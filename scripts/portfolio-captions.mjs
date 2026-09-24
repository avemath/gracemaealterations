/**
 * portfolio-captions.mjs
 * Replaces the generic portfolio labels ("Dress", "Process", "Bustle") with
 * captions that say what was actually done, fixes the alt text, and orders the
 * grid bridal-first.
 *
 *   npm run portfolio:export   → resolves the table, writes content/portfolio-captions.json
 *   npm run portfolio:apply    → patches Sanity from that file
 *
 * Every item was matched to its row by downloading the photo and looking at it
 * (`${assetUrl}?w=600` → /tmp/portfolio/<_id>.jpg). Items whose photo did not
 * match any row are listed in UNMATCHED and left alone; items whose photo
 * contradicts the row's caption are in CAPTION_NEEDS_GRACE and get everything
 * except the caption.
 */

import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

// ── Config ────────────────────────────────────────────────────────────────────
// Zipper work, resizing and strap fixes are tailoring to someone browsing the
// Tailoring filter; the Custom filter should hold things Grace built.
const APPLY_CATEGORY_CHANGES = true;

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
const IMAGE_DIR = "/tmp/portfolio";

// ── The table ─────────────────────────────────────────────────────────────────
// order === row number, so bridal runs 1-8, tailoring 10-19, custom 20-27.

const ROWS = {
  1: { label: "Bridal Gown", type: "bridal", caption: "Bustle added and detachable sleeves constructed, worn on the day", featured: true },
  2: { label: "Bridal Gown", type: "bridal", caption: "The same gown on the wedding morning, detachable sleeves on", featured: true },
  3: { label: "Bustle Fitting", type: "bridal", caption: "Train gathered and pinned at the bustle fitting", featured: true },
  4: { label: "Bridal Party", type: "bridal", caption: "Full bridal party, every dress fitted and altered", featured: true },
  5: { label: "Bustle", type: "bridal", caption: "Bustle set, train secured for the reception", featured: false, verify: "bustle style and number of points" },
  6: { label: "Bustle", type: "bridal", caption: "Bustle set, train secured for the reception", featured: false, verify: "bustle style and number of points" },
  7: { label: "Bride and Bridesmaid", type: "bridal", caption: "Bridesmaid dress: skirt waist taken in and hem raised 3 inches", featured: false },
  8: { label: "Final Press", type: "bridal", caption: "Steaming on the wedding morning — a final press is included before every pickup", featured: false },

  10: { label: "Bridesmaid Dress", type: "tailoring", caption: "Magenta satin, hem raised and skirt waist taken in", featured: false },
  11: { label: "Bridesmaid Dress", type: "tailoring", caption: "Back view: waist taken in and corset closure repaired", featured: false },
  12: { label: "Evening Gown", type: "tailoring", caption: "Hem raised and slit re-cut to length", featured: false },
  13: { label: "Hem in Progress", type: "tailoring", caption: "Pinned and marked at the first fitting", featured: false },

  // Everything below is something Grace built, so it belongs in Custom even
  // though a few of them read like repairs from the outside.
  14: { label: "Batik Top", type: "custom", retype: true, caption: "Custom batik top, zipper set into the back", featured: false },
  15: { label: "Batik Top", type: "custom", retype: true, caption: "Custom batik top, zipper detail", featured: false },
  16: { label: "Batik Set", type: "custom", retype: true, caption: "Custom batik set: cropped top and matching overshirt", featured: false },
  17: { label: "Swim Top", type: "custom", retype: true, caption: "Custom swim top, made to fit", featured: false },
  18: { label: "Annie Costume", type: "custom", retype: true, caption: "Costume built for the title role in Annie", featured: false },
  19: { label: "Yellow Satin Dress", type: "custom", retype: true, caption: "Custom yellow satin dress, built from scratch", featured: false },

  20: { label: "Yellow Satin Dress", type: "custom", retype: true, caption: "The same dress from the back, seams shaped through the waist", featured: false },
  21: { label: "Floral Dress", type: "custom", retype: true, caption: "Custom floral dress with lace sashes at the hip", featured: false },
  22: { label: "Child's Blazer", type: "custom", retype: true, caption: "Custom child's blazer in red houndstooth", featured: false },
  23: { label: "Child's Blazer", type: "custom", retype: true, caption: "The same blazer in progress, pieces cut and interfaced", featured: false },
  24: { label: "Bodice in Progress", type: "custom", caption: "Muslin bodice pinned and marked on the form", featured: false },
  25: { label: "Draping in Progress", type: "custom", caption: "Muslin draped and marked on the form", featured: false },
  26: { label: "Horned Ski Mask", type: "custom", caption: "Custom horned balaclava", featured: false },
  27: { label: "Boxer Shorts", type: "custom", caption: "Custom boxer shorts, made in a batch with one pair monogrammed", featured: false },
};

// ── Photo-confirmed matches ───────────────────────────────────────────────────
// _id → row. Each one was checked against the row's "Looks like" description by
// opening /tmp/portfolio/<_id>.jpg.

