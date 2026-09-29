interface Props {
  limitedMode: boolean;
  reopensLabel: string;
  /** The full canonical availability paragraph, read to screen readers after the label. */
  limitedNote: string;
  /** Fallback line when the whole site is open. */
  bookingNote: string;
  className?: string;
}

/**
 * States both lanes at once: what Grace can take today, and when the rest
 * reopens. Static dot, no ping: this is information, not an alert.
 */
export default function AvailabilityPill({
  limitedMode,
  reopensLabel,
  limitedNote,
  bookingNote,
  className = "",
}: Props) {
  // One line per lane at every width: on one line, desktop wrapped
  // "waitlist open" onto a line of its own.
  const label = limitedMode ? (
    <>
      <span className="block">Tailoring &amp; repairs: booking now</span>
      <span className="sr-only">. </span>
      <span className="block">Bridal: {reopensLabel} waitlist open</span>
    </>
  ) : (
    bookingNote
  );

  return (
    <p
      className={`inline-flex items-center gap-2.5 border border-gold/40 bg-gold/5 px-3.5 py-2 ${className}`}
      title={limitedMode ? limitedNote : undefined}
    >
      <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-gold" aria-hidden="true" />
      <span className="font-jost text-[0.6875rem] lg:text-xs text-charcoal tracking-[0.12em] uppercase">
        {label}
      </span>
      {/* In-flow rather than aria-description or aria-describedby: screen
          readers skip descriptions on static text in browse mode. */}
      {limitedMode && <span className="sr-only"> {limitedNote}</span>}
    </p>
  );
}
