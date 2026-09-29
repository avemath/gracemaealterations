import { test, expect, type Page, type Request } from "@playwright/test";
import sharp from "sharp";
import { hydrated } from "./helpers";

/**
 * The form is the only way to reach Grace. These tests drive it like a person
 * would and intercept /api/contact, so nothing is emailed; the route's own
 * validation is covered separately below.
 */

async function openBranch(page: Page, name: RegExp) {
  await page.goto("/contact");
  await hydrated(page, "[aria-pressed]");
  await page.locator("[aria-pressed]").filter({ hasText: name }).click();
  await expect(page.getByLabel("Full name")).toBeVisible();
}

/** A 12 MP JPEG that compresses like a real photo: soft gradient plus grain. */
async function phonePhoto() {
  const w = 4032;
  const h = 3024;
  const pixels = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      pixels[i] = 180 + (60 * x) / w;
      pixels[i + 1] = 150 + (50 * y) / h;
      pixels[i + 2] = 140 + ((x + y) % 7);
    }
  }
  const grain = await sharp({
    create: { width: w, height: h, channels: 3, background: "#808080", noise: { type: "gaussian", mean: 128, sigma: 12 } },
  })
    .raw()
    .toBuffer();
  return sharp(pixels, { raw: { width: w, height: h, channels: 3 } })
    .composite([{ input: grain, raw: { width: w, height: h, channels: 3 }, blend: "overlay" }])
    .jpeg({ quality: 95 })
    .toBuffer();
}

/** The form's own submit button, never one of the branch cards above it. */
const submit = (page: Page) => page.locator('form button[type="submit"]');

/** Captures the JSON body the form posts, and answers as the real route would. */
async function captureSubmit(page: Page) {
  let body: Record<string, unknown> | null = null;
  await page.route("**/api/contact", async (route) => {
    body = (route.request() as Request).postDataJSON();
    await route.fulfill({ status: 200, json: { success: true } });
  });
  return () => body;
}

