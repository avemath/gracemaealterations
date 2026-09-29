import { test, expect } from "@playwright/test";

/**
 * Link previews and icons. These only need one width, and they check the
 * server HTML directly rather than the rendered page.
 */
const OWN_CARD = ["/", "/about", "/services", "/portfolio", "/contact", "/guides/wedding-dress-bustle-types", "/guides/trouser-hem-length"];

const ogImage = (html: string) =>
  html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? null;

test.describe("share cards", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one width is enough");
  });

  for (const route of OWN_CARD) {
    test(`${route} uses its own card, a JPEG small enough for WhatsApp`, async ({ request }) => {
      const html = await (await request.get(route)).text();
      const url = ogImage(html);
      expect(url, "og:image missing").not.toBeNull();

      // Regression: a default image in pageMetadata once replaced every
      // route's own card with the home one.
      const path = new URL(url!).pathname;
      expect(path).toBe(route === "/" ? "/opengraph-image" : `${route}/opengraph-image`);

      const image = await request.get(path);
      expect(image.status()).toBe(200);
      expect(image.headers()["content-type"]).toBe("image/jpeg");
      expect((await image.body()).length).toBeLessThan(300 * 1024);
    });
  }

  test("routes without a card fall back to the home one", async ({ request }) => {
    const html = await (await request.get("/guides")).text();
    expect(new URL(ogImage(html)!).pathname).toBe("/opengraph-image");
  });
});

test("favicon, app icon and apple touch icon are linked and served", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one width is enough");
  const html = await (await request.get("/")).text();
  for (const rel of ['rel="icon" href="/favicon.ico"', 'rel="icon" href="/icon.png', 'rel="apple-touch-icon" href="/apple-icon.png']) {
    expect(html).toContain(rel);
  }
  for (const path of ["/favicon.ico", "/icon.png", "/apple-icon.png"]) {
    expect((await request.get(path)).status()).toBe(200);
  }
});
