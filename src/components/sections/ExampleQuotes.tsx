import type { SanityExampleQuote } from "@/lib/sanity.queries";

/**
 * Hidden until Grace fills in real totals. Rows without a price never render,
 * so the block cannot show an invented number.
 */
export default function ExampleQuotes({
  quotes,
  caption,
}: {
  quotes: SanityExampleQuote[];
  caption: string;
}) {
  const priced = quotes.filter((q) => typeof q.price === "number");
  if (priced.length === 0) return null;

  return (
    <section className="mt-12 border-t border-blush pt-8" aria-labelledby="example-quotes-heading">
      <h3
        id="example-quotes-heading"
        className="font-cormorant italic text-charcoal text-2xl mb-6"
      >
        Three real gowns, three real quotes
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {priced.map((q, i) => (
          <li key={i} className="border border-blush p-5">
            <p className="font-jost font-medium text-charcoal text-sm">{q.gown}</p>
            <p className="font-jost text-charcoal/75 text-sm leading-[1.65] mt-1">{q.work}</p>
            <p className="font-cormorant font-medium text-charcoal text-2xl lining-nums mt-3">
              ${q.price}
            </p>
          </li>
        ))}
      </ul>
      {caption && (
        <p className="mt-5 font-jost text-charcoal/75 text-xs leading-[1.65]">{caption}</p>
      )}
    </section>
  );
}
