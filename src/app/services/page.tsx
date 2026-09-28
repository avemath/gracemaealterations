import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import {
  getMergedServices,
  getMergedServicesPage,
  getMergedSite,
  getPublishedBustleStyles,
  getPublishedGuides,
} from "@/lib/sanity.queries";
import ServicesPageContent from "./ServicesPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.services);


export default async function ServicesPage() {
  const [services, page, site, bustleStyles, guides] = await Promise.all([
    getMergedServices(),
    getMergedServicesPage(),
    getMergedSite(),
    getPublishedBustleStyles(),
    getPublishedGuides(),
  ]);

  return (
    <ServicesPageContent
      services={services}
      page={page}
      bustleCopy={(bustleStyles ?? []).map((s) => ({ ...s, slug: s.slug ?? "" }))}
      hasBustleGuide={(guides ?? []).some((g) => g.slug === "wedding-dress-bustle-types")}
      availability={{
        limitedMode: site.limitedMode,
        waitlistServices: site.waitlistServices,
        reopensLabel: site.reopensLabel,
        limitedNote: site.limitedNote,
      }}
    />
  );
}
