"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SanityImage from "@/components/ui/SanityImage";
import Button from "@/components/ui/Button";
import CTABanner from "@/components/sections/CTABanner";
import type {
  SanityImage as SanityImageType,
  SanityService,
  SanityTestimonial,
  SanityPortfolioItem,
} from "@/lib/sanity.queries";

interface HomePageData {
  site: { name: string; subTagline: string };
  heroImage: SanityImageType | null;
  trustStats: { value: string; label: string }[];
  services: SanityService[];
  portfolioItems: SanityPortfolioItem[];
  bio: { paragraph1: string; paragraph2: string; pullQuote: string };
  aboutSecondaryImage: SanityImageType | null;
  testimonials: SanityTestimonial[];
}

// Icons
const BridalIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 4C10 4 6 9 6 15C6 21 10 27 16 28C22 27 26 21 26 15C26 9 22 4 16 4Z" /><path d="M13 8L16 12L19 8" /><path d="M11 18Q16 22 21 18" />
  </svg>
);
const TailoringIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="16" y1="3" x2="16" y2="29" /><line x1="7" y1="11" x2="25" y2="11" /><line x1="5" y1="19" x2="27" y2="19" /><path d="M7 11L4 29M25 11L28 29M5 19L9 29M27 19L23 29" />
  </svg>
);
const CustomIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="9" r="4" /><circle cx="9" cy="23" r="4" /><line x1="28" y1="5" x2="12.66" y2="17.34" /><line x1="19.87" y1="19.87" x2="28" y2="28" /><line x1="12.66" y1="12.66" x2="17" y2="17" />
  </svg>
);
const SERVICE_ICONS = [BridalIcon, TailoringIcon, CustomIcon];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" as const } }),
};

