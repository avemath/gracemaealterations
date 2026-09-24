"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import SanityImage from "@/components/ui/SanityImage";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import Button from "@/components/ui/Button";
import CTABanner from "@/components/sections/CTABanner";
import ProcessSteps from "@/components/sections/ProcessSteps";
import CountUp from "@/components/ui/CountUp";
import TestimonialCarousel from "@/components/ui/TestimonialCarousel";
import type {
  SanityImage as SanityImageType,
  SanityService,
  SanityTestimonial,
  SanityPortfolioItem,
  SanityProcessStep,
} from "@/lib/sanity.queries";

interface HomePageText {
  heroSectionLabel: string;
  heroCredentialText: string;
  servicesLabel: string;
  servicesHeading: string;
  portfolioLabel: string;
  portfolioHeading: string;
  aboutTeaserLabel: string;
  testimonialsLabel: string;
  testimonialsHeading: string;
  processLabel: string;
  processHeading: string;
  processCTA: string;
  processSteps: SanityProcessStep[];
  ctaHeadline: string;
  ctaSubhead: string;
  ctaButton: string;
}

interface HomePageData {
  site: { name: string; tagline: string; subTagline: string; bookingNote: string };
  heroImage: SanityImageType | null;
  trustStats: { value: string; label: string }[];
  services: SanityService[];
  portfolioItems: SanityPortfolioItem[];
  bio: { paragraph1: string; paragraph2: string; pullQuote: string };
  aboutSecondaryImage: SanityImageType | null;
  testimonials: SanityTestimonial[];
  text: HomePageText;
}

// ── Service icons ─────────────────────────────────────────────

/** Wedding gown silhouette — one continuous flowing path, no straight lines */
const BridalIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 6 Q14 10 16 11 Q18 10 20 6 C21.5 8 22 12 21 15 C24 20 27 25 28 29 L4 29 C5 25 8 20 11 15 C10 12 10.5 8 12 6 Z" />
  </svg>
);

/** Needle and thread */
const TailoringIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="27,6 9,24.8 10.8,26.2" fill="#C9A84C" />
    <ellipse cx="9.9" cy="25.5" rx="1.3" ry="0.5" transform="rotate(-52 9.9 25.5)" fill="#FAF7F2" />
    <path d="M9 24 C3 21 0 27 3 30 C6 33 13 32 14 28 C16 25 13 21 18 24 C22 27 23 32 20 32" stroke="#C9A84C" strokeWidth="1" />
  </svg>
);

/** Scissors */
const CustomIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="4" />
    <circle cx="8" cy="24" r="4" />
    <line x1="11.5" y1="10.5" x2="28" y2="22" />
    <line x1="11.5" y1="21.5" x2="28" y2="10" />
    <circle cx="19" cy="16" r="1.2" fill="#C9A84C" stroke="none" />
  </svg>
);
const SERVICE_ICONS = [BridalIcon, TailoringIcon, CustomIcon];

const ArrowRight = () => (
  <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
    <path d="M0 4H14M11 1L14 4L11 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Animation variants ────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.13, ease: "easeOut" as const },
  }),
};

