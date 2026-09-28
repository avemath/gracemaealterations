/**
 * seed-part5.mjs
 * Seeds the structures added in Part 5: service price tables and timelines,
 * the services page example quotes, and the policies singleton.
 *
 *   node scripts/seed-part5.mjs
 *
 * Every price and total is left null on purpose. Rows without a number render
 * as "quoted at fitting", and the example quotes block stays hidden entirely
 * until Grace fills in real totals, so nothing invented ever goes live.
 * Policy copy is marked [DRAFT, Grace to confirm].
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
let env = {};
try {
  const raw = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
} catch {
  // fall back to process.env
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = env.SANITY_API_TOKEN ?? process.env.SANITY_API_TOKEN;

if (!token) {
  console.error("\n❌  SANITY_API_TOKEN is not set.\n");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const key = (prefix, i) => `${prefix}-${i}`;
const rows = (prefix, items) =>
  items.map((item, i) => ({ _key: key(prefix, i), _type: "object", item, from: null, note: "" }));

// ── Price tables ─────────────────────────────────────────────────────────────

const PRICE_TABLES = {
  "service-bridal": {
    typicalTimeline: "First fitting 8 to 12 weeks out; final fitting 2 to 3 weeks out.",
    priceTable: rows("bridal", [
      "Bridal hem, single layer",
      "Bridal hem, multi-layer or horsehair",
      "Bustle, per style (American / French / Austrian)",
      "Take in bodice / side seams",
      "Add bra cups",
      "Corset-back conversion",
      "Straps added or adjusted",
    ]),
  },
  "service-tailoring": {
    typicalTimeline: "Usually within two weeks.",
    priceTable: rows("tailoring", [
      "Pant hem",
      "Skirt or dress hem",
      "Waist taken in or let out",
      "Sleeve shortened",
      "Zipper replaced",
      "Seam repair",
    ]),
  },
  "service-custom": {
    typicalTimeline: "Quoted with a timeline after I see the piece.",
    priceTable: [],
  },
};

// ── Example quotes: three placeholders, no numbers ───────────────────────────

const EXAMPLE_QUOTES = {
  exampleQuotes: [
    { _key: "eq-0", _type: "object", gown: "[DRAFT] Gown one", work: "[DRAFT] What was done", price: null },
    { _key: "eq-1", _type: "object", gown: "[DRAFT] Gown two", work: "[DRAFT] What was done", price: null },
    { _key: "eq-2", _type: "object", gown: "[DRAFT] Gown three", work: "[DRAFT] What was done", price: null },
  ],
  exampleQuotesCaption: "Every quote is itemized in writing before I cut a thread.",
};

// ── Policies ─────────────────────────────────────────────────────────────────

const block = (text, k) => ({
  _key: k,
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: `${k}-s`, _type: "span", text, marks: [] }],
});

const POLICY_SECTIONS = [
  ["Deposits and holds",
   "[DRAFT, Grace to confirm] I take a deposit to hold your fitting dates. The deposit comes off your final total and is not separate from the cost of the work."],
  ["Cancellations and rescheduling",
   "[DRAFT, Grace to confirm] Please give me 48 hours notice to cancel or move a fitting. Inside 48 hours I may not be able to fill the slot, and the deposit may not carry over."],
  ["Rush work",
   "[DRAFT, Grace to confirm] If your date is close, tell me at the first message. I take rush work when my schedule allows it, and I quote the rush fee up front, never after the fact."],
  ["Pickup window and storage",
   "[DRAFT, Grace to confirm] Finished garments are ready for pickup on the date we agree. I can hold a piece for a short window after that, but I do not have long term storage, so please collect it promptly."],
  ["Garment care and pressing",
   "[DRAFT, Grace to confirm] Everything is pressed before pickup. For bridal I also steam the gown so it leaves ready to wear. Care instructions for delicate fabrics come with the garment."],
  ["Workmanship guarantee",
   "If something I sewed doesn't hold, I fix it at no charge."],
];

// ── Run ──────────────────────────────────────────────────────────────────────

async function patchDocAndDraft(docId, fields) {
  let touched = 0;
  for (const id of [docId, `drafts.${docId}`]) {
    const doc = await client.getDocument(id);
    if (!doc) continue;
    await client.patch(id).set(fields).commit();
    touched += 1;
  }
  return touched;
}

console.log(`\n🧵  Seeding Part 5 structures (${projectId}/${dataset})\n`);

console.log("Price tables and timelines");
for (const [docId, fields] of Object.entries(PRICE_TABLES)) {
  const touched = await patchDocAndDraft(docId, fields);
  const nulls = (fields.priceTable ?? []).length;
  console.log(`  ✓ ${docId.padEnd(20)} ${touched} doc(s), ${nulls} rows with no price yet`);
}

console.log("\nExample quotes");
console.log(`  ✓ servicesPage       ${await patchDocAndDraft("servicesPage", EXAMPLE_QUOTES)} doc(s), 3 rows with no total yet`);

console.log("\nPolicies");
const existing = await client.getDocument("policies");
const policiesDoc = {
  _id: "policies",
  _type: "policies",
  heading: "Policies",
  intro:
    "[DRAFT, Grace to confirm] The short version of how I work, so there are no surprises later.",
  sections: POLICY_SECTIONS.map(([heading, text], i) => ({
    _key: `sec-${i}`,
    _type: "object",
    heading,
    body: [block(text, `sec-${i}-b`)],
  })),
};
if (existing) {
  await client.patch("policies").set(policiesDoc).commit();
  console.log("  ✓ policies           patched");
} else {
  await client.createOrReplace(policiesDoc);
  console.log("  ✓ policies           created");
}

console.log(`\n✅  Done. Every price, total and policy paragraph is a draft placeholder.\n`);
