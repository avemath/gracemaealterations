import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import { getMergedSite, getMergedAboutPage, getMergedValues } from "@/lib/sanity.queries";
import { getText } from "@/lib/text";
import { pickText } from "@/lib/cta";
import AboutPageContent from "./AboutPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.about);


export default async function AboutPage() {
  const [site, about, values, text] = await Promise.all([
    getMergedSite(),
    getMergedAboutPage(),
    getMergedValues(),
    getText("site"),
  ]);

  return (
    <AboutPageContent
      text={pickText(text, "about", "banner")}
      site={{ name: site.name, limitedMode: site.limitedMode, reopensLabel: site.reopensLabel }}
      about={about}
      values={values}
    />
  );
}
