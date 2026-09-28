import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLandingPage, getPublishedLandingPages } from "@/lib/sanity.queries";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 60;
// Only the landing pages below exist at the root. Anything else 404s rather
// than becoming a catch-all.
export const dynamicParams = false;

const ALLOWED = ["david-s-bridal-dress-alterations", "bridal-party-alterations"];

export async function generateStaticParams() {
  const pages = (await getPublishedLandingPages()) ?? [];
  return pages.filter((page) => ALLOWED.includes(page.slug)).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getLandingPage(params.slug);
  if (!page) return {};
  return pageMetadata({
    path: `/${page.slug}`,
    title: page.seo?.title ?? `${page.title} | Grace Mae`,
    description: page.seo?.description ?? page.intro?.slice(0, 155) ?? "",
  });
}

export default async function LandingPageRoute({ params }: { params: { slug: string } }) {
  if (!ALLOWED.includes(params.slug)) notFound();
  const page = await getLandingPage(params.slug);
  if (!page) notFound();

  return (
    <article>
      <section className="bg-near_black" aria-label="Page hero">
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
            <Link href="/contact" className="text-gold_ink underline">
              Send a request
            </Link>{" "}
            and I will reply with an honest answer.
          </p>
        </div>
      </section>
    </article>
  );
}
