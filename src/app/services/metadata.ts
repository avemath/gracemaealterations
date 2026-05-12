import type { Metadata } from "next";
import { SITE } from "@/data/content";

export const metadata: Metadata = {
  title: "Services — Bridal & Clothing Alterations",
  description: `Bridal alterations, everyday tailoring, and custom sewing in Pittsburgh, PA. ${SITE.name} offers expert alterations by appointment. Pricing from $20 for tailoring, $75+ for bridal work.`,
  openGraph: {
    title: `Services | ${SITE.businessName}`,
    description: `Bridal alterations, everyday tailoring, and custom sewing in Pittsburgh, PA. Expert work by appointment.`,
    url: "https://gracemaealterations.com/services",
  },
  alternates: { canonical: "https://gracemaealterations.com/services" },
};
