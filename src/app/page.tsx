import HomePageContent from "./HomePageContent";
import {
  getMergedSite,
  getMergedHomePage,
  getMergedServices,
  getMergedTestimonials,
  getMergedPortfolioItems,
  getMergedAboutPage,
} from "@/lib/sanity.queries";

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
        site: { name: site.name, subTagline: site.subTagline },
        heroImage: home.heroImage,
        trustStats: home.trustStats,
        services,
        portfolioItems,
        bio: {
          paragraph1: about.paragraph1,
          paragraph2: about.paragraph2,
          pullQuote: about.pullQuote,
        },
        aboutSecondaryImage: about.secondaryImage,
        testimonials,
      }}
    />
  );
}
