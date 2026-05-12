import type { Metadata } from "next";
import { SITE } from "@/data/content";

export const metadata: Metadata = {
  title: "Portfolio — The Work",
  description: `Browse the portfolio of ${SITE.name}, Pittsburgh bridal seamstress and alterations specialist. Bridal gowns, tailoring, vintage restoration, and custom work.`,
  openGraph: {
    title: `Portfolio | ${SITE.businessName}`,
    description: `Browse bridal alterations, tailoring, and custom work by ${SITE.name} in Pittsburgh, PA.`,
    url: "https://gracemaealterations.com/portfolio",
  },
  alternates: { canonical: "https://gracemaealterations.com/portfolio" },
};
