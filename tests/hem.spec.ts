import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { hydrated } from "./helpers";

/**
 * The trouser hem guide: pick a break, a shoe and a leg, and the drawing,
 * its accessible name and the caption all follow.
 */
const PATH = "/guides/trouser-hem-length";
const BREAKS = [
  { id: "none", label: "No break", caption: /skims the top of the shoe/ },
  { id: "quarter", label: "Quarter break", caption: /barely-there dimple/ },
  { id: "half", label: "Half break", caption: /One soft fold/ },
  { id: "full", label: "Full break", caption: /deep crease/ },
];

test.describe("hem explorer", () => {
  test("the guide loads with the explorer", async ({ page }) => {
    const res = await page.goto(PATH);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trouser hem length, explained");
    await expect(page.getByTestId("hem-drawing")).toHaveAttribute("data-break", "half");
    await expect(page.getByRole("link", { name: "Send a tailoring request" })).toHaveAttribute(
      "href",
      "/contact?service=tailoring"
    );
  });

  test("each break changes the drawing and the caption", async ({ page }) => {
    await page.goto(PATH);
    await hydrated(page, '[data-testid="hem-drawing"]');
    const drawing = page.getByTestId("hem-drawing");
    const caption = page.getByTestId("hem-caption");
    const breaks = page.getByRole("radiogroup", { name: "Break" });

    const seen = new Set<string>();
    // Start away from the default so every click is a change.
    for (const b of [...BREAKS].reverse()) {
      await breaks.getByText(b.label, { exact: true }).click();
      await expect(breaks.getByRole("radio", { name: b.label })).toBeChecked();
      await expect(drawing).toHaveAttribute("data-break", b.id);
      await expect(caption).toHaveText(b.caption);
      seen.add((await caption.textContent()) ?? "");
    }
    expect(seen.size).toBe(BREAKS.length);
    await expect(drawing).toHaveAccessibleName(/over a dress shoe, hemmed with no break/);
  });

  test("shoe, leg and slanted hem update the drawing", async ({ page }) => {
    await page.goto(PATH);
    await hydrated(page, '[data-testid="hem-drawing"]');
    const drawing = page.getByTestId("hem-drawing");

    await page.getByRole("radiogroup", { name: "Shoe" }).getByText("Heel", { exact: true }).click();
    await expect(drawing).toHaveAttribute("data-shoe", "heel");
    await expect(page.locator("dd", { hasText: "Bring the shoes you’ll wear" })).toBeVisible();

    await page.getByRole("radiogroup", { name: "Leg" }).getByText("Wide", { exact: true }).click();
    await expect(drawing).toHaveAttribute("data-leg", "wide");
    await expect(drawing).toHaveAccessibleName(/wide trouser leg over a heeled pump/);

    await page.getByText("Slanted hem", { exact: true }).click();
    await expect(page.getByRole("switch", { name: "Slanted hem" })).toBeChecked();
    await expect(drawing).toHaveAttribute("data-slanted", "true");
  });

  test("animates between lengths", async ({ page }) => {
    await page.goto(PATH);
    await hydrated(page, '[data-testid="hem-drawing"]');
    const outline = page.locator('[data-testid="hem-trouser"] path').first();
    await outline.evaluate((el) => {
      (window as unknown as { hemChanges: number }).hemChanges = 0;
      new MutationObserver(() => (window as unknown as { hemChanges: number }).hemChanges++).observe(el, {
        attributeFilter: ["d"],
      });
    });
    await page.getByRole("radiogroup", { name: "Break" }).getByText("Full break", { exact: true }).click();
    await expect(page.getByTestId("hem-drawing")).toHaveAttribute("data-animating", "false", { timeout: 3000 });
    const changes = await page.evaluate(() => (window as unknown as { hemChanges: number }).hemChanges);
    expect(changes).toBeGreaterThan(3);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("jumps straight to the new length", async ({ page }) => {
      await page.goto(PATH);
      await hydrated(page, '[data-testid="hem-drawing"]');
      const drawing = page.getByTestId("hem-drawing");
      const outline = page.locator('[data-testid="hem-trouser"] path').first();
      await outline.evaluate((el) => {
        (window as unknown as { hemChanges: number }).hemChanges = 0;
        new MutationObserver(() => (window as unknown as { hemChanges: number }).hemChanges++).observe(el, {
          attributeFilter: ["d"],
        });
      });
      await page.getByRole("radiogroup", { name: "Break" }).getByText("Full break", { exact: true }).click();
      await expect(drawing).toHaveAttribute("data-break", "full");
      await page.waitForTimeout(900);
      await expect(drawing).toHaveAttribute("data-animating", "false");
      const changes = await page.evaluate(() => (window as unknown as { hemChanges: number }).hemChanges);
      expect(changes).toBe(1);
    });
  });

  test("no horizontal overflow on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PATH);
    await hydrated(page, '[data-testid="hem-drawing"]');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const box = await page.getByTestId("hem-drawing").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  });

  test("has no serious accessibility issues", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(PATH);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
});

test("the guide is listed on the guides index and in the sitemap", async ({ page, request }) => {
  await page.goto("/guides");
  const link = page.getByRole("region", { name: "All guides" }).getByRole("link", { name: /Trouser hem length, explained/ });
  await expect(link).toHaveAttribute("href", PATH);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(PATH);
});
