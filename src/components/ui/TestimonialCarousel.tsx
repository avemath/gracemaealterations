"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SanityTestimonial } from "@/lib/sanity.queries";

const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function TestimonialCarousel({ testimonials }: { testimonials: SanityTestimonial[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const count = testimonials.length;

  // No autoplay: nothing moves unless the reader asks for it.
  const go = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex((next + count) % count);
  };
  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  };

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 48) (dx < 0 ? next : prev)();
    touchStartX.current = null;
  };

  const current = testimonials[index];
  if (!current) return null;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
  };

  const arrowClass =
    "hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 w-11 h-11 text-gold_ink hover:text-charcoal transition-colors duration-200";

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {count > 1 && (
        <button
          type="button"
          onClick={prev}
          className={`${arrowClass} -left-14`}
          aria-label="Previous testimonial"
          aria-controls="testimonial-slide"
        >
          <ChevronLeft />
        </button>
      )}

      <div className="relative overflow-hidden" style={{ minHeight: "280px" }}>
        {/* Decorative giant quote mark */}
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 font-cormorant text-gold_ink/10 select-none pointer-events-none leading-none"
          style={{ fontSize: "14rem", lineHeight: 1 }}
          aria-hidden="true"
        >
          &ldquo;
        </span>

        {/* initial={false} so the first slide is present in the server HTML */}
        <AnimatePresence custom={direction} mode="wait" initial={false}>
          <motion.div
            key={current._id}
            id="testimonial-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-4 lg:px-20 pt-12"
          >
            <blockquote className="font-cormorant italic text-charcoal text-xl lg:text-2xl xl:text-[1.65rem] leading-relaxed mb-8 max-w-2xl">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <div className="w-8 h-px bg-gold mb-5" aria-hidden="true" />
            <p className="font-jost text-charcoal text-sm font-medium tracking-wide">{current.name}</p>
            {current.occasion && (
              <p className="font-jost text-charcoal/75 text-xs tracking-[0.18em] uppercase mt-1">
                {current.occasion}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <button
          type="button"
          onClick={next}
          className={`${arrowClass} -right-14`}
          aria-label="Next testimonial"
          aria-controls="testimonial-slide"
        >
          <ChevronRight />
        </button>
      )}

      {count > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show testimonial ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
              className="w-11 h-11 flex items-center justify-center group"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === index ? "w-7 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-charcoal/25 group-hover:bg-gold/70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
