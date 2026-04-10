"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SanityImage from "@/components/ui/SanityImage";
import CTABanner from "@/components/sections/CTABanner";
import type { SanityPortfolioItem } from "@/lib/sanity.queries";

type FilterType = "all" | "bridal" | "tailoring" | "custom";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Bridal", value: "bridal" },
  { label: "Tailoring", value: "tailoring" },
  { label: "Custom", value: "custom" },
];

export default function PortfolioPageContent({ items }: { items: SanityPortfolioItem[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [lightboxItem, setLightboxItem] = useState<SanityPortfolioItem | null>(null);

  const filtered = activeFilter === "all" ? items : items.filter((i) => i.type === activeFilter);

  return (
    <>
      {/* HERO */}
      <section className="pt-32 pb-16 px-6 bg-ivory" style={{ minHeight: "35vh", display: "flex", alignItems: "center" }} aria-label="Portfolio hero">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label mb-4">Selected Work</p>
            <h1 className="font-cormorant italic text-charcoal text-5xl lg:text-7xl mb-4">The Work</h1>
            <div className="w-12 h-px bg-gold mb-6" aria-hidden="true" />
            <p className="font-jost text-charcoal/60 text-base max-w-xl leading-relaxed">Each garment is a collaboration between craft and vision.</p>
          </motion.div>
        </div>
      </section>

      {/* FILTER TABS */}
      <section className="bg-ivory px-6 pb-4" aria-label="Filter portfolio">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-0 border-b border-blush" role="tablist" aria-label="Filter by garment type">
            {FILTERS.map((f) => (
              <button key={f.value} role="tab" aria-selected={activeFilter === f.value} onClick={() => setActiveFilter(f.value)}
                className={`px-5 py-3 font-jost text-xs tracking-[0.18em] uppercase transition-all duration-300 border-b-2 -mb-px ${activeFilter === f.value ? "border-gold text-charcoal" : "border-transparent text-charcoal/40 hover:text-charcoal/70"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MASONRY GRID */}
      <section className="bg-ivory px-6 py-8 lg:py-12" aria-label="Portfolio gallery">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeFilter} className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {filtered.map((item, i) => (
                <motion.div key={item._id} className="group relative overflow-hidden cursor-pointer break-inside-avoid"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}
                  onClick={() => setLightboxItem(item)} role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setLightboxItem(item)}
                  aria-label={`View ${item.label}`}>
                  <SanityImage image={item.image} placeholderLabel={`PORTFOLIO_IMAGE_${i + 1}`} placeholderRatio={i % 3 === 1 ? "landscape" : "portrait"} alt={item.image?.alt ?? item.label} />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-400 text-center px-4">
                      <p className="font-cormorant italic text-ivory text-xl mb-1">{item.label}</p>
                      <div className="w-6 h-px bg-gold mx-auto" aria-hidden="true" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          {filtered.length === 0 && <p className="text-center font-jost text-charcoal/40 py-20">No items in this category yet.</p>}
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-near_black/95 p-4"
            onClick={() => setLightboxItem(null)} role="dialog" aria-modal="true" aria-label={`Lightbox: ${lightboxItem.label}`}>
            <button className="absolute top-6 right-6 text-ivory/70 hover:text-ivory transition-colors z-10" onClick={() => setLightboxItem(null)} aria-label="Close lightbox">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.35 }}
              className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <SanityImage image={lightboxItem.image} placeholderLabel={lightboxItem.label} placeholderRatio="landscape" alt={lightboxItem.image?.alt ?? lightboxItem.label} width={1200} height={800} />
              <p className="text-center text-ivory/60 font-jost text-xs tracking-widest uppercase mt-4">{lightboxItem.label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CTABanner />
    </>
  );
}
