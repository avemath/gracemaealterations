import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_SC, Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import StickyMobileCTA from "@/components/layout/StickyMobileCTA";
import StickyDesktopCTA from "@/components/layout/StickyDesktopCTA";
import PageTransition from "@/components/layout/PageTransition";
import { getMergedSite } from "@/lib/sanity.queries";

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
export async function generateMetadata(): Promise<Metadata> {
  const site = await getMergedSite();
  return {
    metadataBase: new URL("https://gracemaealterations.com"), // UPDATE: your actual domain
    title: {
      default: `${site.name} | Bridal & Clothing Alterations | Pittsburgh, PA`,
      template: `%s | ${site.businessName}`,
    },
    description: site.metaDescription,
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
      siteName: site.businessName,
      title: `${site.name} | Bridal & Clothing Alterations | Pittsburgh, PA`,
      description: site.metaDescription,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${site.businessName} — Pittsburgh bridal alterations`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} | Bridal Alterations | Pittsburgh, PA`,
      description: site.metaDescription,
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getMergedSite();

  // ── LOCAL BUSINESS STRUCTURED DATA (JSON-LD) ─────────────────
  // Street address intentionally omitted — home-based, appointment-only business.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://gracemaealterations.com/#business",
    name: site.businessName,
    alternateName: site.name,
    description: site.metaDescription,
    url: "https://gracemaealterations.com",
    email: site.email,
    image: "https://gracemaealterations.com/og-image.png",
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
    areaServed: [
      { "@type": "City", name: "Pittsburgh" },
      { "@type": "AdministrativeArea", name: "Allegheny County" },
      { "@type": "AdministrativeArea", name: "Greater Pittsburgh Area" },
    ],
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      description: "By appointment only — contact to schedule",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Alteration Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bridal Alterations Pittsburgh",
            description:
              "Wedding dress alterations in Pittsburgh including hem adjustments, bustle additions, bodice fitting, corset back conversion, and lace and beading work. By appointment only.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Clothing Tailoring Pittsburgh",
            description:
              "Clothing alterations in Pittsburgh including pants hemming, dress and skirt alterations, jacket tailoring, zipper repair and replacement, and waist adjustments.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Sewing and Garment Repair Pittsburgh",
            description:
              "Vintage garment restoration, costume construction and alterations, structural garment repair, and special occasion dress alterations in Pittsburgh.",
          },
        },
      ],
    },
    knowsAbout: [
      "Bridal Alterations",
      "Wedding Dress Alterations",
      "Clothing Tailoring",
      "Seamstress Services",
      "Garment Repair",
      "Vintage Restoration",
      "Costume Alterations",
    ],
    founder: {
      "@type": "Person",
      name: site.name,
      jobTitle: "Seamstress and Alterations Specialist",
      alumniOf: [
        {
          "@type": "EducationalOrganization",
          name: "Indiana University of Pennsylvania",
        },
      ],
    },
    sameAs: [site.instagramUrl],
  };

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
        <SiteChrome
          site={{
            siteName: site.name,
            businessName: site.businessName,
            location: site.location,
            availability: site.availability,
            instagram: site.instagram,
            instagramUrl: site.instagramUrl,
          }}
        >
          <main id="main-content">
            <PageTransition>{children}</PageTransition>
          </main>
        </SiteChrome>
        <StickyMobileCTA limitedMode={site.limitedMode} reopensLabel={site.reopensLabel} />
        <StickyDesktopCTA limitedMode={site.limitedMode} reopensLabel={site.reopensLabel} />
        <Analytics />
      </body>
    </html>
  );
}
