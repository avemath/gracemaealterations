"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

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

export default function CountUp({ value, duration = 1400, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const parsed = parse(value);
  const [current, setCurrent] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || !parsed || hasStarted.current) return;
    hasStarted.current = true;

    const end = parsed.num;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isInView, duration, parsed]);

  if (!parsed) {
    return <span ref={ref} className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {parsed.before}{isInView ? current : 0}{parsed.after}
    </span>
  );
}
