import type { Metadata } from "next";
import { getMergedServices, getMergedServicesPage, getMergedSite } from "@/lib/sanity.queries";
import ServicesPageContent from "./ServicesPageContent";

export const metadata: Metadata = {
  title: { absolute: "Bridal & Clothing Alteration Services | Grace Mae | Pittsburgh, PA" },
  description:
    "Bridal gown alterations, everyday tailoring, and custom repairs in Pittsburgh. Itemized quotes, honest timelines.",
  alternates: { canonical: "https://gracemaealterations.com/services" },
  openGraph: {
    title: "Bridal & Clothing Alteration Services | Grace Mae | Pittsburgh, PA",
    description:
      "Bridal gown alterations, everyday tailoring, and custom repairs in Pittsburgh. Itemized quotes, honest timelines.",
    url: "https://gracemaealterations.com/services",
  },
};


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
