import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import { getMergedSite, getMergedFaq, getMergedContactPage, getPolicies } from "@/lib/sanity.queries";
import { getText, type Text } from "@/lib/text";
import ContactPageContent, { type ContactFormText } from "./ContactPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.contact);

/** Only the form's own wording goes to the browser, not the emails or care pages. */
function formWording(text: Text<"forms">): ContactFormText {
  return Object.fromEntries(
    Object.entries(text).filter(([key]) => !key.startsWith("confirm") && !key.startsWith("care"))
  ) as ContactFormText;
}

export default async function ContactPage() {
  const [site, faq, page, policies, toolsText, formsText] = await Promise.all([
    getMergedSite(),
    getMergedFaq(),
    getMergedContactPage(),
    getPolicies(),
    getText("tools"),
    getText("forms"),
  ]);

  return (
    <ContactPageContent
      site={site}
      faq={faq}
      contactImage={page.image ?? null}
      hasPolicies={!!policies}
      photoCheckEnabled={!!process.env.ANTHROPIC_API_KEY}
      dateMessages={toolsText}
      formText={formWording(formsText)}
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
