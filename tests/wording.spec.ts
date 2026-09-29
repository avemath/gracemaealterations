import { test, expect } from "@playwright/test";
import site from "../src/lib/text/specs/site.json";
import { CTA_DEFAULTS } from "../src/lib/cta";

/**
 * Checks on the Studio's "Site-wide words" spec itself. No pages involved,
 * so one width is enough.
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one width is enough");
});

test("the fallback button words match the spec's original wording", () => {
  // src/lib/cta.ts keeps its own copy so the browser code doesn't carry the
  // whole spec; a page without the Studio's words must still say the same.
  const fromSpec = Object.fromEntries(
    Object.entries(site.fields)
      .filter(([key]) => key.startsWith("cta"))
      .map(([key, field]) => [key, field.default])
  );
  expect(CTA_DEFAULTS).toEqual(fromSpec);
});

test("every site-wide field is in a group, with no em dashes and a big box for long wording", () => {
  const groups = new Set(site.groups.map((group) => group.name));
  for (const [key, field] of Object.entries(site.fields) as [string, { group: string; long?: boolean; default: string; title: string }][]) {
    expect(groups.has(field.group), `${key}: unknown group`).toBe(true);
    expect(`${field.title} ${field.default}`, `${key}: em dash`).not.toContain("—");
    if (field.default.length > 60) expect(field.long, `${key}: long wording in a one-line box`).toBe(true);
  }
});
