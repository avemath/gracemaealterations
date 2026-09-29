import { getPortfolioItems } from "@/lib/sanity.queries";
import { SITE_URL } from "@/lib/metadata";

// A separate image sitemap (this version of Next can't add images to the main
// one), so Google Images can find the portfolio photos and credit the site.
export const revalidate = 3600;

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const items = (await getPortfolioItems().catch(() => null)) ?? [];
  const byPage = new Map<string, string[]>();
  for (const item of items) {
    const url = item.image?.asset?.url;
    if (!url) continue;
    const page = item.slug ? `${SITE_URL}/portfolio/${item.slug}` : `${SITE_URL}/portfolio`;
    byPage.set(page, [...(byPage.get(page) ?? []), url]);
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...Array.from(byPage, ([page, urls]) =>
      [
        "  <url>",
        `    <loc>${xml(page)}</loc>`,
        ...urls.slice(0, 1000).map((u) => `    <image:image><image:loc>${xml(u)}</image:loc></image:image>`),
        "  </url>",
      ].join("\n")
    ),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
