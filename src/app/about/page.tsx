import type { Metadata } from "next";
import { getMergedSite, getMergedAboutPage, getMergedValues } from "@/lib/sanity.queries";
import AboutPageContent from "./AboutPageContent";

export const metadata: Metadata = {
  title: { absolute: "About Grace Mae | Pittsburgh Bridal Seamstress" },
  description:
    "Formally trained designer and former Lead Alterations Specialist at David's Bridal, now working independently in Pittsburgh.",
  alternates: { canonical: "https://gracemaealterations.com/about" },
  openGraph: {
    title: "About Grace Mae | Pittsburgh Bridal Seamstress",
    description:
      "Formally trained designer and former Lead Alterations Specialist at David's Bridal, now working independently in Pittsburgh.",
    url: "https://gracemaealterations.com/about",
  },
};


export default async function AboutPage() {
  const [site, about, values] = await Promise.all([
    getMergedSite(),
    getMergedAboutPage(),
    getMergedValues(),
  ]);

  return <AboutPageContent site={site} about={about} values={values} />;
}
