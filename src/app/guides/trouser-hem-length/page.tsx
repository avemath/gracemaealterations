import type { Metadata } from "next";
import Link from "next/link";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "@portabletext/react";
import { pageMetadata, SITE_URL, FALLBACK_OG_IMAGE, jsonLdHtml } from "@/lib/metadata";
import { builtInGuide } from "@/lib/builtInGuides";
import { getGuide } from "@/lib/sanity.queries";
import { getText } from "@/lib/text";
import HemExplorer from "@/components/sections/HemExplorer";
import { toolText } from "../toolText";

// Short, so an edit to the guide in the Studio shows within a minute.
export const revalidate = 60;

/**
 * The trouser hem guide is built around the hem explorer, so it keeps its own
 * page. Its words live in the Studio as an ordinary guide with the same slug
 * (seeded by `npm run content:text`). Until that guide exists, the page falls
 * back to the wording written below, so it never shows empty.
 */
const builtIn = builtInGuide("trouser-hem-length");
const PATH = `/guides/${builtIn.slug}`;
const SEO_TITLE = "Trouser Hem Length & Break, Explained | Grace Mae | Pittsburgh";
const DESCRIPTION =
  "No break, quarter, half or full? See how trouser hem length looks over dress shoes, sneakers and heels, from a Pittsburgh tailor.";

export async function generateMetadata(): Promise<Metadata> {
  const studio = await getGuide(builtIn.slug);
  return pageMetadata({
    path: PATH,
    title: studio?.seo?.title || SEO_TITLE,
    description: studio?.seo?.description || DESCRIPTION,
    image: FALLBACK_OG_IMAGE,
  });
}

