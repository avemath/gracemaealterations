import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import StickyMobileCTA from "@/components/layout/StickyMobileCTA";
import StickyDesktopCTA from "@/components/layout/StickyDesktopCTA";
import MotionProvider from "@/components/layout/MotionProvider";
import RevealObserver from "@/components/layout/RevealObserver";
import {
  getMergedSite,
  getMergedServices,
  getPublishedGuides,
  getPolicies,
} from "@/lib/sanity.queries";
import { SITE_URL } from "@/lib/metadata";

/** First dollar figure in a range like "$75 – $450+", or null when quoted. */
function minPrice(range?: string): number | null {
  const match = range?.match(/\$\s?([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

// ── METADATA ──────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const site = await getMergedSite();
  return {
    metadataBase: new URL("https://gracemaealterations.com"),
    title: {
      default: `${site.name} | Bridal & Clothing Alterations | Pittsburgh, PA`,
      template: `%s | ${site.businessName}`,
    },
    description: site.metaDescription,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://gracemaealterations.com",
      siteName: site.businessName,
      title: `${site.name} | Bridal & Clothing Alterations | Pittsburgh, PA`,
      description: site.metaDescription,
      // No images here on purpose: Next resolves the opengraph-image route.
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
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, services, guides, policies] = await Promise.all([
    getMergedSite(),
    getMergedServices(),
    getPublishedGuides(),
    getPolicies(),
  ]);
  const guideLinks = (guides ?? []).map((guide) => ({ title: guide.title, slug: guide.slug }));

  // ── STRUCTURED DATA (one @graph) ─────────────────────────────
  // Street address intentionally omitted: home based, appointment only.
  // No telephone: the contact form is the only channel.
  const GBP_URL = "";
  const BUSINESS_ID = `${SITE_URL}/#business`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": BUSINESS_ID,
        name: site.businessName,
        alternateName: site.name,
        description: site.metaDescription,
        url: SITE_URL,
        email: site.email,
        image: `${SITE_URL}/opengraph-image`,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Pittsburgh",
          addressRegion: "PA",
          addressCountry: "US",
        },
        areaServed: "Pittsburgh, PA",
        sameAs: [site.instagramUrl, GBP_URL].filter(Boolean),
        knowsAbout: [
          "Bridal Alterations",
          "Wedding Dress Alterations",
          "Clothing Tailoring",
          "Seamstress Services",
          "Garment Repair",
        ],
        founder: {
          "@type": "Person",
          name: site.name,
          jobTitle: "Bridal seamstress and designer",
          alumniOf: {
            "@type": "EducationalOrganization",
            name: "Indiana University of Pennsylvania",
          },
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "degree",
            educationalLevel: "Bachelor of Science",
            name: "B.S. Fashion & Apparel Design",
            recognizedBy: {
              "@type": "EducationalOrganization",
              name: "Indiana University of Pennsylvania",
            },
          },
        },
      },
      ...services.map((service) => ({
        "@type": "Service",
        "@id": `${SITE_URL}/services#${service.id}`,
        name: service.title,
        description: service.shortDescription,
        serviceType: service.title,
        provider: { "@id": BUSINESS_ID },
        areaServed: "Pittsburgh, PA",
        ...(minPrice(service.priceRange) !== null && {
          offers: {
            "@type": "Offer",
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: minPrice(service.priceRange),
              priceCurrency: "USD",
            },
          },
        }),
      })),
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Every hero and portfolio image comes from here; opening the
            connection early saves a round trip on the LCP image. */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-ivory text-charcoal antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-ivory focus:text-charcoal focus:px-5 focus:py-3 focus:border focus:border-charcoal focus:font-jost focus:text-sm"
        >
          Skip to main content
        </a>
        <RevealObserver />
        <MotionProvider>
        <SiteChrome
          site={{
            siteName: site.name,
            businessName: site.businessName,
            location: site.location,
            availability: site.availability,
            instagram: site.instagram,
            instagramUrl: site.instagramUrl,
            email: site.email,
            googleReviewUrl: GBP_URL || undefined,
            guides: guideLinks,
            hasPolicies: !!policies,
            limitedMode: site.limitedMode,
            reopensLabel: site.reopensLabel,
          }}
        >
          <main id="main-content">{children}</main>
        </SiteChrome>
        </MotionProvider>
        <StickyMobileCTA limitedMode={site.limitedMode} reopensLabel={site.reopensLabel} />
        <StickyDesktopCTA limitedMode={site.limitedMode} reopensLabel={site.reopensLabel} />
        <Analytics />
      </body>
    </html>
  );
}
