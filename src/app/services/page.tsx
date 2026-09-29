import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import {
  getMergedServices,
  getMergedServicesPage,
  getMergedSite,
  getPublishedGuides,
} from "@/lib/sanity.queries";
import ServicesPageContent from "./ServicesPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.services);


/** Which guides sit under which service. The trouser guide is built into the site, not Sanity. */
const GUIDES_FOR: Record<string, string[]> = {
  bridal: ["wedding-dress-alterations-timeline", "wedding-dress-bustle-types", "what-to-bring-to-your-wedding-dress-fitting"],
  tailoring: ["trouser-hem-length"],
};
const BUILT_IN_TITLES: Record<string, string> = { "trouser-hem-length": "Trouser hem length, explained" };

export default async function ServicesPage() {
  const [services, page, site, guides] = await Promise.all([
    getMergedServices(),
    getMergedServicesPage(),
    getMergedSite(),
    getPublishedGuides(),
  ]);
  const titles: Record<string, string> = { ...BUILT_IN_TITLES };
  for (const g of guides ?? []) titles[g.slug] = g.title;
  const guideLinks = Object.fromEntries(
    Object.entries(GUIDES_FOR).map(([id, slugs]) => [
      id,
      slugs.filter((slug) => titles[slug]).map((slug) => ({ title: titles[slug], href: `/guides/${slug}` })),
    ])
  );

  return (
    <ServicesPageContent
      services={services}
      page={page}
      guideLinks={guideLinks}
      availability={{
        limitedMode: site.limitedMode,
        waitlistServices: site.waitlistServices,
        reopensLabel: site.reopensLabel,
        limitedNote: site.limitedNote,
      }}
    />
  );
}
