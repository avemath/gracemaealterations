import type { Metadata } from "next";
import { SITE } from "@/data/content";

export const metadata: Metadata = {
  title: `About ${SITE.name}`,
  description: `Meet ${SITE.name}, Pittsburgh seamstress and bridal alterations specialist. With 7+ years of experience including bridal work, she brings precision and care to every garment.`,
  openGraph: {
    title: `About ${SITE.name} | ${SITE.businessName}`,
    description: `Meet ${SITE.name}, Pittsburgh's bridal alterations specialist. Precision craft, honest timelines, personal attention.`,
    url: "https://gracemaealterations.com/about",
  },
  alternates: { canonical: "https://gracemaealterations.com/about" },
};
