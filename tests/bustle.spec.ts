import { test, expect } from "@playwright/test";

/**
 * The bustle explorer on the services page: pick a style, the train lifts
 * into it, and the slider, button and drawing's accessible name all agree.
 */
test.describe("bustle explorer", () => {
  test("bustles on arrival, lets down, and replays for a new style", async ({ page }) => {
    await page.goto("/services");
    const section = page.locator("#bustles");
    const slider = section.getByRole("slider");
    const drawing = section.getByRole("img");

    await drawing.scrollIntoViewIfNeeded();
    // Plays once when it comes into view.
    await expect(slider).toHaveValue("100", { timeout: 5000 });
    await expect(drawing).toHaveAccessibleName(/American bustle, bustled for the reception/);

    await section.getByRole("button", { name: "Let it down" }).click();
    await expect(slider).toHaveValue("0", { timeout: 5000 });
    await expect(drawing).toHaveAccessibleName(/train down for the ceremony/);

    await section.getByText("French", { exact: true }).first().click();
    await expect(section.getByRole("radio", { name: "French" })).toBeChecked();
    await expect(slider).toHaveValue("100", { timeout: 5000 });
    await expect(section.getByRole("heading", { name: "French" })).toBeVisible();
  });

  test("the slider moves the train by hand", async ({ page }) => {
    await page.goto("/services");
    const section = page.locator("#bustles");
    await section.getByRole("img").scrollIntoViewIfNeeded();
    const slider = section.getByRole("slider");
    await expect(slider).toHaveValue("100", { timeout: 5000 });
    await slider.fill("20");
    await expect(slider).toHaveAttribute("aria-valuetext", "train down for the ceremony");
    await slider.fill("80");
    await expect(slider).toHaveAttribute("aria-valuetext", "bustled for the reception");
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("does not play by itself and jumps straight to the result", async ({ page }) => {
      await page.goto("/services");
      const section = page.locator("#bustles");
      await section.getByRole("img").scrollIntoViewIfNeeded();
      const slider = section.getByRole("slider");
      await page.waitForTimeout(1200);
      await expect(slider).toHaveValue("0");
      await section.getByRole("button", { name: "Bustle it" }).click();
      await expect(slider).toHaveValue("100");
    });
  });
});
