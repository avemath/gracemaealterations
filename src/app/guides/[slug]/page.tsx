import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import {
  getGuide,
  getPublishedGuides,
  getPublishedBustleStyles,
} from "@/lib/sanity.queries";
import { pageMetadata, SITE_URL, FALLBACK_OG_IMAGE } from "@/lib/metadata";
import SanityImage from "@/components/ui/SanityImage";
import BustleExplorer from "@/components/sections/BustleExplorer";

export const revalidate = 60;

export async function generateStaticParams() {
  const guides = (await getPublishedGuides()) ?? [];
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const guide = await getGuide(params.slug);
  if (!guide) return {};
  return pageMetadata({
    path: `/guides/${guide.slug}`,
    title: guide.seo?.title ?? `${guide.title} | Grace Mae`,
    description: guide.seo?.description ?? guide.summary ?? "",
    image: FALLBACK_OG_IMAGE,
  });
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = await getGuide(params.slug);
  if (!guide) notFound();

  // The bustle guide renders the bustle style cards.
  const isBustleGuide = guide.slug === "wedding-dress-bustle-types";
  const bustleStyles = isBustleGuide ? (await getPublishedBustleStyles()) ?? [] : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: `${SITE_URL}/guides/${guide.slug}`,
          },
        ],
      },
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.summary,
        mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
        dateModified: guide._updatedAt,
        author: { "@type": "Person", name: "Grace Mae" },
        publisher: { "@id": `${SITE_URL}/#business` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        <section className="bg-near_black" aria-label="Guide hero">
          <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-14">
            <nav aria-label="Breadcrumb" className="mb-6">
              <Link href="/guides" className="section-label text-gold hover:text-gold_light transition-colors">
                Guides
              </Link>
            </nav>
            <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
              {guide.title}
            </h1>
            {guide.summary && (
              <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">
                {guide.summary}
              </p>
            )}
          </div>
        </section>

        {guide.heroImage && (
          <div className="relative w-full aspect-[16/7]">
            <SanityImage image={guide.heroImage} fill placeholderLabel="GUIDE_HERO" sizes="100vw" />
          </div>
        )}

        {isBustleGuide && (
          <section className="bg-ivory pt-14 lg:pt-20 px-6" aria-label="Try each bustle">
            <div className="max-w-6xl mx-auto">
              <BustleExplorer copy={bustleStyles.map((style) => ({ ...style, slug: style.slug ?? "" }))} />
            </div>
          </section>
        )}

        <section className="bg-ivory py-14 lg:py-20 px-6">
          <div className="max-w-3xl mx-auto">
            {guide.body && guide.body.length > 0 && (
              <div className="font-jost text-charcoal/75 text-base leading-[1.65] max-w-[65ch] space-y-5">
                <PortableText value={guide.body as PortableTextBlock[]} />
              </div>
            )}

            {guide.timelineSteps && guide.timelineSteps.length > 0 && (
              <ol className="mt-14 space-y-8 border-t border-blush pt-10">
                {guide.timelineSteps.map((step, i) => (
                  <li key={i} className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-2 sm:gap-6">
                    <p className="font-jost font-medium text-gold_ink text-xs tracking-[0.22em] uppercase pt-1">
                      {step.weeksOut}
                    </p>
                    <div>
                      <h2 className="font-cormorant italic text-charcoal text-2xl leading-snug">
                        {step.title}
                      </h2>
                      {step.detail && (
                        <p className="font-jost text-charcoal/75 text-sm leading-[1.65] mt-1 max-w-[65ch]">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {bustleStyles.length > 0 && (
              <div className="mt-14 border-t border-blush pt-10">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {bustleStyles.map((style) => (
                    <li key={style._id} className="border border-blush p-6">
                      {style.image && (
                        <div className="relative w-full aspect-[4/3] overflow-hidden mb-4">
                          <SanityImage
                            image={style.image}
                            fill
                            placeholderLabel="BUSTLE_IMAGE"
                            sizes="(min-width:640px) 50vw, 100vw"
                          />
                        </div>
                      )}
                      <h3 className="font-cormorant italic text-charcoal text-xl">{style.name}</h3>
                      {style.alsoCalled && (
                        <p className="font-jost text-charcoal/75 text-xs mt-1">
                          Also called: {style.alsoCalled}
                        </p>
                      )}
                      <dl className="mt-3 space-y-1.5 font-jost text-sm text-charcoal/75 leading-[1.65]">
                        {style.typicalPoints && (
                          <div>
                            <dt className="inline font-medium text-charcoal">Typical points: </dt>
                            <dd className="inline">{style.typicalPoints}</dd>
                          </div>
                        )}
                        {style.bestFor && (
                          <div>
                            <dt className="inline font-medium text-charcoal">Best for: </dt>
                            <dd className="inline">{style.bestFor}</dd>
                          </div>
                        )}
                        {style.fabricNotes && (
                          <div>
                            <dt className="inline font-medium text-charcoal">Fabric: </dt>
                            <dd className="inline">{style.fabricNotes}</dd>
                          </div>
                        )}
                        {typeof style.priceFrom === "number" && (
                          <div>
                            <dt className="inline font-medium text-charcoal">From: </dt>
                            <dd className="inline lining-nums">${style.priceFrom}</dd>
                          </div>
                        )}
                      </dl>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-14 pt-8 border-t border-blush font-jost text-charcoal/75 text-sm leading-[1.65]">
              Questions this did not answer?{" "}
              <Link href="/contact" className="text-gold_ink underline">
                Send me a request
              </Link>
              .
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
