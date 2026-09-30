import { test, expect } from "@playwright/test";

/**
 * A page's script arriving as an error (a dropped phone connection, or a
 * page left open across a deploy, so the file no longer exists) used to end
 * on the "A thread came loose" screen. The site now reloads once instead.
 */
test("a script that fails to load while moving between pages reloads the page instead of showing the error screen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the nav links are the same at every width");
  let armed = false;
  let failed = 0;
  await page.route(/\/_next\/static\/chunks\/app\/contact\/page-.*\.js/, (route) => {
    // Until the click, keep prefetching from fetching the file early.
    if (!armed) return route.abort("blockedbyclient");
    if (failed++ === 0) return route.fulfill({ status: 502, contentType: "text/html", body: "Bad Gateway" });
    return route.continue();
  });

  await page.goto("/", { waitUntil: "networkidle" });
  armed = true;
  await page.locator("nav a[href='/contact']").first().click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Let's talk about your garment", { timeout: 15_000 });
  expect(failed).toBeGreaterThan(0);
  expect(await page.evaluate(() => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type)).toBe("reload");
});

test("the David's Bridal page says it isn't affiliated with David's Bridal", async ({ page }) => {
  await page.goto("/david-s-bridal-dress-alterations");
  await expect(page.getByTestId("landing-small-print")).toContainText("not affiliated with David's Bridal");
});

test("every tab title ends in exactly one '| Grace Mae'", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "titles don't change with width");
  for (const path of ["/", "/services", "/portfolio", "/about", "/contact", "/guides", "/guides/trouser-hem-length", "/david-s-bridal-dress-alterations", "/no-such-page"]) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    expect(title, path).toMatch(/ \| Grace Mae$/);
    expect(title.match(/Grace Mae/g)?.length, path).toBe(1);
  }
});