export default async function TrouserHemLengthPage() {
  const [studio, text] = await Promise.all([getGuide(builtIn.slug), getText("tools")]);
  const title = studio?.title || builtIn.title;
  const summary = studio?.summary || builtIn.summary;
  const body = studio?.body?.length ? (studio.body as Block[]) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}${PATH}` },
        ],
      },
      {
        "@type": "Article",
        headline: title,
        description: summary,
        mainEntityOfPage: `${SITE_URL}${PATH}`,
        datePublished: builtIn.updated,
        dateModified: studio?._updatedAt ?? builtIn.updated,
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
                {text.guideBackLink}
              </Link>
            </nav>
            <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
              {title}
            </h1>
            <p className="font-jost text-ivory/75 text-base leading-[1.65] max-w-[65ch] mt-6">{summary}</p>
          </div>
        </section>

        <section className="bg-ivory pt-14 lg:pt-20 px-4 sm:px-6" aria-label="Try each hem length">
          <div className="max-w-6xl mx-auto">
            <HemExplorer text={toolText(text, "hem")} />
          </div>
        </section>

        <section className="bg-ivory py-14 lg:py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="font-jost text-charcoal/75 text-base leading-[1.65] max-w-[65ch] space-y-12">
              {body ? <StudioProse body={body} /> : <WrittenProse />}

              <div className="pt-8 border-t border-blush">
                <p>{text.hemGuideClosing}</p>
                <p className="mt-6">
                  <Link href="/contact?service=tailoring" className="btn-gold">
                    {text.hemGuideButton}
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

// ── The guide from the Studio ───────────────────────────────────────────────

type Block = PortableTextBlock & {
  style?: string;
  listItem?: string;
  children?: { text?: string; marks?: string[] }[];
};

const H2 = "font-cormorant italic text-charcoal text-3xl leading-snug";

const PROSE: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-3">{children}</p>,
    h2: ({ children }) => <h2 className={`${H2} mt-8`}>{children}</h2>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-medium text-charcoal">{children}</strong>,
  },
};

const plain = (block: Block) => (block.children ?? []).map((c) => c.text ?? "").join("");

/**
 * "Suits: A quarter or half break…" in the Studio: a paragraph that opens
 * with a bold label ending in a colon. A run of these reads as a short list
 * of terms, the way the original page set them out.
 */
function asTerm(block: Block): { term: string; detail: string } | null {
  if (block._type !== "block" || (block.style ?? "normal") !== "normal" || block.listItem) return null;
  const [first, ...rest] = block.children ?? [];
  const label = first?.text?.trim() ?? "";
  if (!first?.marks?.includes("strong") || !label.endsWith(":") || label.length < 2) return null;
  return { term: label.slice(0, -1), detail: rest.map((c) => c.text ?? "").join("").trim() };
}

/** Splits the body at each heading, so every part keeps the page's spacing. */
function StudioProse({ body }: { body: Block[] }) {
  const parts: { heading?: Block; blocks: Block[] }[] = [];
  for (const block of body) {
    if (block._type === "block" && block.style === "h2") parts.push({ heading: block, blocks: [] });
    else if (parts.length) parts[parts.length - 1].blocks.push(block);
    else parts.push({ blocks: [block] });
  }

  return (
    <>
      {parts.map((part, i) => (
        <div key={part.heading?._key ?? `part-${i}`}>
          {part.heading && <h2 className={H2}>{plain(part.heading)}</h2>}
          <PartBody blocks={part.blocks} />
        </div>
      ))}
    </>
  );
}

function PartBody({ blocks }: { blocks: Block[] }) {
  // Consecutive term paragraphs become one list; everything else is prose.
  const runs: ({ terms: { key: string; term: string; detail: string }[] } | { prose: Block[] })[] = [];
  for (const block of blocks) {
    const term = asTerm(block);
    const last = runs[runs.length - 1];
    if (term) {
      if (last && "terms" in last) last.terms.push({ key: block._key ?? term.term, ...term });
      else runs.push({ terms: [{ key: block._key ?? term.term, ...term }] });
    } else if (last && "prose" in last) last.prose.push(block);
    else runs.push({ prose: [block] });
  }

  return (
    <>
      {runs.map((run, i) =>
        "terms" in run ? (
          <dl key={i} className="mt-5 space-y-3 text-sm">
            {run.terms.map((t) => (
              <div key={t.key}>
                <dt className="inline font-medium text-charcoal">{t.term}: </dt>
                <dd className="inline">{t.detail}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <PortableText key={i} value={run.prose} components={PROSE} />
        )
      )}
    </>
  );
}

// ── The original wording, until the Studio guide exists ─────────────────────

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

function WrittenProse() {
  return (
    <>
      <div>
        <h2 className={H2}>What “break” means</h2>
        <p className="mt-3">
          The break is the fold that forms where the front of your trousers meets your shoe. The longer the hem, the
          more fabric rests on the shoe and the deeper that fold gets. With no break the hem stops just above the
          shoe; with a full break there’s a clear crease across the front and the back reaches well down the heel.
          None of them is wrong. It comes down to the cut, the occasion and what you like to see in the mirror.
        </p>
      </div>

      <div>
        <h2 className={H2}>How I help you choose</h2>
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
        <h2 className={H2}>Bring the shoes you’ll wear</h2>
        <p className="mt-3">
          I measure a hem against a shoe, not the floor. A dress shoe, a sneaker and a heel each put the hem
          somewhere different, and even two pairs of dress shoes can differ more than you’d think. Please bring the
          exact pair you plan to wear and put them on while I pin. If the trousers will see more than one pair,
          bring the pair you’ll wear most and we’ll find a length that works for both.
        </p>
      </div>

      <div>
        <h2 className={H2}>Cuffs or a plain hem</h2>
        <p className="mt-3">
          A cuff (a turn-up) adds a little weight at the bottom, so the leg hangs straight and the break stays
          neat. Cuffs suit wool suit trousers and pleated trousers, and they look best with a quarter break or
          less, since a cuff sitting in a deep fold looks crumpled. A plain hem is the cleaner, more modern choice,
          and the right one for slim trousers and tuxedos.
        </p>
      </div>
    </>
  );
}
