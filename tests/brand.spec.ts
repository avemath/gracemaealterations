import { test, expect } from "@playwright/test";

/**
 * Type: Georgia headings and the system sans-serif body, chosen on purpose.
 * Cormorant Garamond and Jost were tried and dropped as harder to read, so
 * no web font should be downloaded.
 */
test("headings use Georgia and body copy the system sans, with no web fonts", async ({ page }) => {
  const fontFiles: string[] = [];
  page.on("request", (r) => {
    if (/\.(woff2?|ttf|otf)(\?|$)/.test(r.url())) fontFiles.push(r.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const fonts = await page.evaluate(() => ({
    h1: getComputedStyle(document.querySelector("h1")!).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
  }));
  expect(fonts.h1).toMatch(/^Georgia/);
  expect(fonts.body).toBe("sans-serif");
  expect(fontFiles).toEqual([]);
});

test("on a phone the headline sits right under the portrait", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile layout only");
  await page.goto("/");
  // Regression: a min-h-screen, vertically centred copy block left roughly
  // half a screen of empty ivory between the photo and the headline.
  const top = await page.locator("h1").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  expect(top).toBeLessThan(700);
});

test("the stats bar shows big gold figures and counts the garments up", async ({ page }) => {
  await page.goto("/");
  const bar = page.getByRole("region", { name: "Experience and credentials" });
  const counter = page.locator("[data-countup]");
  await expect(counter).toHaveCount(1);

  // Screen readers get the real figure even before the count has run.
  const spoken = await bar.evaluate((el) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    return clone.textContent ?? "";
  });
  expect(spoken).toMatch(/[1-9]\d*\+/);

  // Large and gold, not body-sized text.
  const style = await counter.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { size: parseFloat(cs.fontSize), color: cs.color };
  });
  expect(style.size).toBeGreaterThanOrEqual(28);
  expect(style.color).toBe("rgb(168, 136, 46)");

  // The bar starts below the first screen, so the count plays on scroll and
  // lands on the real figure.
  await bar.scrollIntoViewIfNeeded();
  await expect(counter).toHaveText(/^[1-9]\d*\+$/, { timeout: 5000 });
});
