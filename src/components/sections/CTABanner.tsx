"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface CTABannerProps {
  headline?: string;
  subhead?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export default function CTABanner({
  headline = "Your dress deserves to fit perfectly.",
  subhead = "Book a consultation in Pittsburgh today.",
  buttonLabel = "Get in Touch",
  buttonHref = "/contact",
}: CTABannerProps) {
  return (
    <section className="relative bg-near_black py-20 lg:py-28 px-6 overflow-hidden" aria-labelledby="cta-heading">
      {/* Subtle decorative element — two large quotation marks */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.03]"
        aria-hidden="true"
      >
        <span
          className="font-cormorant text-ivory"
          style={{ fontSize: "clamp(16rem, 40vw, 36rem)", lineHeight: 1 }}
        >
          ✦
        </span>
      </div>

      {/* Thin gold lines — top and bottom edges */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75 }}
        >
          {/* Gold rule */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-px bg-gold" aria-hidden="true" />
          </div>

          <h2
            id="cta-heading"
            className="font-cormorant italic text-ivory leading-tight mb-5"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            {headline}
          </h2>

          <p className="font-jost text-ivory/65 text-sm tracking-[0.16em] uppercase mb-10">
            {subhead}
          </p>

          <Button variant="outline-ivory" href={buttonHref}>
            {buttonLabel}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
