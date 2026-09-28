/**
 * set-response-time.mjs
 * Replaces the reply-time promise in the three Studio fields that carry it,
 * so the site never guarantees a response window.
 *
 * Usage:
 *   npm run copy:response-time              # patch Sanity (needs SANITY_API_TOKEN)
 *   npm run copy:response-time -- --dry-run # show what would change, write nothing
 *
 * Fields:
 *   siteSettings.responseTime
 *   homePage.processSteps[0].body
 *   contactPage.successMessage
 *
 * Also turns spaced em dashes in those fields into colons. Patches the
 * published document and its draft, when one exists.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const LINE = "I read every message myself and reply as soon as I can.";

// Any sentence that promises a window, e.g. "I reply to every message within
// 2 business days, usually sooner." or "I'll follow up within 24 hours."
const PROMISE = /[^.:]*\bwithin\b[^.]*\b(hours?|days?|business days?)\b[^.]*\./gi;

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

/**
 * Swap the promise sentence for LINE, keeping the rest of the text. Spaced
 * em dashes in these fields become colons, per the house style.
 */
function rewrite(text) {
  if (typeof text !== "string") return null;
  PROMISE.lastIndex = 0;
  const next = text
    .replace(PROMISE, ` ${LINE}`)
    .replace(/\s+\u2014\s+/g, ": ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return next === text ? null : next;
}

const TARGETS = [
  { type: "siteSettings", path: "responseTime", get: (d) => d.responseTime },
  { type: "homePage", path: "processSteps[0].body", get: (d) => d.processSteps?.[0]?.body },
  { type: "contactPage", path: "successMessage", get: (d) => d.successMessage },
];

console.log(`\n🧵  Reply-time copy (${projectId}/${dataset})${dryRun ? ", dry run" : ""}\n`);

let changed = 0;
for (const target of TARGETS) {
  // Published and draft copies of the singleton.
  const docs = await client.fetch(`*[_type == $type]{ _id, responseTime, processSteps, successMessage }`, {
    type: target.type,
  });
  if (docs.length === 0) console.log(`  – ${target.type}: no document found`);
  for (const doc of docs) {
    const before = target.get(doc);
    const after = rewrite(before);
    if (!after) {
      console.log(`  ✓ ${doc._id}.${target.path}: already fine`);
      continue;
    }
    console.log(`  ${dryRun ? "→" : "✎"} ${doc._id}.${target.path}\n      before: ${before}\n      after:  ${after}`);
    if (!dryRun) await client.patch(doc._id).set({ [target.path]: after }).commit();
    changed++;
  }
}

console.log(`\n${dryRun ? "Would change" : "Changed"} ${changed} field${changed === 1 ? "" : "s"}.\n`);
