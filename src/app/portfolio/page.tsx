import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import { getMergedPortfolioItems, getMergedPortfolioPage, getMergedSite } from "@/lib/sanity.queries";
import { getText } from "@/lib/text";
import { pickText } from "@/lib/cta";
import PortfolioPageContent from "./PortfolioPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.portfolio);


export default async function PortfolioPage() {
  const [items, portfolioPageData, site, text] = await Promise.all([
    getMergedPortfolioItems(),
    getMergedPortfolioPage(),
    getMergedSite(),
    getText("site"),
  ]);
  return (
    <PortfolioPageContent
      items={items}
      portfolioPageData={portfolioPageData}
      availability={{ limitedMode: site.limitedMode, reopensLabel: site.reopensLabel }}
      text={pickText(text, "portfolio", "slider", "banner")}
    />
  );
}
