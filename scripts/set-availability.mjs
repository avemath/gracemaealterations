/**
 * set-availability.mjs
 * Flips the site between normal booking and limited availability, where some
 * services stay open and others go to a waitlist.
 *
 * Usage:
 *   npm run availability:limited   # bridal on the waitlist, tailoring open
 *   npm run availability:open      # everything open again
 *
 * siteSettings.isAcceptingClients is deliberately left alone: that switch is
 * all-or-nothing and turning it off would put every service on the waitlist.
 *
 * Patches the published document and its draft, and updates the FAQ items
 * whose answers depend on whether bridal is open.
 *
 * Add --dry-run to see exactly which fields would change, without writing.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Config ────────────────────────────────────────────────────────────────────
const BRIDAL_REOPENS = "early 2027";
const WAITLIST_SERVICES = ["bridal"];
const LEAVE_NOTE_PUBLIC = true; // mention the new baby in the hero pill
const REOPEN_YEAR = (BRIDAL_REOPENS.match(/\b(\d{4})\b/) ?? [])[1] ?? BRIDAL_REOPENS;

const TRUST_ITEMS = [
  "Former Lead Alterations Specialist, David's Bridal",
  "B.S. Fashion & Apparel Design, IUP",
  "500+ garments altered",
  "Itemized quotes, always",
];

// ── Load .env.local ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
let env = {};
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
} catch {
  // .env.local not found — fall back to process.env
}

const projectId =
  env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "qv75bufa";
const dataset =
  env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = env.SANITY_API_TOKEN ?? process.env.SANITY_API_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

const dryRun = process.argv.includes("--dry-run");

if (!token && !dryRun) {
  console.error("\n❌  SANITY_API_TOKEN is not set. Add it to site/.env.local, or run with --dry-run.\n");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

// ── Modes ─────────────────────────────────────────────────────────────────────

const mode = process.argv.includes("--limited")
  ? "limited"
  : process.argv.includes("--open")
  ? "open"
  : null;

if (!mode) {
  console.error("\nUsage: node scripts/set-availability.mjs --limited | --open\n");
  process.exit(1);
}

const LIMITED = {
  limitedMode: true,
  waitlistServices: WAITLIST_SERVICES,
  reopensLabel: BRIDAL_REOPENS,
  bookingNote: LEAVE_NOTE_PUBLIC
    ? `Home with our new baby and taking on smaller projects. Bridal reopens ${BRIDAL_REOPENS}.`
    : `Now taking on everyday tailoring and repairs. Bridal reopens ${BRIDAL_REOPENS}.`,
  limitedNote: `I'm home with our new baby, so for now I'm taking everyday tailoring and small repairs only. Bridal fittings reopen in ${BRIDAL_REOPENS}. If your wedding is in ${REOPEN_YEAR}, join the waitlist and you'll get first pick of fitting dates, in the order you joined. If your date is sooner, tell me anyway and I'll give you an honest answer, plus a referral if I can't take it.`,
  availability: `By Appointment. Bridal reopens ${BRIDAL_REOPENS}`,
  trustItems: TRUST_ITEMS,
  responseTime: "I read every message myself and reply as soon as I can.",
};

const OPEN = {
  limitedMode: false,
  waitlistServices: [],
  reopensLabel: "",
  bookingNote: "Now scheduling consultations",
  limitedNote: "",
  availability: "Available by Appointment",
  trustItems: TRUST_ITEMS,
  responseTime: "I read every message myself and reply as soon as I can.",
};

const settings = mode === "limited" ? LIMITED : OPEN;

// ── FAQ copy that quotes the reopening date ──────────────────────────────────

// Shared by both modes: how far ahead to start bridal fittings.
const BOOKING_LEAD =
  "Fittings ideally start 3 to 6 months before your wedding date, which leaves time for several fittings without rushing. For everyday tailoring, 2–3 weeks is usually plenty. Send a request and I'll confirm what's possible.";

const FAQ_LIMITED = {
  "faq-booking": {
    question: "How far in advance should I book?",
    answer: `Bridal fittings are on a waitlist until ${BRIDAL_REOPENS}, so join as soon as you have your dress. ${BOOKING_LEAD}`,
  },
  "faq-accepting": {
    question: "Are you taking new clients?",
    answer: `Yes, for everyday tailoring and small repairs. Bridal and larger custom projects reopen ${BRIDAL_REOPENS}. You can join the waitlist now and I'll contact you in order as dates open. If your date is sooner, mention it in your request and I'll tell you honestly whether it's possible.`,
  },
  "faq-bridal-reopen": {
    question: "When does bridal booking reopen?",
    answer: `${BRIDAL_REOPENS.charAt(0).toUpperCase()}${BRIDAL_REOPENS.slice(1)}. Join the waitlist from the contact page and I'll reach out in order.`,
    order: 7,
  },
};

const FAQ_OPEN = {
  "faq-booking": {
    question: "How far in advance should I book?",
    answer: `For bridal alterations, get in touch as soon as you have your dress. ${BOOKING_LEAD}`,
  },
  "faq-accepting": {
    question: "Are you taking new clients?",
    answer:
      "Yes, I'm currently accepting new clients for both bridal and everyday tailoring. I work by appointment only, so send a request through the contact form or by email and I'll find you a first fitting.",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Only the fields whose value would actually change. */
