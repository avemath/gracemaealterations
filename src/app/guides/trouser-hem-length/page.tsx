import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, SITE_URL, FALLBACK_OG_IMAGE, jsonLdHtml } from "@/lib/metadata";
import { builtInGuide } from "@/lib/builtInGuides";
import HemExplorer from "@/components/sections/HemExplorer";

export const revalidate = 3600;

const guide = builtInGuide("trouser-hem-length");
const PATH = `/guides/${guide.slug}`;
const DESCRIPTION =
  "No break, quarter, half or full? See how trouser hem length looks over dress shoes, sneakers and heels, from a Pittsburgh tailor.";

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: "Trouser Hem Length & Break, Explained | Grace Mae | Pittsburgh",
  description: DESCRIPTION,
  image: FALLBACK_OG_IMAGE,
});

const CHOICES: { what: string; how: string }[] = [
  {
    what: "Suits",
    how: "A quarter or half break. A slim, modern suit looks sharpest with a quarter break or none; a classic suit with a straighter leg sits beautifully with a half break.",
  },
  {
    what: "Dress trousers",
    how: "Usually a quarter break, or a half if they have pleats or a fuller leg.",
  },
  {
    what: "Chinos",
    how: "No break to a quarter. They’re casual, and a clean line keeps them from looking sloppy.",
  },
  {
    what: "Jeans",
    how: "Mostly taste. A little stacking at the ankle is fine on a slim jean; a straight or wide jean looks best just touching the shoe.",
  },
];

export default function TrouserHemLengthPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: guide.title, item: `${SITE_URL}${PATH}` },
        ],
      },
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.summary,
        mainEntityOfPage: `${SITE_URL}${PATH}`,
        datePublished: guide.updated,
        dateModified: guide.updated,
        author: { "@type": "Person", name: "Grace Mae" },
        publisher: { "@id": `${SITE_URL}/#business` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <article>
        <section className="bg-near_black" aria-label="Guide hero">
          <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-14">
            <nav aria-label="Breadcrumb" className="mb-6">
              <Link href="/guides" className="inline-block py-2 section-label text-gold hover:text-gold_light transition-colors">
                Guides
              </Link>
            </nav>
            <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
              {guide.title}
            </h1>
            <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">{guide.summary}</p>
          </div>
        </section>

        <section className="bg-ivory pt-14 lg:pt-20 px-4 sm:px-6" aria-label="Try each hem length">
          <div className="max-w-6xl mx-auto">
            <HemExplorer />
          </div>
        </section>

        <section className="bg-ivory py-14 lg:py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="font-jost text-charcoal/75 text-base leading-[1.65] max-w-[65ch] space-y-12">
              <div>
                <h2 className="font-cormorant italic text-charcoal text-3xl leading-snug">What “break” means</h2>
                <p className="mt-3">
                  The break is the fold that forms where the front of your trousers meets your shoe. The longer the hem, the
                  more fabric rests on the shoe and the deeper that fold gets. With no break the hem stops just above the
                  shoe; with a full break there’s a clear crease across the front and the back reaches well down the heel.
                  None of them is wrong. It comes down to the cut, the occasion and what you like to see in the mirror.
                </p>
              </div>

              <div>
                <h2 className="font-cormorant italic text-charcoal text-3xl leading-snug">How I help you choose</h2>
                <p className="mt-3">
                  Most trousers today are cut slimmer than they used to be, and a slim leg looks best with less break: a
                  quarter, or none at all. A classic suit with a straighter leg still sits well with a half break. As a
                  starting point:
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  {CHOICES.map((c) => (
                    <div key={c.what}>
                      <dt className="inline font-medium text-charcoal">{c.what}: </dt>
                      <dd className="inline">{c.how}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h2 className="font-cormorant italic text-charcoal text-3xl leading-snug">Bring the shoes you’ll wear</h2>
                <p className="mt-3">
                  I measure a hem against a shoe, not the floor. A dress shoe, a sneaker and a heel each put the hem
                  somewhere different, and even two pairs of dress shoes can differ more than you’d think. Please bring the
                  exact pair you plan to wear and put them on while I pin. If the trousers will see more than one pair,
                  bring the pair you’ll wear most and we’ll find a length that works for both.
                </p>
              </div>

              <div>
                <h2 className="font-cormorant italic text-charcoal text-3xl leading-snug">Cuffs or a plain hem</h2>
                <p className="mt-3">
                  A cuff (a turn-up) adds a little weight at the bottom, so the leg hangs straight and the break stays
                  neat. Cuffs suit wool suit trousers and pleated trousers, and they look best with a quarter break or
                  less, since a cuff sitting in a deep fold looks crumpled. A plain hem is the cleaner, more modern choice,
                  and the right one for slim trousers and tuxedos.
                </p>
              </div>

              <div className="pt-8 border-t border-blush">
                <p>
                  Not sure which you like? Bring the trousers and the shoes, and we can try a couple of lengths with pins
                  before anything is cut.
                </p>
                <p className="mt-6">
                  <Link href="/contact?service=tailoring" className="btn-gold">
                    Send a tailoring request
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
