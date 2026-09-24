import type { Metadata } from "next";
import { getMergedSite, getMergedFaq, getMergedContactPage } from "@/lib/sanity.queries";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = {
  title: { absolute: "Book a Consultation | Grace Mae Alterations | Pittsburgh, PA" },
  description:
    "Request a bridal or tailoring consultation in Pittsburgh. Every inquiry gets a personal reply.",
  alternates: { canonical: "https://gracemaealterations.com/contact" },
  openGraph: {
    title: "Book a Consultation | Grace Mae Alterations | Pittsburgh, PA",
    description:
      "Request a bridal or tailoring consultation in Pittsburgh. Every inquiry gets a personal reply.",
    url: "https://gracemaealterations.com/contact",
  },
};


export default async function ContactPage() {
  const [site, faq, page] = await Promise.all([
    getMergedSite(),
    getMergedFaq(),
    getMergedContactPage(),
  ]);

  return (
    <ContactPageContent
      site={site}
      faq={faq}
      contactImage={page.image ?? null}
      availability={{
        limitedMode: site.limitedMode,
        waitlistServices: site.waitlistServices,
        reopensLabel: site.reopensLabel,
        limitedNote: site.limitedNote,
      }}
      text={{
        heroLabel: page.heroLabel,
        heroHeading: page.heroHeading,
        waitlistBannerBold: page.waitlistBannerBold,
        waitlistBannerText: page.waitlistBannerText,
        successHeading: page.successHeading,
        successMessage: page.successMessage,
        waitlistSuccessMessage: page.waitlistSuccessMessage,
      }}
    />
  );
}
