import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCaseStudy, getCaseStudies } from "@/lib/sanity.queries";
import { pageMetadata, SITE_URL, FALLBACK_OG_IMAGE, jsonLdHtml } from "@/lib/metadata";
import SanityImage from "@/components/ui/SanityImage";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = (await getCaseStudies()) ?? [];
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = await getCaseStudy(params.slug);
  if (!item) return {};
  return pageMetadata({
    path: `/portfolio/${item.slug}`,
    title: `${item.label} | Alterations Case Study | Grace Mae`,
    description: item.caption ?? `${item.label}, altered by Grace Mae in Pittsburgh.`,
    image: FALLBACK_OG_IMAGE,
  });
}

export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const item = await getCaseStudy(params.slug);
  if (!item) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Portfolio", item: `${SITE_URL}/portfolio` },
      {
        "@type": "ListItem",
        position: 3,
        name: item.label,
        item: `${SITE_URL}/portfolio/${item.slug}`,
      },
    ],
  };

  const facts: [string, string][] = [
    ["Designer", item.designer ?? ""],
    ["Silhouette", item.silhouette ?? ""],
    ["Fittings", item.fittings ? String(item.fittings) : ""],
    ["First fitting to pickup", item.weeks ? `${item.weeks} weeks` : ""],
    ["Venue", item.venue ?? ""],
  ];
  const shownFacts = facts.filter(([, value]) => value !== "");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <article>
        <section className="bg-near_black" aria-label="Case study hero">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-14">
            <nav aria-label="Breadcrumb" className="mb-6">
              <Link href="/portfolio" className="section-label text-gold hover:text-gold_light transition-colors">
                Portfolio
              </Link>
            </nav>
            <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
              {item.label}
            </h1>
            {item.caption && (
              <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">
                {item.caption}
              </p>
            )}
          </div>
        </section>

        <section className="bg-ivory py-14 lg:py-20 px-6">
          <div className="max-w-4xl mx-auto">
            {item.beforeImage && item.afterImage ? (
              <BeforeAfterSlider
                beforeImage={item.beforeImage}
                afterImage={item.afterImage}
                label="Before and after"
              />
            ) : (
              item.image && (
                <div className="relative w-full aspect-[3/4] max-w-xl mx-auto overflow-hidden">
                  <SanityImage image={item.image} fill placeholderLabel="CASE_STUDY" sizes="(min-width:1024px) 40vw, 100vw" />
                </div>
              )
            )}

            {shownFacts.length > 0 && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 mt-12 border-t border-blush pt-8">
                {shownFacts.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-blush/70 pb-3">
                    <dt className="font-jost font-medium text-charcoal text-xs tracking-[0.16em] uppercase">
                      {label}
                    </dt>
                    <dd className="font-jost text-charcoal/75 text-sm text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {item.alterations && item.alterations.length > 0 && (
              <div className="mt-10">
                <h2 className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-4">
                  What was done
                </h2>
                <ul className="space-y-2">
                  {item.alterations.map((line, i) => (
                    <li key={i} className="font-jost text-charcoal/75 text-sm leading-[1.65]">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.gallery && item.gallery.length > 0 && (
              <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-12">
                {item.gallery.map((photo, i) => (
                  <li key={i} className="relative aspect-[3/4] overflow-hidden">
                    <SanityImage image={photo} fill placeholderLabel={`GALLERY_${i + 1}`} sizes="(min-width:1024px) 33vw, 50vw" />
                  </li>
                ))}
              </ul>
            )}

            {item.testimonial && (
              <blockquote className="mt-14 border-l-2 border-gold pl-6">
                <p className="font-cormorant italic text-charcoal text-xl lg:text-2xl leading-snug">
                  &ldquo;{item.testimonial.quote}&rdquo;
                </p>
                <footer className="font-jost text-charcoal/75 text-sm mt-3">
                  {item.testimonial.name}
                </footer>
              </blockquote>
            )}
          </div>
        </section>
      </article>
    </>
  );
}
