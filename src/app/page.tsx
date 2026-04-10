"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Button from "@/components/ui/Button";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTABanner from "@/components/sections/CTABanner";
import { SITE, TRUST_STATS, SERVICES, PORTFOLIO_ITEMS, BIO } from "@/data/content";

// ── SERVICE ICONS ─────────────────────────────────────────────
const BridalIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 4C10 4 6 9 6 15C6 21 10 27 16 28C22 27 26 21 26 15C26 9 22 4 16 4Z" />
    <path d="M13 8L16 12L19 8" />
    <path d="M11 18Q16 22 21 18" />
  </svg>
);

const TailoringIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="16" y1="3" x2="16" y2="29" />
    <line x1="7" y1="11" x2="25" y2="11" />
    <line x1="5" y1="19" x2="27" y2="19" />
    <path d="M7 11L4 29M25 11L28 29M5 19L9 29M27 19L23 29" />
  </svg>
);

const CustomIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="9" r="4" />
    <circle cx="9" cy="23" r="4" />
    <line x1="28" y1="5" x2="12.66" y2="17.34" />
    <line x1="19.87" y1="19.87" x2="28" y2="28" />
    <line x1="12.66" y1="12.66" x2="17" y2="17" />
  </svg>
);

const SERVICE_ICONS = [BridalIcon, TailoringIcon, CustomIcon];

