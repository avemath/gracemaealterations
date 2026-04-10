"use client";

import { motion } from "framer-motion";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import CTABanner from "@/components/sections/CTABanner";
import { SITE, BIO, VALUES } from "@/data/content";

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      {/*
        ABOUT_HERO_IMAGE
        Full-bleed tall hero image.
        Ideal: the seamstress working at her machine, or a polished portrait.
        Ratio: landscape (16:9) or taller. File: /public/images/about-hero.jpg
      */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "70vh" }}
        aria-label="About page hero"
      >
        <div className="absolute inset-0 z-0">
          <ImagePlaceholder label="ABOUT_HERO_IMAGE" aspectRatio="landscape" />
        </div>
        <div className="absolute inset-0 bg-near_black/50 z-10" />

        <div className="relative z-20 flex items-end justify-start max-w-7xl mx-auto px-6 lg:px-12 h-full pb-16 pt-48">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            <p className="section-label text-gold/80 mb-4">The Seamstress</p>
            <h1 className="font-cormorant italic text-ivory leading-none"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
              {SITE.name}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── STORY SECTION ────────────────────────────────────── */}
      <section
        className="bg-ivory py-20 lg:py-28 px-6"
        aria-labelledby="story-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
            >
              <p className="section-label mb-4">My Story</p>
              <h2
                id="story-heading"
                className="font-cormorant italic text-charcoal text-4xl lg:text-5xl mb-6"
              >
                Where the love of sewing began
              </h2>
              <div className="w-12 h-px bg-gold mb-8" aria-hidden="true" />

              {/* Para 1: Origin */}
              <p className="font-jost text-charcoal/70 text-sm leading-relaxed mb-6">
                {BIO.paragraph1}
              </p>

              {/* Para 2: Experience */}
              <p className="font-jost text-charcoal/70 text-sm leading-relaxed mb-6">
                {BIO.paragraph2}
              </p>

              {/* Para 3: Philosophy */}
              <p className="font-jost text-charcoal/70 text-sm leading-relaxed">
                {BIO.paragraph3}
              </p>
            </motion.div>

            {/* Right: Secondary image
                ─────────────────────────────────────────────────
                ABOUT_SECONDARY_IMAGE
                Close-up of hands at work, fabric texture, or needle/thread detail.
                Should feel intimate and skilled. Ratio: 2:3.
                File: /public/images/about-secondary.jpg
                ───────────────────────────────────────────────── */}
            <motion.div
              className="lg:sticky lg:top-28"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ImagePlaceholder label="ABOUT_SECONDARY_IMAGE" aspectRatio="tall" />

              {/* Pull quote below image */}
              <blockquote className="mt-8 border-l-2 border-gold pl-6">
                <p className="font-cormorant italic text-charcoal text-xl lg:text-2xl leading-snug">
                  &ldquo;{BIO.pullQuote}&rdquo;
                </p>
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUES SECTION ───────────────────────────────────── */}
      <section
        className="bg-blush py-16 lg:py-24 px-6"
        aria-labelledby="values-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label mb-4">What I Stand By</p>
            <h2
              id="values-heading"
              className="font-cormorant italic text-charcoal text-4xl lg:text-5xl"
            >
              My Values
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {VALUES.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                {/* Thin gold line above each value — design motif */}
                <div className="w-12 h-px bg-gold mb-6" aria-hidden="true" />
                <h3 className="font-cormorant text-charcoal text-2xl mb-3">
                  {value.title}
                </h3>
                <p className="font-jost text-charcoal/65 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY INDEPENDENT SECTION ──────────────────────────── */}
      <section
        className="bg-near_black py-20 lg:py-28 px-6"
        aria-labelledby="independent-heading"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label text-gold/70 mb-6">Why Independent</p>
            <div className="w-12 h-px bg-gold mx-auto mb-8" aria-hidden="true" />
            <h2
              id="independent-heading"
              className="font-cormorant italic text-ivory text-4xl lg:text-5xl xl:text-6xl leading-tight mb-8"
            >
              Working for myself means working for you.
            </h2>
            <blockquote className="font-cormorant italic text-ivory/70 text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed">
              &ldquo;When I worked in a corporate shop, the pressure was to move fast, book more,
              and never slow down. I got very good at working quickly — but I missed the part
              of this craft that actually matters: giving a garment the attention it deserves,
              and giving a client the time to feel comfortable. Going independent let me do
              both. I don&rsquo;t overbook. I don&rsquo;t rush. And I don&rsquo;t work for a
              quota. I work for the people who trust me with something that matters to them.&rdquo;
            </blockquote>
            <p className="font-cormorant_sc text-gold text-sm tracking-widest mt-8">
              — {SITE.name}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <CTABanner
        headline="Ready to work together?"
        subhead="Let&apos;s talk about your garment."
        buttonLabel="Get in Touch"
      />
    </>
  );
}
