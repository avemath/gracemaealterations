"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/**
 * Honours the OS "reduce motion" setting for every Framer animation, and
 * loads only the animation features the site uses (fades, slides, exits; no
 * drag or layout animation). Components import `m as motion`, so a full
 * `motion` import sneaking back in fails loudly (strict) instead of quietly
 * re-adding the whole library to every page.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