// ── STAGGER ANIMATION VARIANTS ────────────────────────────────
const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  return (
    <>
      {/* ── SECTION 1: HERO ─────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden bg-ivory linen-overlay"
        aria-label="Hero section"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-16 lg:pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center min-h-screen py-20 lg:py-0">

            {/* Left: Text */}
            <div className="flex flex-col justify-center">
              <motion.p
                className="section-label mb-6"
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
              >
                Pittsburgh Bridal Alterations
              </motion.p>

              <motion.h1
                className="font-cormorant italic text-charcoal leading-[0.9] mb-2"
                style={{ fontSize: "clamp(3.5rem, 8vw, 7.5rem)" }}
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
              >
                Sewn with
              </motion.h1>
              <motion.p
                className="font-cormorant italic text-charcoal leading-[0.9] mb-6"
                style={{ fontSize: "clamp(3.5rem, 8vw, 7.5rem)" }}
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
                aria-hidden="true"
              >
                precision.
              </motion.p>

              <motion.div
                className="w-12 h-px bg-gold mb-6"
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
                aria-hidden="true"
              />

              <motion.p
                className="font-jost text-charcoal/65 text-base lg:text-lg max-w-sm mb-10 leading-relaxed"
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
              >
                {SITE.subTagline}
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                custom={5}
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
              >
                <Button variant="gold" href="/services">
                  View Services
                </Button>
                <Button variant="outline" href="/contact">
                  Book a Consultation
                </Button>
              </motion.div>
            </div>

            {/* Right: Portrait image
                ─────────────────────────────────────────────────
                HERO_PORTRAIT_IMAGE
                Professional photo of the seamstress.
                Ideal: at sewing machine, holding fabric, or a polished headshot.
                Ratio: portrait (3:4). File: /public/images/hero-portrait.jpg
                ───────────────────────────────────────────────── */}
            <motion.div
              className="relative lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[44%] overflow-hidden"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            >
              <div className="lg:h-screen">
                <ImagePlaceholder
                  label="HERO_PORTRAIT_IMAGE"
                  aspectRatio="portrait"
                  className="lg:!pb-0 lg:h-full"
                />
                <div className="hidden lg:block absolute inset-0" style={{ paddingBottom: 0 }}>
                  <ImagePlaceholder label="HERO_PORTRAIT_IMAGE" aspectRatio="portrait" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          aria-hidden="true"
        >
          <span className="font-jost text-[0.6rem] tracking-[0.25em] uppercase text-charcoal/40">
            Scroll
          </span>
          <motion.div
            className="w-px h-8 bg-gold/50"
            animate={{ scaleY: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* ── SECTION 2: TRUST BAR ────────────────────────────── */}
      <section
        className="bg-ivory border-y border-blush py-10"
        aria-label="Experience and credentials"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
            {TRUST_STATS.map((stat, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && (
                  <div
                    className="hidden sm:block w-px h-10 bg-gold/40 mx-10 lg:mx-16"
                    aria-hidden="true"
                  />
                )}
                <div className="text-center">
                  <p className="font-cormorant text-charcoal text-3xl lg:text-4xl font-light">
                    {stat.value}
                  </p>
                  <p className="font-jost text-charcoal/50 text-xs tracking-[0.18em] uppercase mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: SERVICES PREVIEW ─────────────────────── */}
      <section
        className="bg-near_black py-20 lg:py-28 px-6"
        aria-labelledby="services-preview-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label text-gold/70 mb-3">What I Do</p>
            <h2
              id="services-preview-heading"
              className="font-cormorant italic text-ivory text-4xl lg:text-5xl"
            >
              Services
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ivory/10">
            {SERVICES.map((service, i) => {
              const Icon = SERVICE_ICONS[i];
              return (
                <motion.article
                  key={service.id}
                  className="group bg-near_black p-8 lg:p-10 flex flex-col"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                >
                  <div className="mb-6">
                    <Icon />
                  </div>
                  <div className="w-8 h-px bg-gold/50 mb-6" aria-hidden="true" />
                  <h3 className="font-cormorant text-ivory text-2xl mb-3">
                    {service.title}
                  </h3>
                  <p className="font-jost text-ivory/55 text-sm leading-relaxed flex-1">
                    {service.shortDescription}
                  </p>
                  <Link
                    href={`/services#${service.id}`}
                    className="mt-6 font-jost text-xs text-gold tracking-[0.18em] uppercase hover:text-gold_light transition-colors duration-300 flex items-center gap-2"
                    aria-label={`Learn more about ${service.title}`}
                  >
                    Learn More
                    <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
                      <path d="M0 4H14M11 1L14 4L11 7" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: PORTFOLIO TEASER ─────────────────────── */}
      <section
        className="bg-ivory py-20 lg:py-28 px-6"
        aria-labelledby="portfolio-preview-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label mb-3">Selected Work</p>
            <h2
              id="portfolio-preview-heading"
              className="font-cormorant italic text-charcoal text-4xl lg:text-5xl"
            >
              The Work
            </h2>
          </motion.div>

          {/* 4-image preview grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {PORTFOLIO_ITEMS.slice(0, 4).map((item, i) => (
              <motion.div
                key={item.id}
                className="group relative overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                {/*
                  PORTFOLIO_IMAGE_{i+1}
                  See /src/data/content.ts for shot guides per image slot.
                  File: /public/images/portfolio/portfolio-{i+1}.jpg
                */}
                <ImagePlaceholder
                  label={`PORTFOLIO_IMAGE_${item.id}`}
                  aspectRatio="portrait"
                />

                {/* Gold hover overlay with + icon */}
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/35 transition-all duration-500 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <line x1="10" y1="0" x2="10" y2="20" stroke="white" strokeWidth="1.5" />
                      <line x1="0" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>

                {/* Caption on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-charcoal/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <p className="font-jost text-ivory text-xs tracking-widest uppercase">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button variant="outline" href="/portfolio">
              View Full Portfolio
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 5: ABOUT TEASER ─────────────────────────── */}
      <section
        className="bg-blush py-20 lg:py-28 px-6"
        aria-labelledby="about-teaser-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Image
                ─────────────────────────────────────────────────
                ABOUT_SECONDARY_IMAGE
                Ideal shot: close-up of hands at work, fabric texture,
                or a candid of the seamstress mid-task. Intimate and skilled.
                File: /public/images/about-secondary.jpg
                ───────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
            >
              <ImagePlaceholder label="ABOUT_SECONDARY_IMAGE" aspectRatio="tall" />
            </motion.div>

            {/* Right: Text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="section-label mb-6">The Seamstress</p>
              <div className="w-12 h-px bg-gold mb-8" aria-hidden="true" />

              <blockquote className="font-cormorant italic text-charcoal text-2xl lg:text-3xl leading-snug mb-8 border-l-2 border-gold pl-6">
                &ldquo;{BIO.pullQuote}&rdquo;
              </blockquote>

              <p className="font-jost text-charcoal/70 text-sm leading-relaxed mb-4">
                {BIO.paragraph1}
              </p>
              <p className="font-jost text-charcoal/70 text-sm leading-relaxed mb-8">
                {BIO.paragraph2}
              </p>

              <Link
                href="/about"
                className="font-jost text-xs text-gold tracking-[0.18em] uppercase hover:text-gold_dark transition-colors duration-300 flex items-center gap-2"
                aria-label="Read the full about story"
              >
                My Story
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
                  <path d="M0 4H14M11 1L14 4L11 7" stroke="currentColor" strokeWidth="1" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: TESTIMONIALS ─────────────────────────── */}
      <TestimonialsSection />

      {/* ── SECTION 7: CTA BANNER ───────────────────────────── */}
      <CTABanner />
    </>
  );
}
