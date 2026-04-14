"use client";

import { motion } from "framer-motion";
import SanityImage from "@/components/ui/SanityImage";
import CTABanner from "@/components/sections/CTABanner";
import type { SanityImage as SanityImageType, SanityValue } from "@/lib/sanity.queries";

interface AboutData {
  heroImage: SanityImageType | null;
  secondaryImage: SanityImageType | null;
  heroLabel: string;
  storyLabel: string;
  storyHeading: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  pullQuote: string;
  valuesLabel: string;
  valuesHeading: string;
  independenceLabel: string;
  independenceHeading: string;
  independenceQuote: string;
  ctaHeadline: string;
  ctaSubhead: string;
  ctaButton: string;
}

interface Props {
  site: { name: string };
  about: AboutData;
  values: SanityValue[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

// Values block — staggered children so each element animates in sequence
const valBlock = {
  hidden: {},
  visible: (i: number) => ({
    transition: { staggerChildren: 0.1, delayChildren: i * 0.15 },
  }),
};
const valNum = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};
const valLine = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};
const valText = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function AboutPageContent({ site, about, values }: Props) {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative flex items-end overflow-hidden"
        style={{ minHeight: "72vh" }}
        aria-label="About hero"
      >
        <div className="absolute inset-0 z-0">
          <SanityImage
            image={about.heroImage}
            fill
            priority
            placeholderLabel="ABOUT_HERO_IMAGE"
            placeholderRatio="landscape"
            alt={`${site.name} — Pittsburgh seamstress at work`}
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            maskImage: "radial-gradient(ellipse 80% 70% at 0% 100%, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 0% 100%, black 20%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 90% 80% at 0% 105%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 right-0 z-[15] pointer-events-none"
          style={{ height: "220px", background: "linear-gradient(to top, #FAF7F2 0%, #FAF7F2 15%, rgba(250,247,242,0.85) 40%, rgba(250,247,242,0.4) 65%, transparent 100%)" }}
          aria-hidden="true"
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-40 pt-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
            <p className="section-label text-gold/80 mb-4">{about.heroLabel}</p>
            <h1
              className="font-cormorant italic text-ivory leading-none"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
            >
              {site.name}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── STORY ─────────────────────────────────────────────── */}
      <section className="bg-ivory py-16 lg:py-24 px-6" aria-labelledby="story-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
            >
              <p className="section-label mb-4">{about.storyLabel}</p>
              <h2 id="story-heading" className="font-cormorant italic text-charcoal text-4xl lg:text-5xl mb-6">
                {about.storyHeading}
              </h2>
              <div className="w-12 h-px bg-gold mb-8" aria-hidden="true" />
              <p className="font-jost text-charcoal/65 text-sm leading-relaxed mb-6">{about.paragraph1}</p>
              <p className="font-jost text-charcoal/65 text-sm leading-relaxed mb-6">{about.paragraph2}</p>
              <p className="font-jost text-charcoal/65 text-sm leading-relaxed">{about.paragraph3}</p>
            </motion.div>

            <motion.div
              className="relative lg:sticky lg:top-28"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <SanityImage
                image={about.secondaryImage}
                placeholderLabel="ABOUT_SECONDARY_IMAGE"
                placeholderRatio="tall"
                alt="Close-up of hands at work — precision sewing"
              />
              <div className="absolute -bottom-3 -right-3 w-full h-full border border-gold/25 pointer-events-none" aria-hidden="true" />
              <blockquote className="mt-10 border-l-2 border-gold pl-6">
                <p className="font-cormorant italic text-charcoal text-xl lg:text-2xl leading-snug">
                  &ldquo;{about.pullQuote}&rdquo;
                </p>
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────── */}
      <section className="bg-blush py-14 lg:py-20 px-6" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label mb-4">{about.valuesLabel}</p>
            <h2 id="values-heading" className="font-cormorant italic text-charcoal text-4xl lg:text-5xl">{about.valuesHeading}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            {values.map((value, i) => (
              <motion.div
                key={value._id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                variants={valBlock}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
              >
                <motion.p
                  variants={valNum}
                  className="font-cormorant text-gold/40 text-5xl font-light mb-2 leading-none"
                  aria-hidden="true"
                >
                  0{i + 1}
                </motion.p>
                <motion.div
                  variants={valLine}
                  style={{ transformOrigin: "left" }}
                  className="w-10 h-px bg-gold mb-5"
                  aria-hidden="true"
                />
                <motion.h3 variants={valText} className="font-cormorant text-charcoal text-2xl mb-3">
                  {value.title}
                </motion.h3>
                <motion.p variants={valText} className="font-jost text-charcoal/60 text-sm leading-relaxed">
                  {value.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY INDEPENDENT ───────────────────────────────────── */}
      <section className="bg-near_black py-16 lg:py-24 px-6" aria-labelledby="independent-heading">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label text-gold/70 mb-6">{about.independenceLabel}</p>
            <div className="w-12 h-px bg-gold mx-auto mb-10" aria-hidden="true" />
            <h2
              id="independent-heading"
              className="font-cormorant italic text-ivory text-4xl lg:text-5xl xl:text-6xl leading-tight mb-10"
            >
              {about.independenceHeading}
            </h2>
            <blockquote className="font-cormorant italic text-ivory/65 text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed">
              &ldquo;{about.independenceQuote}&rdquo;
            </blockquote>
            <p className="font-cormorant_sc text-gold text-sm tracking-widest mt-10">— {site.name}</p>
          </motion.div>
        </div>
      </section>

      <CTABanner
        headline={about.ctaHeadline}
        subhead={about.ctaSubhead}
        buttonLabel={about.ctaButton}
      />
    </>
  );
}
