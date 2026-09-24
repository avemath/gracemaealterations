import { getMergedSite, getMergedFaq, getMergedContactPage } from "@/lib/sanity.queries";
import ContactPageContent from "./ContactPageContent";

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
