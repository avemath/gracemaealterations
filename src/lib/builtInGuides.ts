/**
 * Guides with their own page in the code, usually because they are built
 * around an interactive drawing. The guides index lists them after the
 * Studio's guides, and the sitemap includes them.
 *
 * Their words can still live in the Studio: a Studio guide with the same slug
 * supplies the title, summary and body (the page reads it), and is never
 * listed a second time. The title and summary here are what shows until that
 * guide exists.
 */
export interface BuiltInGuide {
  title: string;
  slug: string;
  summary: string;
  /** ISO date, for the sitemap and the Article's dates. */
  updated: string;
}

export const BUILT_IN_GUIDES: BuiltInGuide[] = [
  {
    title: "Trouser hem length, explained",
    slug: "trouser-hem-length",
    summary:
      "No break, quarter, half or full: how much your trousers should rest on your shoes, and why I always pin a hem over the shoes you’ll actually wear.",
    updated: "2026-09-29",
  },
];

export function builtInGuide(slug: string): BuiltInGuide {
  const guide = BUILT_IN_GUIDES.find((g) => g.slug === slug);
  if (!guide) throw new Error(`No built-in guide "${slug}"`);
  return guide;
}
