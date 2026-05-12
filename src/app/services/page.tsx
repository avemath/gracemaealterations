import { getMergedServices, getMergedServicesPage } from "@/lib/sanity.queries";
import ServicesPageContent from "./ServicesPageContent";

export default async function ServicesPage() {
  const [services, page] = await Promise.all([
    getMergedServices(),
    getMergedServicesPage(),
  ]);

  return <ServicesPageContent services={services} page={page} />;
}
