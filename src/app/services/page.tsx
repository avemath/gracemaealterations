import { getMergedServices, getServicesPage } from "@/lib/sanity.queries";
import ServicesPageContent from "./ServicesPageContent";

export default async function ServicesPage() {
  const [services, page] = await Promise.all([
    getMergedServices(),
    getServicesPage(),
  ]);

  return <ServicesPageContent services={services} heroImage={page?.heroImage ?? null} />;
}
