"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/data/content";

export default function TestimonialsSection() {
  return (
    <section
      className="bg-ivory py-20 lg:py-28 px-6"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-3">Kind Words</p>
          <h2
            id="testimonials-heading"
            className="font-cormorant italic text-charcoal text-4xl lg:text-5xl"
          >
            What clients say
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={i}
              className="relative bg-blush p-8 lg:p-10 overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              {/* Giant background quotation mark */}
              <span
                className="absolute top-0 left-4 font-cormorant text-gold/20 select-none pointer-events-none leading-none"
                style={{ fontSize: "10rem", lineHeight: 1 }}
                aria-hidden="true"
              >
                &ldquo;
              </span>

              <div className="relative z-10">
                <p className="font-cormorant italic text-charcoal text-lg lg:text-xl leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="w-8 h-px bg-gold mb-4" aria-hidden="true" />
                <p className="font-jost text-charcoal text-sm font-medium">{t.name}</p>
                <p className="font-jost text-charcoal/50 text-xs tracking-widest uppercase mt-0.5">
                  {t.occasion}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
