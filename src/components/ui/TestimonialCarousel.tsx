"use client";

import { useState, useEffect } from "react";
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
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const count = testimonials.length;

  const go = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };
  const prev = () => go((index - 1 + count) % count);
  const next = () => go((index + 1) % count);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % count);
    }, 5500);
    return () => clearInterval(id);
  }, [paused, count]);

  const current = testimonials[index];

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Prev arrow */}
      {count > 1 && (
        <button
          onClick={prev}
          className="hidden lg:flex absolute -left-14 top-1/2 -translate-y-1/2 text-gold/35 hover:text-gold transition-colors duration-200 p-2"
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
      )}

      {/* Quote display area */}
      <div className="relative overflow-hidden" style={{ minHeight: "280px" }}>
        {/* Decorative giant quote mark */}
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 font-cormorant text-gold/10 select-none pointer-events-none leading-none"
          style={{ fontSize: "14rem", lineHeight: 1 }}
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current._id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-4 lg:px-20 pt-12"
          >
            <p className="font-cormorant italic text-charcoal text-xl lg:text-2xl xl:text-[1.65rem] leading-relaxed mb-8 max-w-2xl">
              &ldquo;{current.quote}&rdquo;
            </p>
            <div className="w-8 h-px bg-gold mb-5" aria-hidden="true" />
            <p className="font-jost text-charcoal text-sm font-medium tracking-wide">{current.name}</p>
            <p className="font-jost text-charcoal/40 text-xs tracking-[0.18em] uppercase mt-1">{current.occasion}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next arrow */}
      {count > 1 && (
        <button
          onClick={next}
          className="hidden lg:flex absolute -right-14 top-1/2 -translate-y-1/2 text-gold/35 hover:text-gold transition-colors duration-200 p-2"
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8" role="tablist" aria-label="Testimonial navigation">
          {testimonials.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-400 ${
                i === index
                  ? "w-7 h-1.5 bg-gold"
                  : "w-1.5 h-1.5 bg-gold/25 hover:bg-gold/55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