const RESOLVED = {
  "69979de4-c8d2-44ec-a89c-e15ce525d240": 1,  // bride and partner, first dance
  "23222aa8-d791-4928-8fac-c998dbe08747": 2,  // bride being fastened into the lace gown
  "64c4d4f7-136b-4f45-8edc-35b462b00e2c": 3,  // back of the lace gown, train pinned at the bustle
  "2163ed55-ff00-45f8-ae8d-2bf62c6ce24a": 4,  // bride and five bridesmaids outdoors
  "2819bc0a-9465-495f-9465-cdfabf4e82ba": 5,  // satin gown bustled, store fitting room
  "2e87ddaa-602d-43f7-a4cf-be77ac8da149": 6,  // lace gown bustled, hanging in the studio
  "9c46cddf-1887-4d8d-9f16-7c3628e53a93": 7,  // bride and one bridesmaid with bouquets
  "dd5445aa-872e-42c5-846c-87108ab6c966": 8,  // steaming the hanging lace gown

  "86f16cc2-638d-4323-b163-deda76fdfdbe": 10, // magenta satin, front
  "f713f6af-e5ec-4ce1-9fa0-419d0166c837": 11, // magenta satin, back, corset lacing
  "22915bf0-080f-4f8d-bec6-fff08095580c": 12, // black gown with a high slit
  "2a12a798-f9d0-405b-9897-625ebd2e438d": 13, // blue leaf print pinned at the machine
  "a12744e1-6446-4eef-938c-3a1f402a4c35": 14, // batik top, outside, zipper closed
  "25346c58-2468-41d8-a5ee-6f9aa50b7573": 15, // batik top, inside out, zipper tape
  "98ee15d2-6f94-4daa-a40f-2b3f937039b1": 16, // batik top and jacket worn together
  "bc5d23c8-1ab5-4382-9dea-3897f5de7ec1": 17, // swim top, front and back in the mirror
  "81369df5-f419-487d-a1d2-23981f482ad0": 18, // red dress, white collar, red wig
  "aa99de15-f78a-486f-a018-ba27f0caa55d": 19, // yellow satin, front, full length on a form

  "23c4f86c-438e-4ec1-9b6a-9f53960f4e7d": 20, // yellow satin, back, full length on a form
  "653b8d2e-be42-4367-bd81-f24c01fcc626": 21, // floral print dress with lace sashes on a form
  "001b1260-b73b-4b50-94e3-c72faf778d6f": 22, // pink houndstooth blazer laid flat
  "4b1c2b0d-904f-4226-9f39-d183cf6c837a": 23, // the same blazer opened up into pieces
  "1f52fb95-e5f7-4032-8b2a-b89da931892a": 24, // muslin bodice pinned and marked on a form
  "41c1d493-dddf-4149-a9a9-52ef96416bc3": 25, // muslin draped on a form, CUT 2 marked
  "e6daa0fc-a9a8-4963-90bf-343fddb4b0cc": 26, // blue spiked balaclava
  "50bc4ba0-e405-41d6-aeaa-c51bf8d2885a": 27, // a batch of boxer shorts in assorted prints
};

/** Photo does not match the row's caption — patch everything but the caption. */
const CAPTION_NEEDS_GRACE = {};

/** No row describes this photo — left exactly as it is. */
const UNMATCHED = {};

// ── Before/after slider ───────────────────────────────────────────────────────

