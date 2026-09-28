"use client";

import { useEffect, useRef, useState } from "react";

/** Parses a string like "500+" into { before: "", num: 500, after: "+" }.
 *  Returns null if no numeric component is found. */
function parse(value: string): { before: string; num: number; after: string } | null {
  const match = value.match(/^([^\d]*)(\d+)([^\d]*)$/);
  if (!match) return null;
  return { before: match[1], num: parseInt(match[2], 10), after: match[3] };
}

interface Props {
  value: string;
  duration?: number; // ms, default 1400
  className?: string;
}

/**
 * Counts up to its number the first time it scrolls into view.
 *
 * The server HTML, and anything already on screen when the page loads, shows
 * the final number and never animates: resetting a visible "500+" to "0+" on
 * hydration made it flicker, and could leave it stuck at 0 if the observer
 * missed. Reduced motion skips the animation entirely, and screen readers
 * always read the final value.
 */
export default function CountUp({ value, duration = 1400, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = parse(value);
  const end = parsed?.num ?? 0;
  const [displayed, setDisplayed] = useState(end);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    // Off screen, so the reset to 0 is never seen.
    setDisplayed(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setDisplayed(Math.round((1 - Math.pow(1 - t, 3)) * end));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // parsed is derived from value; end and duration cover it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration]);

  if (!parsed) {
    return <span ref={ref} className={className}>{value}</span>;
  }

  // Screen readers get the real figure at all times; the digits that count
  // are hidden from them, or reading ahead would announce "0+".
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" data-countup>
        {parsed.before}{displayed}{parsed.after}
      </span>
    </span>
  );
}
