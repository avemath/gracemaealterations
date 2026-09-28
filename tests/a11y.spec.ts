import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/about", "/services", "/portfolio", "/contact", "/policies"];

for (const route of ROUTES) {
  test(`axe: ${route}`, async ({ page }, testInfo) => {
    const response = await page.goto(route);

    // /policies 404s while the singleton is unpublished. That is the intended
    // behaviour, so there is nothing to scan.
    if (response && response.status() === 404) {
      test.skip(true, `${route} is not published`);
      return;
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    if (blocking.length > 0) {
      const detail = blocking
        .map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(" "))
              .join("\n    ")}`
        )
        .join("\n  ");
      testInfo.attach("violations", { body: detail });
      expect(blocking, `${testInfo.project.name} ${route}\n  ${detail}`).toEqual([]);
    }
  });
}
