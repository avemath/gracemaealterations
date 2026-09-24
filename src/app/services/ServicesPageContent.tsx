"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import SanityImage from "@/components/ui/SanityImage";
import RevealText from "@/components/ui/RevealText";
import CTABanner from "@/components/sections/CTABanner";
import type { SanityService, SanityImage as SanityImageType, SanityPricingCard } from "@/lib/sanity.queries";

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
}

export default function ServicesPageContent({ services, page, availability }: Props) {
  const { limitedMode, waitlistServices, reopensLabel } = availability;
  const isWaitlisted = (serviceId: string) =>
    limitedMode && waitlistServices.includes(serviceId);
  // ── Hero parallax ───────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallaxY = useTransform(heroScroll, [0, 1], ["0%", "-18%"]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex items-end overflow-hidden"
        style={{ minHeight: "48vh" }}
        aria-label="Services hero"
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
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            maskImage: "linear-gradient(to right, black 0%, black 40%, transparent 75%)",
            WebkitMaskImage: "linear-gradient(to right, black 0%, black 40%, transparent 75%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, rgba(250,247,242,0.82) 0%, rgba(250,247,242,0.82) 35%, rgba(250,247,242,0.3) 65%, rgba(250,247,242,0) 100%)" }}
          aria-hidden="true"
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-14 pt-36 lg:pt-44">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label mb-4">{page.heroLabel}</p>
            <RevealText onMount delay={0.2}>
              <h1 className="font-cormorant italic text-charcoal text-5xl lg:text-7xl mb-5">{page.heroHeading}</h1>
            </RevealText>
            <div className="w-12 h-px bg-gold" aria-hidden="true" />
          </motion.div>
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
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                <p
                  className="font-cormorant text-gold/25 font-light leading-none mb-3"
                  style={{ fontSize: "5rem" }}
                  aria-hidden="true"
                >
                  0{i + 1}
                </p>
                <div className="w-12 h-px bg-gold mb-6" aria-hidden="true" />

                {isWaitlisted(service.id) && (
                  <div className="border border-gold/30 bg-gold/5 p-5 mb-8 max-w-2xl">
                    <p className="font-jost text-charcoal/70 text-sm leading-relaxed">
                      {service.title} booking reopens {reopensLabel}. I&apos;m taking a limited
                      waitlist now and will reach out in order as dates open.
                    </p>
                    <Link
                      href={`/contact?service=${service.id}`}
                      className="mt-4 inline-flex items-center gap-2 font-jost text-xs text-gold tracking-[0.18em] uppercase hover:text-gold_dark transition-colors duration-300"
                    >
                      Join the {service.title.split(" ")[0]} Waitlist
                    </Link>
                  </div>
                )}

                <h2
                  id={`${service.id}-heading`}
                  className="font-cormorant italic text-charcoal text-4xl lg:text-5xl mb-6"
                >
                  {service.title}
                </h2>
                <div className="mb-12">
                  <p className="font-jost text-charcoal/65 text-base leading-relaxed max-w-2xl">
                    {service.description}
                  </p>

                  {limitedMode && service.id === "custom" && !isWaitlisted(service.id) && (
                    <p className="font-jost text-charcoal/65 text-base leading-relaxed max-w-2xl mt-4">
                      Small repairs are open now; larger construction and restoration projects are
                      booking for {reopensLabel}.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                  <div>
                    <h3 className="font-cormorant_sc text-charcoal text-sm tracking-[0.2em] uppercase mb-5">
                      Includes
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
                    <h3 className="font-cormorant_sc text-charcoal text-sm tracking-[0.2em] uppercase mb-5">
                      Pricing
                    </h3>
                    <p className="font-cormorant text-charcoal leading-none mb-2" style={{ fontSize: "3rem" }}>
                      {service.priceRange}
                    </p>
                    <p className="font-jost text-charcoal/45 text-xs mb-8">{service.priceNote}</p>
                    {service.freeConsult && (
                      <div className="border border-gold/25 bg-gold/5 p-5">
                        <p className="font-jost text-charcoal/70 text-xs leading-relaxed">
                          ✦&nbsp;&nbsp;{service.freeConsult}
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

      {/* ── HOW PRICING WORKS ─────────────────────────────────── */}
      <section className="bg-near_black py-14 lg:py-20 px-6" aria-labelledby="pricing-heading">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label text-gold/70 mb-4">{page.pricingLabel}</p>
            <h2 id="pricing-heading" className="font-cormorant italic text-ivory text-4xl lg:text-5xl mb-4">
              {page.pricingHeading}
            </h2>
            <div className="w-12 h-px bg-gold mb-12" aria-hidden="true" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-px bg-ivory/10">
              {page.pricingCards.map((card, i) => (
                <motion.div
                  key={i}
                  className="bg-near_black p-8 lg:p-10 border-t border-ivory/10 md:border-t-0"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="w-6 h-px bg-gold mb-5" aria-hidden="true" />
                  <h3 className="font-cormorant text-ivory text-xl mb-3">{card.title}</h3>
                  <p className="font-jost text-ivory/50 text-sm leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <CTABanner
        headline={page.ctaHeadline}
        subhead={page.ctaSubhead}
        buttonLabel={page.ctaButton}
        note={limitedMode ? availability.limitedNote : undefined}
      />
    </>
  );
}
