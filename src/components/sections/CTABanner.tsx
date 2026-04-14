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
    <section className="bg-near_black py-20 lg:py-28 px-6" aria-labelledby="cta-heading">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-px bg-gold" aria-hidden="true" />
          </div>
          <h2
            id="cta-heading"
            className="font-cormorant italic text-ivory text-4xl lg:text-5xl xl:text-6xl leading-tight mb-4"
          >
            {headline}
          </h2>
          <p className="font-jost text-ivory/60 text-sm tracking-widest uppercase mb-10">
            {subhead}
          </p>
          <Button variant="gold" href={buttonHref}>
            {buttonLabel}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
