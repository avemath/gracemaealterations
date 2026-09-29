"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import SanityImage from "@/components/ui/SanityImage";
import CTABanner from "@/components/sections/CTABanner";
import { ctas, type TextFor } from "@/lib/cta";
import { fill } from "@/lib/text/fill";
import type {
  SanityService,
  SanityImage as SanityImageType,
  SanityPricingCard,
} from "@/lib/sanity.queries";

const CHECK_ICON = (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
    <path d="M2 7L5.5 10.5L12 3.5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface ServicesPageData {
  heroImage: SanityImageType | null;
  heroLabel: string;
  heroHeading: string;
  pricingLabel: string;
  pricingHeading: string;
  pricingCards: SanityPricingCard[];
  ctaHeadline: string;
  ctaSubhead: string;
  ctaButton: string;
}

interface Availability {
  limitedMode: boolean;
  waitlistServices: string[];
  reopensLabel: string;
  limitedNote: string;
}

interface Props {
  services: SanityService[];
  page: ServicesPageData;
  availability: Availability;
  /** Guides to point to under each service, by service id. */
  guideLinks?: Record<string, { title: string; href: string }[]>;
  /** The Studio's site-wide words this page and its banner use. */
  text: TextFor<"services" | "banner" | "cta">;
}

export default function ServicesPageContent({
  services,
  page,
  availability,
  guideLinks = {},
  text,
}: Props) {
  const { limitedMode, waitlistServices, reopensLabel } = availability;
  const isWaitlisted = (serviceId: string) =>
    limitedMode && waitlistServices.includes(serviceId);
  const { primary, secondary } = ctas({ limitedMode, reopensLabel }, text);
  // ── Hero parallax ───────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Still for anyone who has asked for less motion (MotionConfig does not
  // cover motion values passed through style).
  const reduceMotion = useReducedMotion();
  const heroParallaxY = useTransform(heroScroll, [0, 1], ["0%", reduceMotion ? "0%" : "-18%"]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex items-end overflow-hidden"
        style={{ minHeight: "48vh" }}
        aria-label={text.servicesHeroRegion}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div className="absolute inset-x-0 top-0" style={{ height: "120%", y: heroParallaxY }}>
            <SanityImage
              image={page.heroImage}
              fill
              priority
              placeholderLabel="SERVICES_HERO_IMAGE"
              placeholderRatio="landscape"
              sizes="100vw"
            />
          </motion.div>
        </div>
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            // Only the strip under the heading is softened now; the lace and
            // pearls on the right stay sharp.
            maskImage: "linear-gradient(to right, black 0%, black 25%, transparent 58%)",
            WebkitMaskImage: "linear-gradient(to right, black 0%, black 25%, transparent 58%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, rgba(250,247,242,0.82) 0%, rgba(250,247,242,0.78) 32%, rgba(250,247,242,0.22) 58%, rgba(250,247,242,0) 76%)" }}
          aria-hidden="true"
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-14 pt-36 lg:pt-44">
          <div
            >
            <p className="section-label text-gold_ink mb-4">{page.heroLabel}</p>
              <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-charcoal mb-5">
              {text.servicesHeading}
            </h1>
            <div className="w-12 h-px bg-gold" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── SERVICE SECTIONS ──────────────────────────────────── */}
      <div>
        {services.map((service, i) => (
          <section
            key={service._id}
            id={service.id}
            className={`scroll-mt-20 py-14 lg:py-20 px-6 ${i % 2 === 1 ? "bg-blush" : "bg-ivory"}`}
            aria-labelledby={`${service.id}-heading`}
          >
            <div className="max-w-5xl mx-auto">
              <div data-reveal
            >
                <p
                  className="font-cormorant text-gold_ink/25 font-light leading-none mb-3"
                  style={{ fontSize: "5rem" }}
                  aria-hidden="true"
                  data-numeral={`0${i + 1}`}
                />
                <div className="w-12 h-px bg-gold mb-6" aria-hidden="true" />

                {isWaitlisted(service.id) && (
                  <div className="border border-gold/30 bg-gold/5 p-5 mb-8 max-w-2xl">
                    <p className="font-jost text-charcoal/70 text-sm leading-relaxed">
                      {fill(text.servicesWaitlistNote, { service: service.title, reopens: reopensLabel })}
                    </p>
                    <Link
                      href={`/contact?service=${service.id}`}
                      className="mt-4 inline-flex items-center gap-2 font-jost text-xs text-gold_ink tracking-[0.18em] uppercase hover:text-charcoal transition-colors duration-300"
                    >
                      {fill(text.servicesWaitlistLink, { first: service.title.split(" ")[0] })}
                    </Link>
                  </div>
                )}

                <h2
                  id={`${service.id}-heading`}
                  className="font-cormorant italic text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.1] text-charcoal mb-6"
                >
                  {service.title}
                </h2>
                <div className="mb-12">
                  <p className="font-jost text-charcoal/75 text-base leading-relaxed max-w-2xl">
                    {service.description}
                  </p>

                  {limitedMode && service.id === "custom" && !isWaitlisted(service.id) && (
                    <p className="font-jost text-charcoal/75 text-base leading-relaxed max-w-2xl mt-4">
                      {fill(text.servicesCustomNote, { reopens: reopensLabel })}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                  <div>
                    <h3 className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-5">
                      {text.servicesWhatIDo}
                    </h3>
                    <ul className="space-y-3" role="list">
                      {service.services.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 font-jost text-sm text-charcoal/70">
                          {CHECK_ICON}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:border-l lg:border-blush lg:pl-16">
                    <h3 className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-5">
                      {text.servicesPricing}
                    </h3>
                    <p className="font-cormorant font-medium text-charcoal leading-none mb-2 lining-nums text-[1.5rem]">
                      {service.priceRange}
                    </p>
                    <p className="font-jost text-charcoal/75 text-xs">{service.priceNote}</p>

                    {service.typicalTimeline && (
                      <p className="mt-6 font-jost text-charcoal/75 text-sm leading-[1.65]">
                        <span className="font-medium text-charcoal">{text.servicesTimeline} </span>
                        {service.typicalTimeline}
                      </p>
                    )}

                    {service.freeConsult && (
                      <div className="border border-gold/25 bg-gold/5 p-5 mt-6">
                        <p className="font-jost text-charcoal/75 text-xs leading-relaxed">
                          ✦&nbsp;&nbsp;{service.freeConsult}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section CTA: the waitlist lane for anything closed. */}
                <div className="mt-10">
                  {isWaitlisted(service.id) ? (
                    <Link href={secondary.href} className="btn-outline">
                      {secondary.label}
                    </Link>
                  ) : (
                    <Link href={primary.href} className="btn-outline">
                      {primary.label}
                    </Link>
                  )}
                </div>

                {(guideLinks[service.id]?.length ?? 0) > 0 && (
                  <nav aria-label={fill(text.servicesGuidesFor, { service: service.title.toLowerCase() })} className="mt-10 max-w-2xl">
                    <p className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-3">
                      {text.servicesGuides}
                    </p>
                    <ul className="border-t border-gold/40">
                      {guideLinks[service.id].map((guide) => (
                        <li key={guide.href} className="border-b border-gold/25">
                          <Link
                            href={guide.href}
                            className="group flex items-center justify-between gap-4 py-3.5 font-cormorant italic text-charcoal text-lg leading-snug hover:text-gold_ink transition-colors duration-300"
                          >
                            {guide.title}
                            <span aria-hidden="true" className="font-jost not-italic text-gold_ink transition-transform duration-300 group-hover:translate-x-1">
                              &rarr;
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}

                {service.id === "bridal" && (
                  <>
                    <div className="mt-12 border-t border-blush pt-8">
                      <h3 className="font-cormorant italic text-charcoal text-2xl mb-3">
                        {text.servicesPartyHeading}
                      </h3>
                      <p className="font-jost text-charcoal/75 text-sm leading-[1.65] max-w-[65ch] mb-5">
                        {text.servicesPartyBody}
                      </p>
                      <Link href="/contact?service=party" className="btn-outline">
                        {text.ctaParty}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

        ))}
      </div>

      {/* ── HOW PRICING WORKS ─────────────────────────────────── */}
      <section className="bg-near_black py-14 lg:py-20 px-6" aria-labelledby="pricing-heading">
        <div className="max-w-5xl mx-auto">
          <div data-reveal
            >
            <p className="section-label text-gold mb-4">{page.pricingLabel}</p>
            <h2 id="pricing-heading" className="font-cormorant italic text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.1] text-ivory mb-4">
              {page.pricingHeading}
            </h2>
            <div className="w-12 h-px bg-gold mb-12" aria-hidden="true" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-px bg-ivory/10">
              {page.pricingCards.map((card, i) => (
                <div data-reveal
              key={i}
              className="bg-near_black p-8 lg:p-10 border-t border-ivory/10 md:border-t-0"
            >
                  <div className="w-6 h-px bg-gold mb-5" aria-hidden="true" />
                  <h3 className="font-cormorant text-ivory text-xl mb-3">{card.title}</h3>
                  <p className="font-jost text-ivory/50 text-sm leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        headline={page.ctaHeadline}
        subhead={page.ctaSubhead}
        buttonLabel={page.ctaButton}
        limitedMode={limitedMode}
        reopensLabel={reopensLabel}
        text={text}
      />
    </>
  );
}
