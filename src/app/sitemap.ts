import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity.client";
import { SITE_URL, LANDING_SLUGS } from "@/lib/metadata";
import { BUILT_IN_GUIDES } from "@/lib/builtInGuides";
import {
  getPublishedGuides,
  getCaseStudies,
  getPublishedLandingPages,
  getPolicies,
} from "@/lib/sanity.queries";

const ROUTES = [
  { path: "/", priority: 1.0, type: "homePage" },
  { path: "/services", priority: 0.9, type: "servicesPage" },
  { path: "/portfolio", priority: 0.8, type: "portfolioPage" },
  { path: "/about", priority: 0.7, type: "aboutPage" },
  { path: "/contact", priority: 0.9, type: "contactPage" },
];

/** Newest _updatedAt for a singleton, so lastModified tracks real edits. */
async function lastModified(type: string): Promise<Date> {
  if (!sanityClient) return new Date();
  try {
    const updated = await sanityClient.fetch<string | null>(
      `*[_type == $type][0]._updatedAt`,
      { type },
      { next: { revalidate: 3600 } }
    );
    return updated ? new Date(updated) : new Date();
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await Promise.all(
    ROUTES.map(async (route) => ({
      url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
      lastModified: await lastModified(route.type),
      changeFrequency: "monthly" as const,
      priority: route.priority,
    }))
  );
  // Published content only: drafts are excluded by the queries themselves.
  const [guides, caseStudies, landingPages, policies] = await Promise.all([
    getPublishedGuides(),
    getCaseStudies(),
    getPublishedLandingPages(),
    getPolicies(),
  ]);

  const dynamicEntries: MetadataRoute.Sitemap = [];

  if (policies) {
    dynamicEntries.push({
      url: `${SITE_URL}/policies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    });
  }

  // The index always has the built-in guides on it.
  dynamicEntries.push({
    url: `${SITE_URL}/guides`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  });

  const builtInSlugs = new Set(BUILT_IN_GUIDES.map((g) => g.slug));
  for (const guide of BUILT_IN_GUIDES) {
    dynamicEntries.push({
      url: `${SITE_URL}/guides/${guide.slug}`,
      lastModified: new Date(guide.updated),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // A built-in page owns its URL, so a Studio guide with the same slug is skipped.
  for (const guide of (guides ?? []).filter((g) => !builtInSlugs.has(g.slug))) {
    dynamicEntries.push({
      url: `${SITE_URL}/guides/${guide.slug}`,
      lastModified: guide._updatedAt ? new Date(guide._updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const item of caseStudies ?? []) {
    dynamicEntries.push({
      url: `${SITE_URL}/portfolio/${item.slug}`,
      lastModified: item._updatedAt ? new Date(item._updatedAt) : new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  for (const page of (landingPages ?? []).filter((p) => LANDING_SLUGS.includes(p.slug))) {
    dynamicEntries.push({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return [...entries, ...dynamicEntries];
}
