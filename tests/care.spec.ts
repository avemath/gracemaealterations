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

  test("the care notes route refuses anyone not signed in to the Studio", async ({ request }) => {
    const attempts: Record<string, string>[] = [
      { origin: "https://example.com" },
      // A spoofed Origin is not enough...
      { origin: "https://gracemaealterations.com" },
      // ...and neither is a made-up token.
      { origin: "https://gracemaealterations.com", authorization: "Bearer skNotARealTokenAtAll1234567890" },
    ];
    for (const headers of attempts) {
      const res = await request.post("/api/care-notes", { data: { garment: "wedding gown" }, headers });
      // 503 without an Anthropic key; 401 with one. Either way, nothing is drafted.
      expect([401, 503], JSON.stringify(headers)).toContain(res.status());
    }
  });
});
