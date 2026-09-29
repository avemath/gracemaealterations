import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLandingPage } from "@/lib/sanity.queries";
import { getText } from "@/lib/text";
import { aroundLink } from "@/lib/cta";
import { pageMetadata, FALLBACK_OG_IMAGE, LANDING_SLUGS as ALLOWED, shortDescription } from "@/lib/metadata";

export const revalidate = 60;
// Only the landing pages in LANDING_SLUGS exist at the root, and they are
// always built (a page not yet published in Sanity renders as a 404 and is
// picked up by the next refresh once it is). Any other root path is a normal
// static 404: with dynamic params, those rendered as a blank page without JS.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALLOWED.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  if (!ALLOWED.includes(params.slug)) return {};
  const page = await getLandingPage(params.slug);
  if (!page) return {};
  return pageMetadata({
    path: `/${page.slug}`,
    title: page.seo?.title ?? `${page.title} | Grace Mae`,
    description: page.seo?.description ?? shortDescription(page.intro),
    image: FALLBACK_OG_IMAGE,
  });
}

export default async function LandingPageRoute({ params }: { params: { slug: string } }) {
  if (!ALLOWED.includes(params.slug)) notFound();
  const [page, text] = await Promise.all([getLandingPage(params.slug), getText("site")]);
  if (!page) notFound();
  const [beforeLink, afterLink] = aroundLink(text.landingClosing);

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
        </div>
      </section>
    </article>
  );
}
