/**
 * copy-fixes.mjs
 * Fixes to the live Sanity copy from the September audits: grammar, prices
 * brought up to current rates, and small wording and heading-case polish.
 *
 * Usage:
 *   npm run copy:fixes -- --dry-run   # show what would change, write nothing
 *   npm run copy:fixes                # apply (needs SANITY_API_TOKEN)
 *
 * Each fix swaps one phrase inside one field, so anything Grace has reworded
 * since is left alone and reported as "already fine". Patches the published
 * document and its draft, when one exists.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const FIXES = [
  {
    id: "service-bridal",
    path: "description",
    from: "as if it was made for you",
    to: "as if it were made for you",
  },
  {
    id: "service-bridal",
    path: "services[7]",
    from: "Train preservation and preservation prep",
    to: "Gown and train preservation prep",
  },
  {
    // The dash tidy turned "the waist — I handle it" into two sentences, and
    // the first one no longer finishes.
    id: "service-tailoring",
    path: "description",
    from: "through the waist. I handle it",
    to: "through the waist, I handle it",
  },
  {
    id: "value-craft",
    path: "description",
    from: "alterations specialist means I've",
    to: "alterations specialist mean I've",
  },
  // Prices: brought in line with 2026 bridal rates ($300 to $800 typical, $1,000+ for full or complex work)
  {
    id: "service-bridal",
    path: "priceRange",
    from: "$75 – $450+",
    to: "$300 – $900+",
  },
  {
    id: "service-bridal",
    path: "priceNote",
    from: "depending on complexity and fabric",
    to: "for most gowns, depending on fabric, layers and detail",
  },
  {
    id: "service-tailoring",
    path: "priceRange",
    from: "$20 – $120",
    to: "$25 – $175",
  },
  // Copy polish from the second audit
  {
    id: "service-bridal",
    path: "services[0]",
    from: "(standard, cathedral, horsehair)",
    to: "(plain, lace-edged, horsehair)",
  },
  {
    id: "servicesPage",
    path: "pricingCards[0].body",
    from: "an accurate quote, not a ballpark.",
    to: "a real quote for your garment.",
  },
  {
    id: "faq-rush",
    path: "answer",
    from: "Rush services are available on a case-by-case basis depending on my current schedule and the complexity of the work. Rush jobs (under 2 weeks for bridal, under 1 week for tailoring) do carry an additional fee. Please contact me as early as possible if you have a tight deadline. The sooner you reach out, the more options we have.",
    to: "Sometimes. It depends on my schedule and on the work, so put your date in your first message and I'll tell you honestly whether I can fit it in. Rush work carries an extra fee, which I quote up front. If I can't take it, I'll suggest someone who can.",
  },
  {
    id: "homePage",
    path: "processSteps[3].title",
    from: "The Work",
    to: "The alterations",
  },
  {
    id: "homePage",
    path: "trustStats[2].value",
    from: "Pittsburgh, PA",
    to: "By appointment",
  },
  {
    id: "homePage",
    path: "trustStats[2].label",
    from: "Proudly Local",
    to: "One client at a time",
  },
  {
    id: "homePage",
    path: "processHeading",
    from: "What to Expect",
    to: "What to expect",
  },
  {
    id: "servicesPage",
    path: "pricingHeading",
    from: "How Pricing Works",
    to: "How pricing works",
  },
  {
    id: "contactPage",
    path: "heroHeading",
    from: "Let's Talk About Your Garment",
    to: "Let's talk about your garment",
  },
  {
    id: "portfolioPage",
    path: "heroSubtext",
    from: "Each garment is a collaboration between craft and vision.",
    to: "Real work from my studio: gowns, bridal parties, tailoring and repairs.",
  },
];

// ── Load .env.local ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
let env = {};
try {
  for (const line of readFileSync(resolve(__dirname, "../.env.local"), "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq > 0) env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
} catch {
  // .env.local not found, fall back to process.env
}

const dryRun = process.argv.includes("--dry-run");
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "qv75bufa";
const dataset = env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = env.SANITY_API_TOKEN ?? process.env.SANITY_API_TOKEN;

if (!token && !dryRun) {
  console.error("\n❌  SANITY_API_TOKEN is not set. Add it to site/.env.local, or run with --dry-run.\n");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

/** Reads "services[7]" or "description" off a document. */
function get(doc, path) {
  return path.split(/\.|\[(\d+)\]/).filter(Boolean).reduce((v, key) => v?.[key], doc);
}

console.log(`\n🧵  Copy fixes (${projectId}/${dataset})${dryRun ? ", dry run" : ""}\n`);

let changed = 0;
for (const fix of FIXES) {
  // Drafts are only visible with a token; without one this sees published only.
  const docs = await client.fetch(`*[_id in [$id, "drafts." + $id]]`, { id: fix.id });
  if (docs.length === 0) console.log(`  – ${fix.id}: no document found`);
  for (const doc of docs) {
    const before = get(doc, fix.path);
    if (typeof before !== "string" || !before.includes(fix.from)) {
      console.log(`  ✓ ${doc._id}.${fix.path}: already fine`);
      continue;
    }
    const after = before.replace(fix.from, fix.to);
    console.log(`  ${dryRun ? "→" : "✎"} ${doc._id}.${fix.path}\n      before: ${fix.from}\n      after:  ${fix.to}`);
    if (!dryRun) await client.patch(doc._id).set({ [fix.path]: after }).commit();
    changed++;
  }
}

console.log(`\n${dryRun ? "Would change" : "Changed"} ${changed} field${changed === 1 ? "" : "s"}.\n`);