test.describe("contact form", () => {
  test("typing keeps focus: every character lands in the field", async ({ page }) => {
    // Regression: the field component was declared inside render, so React
    // remounted the input on every keystroke and only the first letter stuck.
    await openBranch(page, /Tailoring or a repair/);
    await page.getByLabel("Full name").click();
    await page.keyboard.type("Jane Doe", { delay: 20 });
    await page.keyboard.press("Tab");
    await page.keyboard.type("jane@example.com", { delay: 10 });

    await expect(page.getByLabel("Full name")).toHaveValue("Jane Doe");
    await expect(page.getByLabel("Email address")).toHaveValue("jane@example.com");
  });

  test("tailoring branch submits the right payload", async ({ page }) => {
    const payload = await captureSubmit(page);
    await openBranch(page, /Tailoring or a repair/);

    await page.getByLabel("Full name").fill("Jane Doe");
    await page.getByLabel("Email address").fill("jane@example.com");
    await page.getByLabel(/The garment, and what you'd like done/).fill("Navy trousers, hem to flats");
    await page.getByLabel(/Needed by/).fill("2027-03-01");
    await page.getByLabel("How did you find me?").selectOption("Google");
    await submit(page).click();

    await expect(page.getByRole("heading", { level: 2 }).filter({ hasNotText: "Contact information" }).first()).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
    expect(payload()).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      serviceType: "tailoring",
      garmentDetails: "Navy trousers, hem to flats",
      eventDate: "2027-03-01",
      referralSource: "Google",
      company: "",
    });
  });

  test("bridal branch sends the intake details", async ({ page }) => {
    const payload = await captureSubmit(page);
    await openBranch(page, /^Bridal(?! party)/);

    await page.getByLabel("Full name").fill("Ann Bride");
    await page.getByLabel("Email address").fill("ann@example.com");
    await page.getByLabel("Wedding date").fill("2027-06-12");
    await page.getByLabel(/Dress designer/).fill("Allure");
    await page.getByLabel("Dress size ordered").fill("10");
    await page.getByLabel("Your usual street size").fill("6");
    await page.getByLabel("Hem", { exact: true }).check();
    await page.getByLabel("Bustle", { exact: true }).check();
    await page.getByLabel(/shoes and undergarments/).selectOption("shoes_only");
    await submit(page).click();

    await expect(page.locator("form")).toHaveCount(0);
    expect(payload()).toMatchObject({
      serviceType: "bridal",
      eventDate: "2027-06-12",
      dressDesigner: "Allure",
      dressSizeOrdered: "10",
      currentStreetSize: "6",
      alterationsNeeded: ["hem", "bustle"],
      shoesUndergarments: "shoes_only",
    });
  });

  test("a wedding date gets an honest note, and a close one asks rather than joins", async ({ page }) => {
    await openBranch(page, /^Bridal(?! party)/);
    const note = page.getByTestId("date-note");
    const inWeeks = (weeks: number) => {
      const d = new Date(Date.now() + weeks * 7 * 86400000);
      return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    };

    await page.getByLabel("Wedding date").fill(inWeeks(3));
    await expect(note).toContainText("under eight weeks");
    await expect(page.getByRole("button", { name: "Ask about my date" })).toBeVisible();

    await page.getByLabel("Wedding date").fill(inWeeks(60));
    await expect(note).toContainText("Plenty of time");
    await expect(page.getByRole("button", { name: "Ask about my date" })).toHaveCount(0);
  });

  test("bridal party branch sends the garment count", async ({ page }) => {
    const payload = await captureSubmit(page);
    await openBranch(page, /Bridal party or special occasion/);

    await page.getByLabel("Full name").fill("Mae Party");
    await page.getByLabel("Email address").fill("mae@example.com");
    await page.getByLabel("Event date").fill("2027-05-01");
    await page.getByLabel("How many garments").fill("4");
    await submit(page).click();

    await expect(page.locator("form")).toHaveCount(0);
    expect(payload()).toMatchObject({ serviceType: "party", eventDate: "2027-05-01", garmentCount: "4" });
  });

  test("five full-size phone photos are resized to fit one request", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one width is enough");
    const payload = await captureSubmit(page);
    await openBranch(page, /Tailoring or a repair/);

    const photo = await phonePhoto();
    expect(photo.length).toBeGreaterThan(3 * 1024 * 1024);

    await page.locator("#photos").setInputFiles(
      [1, 2, 3, 4, 5].map((n) => ({ name: `IMG_000${n}.jpg`, mimeType: "image/jpeg", buffer: photo }))
    );
    await expect(page.getByRole("button", { name: /Remove IMG_000/ })).toHaveCount(5, { timeout: 30_000 });

    await page.getByLabel("Full name").fill("Jane Doe");
    await page.getByLabel("Email address").fill("jane@example.com");
    await submit(page).click();
    await expect(page.locator("form")).toHaveCount(0);

    const body = payload() as { attachments: unknown[] } | null;
    expect(body?.attachments).toHaveLength(5);
    expect(Buffer.byteLength(JSON.stringify(body))).toBeLessThan(4.5 * 1024 * 1024);
  });

  test("photos that cannot fit are refused with a message, not a failed send", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one width is enough");
    await openBranch(page, /Tailoring or a repair/);

    // Pure noise barely compresses, so a few of these exhaust the budget.
    const noise = await sharp({
      // 5 MP keeps five copies under Playwright's 50 MB upload cap.
      create: { width: 2592, height: 1944, channels: 3, background: "#808080", noise: { type: "gaussian", mean: 128, sigma: 60 } },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    await page.locator("#photos").setInputFiles(
      [1, 2, 3, 4, 5].map((n) => ({ name: `NOISE_${n}.jpg`, mimeType: "image/jpeg", buffer: noise }))
    );
    await expect(page.getByRole("alert").filter({ hasText: /too large to send together/ })).toBeVisible({
      timeout: 30_000,
    });
    const kept = await page.getByRole("button", { name: /Remove NOISE_/ }).count();
    expect(kept).toBeGreaterThan(0);
    expect(kept).toBeLessThan(5);
  });

  test("shows a clear error when the request fails", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 500, json: { error: "x" } }));
    await openBranch(page, /Tailoring or a repair/);
    await page.getByLabel("Full name").fill("Jane Doe");
    await page.getByLabel("Email address").fill("jane@example.com");
    await submit(page).click();
    await expect(page.getByRole("alert").filter({ hasText: /something went wrong/ })).toBeVisible();
  });
});

test.describe("/api/contact", () => {
  test("rejects a missing name and silently accepts the honeypot", async ({ request }, testInfo) => {
    // The route rate limits by IP, so keep real requests to one project.
    test.skip(testInfo.project.name !== "desktop", "one width is enough");

    const missing = await request.post("/api/contact", { data: { name: "", email: "a@b.co" } });
    expect(missing.status()).toBe(400);

    const bot = await request.post("/api/contact", {
      data: { name: "Bot", email: "bot@example.com", company: "Acme" },
    });
    expect(bot.status()).toBe(200);
  });

  test("a body that isn't an object is a 400, not a crash", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one width is enough");
    for (const data of ["null", "[]", "42"]) {
      const res = await request.post("/api/contact", {
        data,
        headers: { "content-type": "application/json" },
      });
      expect(res.status(), data).toBe(400);
    }
  });
});

test("structured data parses, and can't be broken out of", async ({ page }) => {
  for (const path of ["/", "/guides/what-to-bring-to-your-wedding-dress-fitting"]) {
    const res = await page.goto(path);
    if (res?.status() !== 200) continue;
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length, path).toBeGreaterThan(0);
    for (const text of blocks) {
      expect(() => JSON.parse(text), path).not.toThrow();
      expect(text, path).not.toContain("</");
    }
  }
});
