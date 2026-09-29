import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCareCard, getMergedSite } from "@/lib/sanity.queries";
import SanityImage from "@/components/ui/SanityImage";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { getText, fill } from "@/lib/text";

export const revalidate = 60;

// Private by link: never indexed, never in the sitemap.
export async function generateMetadata(): Promise<Metadata> {
  const text = await getText("forms");
  return {
    title: text.careTabTitle,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

function finishedLabel(date?: string | null) {
  if (!date) return null;
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function CarePage({ params }: { params: { code: string } }) {
  const [card, site, text] = await Promise.all([getCareCard(params.code), getMergedSite(), getText("forms")]);
  if (!card) notFound();

  // The review link lives in Site Settings once Grace has a Google profile.
  const reviewUrl = site.googleReviewUrl;
  const finished = finishedLabel(card.completedOn);
  const notes = (card.careNotes ?? []).filter((n) => n.heading || n.body);
  const hasBoth = !!(card.beforeImage && card.afterImage);
  const garment = { garment: card.garment };
  const intro = [
    text.careThanks,
    finished ? fill(text.careAlteredOn, { date: finished }) : text.careAltered,
    card.fabric ? fill(text.careFabric, { fabric: card.fabric.toLowerCase() }) : "",
  ]
    .filter(Boolean)
    .join(" ");
  // The closing line holds a link; if Grace drops {link}, it goes at the end.
  const [moreBefore, ...moreRest] = text.careMore.split("{link}");

  return (
    <article className="bg-ivory">
      <header className="px-6 pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-4">
            {card.clientFirstName ? fill(text.careLabelNamed, { name: card.clientFirstName }) : text.careLabel}
          </p>
          <h1 className="font-cormorant italic text-charcoal text-[clamp(2.5rem,6vw,4rem)] leading-[1.05]">
            {fill(text.careHeading, garment)}
          </h1>
          <div className="w-12 h-px bg-gold mt-6 mb-5" aria-hidden="true" />
          <p className="font-jost text-charcoal/75 text-base leading-[1.7] max-w-[60ch]">{intro}</p>
        </div>
      </header>

      {(card.afterImage || card.beforeImage) && (
        <section className="px-6 pb-12" aria-label={text.carePhotoAria}>
          <div className="max-w-3xl mx-auto">
            {hasBoth ? (
              <BeforeAfterSlider beforeImage={card.beforeImage} afterImage={card.afterImage} label={null} description={null} />
            ) : (
              <div className="relative w-full aspect-[4/5] max-w-md">
                <SanityImage
                  image={(card.afterImage ?? card.beforeImage)!}
                  fill
                  placeholderLabel="CARE_PHOTO"
                  alt={(card.afterImage ?? card.beforeImage)?.alt ?? fill(text.carePhotoAlt, garment)}
                  sizes="(min-width: 768px) 28rem, 100vw"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {card.workDone && (
        <section className="px-6 pb-12" aria-labelledby="work-heading">
          <div className="max-w-3xl mx-auto border-t border-blush pt-8">
            <h2 id="work-heading" className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-3">
              {text.careWorkHeading}
            </h2>
            <p className="font-jost text-charcoal/75 text-base leading-[1.7] max-w-[60ch] whitespace-pre-line">{card.workDone}</p>
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section className="px-6 pb-14" aria-label={text.careNotesAria}>
          <div className="max-w-3xl mx-auto border-t border-blush pt-8 space-y-8">
            {notes.map((note, i) => (
              <div key={i}>
                {note.heading && <h2 className="font-cormorant italic text-charcoal text-2xl mb-2">{note.heading}</h2>}
                {note.body && (
                  <p className="font-jost text-charcoal/75 text-base leading-[1.7] max-w-[60ch] whitespace-pre-line">{note.body}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-near_black px-6 py-14" aria-labelledby="after-heading">
        <div className="max-w-3xl mx-auto">
          <h2 id="after-heading" className="font-cormorant italic text-ivory text-3xl mb-3">
            {text.careReviewHeading}
          </h2>
          <p className="font-jost text-ivory/75 text-sm leading-[1.7] max-w-[55ch] mb-8">{text.careReviewText}</p>
          <div className="flex flex-wrap gap-4">
            {reviewUrl && (
              <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                {text.careReviewButton}
              </a>
            )}
            <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-ivory">
              {fill(text.careInstagramButton, { instagram: site.instagram })}
            </a>
          </div>
          <p className="font-jost text-ivory/75 text-sm mt-10">
            {moreRest.length ? moreBefore : `${moreBefore} `}
            <Link href="/contact" className="text-gold underline underline-offset-4">
              {text.careMoreLink}
            </Link>
            {moreRest.join("{link}")}
          </p>
        </div>
      </section>
    </article>
  );
}
