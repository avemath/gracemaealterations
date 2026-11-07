/**
 * export-sanity-fixtures.mjs
 * Writes tests/fixtures/sanity.json: every published document the site reads,
 * so CI runs the end-to-end tests against a fixed copy of the content instead
 * of live Sanity (see getFixtureClient in src/lib/sanity.client.ts).
 *
 * Usage:
 *   npm run fixtures:export
 *
 * Re-run it and commit the file when content the tests check changes in the
 * Studio. Care cards are never exported: they carry clients' first names and
 * are private by design (the tests cover them without a real card). Drafts are
 * never exported either. Uses the public CDN, so no token is needed.
 */

import { createClient } from "@sanity/client";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "tests/fixtures/sanity.json");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "qv75bufa",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  perspective: "published",
});

const docs = await client.fetch(`*[!(_id in path("drafts.**")) && _type != "careCard"]`);
docs.sort((a, b) => a._id.localeCompare(b._id));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(docs, null, 1) + "\n");

const types = {};
for (const d of docs) types[d._type] = (types[d._type] ?? 0) + 1;
console.log(`${docs.length} documents written to tests/fixtures/sanity.json`);
console.log(types);
