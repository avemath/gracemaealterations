"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SanityImage from "@/components/ui/SanityImage";
import RevealText from "@/components/ui/RevealText";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import CTABanner from "@/components/sections/CTABanner";
import type { SanityPortfolioItem } from "@/lib/sanity.queries";

interface PortfolioPageDataProps {
  heroLabel: string;
  heroHeading: string;
  heroSubtext: string;
  featuredSectionLabel: string;
  featuredHeading: string;
  featuredBody: string;
  featuredLabel: string | null;
  featuredDescription: string | null;
  beforeImage: import("@/lib/sanity.queries").SanityImage | null;
  afterImage: import("@/lib/sanity.queries").SanityImage | null;
  ctaHeadline: string;
  ctaSubhead: string;
  ctaButton: string;
}

type FilterType = "all" | "bridal" | "tailoring" | "custom";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All Work", value: "all" },
  { label: "Bridal", value: "bridal" },
  { label: "Tailoring", value: "tailoring" },
  { label: "Custom", value: "custom" },
];

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface Props {
  items: SanityPortfolioItem[];
  portfolioPageData: PortfolioPageDataProps;
}

export default function PortfolioPageContent({ items, portfolioPageData }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const filteredRef = useRef<SanityPortfolioItem[]>(items);

  const filtered = activeFilter === "all" ? items : items.filter((i) => i.type === activeFilter);
  filteredRef.current = filtered;

  // Close lightbox when filter changes
  useEffect(() => { setLightboxIndex(null); }, [activeFilter]);

  // Keyboard navigation for lightbox
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === "Escape") setLightboxIndex(null);
    if (e.key === "ArrowLeft")
      setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
    if (e.key === "ArrowRight")
      setLightboxIndex((i) =>
        i !== null && i < filteredRef.current.length - 1 ? i + 1 : i
      );
  }, [lightboxIndex]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const lightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section
        className="relative flex items-end overflow-hidden bg-near_black"
        style={{ minHeight: "42vh" }}
        aria-label="Portfolio hero"
      >
        {/* Subtle texture gradient so the dark bg has depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-near_black via-near_black to-charcoal/60 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-14 pt-36 lg:pt-44">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label text-gold/70 mb-4">{portfolioPageData.heroLabel}</p>
            <RevealText onMount delay={0.2}>
              <h1 className="font-cormorant italic text-ivory text-5xl lg:text-7xl mb-5">{portfolioPageData.heroHeading}</h1>
            </RevealText>
            <div className="w-12 h-px bg-gold mb-5" aria-hidden="true" />
            <p className="font-jost text-ivory/50 text-base max-w-lg leading-relaxed">
              {portfolioPageData.heroSubtext}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER PILLS ───────────────────────────────────────── */}
      <section className="bg-ivory px-6 py-6 border-b border-blush" aria-label="Filter portfolio by type">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by garment type">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={activeFilter === f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-5 py-2 font-jost text-xs tracking-[0.16em] uppercase transition-all duration-300 rounded-none ${
                  activeFilter === f.value
                    ? "bg-gold text-ivory"
                    : "border border-blush text-charcoal/50 hover:border-gold/40 hover:text-charcoal"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TRANSFORMATION (before/after slider) ─────── */}
      <section className="bg-ivory px-6 pt-12 pb-0" aria-label="Featured transformation">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
          >
            {/* Slider */}
            <BeforeAfterSlider
              beforeImage={portfolioPageData.beforeImage}
              afterImage={portfolioPageData.afterImage}
              label={portfolioPageData.featuredLabel ?? undefined}
              description={portfolioPageData.featuredDescription ?? undefined}
            />

            {/* Text callout */}
            <div>
              <p className="section-label mb-4">{portfolioPageData.featuredSectionLabel}</p>
              <h2 className="font-cormorant italic text-charcoal text-3xl lg:text-4xl mb-5 leading-snug">
                {portfolioPageData.featuredHeading}
              </h2>
              <div className="w-10 h-px bg-gold mb-6" aria-hidden="true" />
              <p className="font-jost text-charcoal/60 text-sm leading-relaxed">
                {portfolioPageData.featuredBody}
              </p>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="mt-12 border-t border-blush" aria-hidden="true" />
        </div>
      </section>

      {/* ── MASONRY GRID ───────────────────────────────────────── */}
      <section className="bg-ivory px-6 py-8 lg:py-12" aria-label="Portfolio gallery">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              className="columns-1 sm:columns-2 lg:columns-3 gap-3 lg:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  className="group relative overflow-hidden cursor-pointer break-inside-avoid mb-3 lg:mb-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.3) }}
                  onClick={() => setLightboxIndex(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setLightboxIndex(i)}
                  aria-label={`View ${item.label}`}
                >
                  <SanityImage
                    image={item.image}
                    placeholderLabel={`PORTFOLIO_IMAGE_${i + 1}`}
                    placeholderRatio={i % 3 === 1 ? "landscape" : "portrait"}
                    alt={item.image?.alt ?? item.label}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-500" aria-hidden="true" />
                  {/* Label — slides up */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
                    <p className="font-cormorant italic text-ivory text-lg">{item.label}</p>
                    <div className="w-5 h-px bg-gold mt-1.5" aria-hidden="true" />
                  </div>
                  {/* Expand icon */}
                  <div className="absolute top-3 right-3 w-7 h-7 bg-ivory/0 group-hover:bg-ivory/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <line x1="7" y1="0" x2="7" y2="14" stroke="white" strokeWidth="1.25" />
                      <line x1="0" y1="7" x2="14" y2="7" stroke="white" strokeWidth="1.25" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="font-cormorant italic text-charcoal/35 text-2xl">No items in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── LIGHTBOX ───────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxItem && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-near_black/96 p-4 lg:p-8"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Lightbox: ${lightboxItem.label}`}
          >
            {/* Close */}
            <button
              className="absolute top-5 right-5 text-ivory/60 hover:text-ivory transition-colors z-10 p-2"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
            >
              <CloseIcon />
            </button>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                className="absolute left-4 lg:left-6 text-ivory/50 hover:text-ivory transition-colors z-10 p-2"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                aria-label="Previous image"
              >
                <ChevronLeft />
              </button>
            )}

            {/* Next */}
            {lightboxIndex < filtered.length - 1 && (
              <button
                className="absolute right-4 lg:right-6 text-ivory/50 hover:text-ivory transition-colors z-10 p-2"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                aria-label="Next image"
              >
                <ChevronRight />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <SanityImage
                image={lightboxItem.image}
                placeholderLabel={lightboxItem.label}
                placeholderRatio="landscape"
                alt={lightboxItem.image?.alt ?? lightboxItem.label}
                width={1200}
                height={800}
              />
              {/* Caption bar */}
              <div className="flex items-center justify-between mt-4 px-1">
                <p className="font-cormorant italic text-ivory/60 text-sm">{lightboxItem.label}</p>
                <p className="font-jost text-ivory/55 text-xs tracking-widest">
                  {lightboxIndex + 1} / {filtered.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CTABanner
        headline={portfolioPageData.ctaHeadline}
        subhead={portfolioPageData.ctaSubhead}
        buttonLabel={portfolioPageData.ctaButton}
      />
    </>
  );
}
