import type { Metadata } from "next";
import { getMergedPortfolioItems, getMergedPortfolioPage } from "@/lib/sanity.queries";
import PortfolioPageContent from "./PortfolioPageContent";

export const metadata: Metadata = {
  title: { absolute: "Alterations Portfolio | Grace Mae | Pittsburgh, PA" },
  description:
    "Before and after bridal, bridesmaid and tailoring work by Grace Mae, Pittsburgh seamstress.",
  alternates: { canonical: "https://gracemaealterations.com/portfolio" },
  openGraph: {
    title: "Alterations Portfolio | Grace Mae | Pittsburgh, PA",
    description:
      "Before and after bridal, bridesmaid and tailoring work by Grace Mae, Pittsburgh seamstress.",
    url: "https://gracemaealterations.com/portfolio",
  },
};


export default async function PortfolioPage() {
  const [items, portfolioPageData] = await Promise.all([
    getMergedPortfolioItems(),
    getMergedPortfolioPage(),
  ]);
  return <PortfolioPageContent items={items} portfolioPageData={portfolioPageData} />;
}
