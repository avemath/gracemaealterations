import type { Metadata } from "next";
import { SITE } from "@/data/content";

export const metadata: Metadata = {
  title: "Book a Consultation — Contact",
  description: `Book a bridal or clothing alteration consultation with ${SITE.name} in Pittsburgh, PA. Available by appointment. Responds within 24 hours.`,
  openGraph: {
    title: `Contact & Booking | ${SITE.businessName}`,
    description: `Book your alteration consultation with ${SITE.name} in Pittsburgh, PA. Bridal, tailoring, and custom work by appointment.`,
    url: "https://gracemaealterations.com/contact",
  },
  alternates: { canonical: "https://gracemaealterations.com/contact" },
};
