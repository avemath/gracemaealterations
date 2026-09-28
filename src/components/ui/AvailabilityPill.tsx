interface Props {
  limitedMode: boolean;
  reopensLabel: string;
  /** The full canonical availability paragraph, used as the accessible description. */
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
  const label = limitedMode
    ? `Tailoring & repairs: booking now · Bridal: ${reopensLabel} waitlist open`
    : bookingNote;

  return (
    <p
      className={`inline-flex items-center gap-2.5 border border-gold/40 bg-gold/5 px-3.5 py-2 ${className}`}
      aria-description={limitedMode ? limitedNote : undefined}
      title={limitedMode ? limitedNote : undefined}
    >
      <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-gold" aria-hidden="true" />
      <span className="font-jost text-[0.6875rem] lg:text-xs text-charcoal tracking-[0.12em] uppercase">
        {label}
      </span>
    </p>
  );
}
