import { getMergedPortfolioItems } from "@/lib/sanity.queries";
import PortfolioPageContent from "./PortfolioPageContent";

export default async function PortfolioPage() {
  const items = await getMergedPortfolioItems();
  return <PortfolioPageContent items={items} />;
}
