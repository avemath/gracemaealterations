"use client";

import { useRef } from "react";
import { m as motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import SanityImage from "@/components/ui/SanityImage";
import Button from "@/components/ui/Button";
import CTABanner from "@/components/sections/CTABanner";
import CountUp from "@/components/ui/CountUp";
import AvailabilityPill from "@/components/ui/AvailabilityPill";
import InstagramRow, { type InstagramPost } from "@/components/sections/InstagramRow";
import { ctas, type TextFor } from "@/lib/cta";
import { fill } from "@/lib/text/fill";
import TestimonialCarousel from "@/components/ui/TestimonialCarousel";
import type {
  SanityImage as SanityImageType,
  SanityService,
  SanityTestimonial,
  SanityPortfolioItem,
  SanityProcessStep,
} from "@/lib/sanity.queries";

// Split into its own chunk so its hydration (a 472 line scroll-driven SVG
// section well below the fold) no longer runs inside the page's main long
// task. Still server rendered, so the HTML and SEO copy are unchanged.
const ProcessSteps = dynamic(() => import("@/components/sections/ProcessSteps"));

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
  site: {
    name: string;
    tagline: string;
    subTagline: string;
    bookingNote: string;
    limitedMode: boolean;
    waitlistServices: string[];
    reopensLabel: string;
    limitedNote: string;
  };
  heroImage: SanityImageType | null;
  trustStats: { value: string; label: string }[];
  services: SanityService[];
  portfolioItems: SanityPortfolioItem[];
  bio: { paragraph1: string; paragraph2: string; pullQuote: string };
  aboutSecondaryImage: SanityImageType | null;
  instagram: { posts: InstagramPost[]; handle: string; profileUrl: string };
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

/** The Studio's site-wide words this page and its sections use. */
type HomeSiteText = TextFor<"home" | "pill" | "reviews" | "insta" | "banner" | "cta">;

export default function HomePageContent({ data, siteText: t }: { data: HomePageData; siteText: HomeSiteText }) {
  const { site, heroImage, trustStats, services, instagram, portfolioItems, bio, aboutSecondaryImage, testimonials, text } = data;

  // While limited availability is on, some services take waitlist requests
  // instead of bookings.
  const isWaitlisted = (serviceId: string) =>
    site.limitedMode && site.waitlistServices.includes(serviceId);

  const { primary, secondary } = ctas(site, t);

  // Grace picks the home page preview with the "featured" toggle; before anyone
  // has picked, fall back to the first four in display order.
  const byOrder = [...portfolioItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const featuredItems = byOrder.filter((item) => item.featured);
  const previewItems = (featuredItems.length > 0 ? featuredItems : byOrder).slice(0, 4);

  // ── Hero parallax ─────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Still for anyone who has asked for less motion (MotionConfig does not
  // cover motion values passed through style).
  const reduceMotion = useReducedMotion();
  const heroParallaxY = useTransform(heroScroll, [0, 1], ["0%", reduceMotion ? "0%" : "-12%"]);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative lg:min-h-screen overflow-hidden bg-ivory linen-overlay" aria-label={t.homeHeroRegion}>

        {/* One portrait for both layouts: full width under the copy on mobile,
            a full-height column on the right from lg up. Rendering it twice
            shipped two <img> elements and two priority preloads.
            From lg up the photo starts 32px past the copy column (48px
            padding + 520px copy + 32px, inside the centred 80rem container)
            rather than at a fixed 52%, which left a wide empty band between
            the words and Grace on laptop and desktop screens. */}
        <div
          className="relative z-[2] w-full aspect-[1024/1210] -mt-4 overflow-hidden lg:mt-0 lg:absolute lg:inset-y-0 lg:right-0 lg:w-auto lg:left-[min(52%,calc(max(0px,50%_-_40rem)_+_600px))] lg:aspect-auto"
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
              alt={heroImage?.alt ?? fill(t.homeHeroAlt, { name: site.name })}
              sizes="(min-width:1024px) 72vw, 100vw"
            />
          </motion.div>
          {/* Softens the image's left edge into the ivory. Fixed pixel stops so
              the fade stays a narrow seam at any width: a fade over half the
              photo read as more empty space, and veiled her face. */}
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #FAF7F2 0px, rgba(250,247,242,0.75) 36px, rgba(250,247,242,0.3) 100px, rgba(250,247,242,0.08) 170px, rgba(250,247,242,0) 230px)",
            }}
          />
        </div>

        {/* Content layer */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          {/* Full-height and vertically centred beside the portrait on desktop.
              On a phone the copy sits straight under the photo: a min-h-screen
              block there left half a screen of empty ivory. */}
          <div className="lg:min-h-screen flex items-center">
            <div className="w-full lg:max-w-[520px] pt-10 pb-14 lg:py-0">

              <p data-reveal
              className="section-label mb-5"
            >
                {t.homeEyebrow}
              </p>

              <AvailabilityPill
                limitedMode={site.limitedMode}
                reopensLabel={site.reopensLabel}
                limitedNote={site.limitedNote}
                bookingNote={site.bookingNote}
                className="mb-6"
                text={t}
              />

                <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-charcoal">
                  {site.tagline}
                </h1>

              <div data-reveal
              className="w-12 h-px bg-gold my-8"
              aria-hidden="true"
            />

              <p data-reveal
              className="font-jost text-charcoal/75 text-base lg:text-lg max-w-sm mb-10 leading-relaxed"
            >
                {t.homeIntro}
              </p>

              <div data-reveal
              className="flex flex-wrap gap-4"
            >
                <Button variant="gold" href={primary.href}>{primary.label}</Button>
                <Button variant="outline" href={secondary.href}>{secondary.label}</Button>
              </div>

            </div>
          </div>
        </div>


        {/* Scroll indicator, desktop screens tall enough to leave room under
            the buttons. Sits under the copy column: centred on the page it
            floated alone between the words and the photo. */}
        <div className="absolute bottom-8 inset-x-0 z-10 hidden lg:[@media(min-height:840px)]:block pointer-events-none" aria-hidden="true">
          <div className="max-w-7xl mx-auto px-12">
            <div className="inline-flex flex-col items-center gap-2">
              <span className="font-jost text-[0.6rem] tracking-[0.25em] uppercase text-charcoal/75">{t.homeScroll}</span>
              {/* CSS keyframes rather than a permanent Framer rAF loop. */}
              <span className="block w-px h-8 bg-gold/50 animate-scroll-hint" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      {/* Big gold figures, with the garment count ticking up as it scrolls
          in. gold_dark is 3.2:1 on ivory, which passes for text this large. */}
      <section className="bg-ivory border-y border-blush py-10 lg:py-14" aria-label={t.homeStatsRegion}>
        <div className="max-w-5xl mx-auto px-6">
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
            {trustStats.map((stat, i) => (
              <li key={i} className="flex items-center">
                {i > 0 && (
                  <span className="hidden sm:block w-px h-12 bg-gold/40 mx-10 lg:mx-16" aria-hidden="true" />
                )}
                <div className="text-center">
                  <p className="font-cormorant text-gold_dark text-3xl lg:text-4xl font-light leading-tight">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="font-jost text-charcoal/75 text-xs tracking-[0.18em] uppercase mt-2">{stat.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SERVICES PREVIEW ──────────────────────────────────── */}
      <section className="bg-near_black py-16 lg:py-24 px-6" aria-labelledby="services-preview-heading">
        <div className="max-w-7xl mx-auto">
          <div data-reveal
              className="text-center mb-14"
            >
            <p className="section-label text-gold mb-3">{text.servicesLabel}</p>
            <h2 id="services-preview-heading" className="font-cormorant italic text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.1] text-ivory">{text.servicesHeading}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ivory/10">
            {services.map((service, i) => {
              const Icon = SERVICE_ICONS[i] ?? BridalIcon;
              return (
                <article data-reveal
              key={service._id}
              style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
              className="group relative bg-near_black p-8 lg:p-10 flex flex-col overflow-hidden transition-all duration-400 min-h-[22rem]"
            >
                  {service.cardImage && (
                    <div className="absolute inset-0" aria-hidden="true">
                      <SanityImage
                        image={service.cardImage}
                        fill
                        placeholderLabel="SERVICE_CARD_IMAGE"
                        sizes="(min-width:1024px) 33vw, 100vw"
                        className="opacity-[0.55] group-hover:opacity-70 transition-opacity duration-500"
                        aria-hidden
                      />
                      {/* Dark at the bottom where the text sits, open at the top
                          so the texture actually reads. */}
                      <div className="absolute inset-0 bg-gradient-to-t from-near_black/85 via-near_black/45 to-near_black/10" />
                      {/* Scrim behind the text block only. Against the brightest
                          part of these textures the description measures 2.67:1
                          without it; with it and ivory/70 it clears AA at 5.1:1,
                          and the top of the card keeps its texture. */}
                      <div className="absolute inset-x-0 bottom-0 top-[38%] bg-[linear-gradient(to_bottom,transparent_0,rgba(36,32,32,0.4)_3rem)]" />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" aria-hidden="true" />
                  <div className="relative z-10 flex flex-col flex-1">
                    <div className="mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:translate-y-[-2px] origin-left">
                      <Icon />
                    </div>
                    <div className="w-8 h-px bg-gold/40 mb-6" aria-hidden="true" />
                    {isWaitlisted(service.id) && (
                      <p className="font-jost text-[10px] tracking-[0.2em] uppercase text-gold mb-2">
                        {fill(t.homeWaitlistTag, { reopens: site.reopensLabel })}
                      </p>
                    )}
                    <h3 className="font-cormorant text-ivory text-2xl mb-3">{service.title}</h3>
                    <p className="font-jost text-ivory/70 text-sm leading-relaxed flex-1">
                      {service.id === "tailoring"
                        ? t.homeTailoringLine
                        : service.shortDescription}
                    </p>
                    {service.id === "tailoring" && (
                      <p className="font-cormorant text-ivory text-xl lining-nums mt-4">{t.homeTailoringPrice}</p>
                    )}
                    <Link
                      href={`/services#${service.id}`}
                      className="mt-4 py-2 inline-flex items-center gap-2 font-jost text-xs text-gold tracking-[0.18em] uppercase group-hover:text-gold_light transition-colors duration-300"
                    >
                      <span>
                        {isWaitlisted(service.id) ? t.homeCardWaitlist : t.homeCardMore}
                        {/* Keeps the link text specific for screen readers and
                            link-text audits without changing the card design.
                            No aria-label: it would replace this text outright. */}
                        <span className="sr-only">
                          {" "}
                          {fill(isWaitlisted(service.id) ? t.homeCardWaitlistFor : t.homeCardMoreAbout, { service: service.title })}
                        </span>
                      </span>
                      {/* Was an infinite Framer loop on every card: three
                          perpetual animations competing with hydration. */}
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        <ArrowRight />
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO TEASER ──────────────────────────────────── */}
      <section className="bg-ivory py-16 lg:py-24 px-6" aria-labelledby="portfolio-preview-heading">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div data-reveal
            >
              <p className="section-label mb-3">{text.portfolioLabel}</p>
              <h2 id="portfolio-preview-heading" className="font-cormorant italic text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.1] text-charcoal">{text.portfolioHeading}</h2>
            </div>
            <div data-reveal
              className="hidden sm:block"
            >
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 font-jost text-xs text-gold_ink tracking-[0.18em] uppercase hover:text-charcoal transition-colors duration-300"
              >
                {t.homeViewAll} <ArrowRight />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
            {previewItems.map((item, i) => (
              <div data-reveal
              key={item._id}
              className="group relative overflow-hidden cursor-pointer"
              style={{ paddingBottom: "133.33%", "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
            >
                <div className="absolute inset-0">
                  <SanityImage
                    image={item.image}
                    fill
                    placeholderLabel={`PORTFOLIO_${i + 1}`}
                    placeholderRatio="portrait"
                    alt={item.image?.alt ?? item.label}
                    sizes="(min-width:1024px) 25vw, 50vw"
                  />
                </div>
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/55 transition-all duration-500" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
                  <p className="font-cormorant italic text-ivory text-lg leading-tight">{item.label}</p>
                  {item.caption && (
                    <p className="font-jost text-ivory/75 text-xs leading-snug mt-1">{item.caption}</p>
                  )}
                  <div className="w-6 h-px bg-gold mt-2" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>

          <div data-reveal
              className="text-center mt-8 sm:hidden"
            >
            <Button variant="outline" href="/portfolio">{t.homeViewPortfolio}</Button>
          </div>
        </div>
      </section>

      {/* ── WHAT TO EXPECT ────────────────────────────────────── */}
      <ProcessSteps
        sectionLabel={text.processLabel}
        heading={text.processHeading}
        ctaText={text.processCTA}
        ctaLabel={primary.label}
        ctaHref={primary.href}
        steps={text.processSteps}
      />

      {/* ── ABOUT TEASER ──────────────────────────────────────── */}
      <section className="bg-blush py-16 lg:py-24 px-6" aria-labelledby="about-teaser-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <div className="relative">
              <div className="overflow-hidden">
                <SanityImage
                  image={aboutSecondaryImage}
                  placeholderLabel="ABOUT_SECONDARY_IMAGE"
                  placeholderRatio="tall"
                />
              </div>
              <div data-reveal
              className="absolute -bottom-3 -right-3 w-full h-full border border-gold/30 pointer-events-none"
              aria-hidden="true"
            />
            </div>

            <div data-reveal
            >
              <p className="section-label mb-6">{text.aboutTeaserLabel}</p>
              <div className="w-12 h-px bg-gold mb-8" aria-hidden="true" />
              <blockquote className="font-cormorant italic text-charcoal text-2xl lg:text-3xl leading-snug mb-8 border-l-2 border-gold pl-6">
                &ldquo;{bio.pullQuote}&rdquo;
              </blockquote>
              <p className="font-jost text-charcoal/75 text-sm leading-[1.65] mb-10 max-w-[65ch]">
                {t.homeAboutText}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 py-2 font-jost text-xs text-gold_ink tracking-[0.18em] uppercase hover:text-charcoal transition-colors duration-300 group"
              >
                {t.homeReadStory}
                <span className="transition-transform duration-300 group-hover:translate-x-1"><ArrowRight /></span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="bg-ivory py-16 lg:py-24 px-6 overflow-hidden" aria-labelledby="testimonials-heading">
        <div className="max-w-4xl mx-auto">
          <div data-reveal
              className="text-center mb-14"
            >
            <p className="section-label mb-3">{text.testimonialsLabel}</p>
            <h2 id="testimonials-heading" className="font-cormorant italic text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.1] text-charcoal">{text.testimonialsHeading}</h2>
          </div>
          <div data-reveal
            >
            <TestimonialCarousel testimonials={testimonials} text={t} />
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ─────────────────────────────────────────── */}
      <InstagramRow
        posts={instagram.posts}
        handle={instagram.handle}
        profileUrl={instagram.profileUrl}
        text={t}
      />

      {/* ── CTA ───────────────────────────────────────────────── */}
      <CTABanner
        headline={text.ctaHeadline}
        subhead={text.ctaSubhead}
        buttonLabel={text.ctaButton}
        limitedMode={site.limitedMode}
        reopensLabel={site.reopensLabel}
        text={t}
      />
    </>
  );
}
