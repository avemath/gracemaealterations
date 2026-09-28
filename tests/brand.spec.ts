import { test, expect } from "@playwright/test";

/**
 * The brand typefaces actually render. A :root redefinition of
 * --font-cormorant in globals.css once overrode next/font's generated family
 * names, so every heading fell back to Georgia and nobody noticed for months.
 */
test("Cormorant Garamond and Jost load and are used", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => ({
    h1: getComputedStyle(document.querySelector("h1")!).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
    loaded: Array.from(document.fonts).filter((f) => f.status === "loaded").map((f) => f.family),
  }));
  expect(fonts.h1).toMatch(/Cormorant_Garamond/);
  expect(fonts.body).toMatch(/Jost/);
  expect(fonts.loaded.some((f) => /Cormorant_Garamond/.test(f))).toBe(true);
  expect(fonts.loaded.some((f) => /Jost/.test(f))).toBe(true);
});

test("on a phone the headline sits right under the portrait", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile layout only");
  await page.goto("/");
  // Regression: a min-h-screen, vertically centred copy block left roughly
  // half a screen of empty ivory between the photo and the headline.
  const top = await page.locator("h1").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  expect(top).toBeLessThan(700);
});

test("the trust strip never says 0+, to eyes or to screen readers", async ({ page }) => {
  await page.goto("/");
  const strip = page.getByRole("region", { name: "Experience and credentials" });
  await expect(page.locator("[data-countup]")).toHaveCount(1);

  // What a screen reader reads: everything except aria-hidden nodes. It must
  // carry the real figure even while the visual count is parked at 0 off screen.
  const spoken = await strip.evaluate((el) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    return clone.textContent ?? "";
  });
  expect(spoken).toMatch(/[1-9]\d*\+ garments/);

  // Once on screen, the visible count lands on the same figure.
  await strip.scrollIntoViewIfNeeded();
  await expect(page.locator("[data-countup]")).toHaveText(/^[1-9]\d*\+$/, { timeout: 5000 });
});
