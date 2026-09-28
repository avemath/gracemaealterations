import type { Metadata } from "next";
import { pageMetadata, PAGE_META } from "@/lib/metadata";
import HomePageContent from "./HomePageContent";
import {
  getMergedSite,
  getMergedHomePage,
  getMergedServices,
  getMergedTestimonials,
  getMergedPortfolioItems,
  getMergedAboutPage,
} from "@/lib/sanity.queries";

export const metadata: Metadata = pageMetadata(PAGE_META.home);


export default async function HomePage() {
  const [site, home, services, testimonials, portfolioItems, about] =
    await Promise.all([
      getMergedSite(),
      getMergedHomePage(),
      getMergedServices(),
      getMergedTestimonials(),
      getMergedPortfolioItems(),
      getMergedAboutPage(),
    ]);

  return (
    <HomePageContent
      data={{
        site: {
          name: site.name,
          tagline: site.tagline,
          subTagline: site.subTagline,
          bookingNote: site.bookingNote,
          limitedMode: site.limitedMode,
          waitlistServices: site.waitlistServices,
          reopensLabel: site.reopensLabel,
          limitedNote: site.limitedNote,
          trustItems: site.trustItems,
        },
        heroImage: home.heroImage,
        services,
        portfolioItems,
        bio: {
          paragraph1: about.paragraph1,
          paragraph2: about.paragraph2,
          pullQuote: about.pullQuote,
        },
        aboutSecondaryImage: about.secondaryImage,
        instagram: {
          posts: site.instagramPosts ?? [],
          handle: site.instagram,
          profileUrl: site.instagramUrl,
        },
        testimonials,
        text: {
          heroSectionLabel: home.heroSectionLabel,
          heroCredentialText: home.heroCredentialText,
          servicesLabel: home.servicesLabel,
          servicesHeading: home.servicesHeading,
          portfolioLabel: home.portfolioLabel,
          portfolioHeading: home.portfolioHeading,
          aboutTeaserLabel: home.aboutTeaserLabel,
          testimonialsLabel: home.testimonialsLabel,
          testimonialsHeading: home.testimonialsHeading,
          processLabel: home.processLabel,
          processHeading: home.processHeading,
          processCTA: home.processCTA,
          processSteps: home.processSteps,
          ctaHeadline: home.ctaHeadline,
          ctaSubhead: home.ctaSubhead,
          ctaButton: home.ctaButton,
        },
      }}
    />
  );
}
