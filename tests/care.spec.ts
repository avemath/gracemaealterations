import { test, expect } from "@playwright/test";

/**
 * Care cards: private pages opened from a printed QR code. Real cards live in
 * Sanity, so these cover what must hold without one: unknown codes are a
 * plain 404 (no hint that other codes exist), the pages stay out of Google,
 * and the drafting route only answers this site.
 */
test.describe("care cards", () => {
  test("an unknown code is a 404, for the page and the printable card", async ({ page }) => {
    for (const path of ["/care/nosuchcode123", "/care/nosuchcode123/card", "/care/NOT-A-CODE"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
    }
  });

  test("care pages are never in the sitemap", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/care/");
  });

  test("the care notes route refuses requests from other sites", async ({ request }) => {
    const res = await request.post("/api/care-notes", {
      data: { garment: "wedding gown" },
      headers: { origin: "https://example.com" },
    });
    // 503 without a key; 403 with one. Either way, nothing is drafted.
    expect([403, 503]).toContain(res.status());
  });
});
