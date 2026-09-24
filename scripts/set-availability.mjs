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
 * Patches the published document and its draft, and updates the two FAQ items
 * that quote the reopening date.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Config ────────────────────────────────────────────────────────────────────
const BRIDAL_REOPENS = "early 2027";
const WAITLIST_SERVICES = ["bridal"];
const LEAVE_NOTE_PUBLIC = true; // mention the new baby in the hero pill

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

if (!token) {
  console.error("\n❌  SANITY_API_TOKEN is not set — add it to site/.env.local.\n");
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
  limitedNote: `Currently accepting everyday tailoring and small repairs. Bridal and larger custom projects are booking for ${BRIDAL_REOPENS}; join the waitlist to hold your place.`,
  availability: `By Appointment. Bridal reopens ${BRIDAL_REOPENS}`,
  responseTime:
    "I'm working reduced hours right now and still reply to every message, usually within a few days.",
};

const OPEN = {
  limitedMode: false,
  waitlistServices: [],
  reopensLabel: "",
  bookingNote: "Now scheduling consultations",
  limitedNote: "",
  availability: "Available by Appointment",
  responseTime: "I respond to all inquiries within 24 hours.",
};

const settings = mode === "limited" ? LIMITED : OPEN;

// ── FAQ copy that quotes the reopening date ──────────────────────────────────

const FAQ_LIMITED = {
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
  "faq-accepting": {
    question: "Are you taking new clients?",
    answer:
      "Yes — I'm currently accepting new clients for both bridal and everyday tailoring. I work by appointment only, so reach out through the contact form or email to check availability and schedule your first consultation.",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function patchDocAndDraft(docId, fields) {
  const draftId = `drafts.${docId}`;
  const published = await client.getDocument(docId);
  if (published) {
    await client.patch(docId).set(fields).commit();
    console.log(`  ✓ patched  ${docId}`);
  } else {
    console.log(`  ! skipped  ${docId} does not exist`);
    return;
  }
  const draft = await client.getDocument(draftId);
  if (draft) {
    await client.patch(draftId).set(fields).commit();
    console.log(`  ✓ patched  ${draftId}`);
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log(`\n🗓   Setting availability: ${mode.toUpperCase()}  (${projectId}/${dataset})\n`);

console.log("📋  Site Settings");
await patchDocAndDraft("siteSettings", settings);
for (const [k, v] of Object.entries(settings)) {
  console.log(`      ${k}: ${JSON.stringify(v)}`);
}

console.log("\n❓  FAQ");
if (mode === "limited") {
  const { "faq-bridal-reopen": reopenItem, ...rest } = FAQ_LIMITED;
  for (const [id, fields] of Object.entries(rest)) await patchDocAndDraft(id, fields);

  // The reopening question only exists while bridal is on the waitlist.
  const existing = await client.getDocument("faq-bridal-reopen");
  if (existing) {
    await patchDocAndDraft("faq-bridal-reopen", reopenItem);
  } else {
    await client.createOrReplace({
      _id: "faq-bridal-reopen",
      _type: "faqItem",
      ...reopenItem,
    });
    console.log("  ✓ created  faq-bridal-reopen");
  }
} else {
  for (const [id, fields] of Object.entries(FAQ_OPEN)) await patchDocAndDraft(id, fields);
  for (const id of ["faq-bridal-reopen", "drafts.faq-bridal-reopen"]) {
    if (await client.getDocument(id)) {
      await client.delete(id);
      console.log(`  ✓ removed  ${id}  (only applies while bridal is waitlisted)`);
    }
  }
}

console.log(
  `\n✅  ${mode === "limited" ? "Limited availability is live." : "All services are open again."}` +
    "\n    isAcceptingClients was left untouched on purpose.\n"
);
