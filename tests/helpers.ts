import type { Page } from "@playwright/test";

/**
 * Keyboard and form interaction only exists after React attaches its
 * handlers, so tests wait for hydration rather than racing it.
 */
export async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
  }, selector);
}
