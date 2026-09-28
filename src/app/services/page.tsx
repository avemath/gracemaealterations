import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import { getMergedServices, getMergedServicesPage, getMergedSite } from "@/lib/sanity.queries";
import ServicesPageContent from "./ServicesPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.services);


export default async function ServicesPage() {
  const [services, page, site] = await Promise.all([
    getMergedServices(),
    getMergedServicesPage(),
    getMergedSite(),
  ]);

  return (
    <ServicesPageContent
      services={services}
      page={page}
      availability={{
        limitedMode: site.limitedMode,
        waitlistServices: site.waitlistServices,
        reopensLabel: site.reopensLabel,
        limitedNote: site.limitedNote,
      }}
    />
  );
}
