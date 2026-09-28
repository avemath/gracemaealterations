import { test, expect } from "@playwright/test";

/**
 * Full-page captures of the five main routes at each project width (390 and
 * 1440), attached to the report for eyeballing. Content comes live from Sanity,
 * so these are not pixel-diffed; the hard assertion is no sideways scroll.
 */
const ROUTES = ["/", "/about", "/services", "/portfolio", "/contact"];

for (const route of ROUTES) {
  test(`screenshot: ${route}`, async ({ page }, testInfo) => {
    await page.goto(route, { waitUntil: "networkidle" });

    // Reveal everything so the capture shows the finished page.
    await page.evaluate(() =>
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"))
    );
    await page.waitForTimeout(700);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow, `${route} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(0);

    const name = route === "/" ? "home" : route.slice(1);
    await testInfo.attach(`${name}-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: true, animations: "disabled" }),
      contentType: "image/png",
    });
  });
}
