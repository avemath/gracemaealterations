import { test, expect, type Page } from "@playwright/test";
import { hydrated } from "./helpers";

/**
 * Reveals are CSS driven: the inline head script adds .js to <html>, which
 * arms [data-reveal] at opacity 0, and RevealObserver adds .is-visible as each
 * element scrolls in.
 */

/** The last [data-reveal] on the page is always well below the fold. */
async function lastReveal(page: Page) {
  const all = page.locator("[data-reveal]");
  await expect(all.first()).toBeAttached();
  return all.last();
}

const opacity = (page: Page, index: number) =>
  page.evaluate(
    (i) => getComputedStyle(document.querySelectorAll("[data-reveal]")[i]).opacity,
    index
  );

test.describe("scroll reveals", () => {
  test("below-the-fold elements start hidden and animate in on scroll", async ({ page }) => {
    await page.goto("/");
    await hydrated(page, "header a");

    const target = await lastReveal(page);
    const index = (await page.locator("[data-reveal]").count()) - 1;

    await expect(target).not.toHaveClass(/is-visible/);
    expect(await opacity(page, index)).toBe("0");

    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveClass(/is-visible/);
    await expect.poll(() => opacity(page, index)).toBe("1");
  });

  test("elements mounted after load are revealed too (portfolio filter)", async ({ page }) => {
    await page.goto("/portfolio");
    await hydrated(page, '[role="button"][aria-label^="View "]');

    const filters = page.getByRole("tab");
    test.skip((await filters.count()) < 2, "no portfolio filters rendered");
    await filters.nth(1).click();

    // The grid swaps out through AnimatePresence, so retry until the new
    // tiles have settled.
    const tile = page.locator('[data-reveal]:has(> [role="button"][aria-label^="View "])').first();
    await expect(async () => {
      await tile.scrollIntoViewIfNeeded({ timeout: 1000 });
      await expect(tile).toHaveClass(/is-visible/, { timeout: 1000 });
    }).toPass({ timeout: 10_000 });
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing is hidden or transitioned", async ({ page }) => {
    await page.goto("/");
    await hydrated(page, "header a");
    await lastReveal(page);

    // Without scrolling, every reveal target is already fully visible and has
    // no transition to play.
    const styles = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-reveal]")).map((el) => {
        const cs = getComputedStyle(el);
        return {
          opacity: cs.opacity,
          transform: cs.transform,
          property: cs.transitionProperty,
          duration: cs.transitionDuration,
        };
      })
    );
    expect(styles.length).toBeGreaterThan(0);
    for (const s of styles) {
      expect(s.opacity).toBe("1");
      expect(s.transform).toBe("none");
      // globals.css zeroes every transition under reduced motion (0.01ms,
      // property none), so nothing perceptible can play.
      const inert = s.property === "none" || s.duration.split(",").every((d) => parseFloat(d) < 0.01);
      expect(inert, `transition ${s.property} ${s.duration}`).toBe(true);
    }
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("server HTML is fully visible", async ({ page }) => {
    await page.goto("/");
    const hidden = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll("[data-reveal]")).filter(
          (el) => getComputedStyle(el).opacity !== "1"
        ).length
    );
    expect(hidden).toBe(0);
  });
});
