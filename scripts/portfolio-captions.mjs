/**
 * portfolio-captions.mjs
 * Round-trips portfolio captions through a JSON file so Grace can fill in what
 * was actually done to each garment without touching the Studio 26 times.
 *
 *   npm run portfolio:export   → writes content/portfolio-captions.json
 *   (edit the file, replace every "TODO...")
 *   npm run portfolio:apply    → patches Sanity from the file
 *
 * The export pre-fills the captions we already know and proposes bridal-first
 * ordering. Items whose caption still starts with TODO keep their existing
 * caption on apply — only label, alt, featured and order are written.
 */

import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, "..");
let env = {};
try {
  const raw = readFileSync(resolve(APP_ROOT, ".env.local"), "utf8");
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

const OUT_FILE = join(APP_ROOT, "content", "portfolio-captions.json");
const TYPE_ORDER = ["bridal", "tailoring", "custom"];
const isTodo = (caption) => !caption || caption.trim().toUpperCase().startsWith("TODO");

// ── Proposed values, matched on the item's CURRENT label ─────────────────────
// `alt` narrows the match when two items share a label.

const PROPOSALS = [
  { match: "Bridesmaid Dress - Hem Adjustment", label: "Bridesmaid Dress", caption: "Hem shortened 10 inches, original hem finish preserved", featured: true },
  { match: "Bustle & Detachable Sleeves", label: "Bridal Gown", caption: "Bustle added, detachable sleeves constructed", featured: true, order: 1 },
  { match: "Bridal Gown", matchAlt: "4", label: "Bridal Gown", caption: "TODO", featured: true, order: 2 },
  { match: "Bustle Fitting", label: "Bustle Fitting", caption: "TODO (bustle type and number of points)", featured: true, order: 3 },
  { match: "Bridal Alterations", caption: "TODO" },
  { match: "Bridal Party", caption: "Full bridal party fitted and altered" },
  { match: "Bustle", caption: "TODO (bustle type and number of points)" },
  { match: "Bridesmaids Dress Alterations", matchAlt: "Hem and skirt waist taken in", label: "Bridesmaid Dress", caption: "Hem raised, skirt waist taken in" },
  { match: "Bridesmaids Dress Back", matchAlt: "Hem and skirt waist taken in, corset repair", label: "Bridesmaid Dress", caption: "Hem raised, waist taken in, corset back repaired" },
  { match: "Dress Hem and Slit", label: "Dress", caption: "Hem raised, slit re-cut and finished" },
  { match: "Dress", caption: "TODO" },
  { match: "Hem Process", label: "Hem in Progress", caption: "Pinned and marked at the first fitting" },
  { match: "Process", label: "In Progress", caption: "TODO" },
  { match: "Steaming", label: "Final Press", caption: "Steamed and pressed before pickup" },
  { match: "Kid's Blazer", label: "Child's Blazer", caption: "TODO (sleeves shortened, body taken in?)" },
  { match: "Kid's Blazer Process", label: "Child's Blazer", caption: "In progress, marked for sleeve and body adjustments" },
  { match: "Shirt and Blazer", caption: "TODO" },
  { match: "Shirt w/ Zipper", label: "Shirt", caption: "Zipper replaced" },
  { match: "Swim Top", caption: "TODO" },
  { match: "Boxers", caption: "TODO" },
  { match: "Costume Fitting", caption: "Costume fitting for a stage production" },
  { match: "Ski Mask", caption: "TODO" },
];

/** Labels generic enough that repeating them as alt text says nothing. */
const GENERIC_LABELS = new Set(
  ["dress", "process", "bustle", "bridal gown", "bridal alterations", "in progress", "shirt"].map((l) => l)
);

function findProposal(item) {
  const byLabelAndAlt = PROPOSALS.find(
    (p) => p.match === item.label && p.matchAlt && p.matchAlt === item.alt
  );
  if (byLabelAndAlt) return byLabelAndAlt;
  return PROPOSALS.find((p) => p.match === item.label && !p.matchAlt);
}

// ── Export ────────────────────────────────────────────────────────────────────

async function exportCaptions() {
  const items = await client.fetch(
    `*[_type == "portfolioItem"] | order(order asc, _createdAt asc) {
      _id, order, type, label, caption, featured, "alt": image.alt
    }`
  );

  const usedProposals = new Set();

  const rows = items.map((item) => {
    const proposal = findProposal(item);
    if (proposal) usedProposals.add(proposal.match + (proposal.matchAlt ?? ""));

    const label = proposal?.label ?? item.label ?? "";
    const caption = item.caption && !isTodo(item.caption) ? item.caption : proposal?.caption ?? "TODO";
    const featured = proposal?.featured ?? item.featured ?? false;

    // Where the alt says nothing — missing, "4", or just the generic label —
    // the caption is a better description of the photo.
    const altIsUseless =
      !item.alt ||
      item.alt.trim() === "4" ||
      GENERIC_LABELS.has(item.alt.trim().toLowerCase()) ||
      item.alt.trim().toLowerCase() === (item.label ?? "").trim().toLowerCase() ||
      item.alt.trim().toLowerCase() === label.trim().toLowerCase();

    const alt = altIsUseless && !isTodo(caption) ? caption : item.alt ?? "";

    return {
      _id: item._id,
      order: proposal?.order ?? null,
      type: item.type ?? "custom",
      label,
      alt,
      caption,
      featured,
    };
  });

  // Bridal first, then tailoring, then custom, keeping the relative order each
  // group already had. Items with an explicitly proposed order keep it.
  const pinned = rows.filter((r) => r.order !== null).sort((a, b) => a.order - b.order);
  const rest = rows
    .filter((r) => r.order === null)
    .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

  let next = 1;
  const taken = new Set(pinned.map((r) => r.order));
  const ordered = [];
  for (const row of pinned) ordered.push(row);
  for (const row of rest) {
    while (taken.has(next)) next += 1;
    row.order = next;
    taken.add(next);
    ordered.push(row);
  }
  ordered.sort((a, b) => a.order - b.order);

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(ordered, null, 2) + "\n");

  const todos = ordered.filter((r) => isTodo(r.caption));
  const unmatched = PROPOSALS.filter((p) => !usedProposals.has(p.match + (p.matchAlt ?? "")));

  console.log(`\n📝  Wrote ${ordered.length} items to:\n    ${OUT_FILE}\n`);

  if (unmatched.length > 0) {
    console.log("⚠️   Proposed values with no matching item (nothing was changed for these):");
    for (const p of unmatched) console.log(`    • "${p.match}"`);
    console.log("");
  }

  console.log(`🕳   ${todos.length} captions still need writing:\n`);
  for (const t of todos) {
    console.log(`    ${String(t.order).padStart(2)}. ${t.label.padEnd(20)} [${t.type}]  ${t.caption}`);
  }
  console.log(
    `\n    Fill them in, then run:  npm run portfolio:apply\n` +
      `    Items left as TODO keep whatever caption they already have.\n`
  );
}

