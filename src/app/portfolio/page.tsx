"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Lightbox from "@/components/ui/Lightbox";
import CTABanner from "@/components/sections/CTABanner";
import { PORTFOLIO_ITEMS } from "@/data/content";

type FilterType = "all" | "bridal" | "tailoring" | "custom";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Bridal", value: "bridal" },
  { label: "Tailoring", value: "tailoring" },
  { label: "Custom", value: "custom" },
];

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [lightboxItem, setLightboxItem] = useState<(typeof PORTFOLIO_ITEMS)[0] | null>(null);

  const filtered =
    activeFilter === "all"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.type === activeFilter);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="pt-32 pb-16 px-6 bg-ivory"
        aria-label="Portfolio hero"
        style={{ minHeight: "35vh", display: "flex", alignItems: "center" }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label mb-4">Selected Work</p>
            <h1 className="font-cormorant italic text-charcoal text-5xl lg:text-7xl mb-4">
              The Work
            </h1>
            <div className="w-12 h-px bg-gold mb-6" aria-hidden="true" />
            <p className="font-jost text-charcoal/60 text-base max-w-xl leading-relaxed">
              Each garment is a collaboration between craft and vision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER TABS ──────────────────────────────────────── */}
      <section className="bg-ivory px-6 pb-4" aria-label="Filter portfolio">
        <div className="max-w-7xl mx-auto">
          <div
            className="flex gap-0 border-b border-blush"
            role="tablist"
            aria-label="Filter by garment type"
          >
            {FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={activeFilter === f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-5 py-3 font-jost text-xs tracking-[0.18em] uppercase transition-all duration-300 border-b-2 -mb-px ${
                  activeFilter === f.value
                    ? "border-gold text-charcoal"
                    : "border-transparent text-charcoal/40 hover:text-charcoal/70"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MASONRY GRID ─────────────────────────────────────── */}
      <section
        className="bg-ivory px-6 py-8 lg:py-12"
        aria-label="Portfolio gallery"
      >
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="group relative overflow-hidden cursor-pointer break-inside-avoid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  onClick={() => setLightboxItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setLightboxItem(item)}
                  aria-label={`View ${item.label} — ${item.alt}`}
                >
                  {/*
                    PORTFOLIO_IMAGE_{item.id}
                    File: /public/images/portfolio/portfolio-{item.id}.jpg
                    Alt text: {item.alt}
                    Shot guide: see /src/data/content.ts PORTFOLIO_ITEMS
                  */}
                  <ImagePlaceholder
                    label={`PORTFOLIO_IMAGE_${item.id}`}
                    aspectRatio={i % 3 === 1 ? "landscape" : "portrait"}
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-400 text-center px-4">
                      <p className="font-cormorant italic text-ivory text-xl mb-1">
                        {item.label}
                      </p>
                      <div className="w-6 h-px bg-gold mx-auto" aria-hidden="true" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <p className="text-center font-jost text-charcoal/40 py-20">
              No items in this category yet.
            </p>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxItem && (
        <Lightbox
          isOpen={!!lightboxItem}
          onClose={() => setLightboxItem(null)}
          src={lightboxItem.src}
          alt={lightboxItem.alt}
          label={lightboxItem.label}
        />
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <CTABanner />
    </>
  );
}
