import { test, expect, type Page } from "@playwright/test";
import sharp from "sharp";
import { hydrated } from "./helpers";

/**
 * The optional AI photo check on the contact form. /api/photo-check is
 * intercepted with a canned answer, so no model is called; the button only
 * renders when ANTHROPIC_API_KEY is set at build time (CI sets a placeholder).
 */

const RESULT = {
  usable: true,
  note: "",
  garment: { type: "Wedding gown", confidence: "high" },
  silhouette: "A-line",
  fabrics: [{ name: "Satin", confidence: "medium", cues: "Smooth surface with a soft sheen and heavy drape" }],
  layers: "",
  details: ["Covered buttons down the back"],
  closure: "Zipper under covered buttons",
  train: "chapel",
  fitObservations: [],
  checklist: [{ id: "bustle", reason: "Train visible and resting on the floor" }],
  cannotTell: ["Fiber content", "How much seam allowance there is"],
};

async function smallPhoto() {
  return sharp({ create: { width: 600, height: 800, channels: 3, background: "#f4efe6" } }).jpeg().toBuffer();
}

async function bridalWithPhoto(page: Page) {
  await page.goto("/contact");
  await hydrated(page, "[aria-pressed]");
  await page.locator("[aria-pressed]").filter({ hasText: /^Bridal(?! party)/ }).click();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await page.locator("#photos").setInputFiles({ name: "gown.jpg", mimeType: "image/jpeg", buffer: await smallPhoto() });
  await expect(page.getByRole("button", { name: "Remove gown.jpg" })).toBeAttached();
}

test.describe("photo check", () => {
  test("reads the photos, suggests related checklist items, and goes out with the request", async ({ page }) => {
    let checkBody: Record<string, unknown> | null = null;
    await page.route("**/api/photo-check", async (route) => {
      checkBody = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { result: RESULT } });
    });
    let contactBody: Record<string, unknown> | null = null;
    await page.route("**/api/contact", async (route) => {
      contactBody = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { success: true } });
    });

    await bridalWithPhoto(page);
    const button = page.getByRole("button", { name: "Check my photos" });
    test.skip((await button.count()) === 0, "photo check not configured in this build");
    await button.click();

    await expect(page.getByText("What the photos show")).toBeVisible();
    expect(checkBody).toMatchObject({ serviceType: "bridal" });
    expect((checkBody as unknown as { photos: string[] }).photos).toHaveLength(1);

    await expect(page.getByText("Wedding gown")).toBeVisible();
    await expect(page.getByText("Satin")).toBeVisible();
    await expect(page.getByText("Likely")).toBeVisible();
    await expect(page.getByText(/Photos can.t show/)).toBeVisible();

    // A suggestion ticks the real checklist box, and only when tapped.
    const bustleBox = page.getByLabel("Bustle", { exact: true });
    await expect(bustleBox).not.toBeChecked();
    await page.getByRole("button", { name: /Bustle/ }).click();
    await expect(bustleBox).toBeChecked();

    await page.getByLabel("Full name").fill("Ann Bride");
    await page.getByLabel("Email address").fill("ann@example.com");
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator("form")).toHaveCount(0);

    expect(contactBody).toMatchObject({
      alterationsNeeded: ["bustle"],
      photoCheck: { garment: { type: "Wedding gown" }, train: "chapel" },
    });
  });

  test("unticking it keeps the check out of the request", async ({ page }) => {
    await page.route("**/api/photo-check", (route) => route.fulfill({ status: 200, json: { result: RESULT } }));
    let contactBody: Record<string, unknown> | null = null;
    await page.route("**/api/contact", async (route) => {
      contactBody = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { success: true } });
    });

    await bridalWithPhoto(page);
    const button = page.getByRole("button", { name: "Check my photos" });
    test.skip((await button.count()) === 0, "photo check not configured in this build");
    await button.click();
    await page.getByLabel(/Send this with my request/).uncheck();

    await page.getByLabel("Full name").fill("Ann Bride");
    await page.getByLabel("Email address").fill("ann@example.com");
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator("form")).toHaveCount(0);
    expect(contactBody).toMatchObject({ photoCheck: null });
  });

  test("a failed check says so and leaves the form usable", async ({ page }) => {
    await page.route("**/api/photo-check", (route) =>
      route.fulfill({ status: 429, json: { error: "That's a lot of checks for one hour." } })
    );
    await bridalWithPhoto(page);
    const button = page.getByRole("button", { name: "Check my photos" });
    test.skip((await button.count()) === 0, "photo check not configured in this build");
    await button.click();
    await expect(page.getByText("That's a lot of checks for one hour.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Check my photos" })).toBeVisible();
  });

  test("the route refuses requests from other sites", async ({ request }) => {
    const res = await request.post("/api/photo-check", {
      data: { photos: [], serviceType: "bridal" },
      headers: { origin: "https://example.com" },
    });
    // 503 without a key; 403 with one. Either way, nothing is analysed.
    expect([403, 503]).toContain(res.status());
  });
});
