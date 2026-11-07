import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLandingPage } from "@/lib/sanity.queries";
import { getText } from "@/lib/text";
import { aroundLink } from "@/lib/cta";
import { pageMetadata, FALLBACK_OG_IMAGE, LANDING_SMALL_PRINT, shortDescription } from "@/lib/metadata";

// The landing pages at the root (one route folder per slug in LANDING_SLUGS,
// each a few lines that render this). They are separate static routes rather
// than one [slug] route on purpose. Next.js 14 has two bugs a [slug] route
// can't dodge at once: with dynamicParams = false, any refresh (the publish
// webhook, or the one-minute revalidation) turns these pages into 404s; with
// dynamic params, an unknown root path renders a blank page without JS. As
// static routes they refresh normally, and any other root path gets the
// static 404. "_landing" starts with an underscore, so it is never a route.

export async function landingMetadata(slug: string): Promise<Metadata> {
  const page = await getLandingPage(slug);
  if (!page) return {};
  return pageMetadata({
    path: `/${page.slug}`,
    title: page.seo?.title ?? `${page.title} | Grace Mae`,
    description: page.seo?.description ?? shortDescription(page.intro),
    image: FALLBACK_OG_IMAGE,
  });
}

/**
 * A landing page not yet published in Sanity renders as a 404 and is picked
 * up by the next refresh once it is. A failed read throws instead, so a
 * Sanity outage keeps the last good page (see safeFetch).
 */
export async function LandingPage({ slug }: { slug: string }) {
  const [page, text] = await Promise.all([getLandingPage(slug), getText("site")]);
  if (!page) notFound();
  const [beforeLink, afterLink] = aroundLink(text.landingClosing);
  const smallPrint = page.smallPrint?.trim() || LANDING_SMALL_PRINT[page.slug];

  return (
    <article>
      <section className="bg-near_black" aria-label={text.landingHeroRegion}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-14">
          <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
            {page.title}
          </h1>
          {page.intro && (
            <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">
              {page.intro}
            </p>
          )}
        </div>
      </section>

      <section className="bg-ivory py-14 lg:py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          {(page.sections ?? []).map((section, i) => (
            <div key={i}>
              <h2 className="font-cormorant italic text-charcoal text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.1] mb-4">
                {section.heading}
              </h2>
              <p className="font-jost text-charcoal/75 text-base leading-[1.65] max-w-[65ch]">
                {section.body}
              </p>
            </div>
          ))}

          <p className="pt-8 border-t border-blush font-jost text-charcoal/75 text-sm leading-[1.65]">
            {beforeLink}
            <Link href="/contact" className="text-gold_ink underline">
              {text.landingLink}
            </Link>
            {afterLink}
          </p>

          {smallPrint && (
            <p className="!mt-6 font-jost text-charcoal/75 text-xs leading-[1.6]" data-testid="landing-small-print">
              {smallPrint}
            </p>
          )}
        </div>
      </section>
    </article>
  );
}