const SLIDER = {
  featuredLabel: "Sage Bridesmaid Dress: Hem",
  featuredDescription:
    "Sage satin bridesmaid dress, hem shortened 10 inches, original hem finish kept",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function patchDocAndDraft(docId, fields) {
  let patched = 0;
  for (const id of [docId, `drafts.${docId}`]) {
    const doc = await client.getDocument(id);
    if (!doc) continue;
    await client.patch(id).set(fields).commit();
    patched += 1;
  }
  return patched;
}

function resolveRows(items) {
  const rows = [];

  for (const item of items) {
    const rowNumber = RESOLVED[item._id];
    if (!rowNumber) continue;

    const row = ROWS[rowNumber];
    const skipCaption = item._id in CAPTION_NEEDS_GRACE;
    const caption = skipCaption ? null : row.caption;

    rows.push({
      _id: item._id,
      currentLabel: item.label,
      label: row.label,
      // Only retype rows are allowed to move category, and only when the flag is on.
      type: row.retype && APPLY_CATEGORY_CHANGES ? row.type : item.type,
      caption,
      alt: caption ? `${row.label}: ${caption}` : row.label,
      featured: row.featured,
      order: rowNumber,
      verify: row.verify ?? null,
      captionNote: CAPTION_NEEDS_GRACE[item._id] ?? null,
    });
  }

  return rows.sort((a, b) => a.order - b.order);
}

function printTable(rows) {
  console.log(
    `\n  ${"#".padStart(2)}  ${"current label".padEnd(29)} ${"new label".padEnd(21)} ${"type".padEnd(10)} caption`
  );
  console.log(`  ${"─".repeat(110)}`);
  for (const r of rows) {
    console.log(
      `  ${String(r.order).padStart(2)}  ${r.currentLabel.padEnd(29)} ${r.label.padEnd(21)} ${r.type.padEnd(10)} ${
        r.caption ?? "— (Grace to write)"
      }${r.featured ? "   ★ featured" : ""}`
    );
  }
}

function printVerify(rows) {
  const flagged = rows.filter((r) => r.verify || r.captionNote);
  if (flagged.length === 0) return;
  console.log(`\n🔍  VERIFY — ${flagged.length} items for Grace to confirm:\n`);
  for (const r of flagged) {
    console.log(`    ${String(r.order).padStart(2)}. ${r.label} — ${r.captionNote ?? r.verify}`);
  }
  if (Object.keys(UNMATCHED).length > 0) {
    console.log(`\n⚠️   Left untouched (photo matched no row):\n`);
    for (const [id, why] of Object.entries(UNMATCHED)) console.log(`    • ${id}\n      ${why}`);
  }
  console.log("");
}

// ── Fetch photos (for matching by eye) ───────────────────────────────────────

async function fetchPhotos() {
  const items = await client.fetch(
    `*[_type == "portfolioItem"]{ _id, label, type, "assetUrl": image.asset->url }`
  );
  mkdirSync(IMAGE_DIR, { recursive: true });
  for (const item of items) {
    if (!item.assetUrl) continue;
    const res = await fetch(`${item.assetUrl}?w=600`);
    writeFileSync(join(IMAGE_DIR, `${item._id}.jpg`), Buffer.from(await res.arrayBuffer()));
    console.log(`  ↓ ${item._id}.jpg  "${item.label}" [${item.type}]`);
  }
  console.log(`\n✅  ${items.length} photos in ${IMAGE_DIR} — open them to match against the table.\n`);
}

// ── Export ────────────────────────────────────────────────────────────────────

async function exportRows() {
  const items = await client.fetch(
    `*[_type == "portfolioItem"]{
      _id, label, type, order, "assetUrl": image.asset->url, "alt": image.alt
    }`
  );

  const rows = resolveRows(items);
  const missing = items.filter((i) => !RESOLVED[i._id] && !(i._id in UNMATCHED));

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify({ slider: SLIDER, items: rows }, null, 2) + "\n");

  console.log(`\n📝  Resolved ${rows.length} of ${items.length} portfolio items`);
  printTable(rows);

  if (missing.length > 0) {
    console.log(`\n⚠️   Not in the table (untouched):`);
    for (const m of missing) console.log(`    • ${m._id}  "${m.label}"`);
  }

  console.log(`\n    Written to ${OUT_FILE}`);
  console.log(`    Apply with: npm run portfolio:apply`);
  printVerify(rows);
}

// ── Apply ─────────────────────────────────────────────────────────────────────

async function applyRows() {
  if (!existsSync(OUT_FILE)) {
    console.error(`\n❌  ${OUT_FILE} not found — run "npm run portfolio:export" first.\n`);
    process.exit(1);
  }

  const { slider, items: rows } = JSON.parse(readFileSync(OUT_FILE, "utf8"));

  console.log(`\n📝  Patching ${rows.length} portfolio items (${projectId}/${dataset})`);
  console.log(`    Category changes: ${APPLY_CATEGORY_CHANGES ? "ON" : "OFF"}`);
  printTable(rows);
  console.log("");

  for (const row of rows) {
    const fields = {
      label: row.label,
      order: row.order,
      featured: !!row.featured,
      "image.alt": row.alt,
    };
    if (row.caption) fields.caption = row.caption;
    if (APPLY_CATEGORY_CHANGES) fields.type = row.type;

    const patched = await patchDocAndDraft(row._id, fields);
    console.log(
      `  ✓ ${String(row.order).padStart(2)}. ${row.label.padEnd(21)} ${patched} doc(s)${
        row.caption ? "" : "   (caption left blank)"
      }`
    );
  }

  console.log("\n🎞   Before/after slider");
  const patched = await patchDocAndDraft("portfolioPage", slider);
  console.log(`  ✓ portfolioPage  ${patched} doc(s)`);
  console.log(`      label:       ${slider.featuredLabel}`);
  console.log(`      description: ${slider.featuredDescription}`);

  printVerify(rows);
}

// ── Run ───────────────────────────────────────────────────────────────────────

if (process.argv.includes("--fetch")) {
  await fetchPhotos();
} else if (process.argv.includes("--export")) {
  await exportRows();
} else if (process.argv.includes("--apply")) {
  await applyRows();
} else {
  console.error("\nUsage: node scripts/portfolio-captions.mjs --fetch | --export | --apply\n");
  console.error(`Photos for matching are downloaded to ${IMAGE_DIR}/<_id>.jpg\n`);
  process.exit(1);
}
