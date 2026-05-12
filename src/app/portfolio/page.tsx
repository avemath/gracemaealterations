import { getMergedPortfolioItems, getMergedPortfolioPage } from "@/lib/sanity.queries";
import PortfolioPageContent from "./PortfolioPageContent";

export default async function PortfolioPage() {
  const [items, portfolioPageData] = await Promise.all([
    getMergedPortfolioItems(),
    getMergedPortfolioPage(),
  ]);
  return <PortfolioPageContent items={items} portfolioPageData={portfolioPageData} />;
}
