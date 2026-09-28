/**
 * publish-drafts.mjs
 * Puts the written-but-hidden content live: the three guides, the five bustle
 * styles and the two landing pages. The policies page only goes live with
 * --policies, because its deposit, cancellation and rush terms are Grace's
 * to confirm.
 *
 * Usage:
 *   npm run content:publish -- --dry-run      # list every change, write nothing
 *   npm run content:publish                   # guides, bustles, landing pages
 *   npm run content:publish -- --policies     # also the policies page
 *   npm run content:publish -- --unpublish    # take them all back off the site
 *
 * On the way it takes the "[DRAFT]" markers out of the Studio copy (the site
 * already hides them) and applies the small copy edits listed in EDITS below.
 * Patches the published document and its draft, when one exists.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const GROUPS = {
  guides: ["guide-alterations-timeline", "guide-bustle-types", "guide-what-to-bring"],
  bustles: ["bustle-american", "bustle-french", "bustle-austrian", "bustle-ballroom", "bustle-detachable"],
  landing: ["landing-bridal-party", "landing-davids-bridal"],
  policies: ["policies"],
};

// Found in review. US spelling for a Pittsburgh site, and no promise of a
// referral Grace may not be able to give.
const EDITS = [
  ["no beading down the centre back seam", "no beading down the center back seam"],
  ["so they can practise.", "so they can practice."],
  [
    "If your date is sooner, tell me anyway and I will give you an honest answer, plus a referral if I cannot take it.",
    "If your date is sooner, tell me anyway and I will tell you honestly whether I can fit it in.",
  ],
];

const DRAFT_PREFIX = /^\s*\[DRAFT[^\]]*\]\s*/i;

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

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const unpublish = args.includes("--unpublish");
const withPolicies = args.includes("--policies");
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "qv75bufa";
const dataset = env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = env.SANITY_API_TOKEN ?? process.env.SANITY_API_TOKEN;

if (!token && !dryRun) {
  console.error("\n❌  SANITY_API_TOKEN is not set. Add it to site/.env.local, or run with --dry-run.\n");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const SKIP_KEYS = new Set(["_id", "_type", "_rev", "_key", "_ref", "_createdAt", "_updatedAt", "current", "url"]);

/** Yields [jsonMatchPath, value] for every string in a document. */
function* strings(value, path) {
  if (typeof value === "string") {
    yield [path, value];
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const seg = item && typeof item === "object" && item._key ? `[_key=="${item._key}"]` : `[${i}]`;
      yield* strings(item, path + seg);
    }
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (SKIP_KEYS.has(k)) continue;
      yield* strings(v, path ? `${path}.${k}` : k);
    }
  }
}

function clean(text) {
  let out = text.replace(DRAFT_PREFIX, "");
  for (const [from, to] of EDITS) out = out.replace(from, to);
  return out;
}

const ids = [
  ...GROUPS.guides,
  ...GROUPS.bustles,
  ...GROUPS.landing,
  ...(withPolicies || unpublish ? GROUPS.policies : []),
];

console.log(
  `\n🧵  ${unpublish ? "Unpublishing" : "Publishing"} drafts (${projectId}/${dataset})${dryRun ? ", dry run" : ""}\n`
);

let docsChanged = 0;
for (const id of ids) {
  const docs = await client.fetch(`*[_id in [$id, "drafts." + $id]]`, { id });
  if (docs.length === 0) {
    console.log(`  – ${id}: no document found`);
    continue;
  }
  for (const doc of docs) {
    const sets = {};
    if (!unpublish) {
      for (const [path, text] of strings(doc, "")) {
        const next = clean(text);
        if (next !== text) sets[path] = next;
      }
    }
    const wantPublished = !unpublish;
    if (doc.published !== wantPublished) sets.published = wantPublished;

    const count = Object.keys(sets).length;
    if (count === 0) {
      console.log(`  ✓ ${doc._id}: already ${unpublish ? "off the site" : "live"}`);
      continue;
    }
    const label = doc.title ?? doc.name ?? doc.heading ?? doc._id;
    const edits = Object.keys(sets).filter((k) => k !== "published").length;
    console.log(
      `  ${dryRun ? "→" : "✎"} ${doc._id} (${label}): ${
        "published" in sets ? (wantPublished ? "publish" : "unpublish") : "already set"
      }${edits ? `, ${edits} string${edits === 1 ? "" : "s"} tidied` : ""}`
    );
    for (const [from, to] of EDITS) {
      if (Object.values(sets).some((v) => typeof v === "string" && v.includes(to)) &&
          [...strings(doc, "")].some(([, v]) => v.includes(from))) {
        console.log(`      edit: "${from}"\n         → "${to}"`);
      }
    }
    if (!dryRun) await client.patch(doc._id).set(sets).commit();
    docsChanged++;
  }
}

if (!withPolicies && !unpublish) {
  console.log(`\n  The policies page stays off until Grace confirms it. Then: npm run content:publish -- --policies`);
}
console.log(`\n${dryRun ? "Would change" : "Changed"} ${docsChanged} document${docsChanged === 1 ? "" : "s"}.\n`);
