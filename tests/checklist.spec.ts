import { test, expect } from "@playwright/test";

/**
 * The "what to bring" guide renders as a packing checklist. Ticks are a
 * per-device convenience, so they survive a reload but never leave the browser.
 */
test("fitting bag checklist ticks, counts and remembers", async ({ page }) => {
  const res = await page.goto("/guides/what-to-bring-to-your-wedding-dress-fitting");
  test.skip(res?.status() !== 200, "guide not published");

  const bag = page.getByTestId("fitting-bag");
  const boxes = bag.getByRole("checkbox");
  const total = await boxes.count();
  expect(total).toBeGreaterThan(1);
  await expect(page.getByTestId("bag-count")).toHaveText(`0 of ${total} packed`);

  await boxes.first().check({ force: true });
  await expect(page.getByTestId("bag-count")).toHaveText(`1 of ${total} packed`);

  await page.reload();
  await expect(page.getByTestId("bag-count")).toHaveText(`1 of ${total} packed`);

  for (let i = 1; i < total; i++) await boxes.nth(i).check({ force: true });
  await expect(page.getByTestId("bag-count")).toHaveText("All packed. See you at the fitting.");
});
