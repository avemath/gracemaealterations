"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.image";
import { sanityLoader } from "@/lib/sanity.loader";
import type { SanityImage as SanityImageType } from "@/lib/sanity.queries";
import type { TextFor } from "@/lib/cta";
import { fill } from "@/lib/text/fill";

export type SliderText = TextFor<"slider">;

export interface SliderProps {
  beforeImage?: SanityImageType | null;
  afterImage?: SanityImageType | null;
  label?: string | null;
  description?: string | null;
  /** The Studio's words for the tags and what screen readers hear. */
  text: SliderText;
}

function getSrc(img: SanityImageType): string | null {
  try { return urlFor(img).fit("max").url(); }
  catch { return null; }
}

/**
 * The slider itself, for client components that already hold the Studio's
 * words. Server pages use BeforeAfterSlider, which fetches them.
 */
export default function BeforeAfterSliderView({
  beforeImage,
  afterImage,
  label,
  description,
  text,
}: SliderProps) {
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
    const keys: Record<string, () => void> = {
      ArrowLeft: () => setPosition((p) => clamp(p - 5)),
      ArrowRight: () => setPosition((p) => clamp(p + 5)),
      Home: () => setPosition(clamp(0)),
      End: () => setPosition(clamp(100)),
    };
    const handler = keys[e.key];
    if (handler) {
      e.preventDefault();
      handler();
    }
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
        // touch-pan-y: the page still scrolls up and down, and sideways drags
        // move the slider (React touch handlers are passive, so preventDefault
        // can't stop the scroll).
        className="relative overflow-hidden select-none touch-pan-y"
        style={{ paddingBottom: "133.33%", cursor: active ? "grabbing" : "ew-resize" }}
        onMouseDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          setActive(true);
          updatePos(e.clientX);
        }}
        onTouchStart={(e) => updatePos(e.touches[0].clientX)}
        onTouchMove={(e) => updatePos(e.touches[0].clientX)}
      >
        {/* ── AFTER layer (full width, underneath) ─────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {afterSrc ? (
            <Image
              src={afterSrc}
              loader={sanityLoader}
              alt={afterImage?.alt ?? text.sliderAfterAlt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              // The largest image above the fold on /portfolio, so the LCP.
              priority
            />
          ) : (
            /* Placeholder: dark ivory panel */
            <div className="absolute inset-0 bg-charcoal/8 flex items-center justify-center">
              <div className="text-center">
                <p className="font-cormorant italic text-charcoal/75 text-2xl">{text.sliderAfter}</p>
                <p className="font-jost text-charcoal/75 text-xs tracking-[0.15em] uppercase mt-2">{text.sliderComingSoon}</p>
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
              loader={sanityLoader}
              alt={beforeImage?.alt ?? text.sliderBeforeAlt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              // The largest image above the fold on /portfolio, so the LCP.
              priority
            />
          ) : (
            /* Placeholder: blush panel */
            <div className="absolute inset-0 bg-blush flex items-center justify-center">
              <div className="text-center">
                <p className="font-cormorant italic text-charcoal/75 text-2xl">{text.sliderBefore}</p>
                <p className="font-jost text-charcoal/75 text-xs tracking-[0.15em] uppercase mt-2">{text.sliderComingSoon}</p>
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
          className="absolute top-1/2 z-20 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${position}%` }}
          role="slider"
          aria-label={text.sliderName}
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={fill(text.sliderValue, { before: Math.round(position), after: 100 - Math.round(position) })}
          tabIndex={0}
          onKeyDown={onKeyDown}
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
            {text.sliderBefore}
          </span>
        </div>
        <div
          className="absolute top-4 right-4 z-10 pointer-events-none transition-opacity duration-200"
          style={{ opacity: position > 82 ? 0 : 1 }}
          aria-hidden="true"
        >
          <span className="font-jost text-xs tracking-[0.18em] uppercase text-ivory bg-near_black/55 px-2.5 py-1">
            {text.sliderAfter}
          </span>
        </div>

        {/* Placeholder upload hint — only shown when no real photos */}
        {!hasImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none" aria-hidden="true">
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-charcoal/75 whitespace-nowrap">
              {text.sliderUploadHint}
            </p>
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 font-jost text-charcoal/75 text-xs leading-[1.65]">{description}</p>
      )}
    </div>
  );
}