export default function HomePageContent({ data }: { data: HomePageData }) {
  const { site, heroImage, trustStats, services, portfolioItems, bio, aboutSecondaryImage, testimonials, text } = data;

  // ── Hero parallax ─────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallaxY = useTransform(heroScroll, [0, 1], ["0%", "-12%"]);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-ivory linen-overlay" aria-label="Hero section">

        {/* Desktop: portrait image covers right half of viewport */}
        <motion.div
          className="hidden lg:block absolute inset-y-0 right-0 w-[48%] z-0 overflow-hidden"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
          aria-hidden="true"
        >
          {/* Parallax inner — taller than container so there's room to translate */}
          <motion.div className="absolute inset-x-0 top-0" style={{ height: "120%", y: heroParallaxY }}>
            <SanityImage
              image={heroImage}
              fill
              priority
              placeholderLabel="HERO_PORTRAIT_IMAGE"
              placeholderRatio="portrait"
              alt={heroImage?.alt ?? `${site.name} — Pittsburgh bridal seamstress`}
              sizes="48vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/25 to-transparent pointer-events-none" />
        </motion.div>

        {/* Content layer */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="min-h-screen flex items-center">
            <div className="w-full lg:max-w-[520px] py-32 lg:py-0">

              <motion.p className="section-label mb-6" custom={0} initial="hidden" animate="visible" variants={fadeUp}>
                {text.heroSectionLabel}
              </motion.p>

              <RevealText onMount delay={0.18}>
                <h1
                  className="font-cormorant italic text-charcoal leading-[0.9]"
                  style={{ fontSize: "clamp(3.5rem, 8vw, 7.5rem)" }}
                >
                  {site.tagline}
                </h1>
              </RevealText>

              <motion.div
                className="w-12 h-px bg-gold my-8"
                custom={2} initial="hidden" animate="visible" variants={fadeUp}
                aria-hidden="true"
              />

              <motion.p
                className="font-jost text-charcoal/65 text-base lg:text-lg max-w-sm mb-10 leading-relaxed"
                custom={3} initial="hidden" animate="visible" variants={fadeUp}
              >
                {site.subTagline}
              </motion.p>

              <motion.p
                className="font-jost text-sm text-charcoal/55 tracking-[0.03em] italic max-w-sm mb-8 leading-relaxed"
                custom={4} initial="hidden" animate="visible" variants={fadeUp}
              >
                {text.heroCredentialText}
              </motion.p>

              <motion.div className="flex flex-wrap gap-4" custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                <Button variant="gold" href="/services">View Services</Button>
                <Button variant="outline" href="/contact">Book a Consultation</Button>
              </motion.div>

              {/* Availability signal */}
              <motion.div
                className="flex items-center gap-2.5 mt-8"
                custom={6}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
                <p className="font-jost text-xs text-charcoal/65 tracking-[0.15em] uppercase">
                  {site.bookingNote}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile: portrait image below the text, edge-to-edge */}
        <motion.div
          className="lg:hidden -mt-4 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          aria-hidden="true"
        >
          <SanityImage
            image={heroImage}
            placeholderLabel="HERO_PORTRAIT_IMAGE"
            placeholderRatio="portrait"
            alt={heroImage?.alt ?? `${site.name} — Pittsburgh bridal seamstress`}
            priority
          />
        </motion.div>

        {/* Scroll indicator — desktop only */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          aria-hidden="true"
        >
          <span className="font-jost text-[0.6rem] tracking-[0.25em] uppercase text-charcoal/35">Scroll</span>
          <motion.div
            className="w-px h-8 bg-gold/50"
            animate={{ scaleY: [1, 0.3, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────── */}
      <section className="bg-ivory border-y border-blush py-10 lg:py-12" aria-label="Experience and credentials">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
            {trustStats.map((stat, i) => (
              <motion.div
                key={i}
                className="flex items-center"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {i > 0 && (
                  <div className="hidden sm:block w-px h-10 bg-gold/30 mx-10 lg:mx-16" aria-hidden="true" />
                )}
                <div className="text-center">
                  <p className="font-cormorant text-charcoal text-3xl lg:text-4xl font-light"><CountUp value={stat.value} /></p>
                  <p className="font-jost text-charcoal/45 text-xs tracking-[0.18em] uppercase mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES PREVIEW ──────────────────────────────────── */}
      <section className="bg-near_black py-16 lg:py-24 px-6" aria-labelledby="services-preview-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label text-gold/70 mb-3">{text.servicesLabel}</p>
            <h2 id="services-preview-heading" className="font-cormorant italic text-ivory text-4xl lg:text-5xl">{text.servicesHeading}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ivory/10">
            {services.map((service, i) => {
              const Icon = SERVICE_ICONS[i] ?? BridalIcon;
              return (
                <motion.article
                  key={service._id}
                  className="group relative bg-near_black p-8 lg:p-10 flex flex-col overflow-hidden transition-all duration-400 min-h-[22rem]"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                >
                  {service.cardImage && (
                    <div className="absolute inset-0" aria-hidden="true">
                      <SanityImage
                        image={service.cardImage}
                        fill
                        placeholderLabel="SERVICE_CARD_IMAGE"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="opacity-30 group-hover:opacity-45 transition-opacity duration-500"
                        aria-hidden
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-near_black via-near_black/70 to-near_black/20" />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" aria-hidden="true" />
                  <div className="relative z-10 flex flex-col flex-1">
                    <div className="mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:translate-y-[-2px] origin-left">
                      <Icon />
                    </div>
                    <div className="w-8 h-px bg-gold/40 mb-6" aria-hidden="true" />
                    <h3 className="font-cormorant text-ivory text-2xl mb-3">{service.title}</h3>
                    <p className="font-jost text-ivory/50 text-sm leading-relaxed flex-1">{service.shortDescription}</p>
                    <Link
                      href={`/services#${service.id}`}
                      className="mt-6 inline-flex items-center gap-2 font-jost text-xs text-gold tracking-[0.18em] uppercase group-hover:text-gold_light transition-colors duration-300"
                      aria-label={`Learn more about ${service.title}`}
                    >
                      <span>Learn More</span>
                      <motion.span
                        className="inline-block"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                      >
                        <ArrowRight />
                      </motion.span>
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO TEASER ──────────────────────────────────── */}
      <section className="bg-ivory py-16 lg:py-24 px-6" aria-labelledby="portfolio-preview-heading">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="section-label mb-3">{text.portfolioLabel}</p>
              <h2 id="portfolio-preview-heading" className="font-cormorant italic text-charcoal text-4xl lg:text-5xl">{text.portfolioHeading}</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden sm:block"
            >
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 font-jost text-xs text-gold tracking-[0.18em] uppercase hover:text-gold_dark transition-colors duration-300"
              >
                View All <ArrowRight />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
            {portfolioItems.slice(0, 4).map((item, i) => (
              <motion.div
                key={item._id}
                className="group relative overflow-hidden cursor-pointer"
                style={{ paddingBottom: "133.33%" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="absolute inset-0">
                  <SanityImage
                    image={item.image}
                    fill
                    placeholderLabel={`PORTFOLIO_${i + 1}`}
                    placeholderRatio="portrait"
                    alt={item.label}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/55 transition-all duration-500" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
                  <p className="font-cormorant italic text-ivory text-lg leading-tight">{item.label}</p>
                  <div className="w-6 h-px bg-gold mt-2" aria-hidden="true" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-8 sm:hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="outline" href="/portfolio">View Full Portfolio</Button>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT TO EXPECT ────────────────────────────────────── */}
      <ProcessSteps
        sectionLabel={text.processLabel}
        heading={text.processHeading}
        ctaText={text.processCTA}
        steps={text.processSteps}
      />

      {/* ── ABOUT TEASER ──────────────────────────────────────── */}
      <section className="bg-blush py-16 lg:py-24 px-6" aria-labelledby="about-teaser-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <div className="relative">
              <RevealImage>
                <SanityImage
                  image={aboutSecondaryImage}
                  placeholderLabel="ABOUT_SECONDARY_IMAGE"
                  placeholderRatio="tall"
                />
              </RevealImage>
              <motion.div
                className="absolute -bottom-3 -right-3 w-full h-full border border-gold/30 pointer-events-none"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.75, duration: 0.5 }}
                aria-hidden="true"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="section-label mb-6">{text.aboutTeaserLabel}</p>
              <div className="w-12 h-px bg-gold mb-8" aria-hidden="true" />
              <blockquote className="font-cormorant italic text-charcoal text-2xl lg:text-3xl leading-snug mb-8 border-l-2 border-gold pl-6">
                &ldquo;{bio.pullQuote}&rdquo;
              </blockquote>
              <p className="font-jost text-charcoal/65 text-sm leading-relaxed mb-4">{bio.paragraph1}</p>
              <p className="font-jost text-charcoal/65 text-sm leading-relaxed mb-10">{bio.paragraph2}</p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-jost text-xs text-gold tracking-[0.18em] uppercase hover:text-gold_dark transition-colors duration-300 group"
                aria-label="Read the full about story"
              >
                My Story
                <span className="transition-transform duration-300 group-hover:translate-x-1"><ArrowRight /></span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="bg-ivory py-16 lg:py-24 px-6 overflow-hidden" aria-labelledby="testimonials-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label mb-3">{text.testimonialsLabel}</p>
            <h2 id="testimonials-heading" className="font-cormorant italic text-charcoal text-4xl lg:text-5xl">{text.testimonialsHeading}</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <TestimonialCarousel testimonials={testimonials} />
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <CTABanner
        headline={text.ctaHeadline}
        subhead={text.ctaSubhead}
        buttonLabel={text.ctaButton}
      />
    </>
  );
}
