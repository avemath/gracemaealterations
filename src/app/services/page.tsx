"use client";

import { motion } from "framer-motion";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import CTABanner from "@/components/sections/CTABanner";
import { SERVICES } from "@/data/content";

const CHECK_ICON = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
    <path d="M2 7L5.5 10.5L12 3.5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ServicesPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-16 px-6 overflow-hidden"
        aria-label="Services page hero"
        style={{ minHeight: "40vh", display: "flex", alignItems: "center" }}
      >
        {/* Background image placeholder
            ──────────────────────────────────────────────────────
            SERVICES_HERO_IMAGE
            Blurred/dimmed background for the services hero section.
            Ideal: wide shot of fabric, workspace, or gown detail.
            File: /public/images/services-hero.jpg
            ────────────────────────────────────────────────────── */}
        <div className="absolute inset-0 z-0 opacity-20">
          <ImagePlaceholder label="SERVICES_HERO_IMAGE" aspectRatio="landscape" />
        </div>
        <div className="absolute inset-0 bg-ivory/80 z-0" />

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label mb-4">What I Offer</p>
            <h1 className="font-cormorant italic text-charcoal text-5xl lg:text-7xl mb-4">
              What I Do
            </h1>
            <div className="w-12 h-px bg-gold" aria-hidden="true" />
          </motion.div>
        </div>
      </section>

      {/* ── SERVICE SECTIONS ─────────────────────────────────── */}
      <div className="bg-ivory">
        {SERVICES.map((service, i) => (
          <section
            key={service.id}
            id={service.id}
            className={`py-16 lg:py-24 px-6 ${
              i % 2 === 1 ? "bg-blush" : "bg-ivory"
            }`}
            aria-labelledby={`${service.id}-heading`}
          >
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                {/* Section number */}
                <p className="font-cormorant text-gold/40 text-6xl font-light mb-2" aria-hidden="true">
                  0{i + 1}
                </p>
                <div className="w-12 h-px bg-gold mb-6" aria-hidden="true" />
                <h2
                  id={`${service.id}-heading`}
                  className="font-cormorant italic text-charcoal text-4xl lg:text-5xl mb-6"
                >
                  {service.title}
                </h2>
                <p className="font-jost text-charcoal/70 text-base leading-relaxed max-w-2xl mb-10">
                  {service.description}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                  {/* Services list */}
                  <div>
                    <h3 className="font-cormorant_sc text-charcoal text-sm tracking-[0.2em] uppercase mb-5">
                      Includes
                    </h3>
                    <ul className="space-y-3" role="list">
                      {service.services.map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 font-jost text-sm text-charcoal/75"
                        >
                          {CHECK_ICON}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="lg:border-l lg:border-blush lg:pl-16">
                    <h3 className="font-cormorant_sc text-charcoal text-sm tracking-[0.2em] uppercase mb-5">
                      Pricing
                    </h3>
                    <p className="font-cormorant text-charcoal text-4xl mb-2">
                      {service.priceRange}
                    </p>
                    <p className="font-jost text-charcoal/50 text-xs mb-6">
                      {service.priceNote}
                    </p>

                    {service.freeConsult && (
                      <div className="border border-gold/30 bg-gold/5 p-4">
                        <p className="font-jost text-charcoal/75 text-xs leading-relaxed">
                          ✦ &nbsp;{service.freeConsult}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        ))}
      </div>

      {/* ── HOW PRICING WORKS ────────────────────────────────── */}
      <section
        className="bg-near_black py-16 lg:py-20 px-6"
        aria-labelledby="pricing-heading"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label text-gold/70 mb-4">Transparency First</p>
            <h2
              id="pricing-heading"
              className="font-cormorant italic text-ivory text-4xl lg:text-5xl mb-6"
            >
              How Pricing Works
            </h2>
            <div className="w-12 h-px bg-gold mb-8" aria-hidden="true" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Consultation First",
                  body: "Every project starts with a consultation so I can assess the garment, understand your needs, and give you an accurate quote — not a ballpark.",
                },
                {
                  title: "No Surprise Charges",
                  body: "The price I quote is the price you pay. If something unexpected comes up during the work, I'll discuss it with you before proceeding.",
                },
                {
                  title: "Complexity & Timeline",
                  body: "Pricing reflects fabric type, alteration complexity, and your timeline. Rush requests may carry an additional fee — always communicated upfront.",
                },
              ].map((item, i) => (
                <div key={i} className="border-t border-ivory/10 pt-6">
                  <h3 className="font-cormorant text-ivory text-xl mb-3">{item.title}</h3>
                  <p className="font-jost text-ivory/55 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <CTABanner
        headline="Ready to get started?"
        subhead="Book your consultation — no commitment, just a conversation."
        buttonLabel="Book a Consultation"
      />
    </>
  );
}
