/**
 * upload-images.mjs
 * Uploads the prepared photographs from assets/prepared/ to Sanity and points
 * every page image field at the right asset, with the hotspot each layout needs.
 *
 * Usage:
 *   npm run images:prepare   (writes assets/prepared/)
 *   npm run images:upload    (this script)
 *   npm run images           (both)
 *
 * Idempotent: an asset whose originalFilename already exists in the dataset is
 * reused rather than re-uploaded, so re-running costs nothing and never
 * duplicates. Both the published document and its draft (when one exists) are
 * patched, matching scripts/seed-sanity.mjs.
 */

import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, "..");
const envPath = resolve(APP_ROOT, ".env.local");
let env = {};
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = val;
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
  console.error("");
  console.error("❌  SANITY_API_TOKEN is not set.");
  console.error("");
  console.error("   1. https://sanity.io/manage → your project → API → Tokens");
  console.error("   2. Add API token, 'Editor' role, copy it");
  console.error("   3. Add to site/.env.local:  SANITY_API_TOKEN=<token>");
  console.error("");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const PREPARED_DIR = join(APP_ROOT, "assets", "prepared");

// ── Slot assignments ─────────────────────────────────────────────────────────
// Each entry: which prepared file goes into which document field, with the
// hotspot the layout crops around. Do not swap these — the crops were composed
// for these specific masks and gradients.

const SINGLETON_SLOTS = [
  {
    docId: "homePage",
    field: "heroImage",
    file: "grace-portrait-wall.jpg",
    hotspot: { x: 0.6, y: 0.3 },
    alt: "Grace Mae, bridal seamstress in Pittsburgh",
    note: "Home hero — right 48% of the viewport, ivory gradient over its left edge",
  },
  {
    docId: "aboutPage",
    field: "portraitImage",
    file: "grace-portrait-studio.jpg",
    hotspot: { x: 0.5, y: 0.35 },
    alt: "Grace Mae in her alterations studio",
    note: "About story column — square, beside the bio",
  },
  {
    docId: "aboutPage",
    field: "heroImage",
    file: "atelier-workroom.jpg",
    hotspot: { x: 0.68, y: 0.4 },
    alt: "Sunlit bridal alterations workroom with gowns on a rack and a cutting table",
    note: "About hero — full width, 72vh, title over the blurred bottom-left corner",
  },
  {
    docId: "servicesPage",
    field: "heroImage",
    file: "lace-and-organza.jpg",
    hotspot: { x: 0.78, y: 0.45 },
    alt: "Chantilly lace, seed pearls and a brass thimble on ivory silk and blush organza",
    note: "Services hero — full width, 48vh, left 40-75% blurred and washed ivory",
  },
  {
    docId: "aboutPage",
    field: "secondaryImage",
    file: "hem-detail.jpg",
    hotspot: { x: 0.55, y: 0.5 },
    alt: "Hand-stitched blind hem on ivory silk with a brass thimble and tape measure",
    note: "Home about-teaser — tall portrait",
  },
  {
    docId: "contactPage",
    field: "image",
    file: "studio-machine.jpg",
    hotspot: { x: 0.45, y: 0.55 },
    alt: "Antique sewing machine, thread wall and dress form in the studio",
    note: "Contact sidebar — landscape box, max-h-96",
  },
];

const SERVICE_SLOTS = [
  {
    slug: "bridal",
    field: "cardImage",
    file: "card-bridal.jpg",
    hotspot: { x: 0.5, y: 0.7 },
    alt: "Beaded lace and pearls in low light",
  },
  {
    slug: "tailoring",
    field: "cardImage",
    file: "card-tailoring.jpg",
    hotspot: { x: 0.5, y: 0.4 },
    alt: "Charcoal wool with tape measure and pin",
  },
  {
    slug: "custom",
    field: "cardImage",
    file: "card-custom.jpg",
    hotspot: { x: 0.5, y: 0.65 },
    alt: "Gold embroidery on velvet with embroidery scissors",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const assetIdCache = new Map();

/** Upload the file, or reuse the asset already in the dataset under that name. */
async function getAssetId(filename) {
  if (assetIdCache.has(filename)) return assetIdCache.get(filename);

  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    { filename }
  );

  if (existing) {
    console.log(`  ↻ reused    ${filename.padEnd(28)} ${existing}`);
    assetIdCache.set(filename, existing);
    return existing;
  }

  const path = join(PREPARED_DIR, filename);
  if (!existsSync(path)) {
    throw new Error(
      `${filename} is missing from assets/prepared/ — run "npm run images:prepare" first.`
    );
  }

  const asset = await client.assets.upload("image", readFileSync(path), { filename });
  console.log(`  ↑ uploaded  ${filename.padEnd(28)} ${asset._id}`);
  assetIdCache.set(filename, asset._id);
  return asset._id;
}

/** The image field value shape every slot uses. */
function imageValue(assetId, alt, hotspot) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    alt,
    hotspot: {
      _type: "sanity.imageHotspot",
      x: hotspot.x,
      y: hotspot.y,
      height: 0.5,
      width: 0.5,
    },
    crop: { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 },
  };
}

/** Patch the published document and, when it exists, its draft. */
async function patchDocAndDraft(docId, field, value) {
  const draftId = `drafts.${docId}`;

  const published = await client.getDocument(docId);
  if (published) {
    await client.patch(docId).set({ [field]: value }).commit();
    console.log(`  ✓ patched   ${docId}.${field}`);
  } else {
    console.log(`  ! skipped   ${docId} does not exist — run seed-sanity.mjs first`);
    return;
  }

  const draft = await client.getDocument(draftId);
  if (draft) {
    await client.patch(draftId).set({ [field]: value }).commit();
    console.log(`  ✓ patched   ${draftId}.${field}`);
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log(`\n🖼   Uploading prepared images to Sanity (${projectId}/${dataset})\n`);

console.log("📄  Page images");
for (const slot of SINGLETON_SLOTS) {
  const assetId = await getAssetId(slot.file);
  await patchDocAndDraft(slot.docId, slot.field, imageValue(assetId, slot.alt, slot.hotspot));
  console.log(`    ${slot.note}`);
  console.log("");
}

console.log("🧵  Service card backgrounds");
for (const slot of SERVICE_SLOTS) {
  const docId = await client.fetch(
    `*[_type == "service" && slug.current == $slug][0]._id`,
    { slug: slot.slug }
  );
  if (!docId) {
    console.log(`  ! skipped   no service document with slug "${slot.slug}"`);
    continue;
  }
  const assetId = await getAssetId(slot.file);
  await patchDocAndDraft(docId, slot.field, imageValue(assetId, slot.alt, slot.hotspot));
  console.log("");
}

console.log("✅  Done. The OG background is served from public/og-bg.jpg — not Sanity.\n");
