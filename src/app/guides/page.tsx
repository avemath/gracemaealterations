import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedGuides } from "@/lib/sanity.queries";
import { pageMetadata } from "@/lib/metadata";
import SanityImage from "@/components/ui/SanityImage";

export const metadata: Metadata = pageMetadata({
  path: "/guides",
  title: "Wedding Dress Alteration Guides | Grace Mae | Pittsburgh",
  description:
    "Timelines, bustle types and what to bring to a fitting, written by a Pittsburgh bridal seamstress.",
});

export default async function GuidesPage() {
  const guides = (await getPublishedGuides()) ?? [];

  return (
    <>
      <section className="bg-near_black" aria-label="Guides hero">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-14">
          <p className="section-label text-gold mb-4">Guides</p>
          <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
            What to expect
          </h1>
          <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">
            Plain answers to the questions I get asked most, from timelines to bustles.
          </p>
        </div>
      </section>

      <section className="bg-ivory py-14 lg:py-20 px-6" aria-label="All guides">
        <div className="max-w-5xl mx-auto">
          {guides.length === 0 ? (
            <p className="font-jost text-charcoal/75 text-base leading-[1.65]">
              Guides are being written. In the meantime,{" "}
              <Link href="/contact" className="text-gold_ink underline">
                send me a question
              </Link>{" "}
              and I will answer it directly.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {guides.map((guide) => (
                <li key={guide._id}>
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
          )}
        </div>
      </section>
    </>
  );
}
