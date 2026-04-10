import { getMergedSite, getMergedFaq, getContactPage } from "@/lib/sanity.queries";
import ContactPageContent from "./ContactPageContent";

export default async function ContactPage() {
  const [site, faq, page] = await Promise.all([
    getMergedSite(),
    getMergedFaq(),
    getContactPage(),
  ]);

  return <ContactPageContent site={site} faq={faq} contactImage={page?.image ?? null} />;
}
