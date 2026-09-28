import type { Metadata } from "next";
import Link from "next/link";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { notFound } from "next/navigation";
import { getPolicies } from "@/lib/sanity.queries";
import { pageMetadata, FALLBACK_OG_IMAGE } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/policies",
  title: "Policies | Grace Mae Alterations | Pittsburgh, PA",
  description:
    "Deposits, rescheduling, rush work, pickup windows and the workmanship guarantee for alterations with Grace Mae in Pittsburgh.",
  image: FALLBACK_OG_IMAGE,
});

export default async function PoliciesPage() {
  const policies = await getPolicies();
  if (!policies) notFound();
  const sections = policies.sections ?? [];

  return (
    <>
      <section className="bg-near_black" aria-label="Policies hero">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-14">
          <p className="section-label text-gold mb-4">Good to know</p>
          <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
            {policies.heading ?? "Policies"}
          </h1>
          {policies.intro && (
            <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">
              {policies.intro}
            </p>
          )}
        </div>
      </section>

      <section className="bg-ivory py-14 lg:py-20 px-6" aria-label="Policy details">
        <div className="max-w-3xl mx-auto">
          {sections.length === 0 ? (
            <p className="font-jost text-charcoal/75 text-base leading-[1.65]">
              Policies are being written. In the meantime, ask me anything through the{" "}
              <Link href="/contact" className="text-gold_ink underline">
                contact form
              </Link>
              .
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
            Questions about any of this?{" "}
            <Link href="/contact" className="text-gold_ink underline">
              Send a request
            </Link>{" "}
            and I will answer plainly.
          </p>
        </div>
      </section>
    </>
  );
}
