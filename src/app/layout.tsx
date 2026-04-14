import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_SC, Jost } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SITE } from "@/data/content";

// ── FONTS ─────────────────────────────────────────────────────
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-sc",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

// ── METADATA ──────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://gracemaealterations.com"), // UPDATE: your actual domain
  title: {
    default: `${SITE.name} | Bridal & Clothing Alterations | Pittsburgh, PA`,
    template: `%s | ${SITE.businessName}`,
  },
  description: SITE.metaDescription,
  keywords: [
    "bridal alterations Pittsburgh",
    "wedding dress alterations Pittsburgh PA",
    "seamstress Pittsburgh",
    "clothing alterations Pittsburgh",
    "tailoring Pittsburgh",
    "bridal seamstress Pittsburgh",
    "wedding gown alterations",
    "dress alterations Pittsburgh",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gracemaealterations.com",
    siteName: SITE.businessName,
    title: `${SITE.name} | Bridal & Clothing Alterations | Pittsburgh, PA`,
    description: SITE.metaDescription,
    images: [
      {
        url: "/og-image.jpg", // Create a 1200x630 OG image and place in /public
        width: 1200,
        height: 630,
        alt: `${SITE.businessName} — Pittsburgh bridal alterations`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | Bridal Alterations | Pittsburgh, PA`,
    description: SITE.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://gracemaealterations.com",
  },
};

// ── LOCAL BUSINESS STRUCTURED DATA (JSON-LD) ─────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.businessName,
  description: SITE.metaDescription,
  url: "https://gracemaealterations.com",
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pittsburgh",
    addressRegion: "PA",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "40.4406",
    longitude: "-79.9959",
  },
  areaServed: "Pittsburgh, PA",
  priceRange: "$$",
  serviceType: [
    "Bridal Alterations",
    "Wedding Dress Alterations",
    "Clothing Tailoring",
    "Custom Sewing",
    "Garment Repair",
  ],
  openingHours: "By appointment only",
  sameAs: [SITE.instagramUrl],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cormorantSC.variable} ${jost.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-ivory text-charcoal antialiased">
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
