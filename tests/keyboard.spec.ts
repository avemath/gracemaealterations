import { test, expect, type Page } from "@playwright/test";

/**
 * Keyboard interaction only exists after React attaches its handlers, so every
 * test waits for hydration rather than racing it.
 */
async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
  }, selector);
}

test.describe("keyboard", () => {
  test("skip link is the first focusable element and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.locator("a", { hasText: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("mobile menu traps focus and Escape returns focus to the toggle", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "menu toggle is mobile only");
    await page.goto("/");

    await hydrated(page, "header button");
    const toggle = page.getByRole("button", { name: /open menu/i });
    await toggle.click();

    const dialog = page.getByRole("dialog", { name: /mobile navigation/i });
    await expect(dialog).toBeVisible();

    // Tab all the way round; focus must stay inside the dialog or on its own
    // close button in the header, and the close button must be reachable.
    let reachedClose = false;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const where = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        const el = document.activeElement;
        if (!dlg || !el) return "out";
        if (dlg.contains(el)) return "in";
        return el.getAttribute("aria-label") === "Close menu" ? "close" : "out";
      });
      if (where === "close") reachedClose = true;
      expect(where, `focus escaped the dialog on tab ${i + 1}`).not.toBe("out");
    }
    expect(reachedClose, "Tab never reached the close button").toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /open menu/i })).toBeFocused();
  });

  test("testimonial carousel moves with arrow keys", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: "Client testimonials" });
    await region.scrollIntoViewIfNeeded();

    const slide = page.locator("#testimonial-slide");
    const first = await slide.getAttribute("aria-label");
    expect(first).toBe("1 of 3");

    await hydrated(page, "#testimonial-slide");
    await page.getByRole("button", { name: "Show testimonial 1 of 3" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#testimonial-slide")).toHaveAttribute("aria-label", "2 of 3");

    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#testimonial-slide")).toHaveAttribute("aria-label", "1 of 3");
  });

  test("lightbox opens with Enter, navigates, closes with Escape, restores focus", async ({ page }) => {
    await page.goto("/portfolio");
    await hydrated(page, '[role="button"][aria-label^="View "]');
    const firstThumb = page.locator('[role="button"][aria-label^="View "]').first();
    await firstThumb.scrollIntoViewIfNeeded();
    await firstThumb.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: /Lightbox:/ });
    await expect(dialog).toBeVisible();

    // Two portfolio items share the label "Bridal Gown", so assert on the
    // position counter rather than the title.
    const counter = dialog.locator("text=/^\\d+ \\/ \\d+$/");
    await expect(counter).toContainText(/^1 \//);
    await page.keyboard.press("ArrowRight");
    await expect(counter).toContainText(/^2 \//);
    await page.keyboard.press("ArrowLeft");
    await expect(counter).toContainText(/^1 \//);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(firstThumb).toBeFocused();
  });

  test("before and after slider responds to Home and End", async ({ page }) => {
    await page.goto("/portfolio");
    await hydrated(page, '[role="slider"]');
    const slider = page.getByRole("slider", { name: "Before and after comparison" });
    await slider.scrollIntoViewIfNeeded();
    await slider.focus();

    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuenow", "96");

    await page.keyboard.press("Home");
    await expect(slider).toHaveAttribute("aria-valuenow", "4");
  });

  test("contact cards are keyboard selectable and swap the fields", async ({ page }) => {
    await page.goto("/contact");

    await hydrated(page, "form, [role='group']");
    const tailoring = page.getByRole("button", { name: /Tailoring or a repair/ });
    await tailoring.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel(/Wedding date/)).toBeHidden();

    const bridal = page.getByRole("button", { name: /Bridal \(/ });
    await bridal.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Wedding date")).toBeVisible();
    await expect(page.getByLabel(/Dress designer/)).toBeVisible();

    const party = page.getByRole("button", { name: /Bridal party or special occasion/ });
    await party.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Event date")).toBeVisible();
    await expect(page.getByLabel("How many garments")).toBeVisible();
  });
});
