import { getMergedSite, getMergedAboutPage, getMergedValues } from "@/lib/sanity.queries";
import AboutPageContent from "./AboutPageContent";

export default async function AboutPage() {
  const [site, about, values] = await Promise.all([
    getMergedSite(),
    getMergedAboutPage(),
    getMergedValues(),
  ]);

  return <AboutPageContent site={site} about={about} values={values} />;
}
