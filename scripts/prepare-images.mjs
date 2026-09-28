/**
 * prepare-images.mjs
 * Collects the eight source photographs from the originals folder, copies them
 * into assets/source-images/ under stable canonical names, and writes
 * print-quality JPEGs into assets/prepared/ for upload to Sanity.
 *
 * Usage:
 *   node scripts/prepare-images.mjs [originalsDir]
 *   ORIGINALS=/path/to/photos node scripts/prepare-images.mjs
 *
 * Default originals folder: the parent of the app root when the app lives in
 * ./site (the workspace wrapper layout), otherwise the app root itself.
 *
 * Images are never resampled or upscaled — each prepared JPEG keeps the native
 * resolution of its source. The only resize is og-bg.jpg, which is explicitly
 * built at 1200x630 for Open Graph.
 */

import sharp from "sharp";
import { readdirSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from "fs";
import { basename, extname, join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, "..");

const DEFAULT_ORIGINALS =
  basename(APP_ROOT).toLowerCase() === "site" ? resolve(APP_ROOT, "..") : APP_ROOT;

const ORIGINALS = resolve(
  process.argv[2] ?? process.env.ORIGINALS ?? DEFAULT_ORIGINALS
);

const SOURCE_DIR = join(APP_ROOT, "assets", "source-images");
const PREPARED_DIR = join(APP_ROOT, "assets", "prepared");
const PUBLIC_DIR = join(APP_ROOT, "public");

const JPEG_OPTS = { quality: 90, mozjpeg: false, chromaSubsampling: "4:4:4" };

// ── Config ────────────────────────────────────────────────────────────────────
// The hero photo is 2:3; cropping to the top ~79% keeps the belt and ends the
// frame above her hands, which reads better inside the hero mask.
const HERO_CROP_ABOVE_HANDS = true;
const HERO_CROP_RATIO = 1210 / 1536;

// The card panels were shot very dark and then sit under a near-black gradient
// at low opacity, which left them almost invisible. Lift them at the source.
const CARD_BRIGHTEN = 1.7;
const CARD_GAMMA = 1.15;

/**
 * canonical name -> accepted source filenames (extension removed, matched
 * case-insensitively). The first entry is the name used in the write-up.
 */
const WANTED = {
  "grace-hero": ["grace_darkhair_standing_maternity"],
  "grace-portrait-wall": ["grace masters face wall background"],
  "grace-portrait-studio": ["grace studio portrait", "grace portrait", "file_00000000800481f6b03e732e200eccbd"],
  "atelier-workroom": ["desk w dress rack"],
  "lace-and-organza": ["lace and pink tulle"],
  "hem-detail": ["thimble and measuring tape"],
  "studio-machine": ["sewing machine and mannequin"],
  "lace-and-thimble": ["lace and thimble"],
  "service-cards-triptych": ["service card backgrounds"],
};

const IMAGE_EXT = /\.(jpe?g|png|webp|tiff?|avif|heic|heif)$/i;

// ── Locate the eight sources ─────────────────────────────────────────────────

if (!existsSync(ORIGINALS)) {
  console.error(`\n❌  Originals folder not found: ${ORIGINALS}\n`);
  process.exit(1);
}

const candidates = readdirSync(ORIGINALS).filter((f) => IMAGE_EXT.test(f));

/** filename without extension, lowercased and whitespace-collapsed */
const stem = (f) => basename(f, extname(f)).trim().toLowerCase().replace(/\s+/g, " ");

const found = {};
const missing = [];

for (const [canonical, aliases] of Object.entries(WANTED)) {
  // Aliases are tried in order, so the first one wins when an older file with
  // a later alias is still sitting in the folder.
  const wanted = aliases.map((a) => a.trim().toLowerCase().replace(/\s+/g, " "));
  let match;
  for (const alias of wanted) {
    match = candidates.find((f) => stem(f) === alias);
    if (match) break;
  }
  if (match) found[canonical] = match;
  else missing.push(`${canonical}  (looked for: ${aliases.join(" | ")})`);
}

if (missing.length > 0) {
  console.error(`\n❌  ${missing.length} of ${Object.keys(WANTED).length} source images were not found in:`);
  console.error(`    ${ORIGINALS}\n`);
  for (const m of missing) console.error(`    • ${m}`);
  console.error("\n   Every other image in that folder is ignored on purpose.\n");
  process.exit(1);
}

// ── Prepare ──────────────────────────────────────────────────────────────────

mkdirSync(SOURCE_DIR, { recursive: true });
mkdirSync(PREPARED_DIR, { recursive: true });

console.log(`\n📷  Originals: ${ORIGINALS}\n`);

for (const [canonical, filename] of Object.entries(found)) {
  const from = join(ORIGINALS, filename);

  // Keep a pristine copy of the original, under the canonical name, in git.
  const sourceCopy = join(SOURCE_DIR, canonical + extname(filename).toLowerCase());
  copyFileSync(from, sourceCopy);

  // Prepared JPEG at native resolution — no resize, ICC kept, rest stripped.
  const out = join(PREPARED_DIR, `${canonical}.jpg`);
  let pipeline = sharp(from).keepIccProfile();

  if (canonical === "grace-hero" && HERO_CROP_ABOVE_HANDS) {
    // A straight crop, never a resample: take the top rows and leave the
    // pixels themselves alone.
    const { width, height } = await sharp(from).metadata();
    const keep = Math.min(height, Math.round(height * HERO_CROP_RATIO));
    pipeline = pipeline.extract({ left: 0, top: 0, width, height: keep });
  }

  const info = await pipeline.jpeg(JPEG_OPTS).toFile(out);

  console.log(
    `  ✓ ${canonical.padEnd(24)} ${String(info.width).padStart(5)}x${String(info.height).padEnd(5)}  ← ${filename}` +
      (canonical === "grace-hero" && HERO_CROP_ABOVE_HANDS ? "  (cropped above hands)" : "")
  );
}

// ── Split the service-card triptych into three equal vertical panels ─────────

const triptychPath = join(PREPARED_DIR, "service-cards-triptych.jpg");
const triptych = sharp(triptychPath);
const { width: tw, height: th } = await triptych.metadata();

const panels = [
  ["card-bridal-v2", 0],
  ["card-tailoring-v2", 1],
  ["card-custom-v2", 2],
];

console.log("");
for (const [name, index] of panels) {
  // Thirds computed from the real width; the last panel absorbs any remainder
  // so no column of pixels is lost to rounding.
  const left = Math.round((tw * index) / 3);
  const right = Math.round((tw * (index + 1)) / 3);

  const lifted = await sharp(triptychPath)
    .extract({ left, top: 0, width: right - left, height: th })
    .modulate({ brightness: CARD_BRIGHTEN })
    .gamma(CARD_GAMMA)
    .toBuffer();

  // Only stretch the range when even the brightest pixels are still dim —
  // normalising an already-bright panel would blow out the highlights.
  const stats = await sharp(lifted).stats();
  const brightest = Math.max(...stats.channels.map((c) => c.max));
  const needsNormalise = brightest < 0.6 * 255;

  let pipeline = sharp(lifted).keepIccProfile();
  if (needsNormalise) pipeline = pipeline.normalise();

  const out = join(PREPARED_DIR, `${name}.jpg`);
  const info = await pipeline.jpeg(JPEG_OPTS).toFile(out);

  console.log(
    `  ✓ ${name.padEnd(24)} ${String(info.width).padStart(5)}x${String(info.height).padEnd(5)}  ← panel ${index + 1}/3, brightness ×${CARD_BRIGHTEN}, gamma ${CARD_GAMMA}` +
      `, brightest ${Math.round((brightest / 255) * 100)}%${needsNormalise ? " → normalised" : ""}`
  );
}

// ── Open Graph background: 1200x630 from the vertical centre of the lace shot ─

const ogPath = join(PREPARED_DIR, "og-bg.jpg");
const resized = await sharp(join(PREPARED_DIR, "lace-and-thimble.jpg"))
  .resize({ width: 1200, withoutEnlargement: false })
  .toBuffer({ resolveWithObject: true });

const ogTop = Math.max(0, Math.round((resized.info.height - 630) / 2));
const ogInfo = await sharp(resized.data)
  .extract({ left: 0, top: ogTop, width: 1200, height: Math.min(630, resized.info.height) })
  .keepIccProfile()
  .jpeg(JPEG_OPTS)
  .toFile(ogPath);

mkdirSync(PUBLIC_DIR, { recursive: true });
copyFileSync(ogPath, join(PUBLIC_DIR, "og-bg.jpg"));

console.log(
  `\n  ✓ ${"og-bg".padEnd(24)} ${ogInfo.width}x${ogInfo.height}    ← lace-and-thimble.jpg (centre crop) → public/og-bg.jpg`
);

// ── Keep prepared output out of git ──────────────────────────────────────────

const gitignorePath = join(APP_ROOT, ".gitignore");
const IGNORE_LINE = "assets/prepared/";
const gitignore = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";

if (!gitignore.split("\n").some((l) => l.trim() === IGNORE_LINE)) {
  const addition = `${gitignore.endsWith("\n") || gitignore === "" ? "" : "\n"}\n# prepared image derivatives (regenerate with: npm run images:prepare)\n${IGNORE_LINE}\n`;
  writeFileSync(gitignorePath, gitignore + addition);
  console.log(`  ✓ added ${IGNORE_LINE} to .gitignore`);
}

console.log("\n✅  Prepared images written to assets/prepared/\n");
