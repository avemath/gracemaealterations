import type { Metadata } from "next";
import Link from "next/link";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { notFound } from "next/navigation";
import { getPolicies } from "@/lib/sanity.queries";
import { getText } from "@/lib/text";
import { aroundLink } from "@/lib/cta";
import { pageMetadata, FALLBACK_OG_IMAGE } from "@/lib/metadata";

// Unpublished policies are a 404, so they shouldn't claim a canonical URL.
export async function generateMetadata(): Promise<Metadata> {
  if (!(await getPolicies())) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({
    path: "/policies",
    title: "Policies | Grace Mae Alterations | Pittsburgh, PA",
    description:
      "Deposits, rescheduling, rush work, pickup windows and the workmanship guarantee for alterations with Grace Mae in Pittsburgh.",
    image: FALLBACK_OG_IMAGE,
  });
}

export default async function PoliciesPage() {
  const [policies, text] = await Promise.all([getPolicies(), getText("site")]);
  if (!policies) notFound();
  const sections = policies.sections ?? [];
  const [emptyBefore, emptyAfter] = aroundLink(text.policiesEmpty);
  const [closingBefore, closingAfter] = aroundLink(text.policiesClosing);

  return (
    <>
      <section className="bg-near_black" aria-label={text.policiesHeroRegion}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-14">
          <p className="section-label text-gold mb-4">{text.policiesEyebrow}</p>
          <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
            {policies.heading ?? text.policiesHeading}
          </h1>
          {policies.intro && (
            <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">
              {policies.intro}
            </p>
          )}
        </div>
      </section>

      <section className="bg-ivory py-14 lg:py-20 px-6" aria-label={text.policiesDetailsRegion}>
        <div className="max-w-3xl mx-auto">
          {sections.length === 0 ? (
            <p className="font-jost text-charcoal/75 text-base leading-[1.65]">
              {emptyBefore}
              <Link href="/contact" className="text-gold_ink underline">
                {text.policiesEmptyLink}
              </Link>
              {emptyAfter}
            </p>
          ) : (
            <div className="space-y-12">
              {sections.map((section, i) => (
                <article key={i}>
                  <h2 className="font-cormorant italic text-charcoal text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.1] mb-4">
                    {section.heading}
                  </h2>
                  <div className="font-jost text-charcoal/75 text-base leading-[1.65] max-w-[65ch] space-y-4">
                    <PortableText value={section.body as PortableTextBlock[]} />
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="mt-16 pt-8 border-t border-blush font-jost text-charcoal/75 text-sm leading-[1.65]">
            {closingBefore}
            <Link href="/contact" className="text-gold_ink underline">
              {text.policiesLink}
            </Link>
            {closingAfter}
          </p>
        </div>
      </section>
    </>
  );
}
