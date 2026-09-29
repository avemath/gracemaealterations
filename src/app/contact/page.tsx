import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import { getMergedSite, getMergedFaq, getMergedContactPage, getPolicies } from "@/lib/sanity.queries";
import { getText } from "@/lib/text";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.contact);


export default async function ContactPage() {
  const [site, faq, page, policies, toolsText] = await Promise.all([
    getMergedSite(),
    getMergedFaq(),
    getMergedContactPage(),
    getPolicies(),
    getText("tools"),
  ]);

  return (
    <ContactPageContent
      site={site}
      faq={faq}
      contactImage={page.image ?? null}
      hasPolicies={!!policies}
      photoCheckEnabled={!!process.env.ANTHROPIC_API_KEY}
      dateMessages={toolsText}
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
