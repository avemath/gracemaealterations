import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import { getMergedPortfolioItems, getMergedPortfolioPage, getMergedSite } from "@/lib/sanity.queries";
import PortfolioPageContent from "./PortfolioPageContent";

export const metadata: Metadata = pageMetadata(PAGE_META.portfolio);


export default async function PortfolioPage() {
  const [items, portfolioPageData, site] = await Promise.all([
    getMergedPortfolioItems(),
    getMergedPortfolioPage(),
    getMergedSite(),
  ]);
  return (
    <PortfolioPageContent
      items={items}
      portfolioPageData={portfolioPageData}
      availability={{ limitedMode: site.limitedMode, reopensLabel: site.reopensLabel }}
    />
  );
}