export default function HomePageContent({ data }: { data: HomePageData }) {
  const { site, heroImage, trustStats, services, portfolioItems, bio, aboutSecondaryImage, testimonials } = data;

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-ivory linen-overlay" aria-label="Hero section">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-16 lg:pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center min-h-screen py-20 lg:py-0">
            <div className="flex flex-col justify-center">
              <motion.p className="section-label mb-6" custom={0} initial="hidden" animate="visible" variants={fadeUp}>Pittsburgh Bridal Alterations</motion.p>
              <motion.h1 className="font-cormorant italic text-charcoal leading-[0.9] mb-2" style={{ fontSize: "clamp(3.5rem, 8vw, 7.5rem)" }} custom={1} initial="hidden" animate="visible" variants={fadeUp}>Sewn with</motion.h1>
              <motion.p className="font-cormorant italic text-charcoal leading-[0.9] mb-6" style={{ fontSize: "clamp(3.5rem, 8vw, 7.5rem)" }} custom={2} initial="hidden" animate="visible" variants={fadeUp} aria-hidden="true">precision.</motion.p>
              <motion.div className="w-12 h-px bg-gold mb-6" custom={3} initial="hidden" animate="visible" variants={fadeUp} aria-hidden="true" />
              <motion.p className="font-jost text-charcoal/65 text-base lg:text-lg max-w-sm mb-10 leading-relaxed" custom={4} initial="hidden" animate="visible" variants={fadeUp}>{site.subTagline}</motion.p>
              <motion.div className="flex flex-wrap gap-4" custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                <Button variant="gold" href="/services">View Services</Button>
                <Button variant="outline" href="/contact">Book a Consultation</Button>
              </motion.div>
            </div>

            {/* HERO_PORTRAIT_IMAGE */}
            <motion.div className="relative lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[44%] overflow-hidden" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }}>
              <SanityImage image={heroImage} placeholderLabel="HERO_PORTRAIT_IMAGE" placeholderRatio="portrait" alt={`${site.name} — Pittsburgh bridal seamstress`} priority />
            </motion.div>
          </div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }} aria-hidden="true">
          <span className="font-jost text-[0.6rem] tracking-[0.25em] uppercase text-charcoal/40">Scroll</span>
          <motion.div className="w-px h-8 bg-gold/50" animate={{ scaleY: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
        </motion.div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-ivory border-y border-blush py-10" aria-label="Experience and credentials">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
            {trustStats.map((stat, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && <div className="hidden sm:block w-px h-10 bg-gold/40 mx-10 lg:mx-16" aria-hidden="true" />}
                <div className="text-center">
                  <p className="font-cormorant text-charcoal text-3xl lg:text-4xl font-light">{stat.value}</p>
                  <p className="font-jost text-charcoal/50 text-xs tracking-[0.18em] uppercase mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="bg-near_black py-20 lg:py-28 px-6" aria-labelledby="services-preview-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
            <p className="section-label text-gold/70 mb-3">What I Do</p>
            <h2 id="services-preview-heading" className="font-cormorant italic text-ivory text-4xl lg:text-5xl">Services</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ivory/10">
            {services.map((service, i) => {
              const Icon = SERVICE_ICONS[i] ?? BridalIcon;
              return (
                <motion.article key={service._id} className="group bg-near_black p-8 lg:p-10 flex flex-col" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.12 }} whileHover={{ y: -4, transition: { duration: 0.3 } }}>
                  <div className="mb-6"><Icon /></div>
                  <div className="w-8 h-px bg-gold/50 mb-6" aria-hidden="true" />
                  <h3 className="font-cormorant text-ivory text-2xl mb-3">{service.title}</h3>
                  <p className="font-jost text-ivory/55 text-sm leading-relaxed flex-1">{service.shortDescription}</p>
                  <Link href={`/services#${service.id}`} className="mt-6 font-jost text-xs text-gold tracking-[0.18em] uppercase hover:text-gold_light transition-colors duration-300 flex items-center gap-2" aria-label={`Learn more about ${service.title}`}>
                    Learn More <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4H14M11 1L14 4L11 7" stroke="currentColor" strokeWidth="1" /></svg>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PORTFOLIO TEASER */}
      <section className="bg-ivory py-20 lg:py-28 px-6" aria-labelledby="portfolio-preview-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
            <p className="section-label mb-3">Selected Work</p>
            <h2 id="portfolio-preview-heading" className="font-cormorant italic text-charcoal text-4xl lg:text-5xl">The Work</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {portfolioItems.slice(0, 4).map((item, i) => (
              <motion.div key={item._id} className="group relative overflow-hidden cursor-pointer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <SanityImage image={item.image} placeholderLabel={`PORTFOLIO_IMAGE_${i + 1}`} placeholderRatio="portrait" alt={item.label} />
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/35 transition-all duration-500 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><line x1="10" y1="0" x2="10" y2="20" stroke="white" strokeWidth="1.5" /><line x1="0" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1.5" /></svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-charcoal/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <p className="font-jost text-ivory text-xs tracking-widest uppercase">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div className="text-center mt-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Button variant="outline" href="/portfolio">View Full Portfolio</Button>
          </motion.div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="bg-blush py-20 lg:py-28 px-6" aria-labelledby="about-teaser-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* ABOUT_SECONDARY_IMAGE */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}>
              <SanityImage image={aboutSecondaryImage} placeholderLabel="ABOUT_SECONDARY_IMAGE" placeholderRatio="tall" alt="Hands at work — close-up of sewing craft" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: 0.2 }}>
              <p className="section-label mb-6">The Seamstress</p>
              <div className="w-12 h-px bg-gold mb-8" aria-hidden="true" />
              <blockquote className="font-cormorant italic text-charcoal text-2xl lg:text-3xl leading-snug mb-8 border-l-2 border-gold pl-6">&ldquo;{bio.pullQuote}&rdquo;</blockquote>
              <p className="font-jost text-charcoal/70 text-sm leading-relaxed mb-4">{bio.paragraph1}</p>
              <p className="font-jost text-charcoal/70 text-sm leading-relaxed mb-8">{bio.paragraph2}</p>
              <Link href="/about" className="font-jost text-xs text-gold tracking-[0.18em] uppercase hover:text-gold_dark transition-colors duration-300 flex items-center gap-2" aria-label="Read the full about story">
                My Story <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4H14M11 1L14 4L11 7" stroke="currentColor" strokeWidth="1" /></svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ivory py-20 lg:py-28 px-6" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
            <p className="section-label mb-3">Kind Words</p>
            <h2 id="testimonials-heading" className="font-cormorant italic text-charcoal text-4xl lg:text-5xl">What clients say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <motion.article key={t._id} className="relative bg-blush p-8 lg:p-10 overflow-hidden" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.12 }}>
                <span className="absolute top-0 left-4 font-cormorant text-gold/20 select-none pointer-events-none leading-none" style={{ fontSize: "10rem", lineHeight: 1 }} aria-hidden="true">&ldquo;</span>
                <div className="relative z-10">
                  <p className="font-cormorant italic text-charcoal text-lg lg:text-xl leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="w-8 h-px bg-gold mb-4" aria-hidden="true" />
                  <p className="font-jost text-charcoal text-sm font-medium">{t.name}</p>
                  <p className="font-jost text-charcoal/50 text-xs tracking-widest uppercase mt-0.5">{t.occasion}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner />
    </>
  );
}
