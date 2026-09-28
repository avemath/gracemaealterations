/**
 * tidy-dashes.mjs
 * Removes em dashes from the live Sanity copy, per the house style.
 *
 * Usage:
 *   npm run copy:tidy-dashes -- --dry-run   # list every change, write nothing
 *   npm run copy:tidy-dashes                # apply (needs SANITY_API_TOKEN)
 *
 * Each dash becomes a full stop when a new sentence follows it ("the waist —
 * I handle it" → "the waist. I handle it") and a comma otherwise ("ever wear —
 * and it deserves" → "ever wear, and it deserves"). A dash that opens a line,
 * as in a sign-off, is dropped. En dashes in ranges ($75 – $450) are left alone.
 *
 * Walks every string in every published document and draft, alt text
 * included, and patches only the strings that change. Run the dry run first
 * and read it: the rule is right for this site's copy, but it is a rule.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

// ── The rule ──────────────────────────────────────────────────────────────────

const EM = "—";

// Words that start a new sentence after the dash.
const SENTENCE_START =
  /^(I|I'm|I've|I'll|I'd|we|we're|we've|we'll|it|it's|you|you're|you'll|your|the|this|that|these|those|they|there|every|each|my|our|no|not one|a|an)\b/i;

export function tidy(text) {
  if (!text.includes(EM)) return text;
  return text
    .split("\n")
    .map((line) => {
      // Sign-off or list dash at the start of a line.
      let out = line.replace(new RegExp(`^\\s*${EM}\\s*`), "");
      out = out.replace(new RegExp(`\\s*${EM}\\s*(\\S?)`, "g"), (match, next, offset, whole) => {
        const before = whole.slice(0, offset);
        const after = whole.slice(offset + match.length - next.length);
        if (!next) return ""; // trailing dash
        if (/[.,:;!?]$/.test(before)) return ` ${next}`;
        if (SENTENCE_START.test(after)) return `. ${next.toUpperCase()}`;
        return `, ${next}`;
      });
      return out;
    })
    .join("\n");
}

// ── Walk and patch ────────────────────────────────────────────────────────────

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

console.log(`\n🧵  Em dash tidy (${projectId}/${dataset})${dryRun ? ", dry run" : ""}\n`);

const docs = await client.fetch(`*[!(_type match "sanity.*") && !(_type match "system.*")]`);
let changed = 0;
for (const doc of docs) {
  const sets = {};
  for (const [path, text] of strings(doc, "")) {
    const next = tidy(text);
    if (next === text) continue;
    sets[path] = next;
    console.log(`  ${dryRun ? "→" : "✎"} ${doc._id}.${path}\n      before: ${text}\n      after:  ${next}\n`);
  }
  const count = Object.keys(sets).length;
  if (count === 0) continue;
  changed += count;
  if (!dryRun) await client.patch(doc._id).set(sets).commit();
}

console.log(`${dryRun ? "Would change" : "Changed"} ${changed} string${changed === 1 ? "" : "s"}.\n`);