function changedFields(doc, fields) {
  return Object.fromEntries(
    Object.entries(fields).filter(([k, v]) => JSON.stringify(doc?.[k]) !== JSON.stringify(v))
  );
}

async function patchDocAndDraft(docId, fields) {
  const draftId = `drafts.${docId}`;
  const published = await client.getDocument(docId);
  if (!published) {
    console.log(`  ! skipped  ${docId} does not exist`);
    return;
  }
  for (const [id, doc] of [[docId, published], [draftId, await client.getDocument(draftId)]]) {
    if (!doc) continue;
    const diff = changedFields(doc, fields);
    const keys = Object.keys(diff);
    if (keys.length === 0) {
      console.log(`  ✓ ${id} already up to date`);
      continue;
    }
    for (const k of keys) {
      console.log(`  ${dryRun ? "→" : "✎"} ${id}.${k}\n      before: ${JSON.stringify(doc[k])}\n      after:  ${JSON.stringify(diff[k])}`);
    }
    if (!dryRun) await client.patch(id).set(diff).commit();
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log(`\n🗓   Setting availability: ${mode.toUpperCase()}  (${projectId}/${dataset})${dryRun ? ", dry run" : ""}\n`);

console.log("📋  Site Settings");
await patchDocAndDraft("siteSettings", settings);

console.log("\n❓  FAQ");
if (mode === "limited") {
  const { "faq-bridal-reopen": reopenItem, ...rest } = FAQ_LIMITED;
  for (const [id, fields] of Object.entries(rest)) await patchDocAndDraft(id, fields);

  // The reopening question only exists while bridal is on the waitlist.
  const existing = await client.getDocument("faq-bridal-reopen");
  if (existing) {
    await patchDocAndDraft("faq-bridal-reopen", reopenItem);
  } else {
    if (!dryRun) {
      await client.createOrReplace({
        _id: "faq-bridal-reopen",
        _type: "faqItem",
        ...reopenItem,
      });
    }
    console.log(`  ${dryRun ? "→ would create" : "✓ created"}  faq-bridal-reopen`);
  }
} else {
  for (const [id, fields] of Object.entries(FAQ_OPEN)) await patchDocAndDraft(id, fields);
  for (const id of ["faq-bridal-reopen", "drafts.faq-bridal-reopen"]) {
    if (await client.getDocument(id)) {
      if (!dryRun) await client.delete(id);
      console.log(`  ${dryRun ? "→ would remove" : "✓ removed"}  ${id}  (only applies while bridal is waitlisted)`);
    }
  }
}

console.log(
  dryRun
    ? "\nDry run: nothing was written. Run again without --dry-run to apply.\n"
    : `\n✅  ${mode === "limited" ? "Limited availability is live." : "All services are open again."}` +
        "\n    isAcceptingClients was left untouched on purpose.\n"
);
