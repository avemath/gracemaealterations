"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SanityImage from "@/components/ui/SanityImage";
import CTABanner from "@/components/sections/CTABanner";
import type { SanityImage as SanityImageType, SanityValue } from "@/lib/sanity.queries";

interface AboutData {
  heroImage: SanityImageType | null;
  secondaryImage: SanityImageType | null;
  portraitImage: SanityImageType | null;
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
  site: { name: string; limitedMode: boolean; reopensLabel: string };
  about: AboutData;
  values: SanityValue[];
}

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
  // ── Hero parallax ───────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallaxY = useTransform(heroScroll, [0, 1], ["0%", "-15%"]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex items-end overflow-hidden"
        style={{ minHeight: "72vh" }}
        aria-label="About hero"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div className="absolute inset-x-0 top-0" style={{ height: "120%", y: heroParallaxY }}>
            <SanityImage
              image={about.heroImage}
              fill
              priority
              placeholderLabel="ABOUT_HERO_IMAGE"
              placeholderRatio="landscape"
              alt={about.heroImage?.alt ?? `${site.name}, Pittsburgh seamstress at work`}
              sizes="100vw"
            />
          </motion.div>
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
          style={{ height: "360px", background: "linear-gradient(to top, #FAF7F2 0%, #FAF7F2 3%, rgba(250,247,242,0.92) 10%, rgba(250,247,242,0.62) 20%, rgba(250,247,242,0.28) 32%, rgba(250,247,242,0.07) 44%, transparent 54%)" }}
          aria-hidden="true"
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-40 pt-32">
          <p
              className="section-label text-ivory mb-4"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.75), 0 0 14px rgba(0,0,0,0.5)" }}
            >
            {about.heroLabel}
          </p>
            <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory">
              {site.name}
            </h1>
        </div>
      </section>

      {/* ── STORY ─────────────────────────────────────────────── */}
      <section className="bg-ivory py-16 lg:py-24 px-6" aria-labelledby="story-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            <div data-reveal
            >
              <p className="section-label mb-4">{about.storyLabel}</p>
                <h2 id="story-heading" className="font-cormorant italic text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.1] text-charcoal mb-6">
                  {about.storyHeading}
                </h2>
              <div className="w-12 h-px bg-gold mb-8" aria-hidden="true" />
              <p className="font-jost text-charcoal/75 text-sm leading-relaxed mb-6">{about.paragraph1}</p>
              <p className="font-jost text-charcoal/75 text-sm leading-relaxed mb-6">{about.paragraph2}</p>
              <p className="font-jost text-charcoal/75 text-sm leading-relaxed">{about.paragraph3}</p>
            </div>

            <div className="relative lg:sticky lg:top-28">
              <div className="relative">
                <div className="overflow-hidden">
                  {/* Fixed square so the hotspot actually crops — a portrait
                      asset would otherwise render at its own 2:3 and show her
                      full torso. */}
                  <div className="relative w-full aspect-square">
                    <SanityImage
                      image={about.portraitImage ?? about.secondaryImage}
                      fill
                      sizes="(min-width:1024px) 40vw, 100vw"
                      placeholderLabel="ABOUT_PORTRAIT_IMAGE"
                      placeholderRatio="square"
                    />
                  </div>
                </div>
                <div data-reveal
              className="absolute -bottom-3 -right-3 w-full h-full border border-gold/25 pointer-events-none"
              aria-hidden="true"
            />
              </div>
              <blockquote className="mt-10 border-l-2 border-gold pl-6">
                <p className="font-cormorant italic text-charcoal text-xl lg:text-2xl leading-snug">
                  &ldquo;{about.pullQuote}&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────── */}
      <section className="bg-blush py-14 lg:py-20 px-6" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto">
          <div data-reveal
              className="mb-8"
            >
            <h2 id="values-heading" className="section-label text-base">{about.valuesLabel}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            {values.map((value, i) => (
              <div data-reveal
              key={value._id}
            >
                <motion.p
                  variants={valNum}
                  className="font-cormorant text-gold_ink/40 text-5xl font-light mb-2 leading-none"
                  aria-hidden="true"
                  data-numeral={`0${i + 1}`}
                />
                <motion.div
                  variants={valLine}
                  style={{ transformOrigin: "left" }}
                  className="w-10 h-px bg-gold mb-5"
                  aria-hidden="true"
                />
                <motion.h3 variants={valText} className="font-cormorant text-charcoal text-2xl mb-3">
                  {value.title}
                </motion.h3>
                <motion.p variants={valText} className="font-jost text-charcoal/75 text-sm leading-relaxed">
                  {value.description}
                </motion.p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY INDEPENDENT ───────────────────────────────────── */}
      <section className="bg-near_black py-16 lg:py-24 px-6" aria-labelledby="independent-heading">
        <div className="max-w-4xl mx-auto text-center">
          <div data-reveal
            >
            <p className="section-label text-gold mb-6">{about.independenceLabel}</p>
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
            <p className="font-jost font-medium text-gold text-xs tracking-[0.22em] uppercase mt-10">{site.name}</p>
          </div>
        </div>
      </section>

      <CTABanner
        headline={about.ctaHeadline}
        subhead={about.ctaSubhead}
        buttonLabel={about.ctaButton}
        limitedMode={site.limitedMode}
        reopensLabel={site.reopensLabel}
      />
    </>
  );
}
