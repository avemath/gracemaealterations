import { test, expect } from "@playwright/test";

/**
 * The bustle explorer on the bustle guide: pick a style, the train lifts
 * into it, and the slider, button and drawing's accessible name all agree.
 */
test.describe("bustle explorer", () => {
  test("bustles on arrival, lets down, and replays for a new style", async ({ page }) => {
    await page.goto("/guides/wedding-dress-bustle-types");
    const section = page.locator('section[aria-label="Try each bustle"]');
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
    await page.goto("/guides/wedding-dress-bustle-types");
    const section = page.locator('section[aria-label="Try each bustle"]');
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
      await page.goto("/guides/wedding-dress-bustle-types");
      const section = page.locator('section[aria-label="Try each bustle"]');
      await section.getByRole("img").scrollIntoViewIfNeeded();
      const slider = section.getByRole("slider");
      await page.waitForTimeout(1200);
      await expect(slider).toHaveValue("0");
      await section.getByRole("button", { name: "Bustle it" }).click();
      await expect(slider).toHaveValue("100");
    });
  });
});

test.describe("bustle explorer paths", () => {
  test.use({ reducedMotion: "reduce" });
  test("shows which way each point is pulled, then clears the arrows once bustled", async ({ page }) => {
    await page.goto("/guides/wedding-dress-bustle-types");
    const section = page.locator('section[aria-label="Try each bustle"]');
    await section.getByRole("img").scrollIntoViewIfNeeded();
    const slider = section.getByRole("slider");
    const sidePath = section.locator('[data-testid="path-side-loop"]');

    await slider.fill("0");
    await expect(sidePath).toHaveAttribute("opacity", "0.9");
    const caption = section.getByTestId("bustle-step");
    await expect(caption).toHaveText("Loops are sewn under the train.");

    await slider.fill("100");
    await expect(sidePath).toHaveAttribute("opacity", "0");
    await expect(caption).toContainText("hooked onto a button at the hip");

    await section.getByText("French", { exact: true }).first().click();
    await slider.fill("40");
    await expect(caption).toContainText("tucked up underneath the skirt");
  });
});

test("services points to the guides instead of carrying the explorer", async ({ page }) => {
  await page.goto("/services");
  await expect(page.locator("#bustles")).toHaveCount(0);
  const bridalGuides = page.getByRole("navigation", { name: /guides for bridal/i });
  await expect(bridalGuides.getByRole("link", { name: /bustle/i })).toHaveAttribute("href", "/guides/wedding-dress-bustle-types");
  const tailoringGuides = page.getByRole("navigation", { name: /guides for everyday tailoring/i });
  await expect(tailoringGuides.getByRole("link", { name: /trouser hem/i })).toHaveAttribute("href", "/guides/trouser-hem-length");
});
