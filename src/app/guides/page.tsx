import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedGuides, type SanityGuide } from "@/lib/sanity.queries";
import { pageMetadata, FALLBACK_OG_IMAGE } from "@/lib/metadata";
import { BUILT_IN_GUIDES } from "@/lib/builtInGuides";
import SanityImage from "@/components/ui/SanityImage";
import { getText } from "@/lib/text";

// The built-in guides are always there, so the index is never a placeholder
// and is always worth indexing.
export async function generateMetadata(): Promise<Metadata> {
  const text = await getText("tools");
  return pageMetadata({
    path: "/guides",
    title: text.guidesSeoTitle,
    description: text.guidesSeoDescription,
    image: FALLBACK_OG_IMAGE,
  });
}

type ListedGuide = {
  key: string;
  slug: string;
  title: string;
  summary?: string;
  heroImage?: SanityGuide["heroImage"];
};

export default async function GuidesPage() {
  const [sanityGuides, text] = await Promise.all([getPublishedGuides().then((g) => g ?? []), getText("tools")]);
  const builtInSlugs = new Set(BUILT_IN_GUIDES.map((g) => g.slug));
  const studio = new Map(sanityGuides.map((g) => [g.slug, g]));
  // Studio guides first, then the ones written into the site. A built-in page
  // wins its URL, so a Studio guide with the same slug is listed once, in the
  // built-in's place, but with the title and summary Grace wrote in the Studio.
  const guides: ListedGuide[] = [
    ...sanityGuides
      .filter((g) => !builtInSlugs.has(g.slug))
      .map((g) => ({ key: g._id, slug: g.slug, title: g.title, summary: g.summary, heroImage: g.heroImage })),
    ...BUILT_IN_GUIDES.map((g) => {
      const edited = studio.get(g.slug);
      return {
        key: `built-in-${g.slug}`,
        slug: g.slug,
        title: edited?.title || g.title,
        summary: edited?.summary || g.summary,
        heroImage: edited?.heroImage,
      };
    }),
  ];

  return (
    <>
      <section className="bg-near_black" aria-label="Guides hero">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-14">
          <p className="section-label text-gold mb-4">{text.guidesLabel}</p>
          <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
            {text.guidesHeading}
          </h1>
          <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">
            {text.guidesIntro}
          </p>
        </div>
      </section>

      <section className="bg-ivory py-14 lg:py-20 px-6" aria-label="All guides">
        <div className="max-w-5xl mx-auto">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {guides.map((guide) => (
              <li key={guide.key}>
                <Link href={`/guides/${guide.slug}`} className="group block">
                  {guide.heroImage && (
                    <div className="relative w-full aspect-[3/2] overflow-hidden mb-4">
                      <SanityImage
                        image={guide.heroImage}
                        fill
                        placeholderLabel="GUIDE_IMAGE"
                        sizes="(min-width:768px) 50vw, 100vw"
                      />
                    </div>
                  )}
                  <h2 className="font-cormorant italic text-charcoal text-2xl leading-snug group-hover:text-gold_ink transition-colors duration-300">
                    {guide.title}
                  </h2>
                  {guide.summary && (
                    <p className="font-jost text-charcoal/75 text-sm leading-[1.65] mt-2 max-w-[65ch]">
                      {guide.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
