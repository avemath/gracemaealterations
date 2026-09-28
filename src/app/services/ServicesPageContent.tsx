"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import SanityImage from "@/components/ui/SanityImage";
import CTABanner from "@/components/sections/CTABanner";
import PriceTable from "@/components/ui/PriceTable";
import ExampleQuotes from "@/components/sections/ExampleQuotes";
import { ctas } from "@/lib/cta";
import type {
  SanityService,
  SanityImage as SanityImageType,
  SanityPricingCard,
  SanityExampleQuote,
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
  exampleQuotes: SanityExampleQuote[];
  exampleQuotesCaption: string;
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
  const { primary, secondary } = ctas({ limitedMode, reopensLabel });
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
              Bridal alterations &amp; tailoring in Pittsburgh
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
                  data-decorative
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
                      className="mt-4 inline-flex items-center gap-2 font-jost text-xs text-gold_ink tracking-[0.18em] uppercase hover:text-gold_dark transition-colors duration-300"
                    >
                      Join the {service.title.split(" ")[0]} Waitlist
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
                      Small repairs are open now; larger construction and restoration projects are
                      booking for {reopensLabel}.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                  <div>
                    <h3 className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-5">
                      What&rsquo;s included in every {service.title.toLowerCase()} fitting
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
                      Pricing
                    </h3>
                    <p className="font-cormorant font-medium text-charcoal leading-none mb-2 lining-nums text-[1.5rem]">
                      {service.priceRange}
                    </p>
                    <p className="font-jost text-charcoal/75 text-xs mb-6">{service.priceNote}</p>

                    <PriceTable rows={service.priceTable ?? []} />

                    {service.typicalTimeline && (
                      <p className="mt-6 font-jost text-charcoal/75 text-sm leading-[1.65]">
                        <span className="font-medium text-charcoal">Typical timeline: </span>
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

                {service.id === "bridal" && (
                  <>
                    <ExampleQuotes
                      quotes={page.exampleQuotes}
                      caption={page.exampleQuotesCaption}
                    />

                    <div className="mt-12 border-t border-blush pt-8">
                      <h3 className="font-cormorant italic text-charcoal text-2xl mb-3">
                        Bridal party &amp; mother of the bride
                      </h3>
                      <p className="font-jost text-charcoal/75 text-sm leading-[1.65] max-w-[65ch] mb-5">
                        Bridesmaids, mothers, flower girls: one point of contact, one pickup day.
                      </p>
                      <Link href={primary.href} className="btn-outline">
                        {primary.label}
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
      />
    </>
  );
}
