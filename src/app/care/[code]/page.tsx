import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCareCard, getMergedSite } from "@/lib/sanity.queries";
import SanityImage from "@/components/ui/SanityImage";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";

export const revalidate = 60;

// Private by link: never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: "Care notes",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

function finishedLabel(date?: string | null) {
  if (!date) return null;
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function CarePage({ params }: { params: { code: string } }) {
  const [card, site] = await Promise.all([getCareCard(params.code), getMergedSite()]);
  if (!card) notFound();

  // The review link lives in Site Settings once Grace has a Google profile.
  const reviewUrl = site.googleReviewUrl;
  const finished = finishedLabel(card.completedOn);
  const notes = (card.careNotes ?? []).filter((n) => n.heading || n.body);
  const hasBoth = !!(card.beforeImage && card.afterImage);

  return (
    <article className="bg-ivory">
      <header className="px-6 pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-4">Care notes{card.clientFirstName ? ` for ${card.clientFirstName}` : ""}</p>
          <h1 className="font-cormorant italic text-charcoal text-[clamp(2.5rem,6vw,4rem)] leading-[1.05]">
            Caring for your {card.garment}
          </h1>
          <div className="w-12 h-px bg-gold mt-6 mb-5" aria-hidden="true" />
          <p className="font-jost text-charcoal/75 text-base leading-[1.7] max-w-[60ch]">
            Thank you for trusting me with it.
            {finished ? ` Altered by hand in Pittsburgh, ${finished}.` : " Altered by hand in Pittsburgh."}
            {card.fabric ? ` These notes are written for ${card.fabric.toLowerCase()}.` : ""}
          </p>
        </div>
      </header>

      {(card.afterImage || card.beforeImage) && (
        <section className="px-6 pb-12" aria-label="Before and after">
          <div className="max-w-3xl mx-auto">
            {hasBoth ? (
              <BeforeAfterSlider beforeImage={card.beforeImage} afterImage={card.afterImage} label={null} description={null} />
            ) : (
              <div className="relative w-full aspect-[4/5] max-w-md">
                <SanityImage
                  image={(card.afterImage ?? card.beforeImage)!}
                  fill
                  placeholderLabel="CARE_PHOTO"
                  alt={(card.afterImage ?? card.beforeImage)?.alt ?? `Your ${card.garment}`}
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
              What we did
            </h2>
            <p className="font-jost text-charcoal/75 text-base leading-[1.7] max-w-[60ch] whitespace-pre-line">{card.workDone}</p>
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section className="px-6 pb-14" aria-label="Care notes">
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
            If you loved how it turned out
          </h2>
          <p className="font-jost text-ivory/75 text-sm leading-[1.7] max-w-[55ch] mb-8">
            A few words from you help the next bride find me more than anything I could say myself.
          </p>
          <div className="flex flex-wrap gap-4">
            {reviewUrl && (
              <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                Leave a Google review
              </a>
            )}
            <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-ivory">
              Share a photo, tag {site.instagram}
            </a>
          </div>
          <p className="font-jost text-ivory/75 text-sm mt-10">
            Something not sitting right, or another piece that needs work?{" "}
            <Link href="/contact" className="text-gold underline underline-offset-4">
              Send me a request
            </Link>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
