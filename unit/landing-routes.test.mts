// Every landing page in LANDING_SLUGS needs its own static route folder (see
// src/app/_landing/LandingPage.tsx for why there is no [slug] route), and no
// catch-all route at the root may come back. Run with `npm run test:unit`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";

const { LANDING_SLUGS } = await import("../src/lib/metadata");

test("each landing slug has a route at src/app/<slug>/page.tsx", () => {
  for (const slug of LANDING_SLUGS) {
    assert.ok(existsSync(`src/app/${slug}/page.tsx`), `missing src/app/${slug}/page.tsx`);
  }
});

test("there is no dynamic route at the site root", () => {
  const dynamic = readdirSync("src/app").filter((name) => name.startsWith("["));
  assert.deepEqual(dynamic, []);
});
