/**
 * seed-text.mjs
 * Fills the Studio's "Words around the site" documents with the wording the
 * site uses today, so every field starts from what is live rather than empty.
 *
 * Usage:
 *   npm run content:text -- --dry-run   # show what would be written
 *   npm run content:text                # write it (needs SANITY_API_TOKEN)
 *
 * Safe to run again at any time: it only fills fields that are missing, and
 * never overwrites anything Grace has changed. It also adds any starter
 * documents in src/lib/text/seed/ (such as a guide) that don't exist yet.
 */

import { createClient } from "@sanity/client";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

let env = {};
try {
  for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
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
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

console.log(`\n🧵  Words around the site (${projectId}/${dataset})${dryRun ? ", dry run" : ""}\n`);

let writes = 0;

// ── The three wording documents ─────────────────────────────────────────────
const specDir = join(root, "src/lib/text/specs");
for (const file of readdirSync(specDir).filter((f) => f.endsWith(".json"))) {
  const spec = readJson(join(specDir, file));
  const defaults = Object.fromEntries(Object.entries(spec.fields).map(([k, f]) => [k, f.default]));
  const existing = await client.fetch(`*[_id == $id][0]`, { id: spec.id });
  const missing = Object.keys(defaults).filter((k) => typeof existing?.[k] !== "string" || !existing[k].trim());

  if (!existing) {
    console.log(`  ${dryRun ? "→" : "✎"} ${spec.title}: create with ${missing.length} fields`);
    if (!dryRun) await client.createIfNotExists({ _id: spec.id, _type: spec.id, ...defaults });
    writes++;
  } else if (missing.length) {
    console.log(`  ${dryRun ? "→" : "✎"} ${spec.title}: fill ${missing.length} empty field${missing.length === 1 ? "" : "s"}`);
    if (!dryRun) {
      await client
        .patch(spec.id)
        .set(Object.fromEntries(missing.map((k) => [k, defaults[k]])))
        .commit();
    }
    writes++;
  } else {
    console.log(`  ✓ ${spec.title}: already complete`);
  }
}

// ── Starter documents (created only if missing) ────────────────────────────
const seedDir = join(root, "src/lib/text/seed");
for (const file of readdirSync(seedDir).filter((f) => f.endsWith(".json"))) {
  const doc = readJson(join(seedDir, file));
  const exists = await client.fetch(`count(*[_id in [$id, "drafts." + $id]])`, { id: doc._id });
  if (exists) {
    console.log(`  ✓ ${doc._id}: already there`);
    continue;
  }
  console.log(`  ${dryRun ? "→" : "✎"} ${doc._id}: create`);
  if (!dryRun) await client.createIfNotExists(doc);
  writes++;
}

console.log(`\n${dryRun ? "Would write" : "Wrote"} ${writes} document${writes === 1 ? "" : "s"}.\n`);
