import type { Metadata } from "next";

export const SITE_URL = "https://gracemaealterations.com";
export const SITE_NAME = "Grace Mae Alterations";

/** The home share card, for routes with no opengraph-image of their own. */
export const FALLBACK_OG_IMAGE = "/opengraph-image";

interface PageMeta {
  title: string;
  description: string;
  /** Route path, e.g. "/services". Use "/" for the home page. */
  path: string;
  /**
   * Share image for routes without their own opengraph-image file. Leave it
   * out on routes that have one: an image set here overrides the file.
   */
  image?: string;
}

/**
 * Per-page metadata with a self canonical. Share images come from each
 * route's own opengraph-image file; routes without one pass FALLBACK_OG_IMAGE.
 */
export function pageMetadata({ title, description, path, image }: PageMeta): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      title,
      description,
      url,
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export const PAGE_META: Record<string, PageMeta> = {
  home: {
    path: "/",
    title: "Bridal Alterations & Tailoring in Pittsburgh | Grace Mae",
    description:
      "Former David's Bridal lead alterations specialist. Itemized quotes, honest timelines. Tailoring open now; 2027 bridal waitlist.",
  },
  services: {
    path: "/services",
    title: "Wedding Dress Alterations & Prices | Pittsburgh | Grace Mae",
    description:
      "Hems, bustles, bodice work and everyday tailoring in Pittsburgh, with price ranges and typical timelines.",
  },
  portfolio: {
    path: "/portfolio",
    title: "Real Wedding Dress Alterations, Before & After | Grace Mae",
    description:
      "Bustles, hems, sleeves and fittings on real Pittsburgh brides' gowns, with designer and alteration details.",
  },
  about: {
    path: "/about",
    title: "Meet Grace, Pittsburgh Bridal Seamstress | Grace Mae",
    description:
      "Formally trained designer and former Lead Alterations Specialist at David's Bridal, now fitting one client at a time.",
  },
  contact: {
    path: "/contact",
    title: "Book Tailoring or Join the 2027 Bridal Waitlist | Grace Mae",
    description:
      "Send photos and details and I'll reply personally. Tailoring and repairs open now in Pittsburgh.",
  },
};
