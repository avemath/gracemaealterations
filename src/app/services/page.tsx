import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import {
  getMergedServices,
  getMergedServicesPage,
  getMergedSite,
  getPublishedGuides,
} from "@/lib/sanity.queries";
import { BUILT_IN_GUIDES } from "@/lib/builtInGuides";
import { getText } from "@/lib/text";
import { pickText } from "@/lib/cta";
import ServicesPageContent from "./ServicesPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.services);


/**
 * Which guides sit under which service until Grace picks them on the Service
 * in the Studio. By slug, so the trouser guide is found whether it is built
 * into the site or has become a Studio guide.
 */
const GUIDES_FOR: Record<string, string[]> = {
  bridal: ["wedding-dress-alterations-timeline", "wedding-dress-bustle-types", "what-to-bring-to-your-wedding-dress-fitting"],
  tailoring: ["trouser-hem-length"],
};

export default async function ServicesPage() {
  const [services, page, site, guides, text] = await Promise.all([
    getMergedServices(),
    getMergedServicesPage(),
    getMergedSite(),
    getPublishedGuides(),
    getText("site"),
  ]);
  const titles: Record<string, string> = Object.fromEntries(BUILT_IN_GUIDES.map((g) => [g.slug, g.title]));
  for (const g of guides ?? []) titles[g.slug] = g.title;
  const guideLinks = Object.fromEntries(
    services.map((service) => {
      // Picked in the Studio (its published ones), else the usual list.
      const picked = service.guides;
      const links = picked
        ? picked.map((g) => ({ title: g.title, href: `/guides/${g.slug}` }))
        : (GUIDES_FOR[service.id] ?? [])
            .filter((slug) => titles[slug])
            .map((slug) => ({ title: titles[slug], href: `/guides/${slug}` }));
      return [service.id, links];
    })
  );

  return (
    <ServicesPageContent
      text={pickText(text, "services", "banner", "cta")}
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
