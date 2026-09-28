import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity.client";
import { SITE_URL } from "@/lib/metadata";

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
  return entries;
}
