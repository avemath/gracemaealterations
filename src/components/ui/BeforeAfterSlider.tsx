"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.image";
import type { SanityImage as SanityImageType } from "@/lib/sanity.queries";

interface Props {
  beforeImage?: SanityImageType | null;
  afterImage?: SanityImageType | null;
  label?: string | null;
  description?: string | null;
}

function getSrc(img: SanityImageType): string | null {
  try { return urlFor(img).auto("format").quality(85).url(); }
  catch { return null; }
}

export default function BeforeAfterSlider({ beforeImage, afterImage, label, description }: Props) {
  const [position, setPosition] = useState(50);
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) => Math.min(96, Math.max(4, v));

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    setPosition(clamp(((clientX - left) / width) * 100));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) updatePos(e.clientX); };
    const onUp = () => { dragging.current = false; setActive(false); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [updatePos]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPosition((p) => clamp(p - 5));
    if (e.key === "ArrowRight") setPosition((p) => clamp(p + 5));
  };

  const beforeSrc = beforeImage?.asset ? getSrc(beforeImage) : null;
  const afterSrc = afterImage?.asset ? getSrc(afterImage) : null;
  const hasImages = !!(beforeSrc && afterSrc);

  return (
    <div className="w-full">
      {label && (
        <div className="mb-3">
          <p className="section-label">{label}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative overflow-hidden select-none"
        style={{ paddingBottom: "133.33%", cursor: active ? "grabbing" : "ew-resize" }}
        onMouseDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          setActive(true);
          updatePos(e.clientX);
        }}
        onTouchStart={(e) => updatePos(e.touches[0].clientX)}
        onTouchMove={(e) => { e.preventDefault(); updatePos(e.touches[0].clientX); }}
        role="slider"
        aria-label="Before and after comparison — drag left or right"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {/* ── AFTER layer (full width, underneath) ─────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {afterSrc ? (
            <Image
              src={afterSrc}
              alt={afterImage?.alt ?? "After alteration"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            /* Placeholder: dark ivory panel */
            <div className="absolute inset-0 bg-charcoal/8 flex items-center justify-center">
              <div className="text-center">
                <p className="font-cormorant italic text-charcoal/45 text-2xl">After</p>
                <p className="font-jost text-charcoal/45 text-xs tracking-[0.15em] uppercase mt-2">Photo coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* ── BEFORE layer (clipped from the right) ────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {beforeSrc ? (
            <Image
              src={beforeSrc}
              alt={beforeImage?.alt ?? "Before alteration"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            /* Placeholder: blush panel */
            <div className="absolute inset-0 bg-blush flex items-center justify-center">
              <div className="text-center">
                <p className="font-cormorant italic text-charcoal/45 text-2xl">Before</p>
                <p className="font-jost text-charcoal/45 text-xs tracking-[0.15em] uppercase mt-2">Photo coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* ── DIVIDER LINE ─────────────────────────────────────── */}
        <div
          className="absolute inset-y-0 z-10 flex flex-col items-center pointer-events-none"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          aria-hidden="true"
        >
          <div className="h-full w-px bg-ivory/80 shadow-[0_0_8px_rgba(0,0,0,0.25)]" />
        </div>

        {/* ── DRAG HANDLE ──────────────────────────────────────── */}
        <div
          className="absolute top-1/2 z-20 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        >
          <div className={`w-11 h-11 rounded-full bg-ivory shadow-[0_2px_16px_rgba(0,0,0,0.28)] flex items-center justify-center transition-transform duration-150 ${active ? "scale-110" : "scale-100"}`}>
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
              <path d="M1 5H17M5 1L1 5L5 9M13 1L17 5L13 9" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* ── LABELS ───────────────────────────────────────────── */}
        <div
          className="absolute top-4 left-4 z-10 pointer-events-none transition-opacity duration-200"
          style={{ opacity: position < 18 ? 0 : 1 }}
          aria-hidden="true"
        >
          <span className="font-jost text-xs tracking-[0.18em] uppercase text-ivory bg-near_black/55 px-2.5 py-1">
            Before
          </span>
        </div>
        <div
          className="absolute top-4 right-4 z-10 pointer-events-none transition-opacity duration-200"
          style={{ opacity: position > 82 ? 0 : 1 }}
          aria-hidden="true"
        >
          <span className="font-jost text-xs tracking-[0.18em] uppercase text-ivory bg-near_black/55 px-2.5 py-1">
            After
          </span>
        </div>

        {/* Placeholder upload hint — only shown when no real photos */}
        {!hasImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none" aria-hidden="true">
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-charcoal/45 whitespace-nowrap">
              Upload photos in Studio → Portfolio Page
            </p>
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 font-jost text-charcoal/55 text-xs leading-relaxed">{description}</p>
      )}
    </div>
  );
}