// ── Apply ─────────────────────────────────────────────────────────────────────

async function applyCaptions() {
  if (!existsSync(OUT_FILE)) {
    console.error(`\n❌  ${OUT_FILE} not found — run "npm run portfolio:export" first.\n`);
    process.exit(1);
  }

  const rows = JSON.parse(readFileSync(OUT_FILE, "utf8"));
  console.log(`\n📝  Applying ${rows.length} portfolio items (${projectId}/${dataset})\n`);

  const stillTodo = [];

  for (const row of rows) {
    const fields = {
      label: row.label,
      order: row.order,
      featured: !!row.featured,
    };

    if (isTodo(row.caption)) {
      stillTodo.push(row);
    } else {
      fields.caption = row.caption;
    }

    // Alt lives inside the image object, so patch that key rather than the
    // whole image — replacing it would drop the asset reference.
    if (row.alt) fields["image.alt"] = row.alt;

    for (const id of [row._id, `drafts.${row._id}`]) {
      const doc = await client.getDocument(id);
      if (!doc) continue;
      await client.patch(id).set(fields).commit();
      console.log(
        `  ✓ ${String(row.order).padStart(2)}. ${row.label.padEnd(20)} ${id}${
          isTodo(row.caption) ? "  (caption left as-is)" : ""
        }`
      );
    }
  }

  if (stillTodo.length > 0) {
    console.log(`\n🕳   ${stillTodo.length} captions are still TODO:\n`);
    for (const t of stillTodo) {
      console.log(`    ${String(t.order).padStart(2)}. ${t.label.padEnd(20)} ${t.caption}`);
    }
    console.log("");
  } else {
    console.log("\n✅  Every item has a real caption.\n");
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

if (process.argv.includes("--export")) {
  await exportCaptions();
} else if (process.argv.includes("--apply")) {
  await applyCaptions();
} else {
  console.error("\nUsage: node scripts/portfolio-captions.mjs --export | --apply\n");
  process.exit(1);
}
