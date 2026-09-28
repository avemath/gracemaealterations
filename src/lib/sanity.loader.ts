import type { ImageLoaderProps } from "next/image";

/**
 * Builds cdn.sanity.io URLs directly, so images are compressed once by Sanity
 * instead of twice (Sanity, then /_next/image). Crop and hotspot are already
 * baked into `src` by the image-url builder.
 */
export function sanityLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.startsWith("https://cdn.sanity.io/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 80));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}

// Also the site-wide default (next.config.mjs), so no image ever goes through
// Next's own /_next/image optimizer.
export default sanityLoader;
