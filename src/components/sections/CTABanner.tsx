"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { reopenYear } from "@/lib/cta";

interface CTABannerProps {
  headline?: string;
  subhead?: string;
  buttonLabel?: string;
  buttonHref?: string;
  /** In limited mode the banner speaks to next year's brides instead. */
  limitedMode?: boolean;
  reopensLabel?: string;
}

export default function CTABanner({
  headline = "Your dress deserves to fit perfectly.",
  subhead = "Book a consultation in Pittsburgh today.",
  buttonLabel = "Get in Touch",
  buttonHref = "/contact",
  limitedMode = false,
  reopensLabel = "",
}: CTABannerProps) {
  const year = reopenYear(reopensLabel);

  const copy = limitedMode
    ? {
        headline: year ? `Getting married in ${year}?` : "Getting married after bridal reopens?",
        subhead: `Bridal fittings reopen ${reopensLabel}. Waitlist brides get first choice of fitting dates, in the order they joined.`,
        buttonLabel: "Save my place",
        buttonHref: "/contact?service=bridal",
      }
    : { headline, subhead, buttonLabel, buttonHref };

  return (
    <section className="relative bg-near_black py-20 lg:py-28 px-6 overflow-hidden" aria-labelledby="cta-heading">
      {/* Subtle decorative element */}
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
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75 }}
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-px bg-gold" aria-hidden="true" />
          </div>

          <h2
            id="cta-heading"
            className="font-cormorant italic text-ivory text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.1] mb-5"
          >
            {copy.headline}
          </h2>

          <p className="font-jost text-ivory/75 text-sm lg:text-base leading-[1.65] max-w-[52ch] mx-auto mb-10">
            {copy.subhead}
          </p>

          <Button variant="outline-ivory" href={copy.buttonHref}>
            {copy.buttonLabel}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
