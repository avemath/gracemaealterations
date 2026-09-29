"use client";

import { analytics } from "@/lib/analytics";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { fill } from "@/lib/text/fill";
import type { Text } from "@/lib/text";
import { BackView, SideView, bustleSteps, stepFor, GOLD, FOLD_FILL } from "./bustleDrawing";

/**
 * An interactive drawing of a gown from the back. Pick a bustle and a train
 * length, then bustle it: the train lifts into that style, the way it would
 * after the ceremony. Everything is drawn from a handful of numbers, so one
 * value, t (0 = train down, 1 = bustled), drives every shape, and the slider
 * and the button simply move t.
 *
 * The copy for each style defaults to what is written here and is replaced by
 * the Studio's Bustle Styles once those are published. Everything else it
 * says (buttons, captions, the "how it works" lines) comes from the Studio's
 * Guides & tools wording, passed in by the page.
 */

export type BustleStyleId = "american" | "french" | "austrian" | "ballroom" | "detachable-train";
export type TrainId = "sweep" | "chapel" | "cathedral";

/** The explorer's own wording from the Studio (Guides & tools): every "bustle" field. */
export type BustleText = Pick<Text<"tools">, Extract<keyof Text<"tools">, `bustle${string}`>>;

export interface BustleCopy {
  slug: string;
  name?: string;
  alsoCalled?: string;
  typicalPoints?: string;
  bestFor?: string;
  fabricNotes?: string;
}

interface StyleInfo {
  name: string;
  alsoCalled: string;
  typicalPoints: string;
  bestFor: string;
  fabricNotes: string;
  /** The Guides & tools field with the "how it works" line. */
  how: keyof BustleText;
  /** How the points are drawn: hooks on top, ties underneath, or none. */
  points: Record<TrainId, number>;
}

const STYLES: Record<BustleStyleId, StyleInfo> = {
  american: {
    name: "American",
    alsoCalled: "Over-bustle, pickup bustle",
    typicalPoints: "2 to 7 points",
    how: "bustleHowAmerican",
    bestFor: "Most skirts. It is the workhorse and the one I use most often.",
    fabricNotes: "Works on almost anything. Heavy satins hold the folds crisply; very soft chiffon can look limp.",
    points: { sweep: 1, chapel: 3, cathedral: 5 },
  },
  french: {
    name: "French",
    alsoCalled: "Under-bustle, Victorian bustle",
    typicalPoints: "2 to 5 points",
    how: "bustleHowFrench",
    bestFor: "Skirts where you want the train to disappear underneath rather than sit on top.",
    fabricNotes: "Lovely on lace and layered tulle. Needs enough structure underneath to carry the weight.",
    points: { sweep: 2, chapel: 3, cathedral: 5 },
  },
  austrian: {
    name: "Austrian",
    alsoCalled: "Ruched bustle, gathered bustle",
    typicalPoints: "One continuous gather",
    how: "bustleHowAustrian",
    bestFor: "Simple skirts with no beading down the center back seam.",
    fabricNotes: "Draws the train up on a drawstring. Best on lighter fabrics; heavy satin fights it.",
    points: { sweep: 1, chapel: 1, cathedral: 1 },
  },
  ballroom: {
    name: "Ballroom",
    alsoCalled: "Floor-length bustle",
    typicalPoints: "3 to 9 points",
    how: "bustleHowBallroom",
    bestFor: "Formal gowns where you want the hem to sit level all the way round after bustling.",
    fabricNotes: "Takes the most points and the most time, and it is worth it on a long cathedral train.",
    points: { sweep: 3, chapel: 5, cathedral: 7 },
  },
  "detachable-train": {
    name: "Detachable train",
    alsoCalled: "Removable train, convertible train",
    typicalPoints: "Not applicable",
    how: "bustleHowDetachable",
    bestFor: "Gowns designed for it, or where a bustle would be too heavy.",
    fabricNotes: "The train comes off entirely at the reception. Needs to be planned, not retrofitted to any dress.",
    points: { sweep: 0, chapel: 0, cathedral: 0 },
  },
};

const ORDER: BustleStyleId[] = ["american", "french", "austrian", "ballroom", "detachable-train"];
const TRAINS: { id: TrainId; label: keyof BustleText }[] = [
  { id: "sweep", label: "bustleTrainSweep" },
  { id: "chapel", label: "bustleTrainChapel" },
  { id: "cathedral", label: "bustleTrainCathedral" },
];

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

// ── Component ───────────────────────────────────────────────────────────────

export default function BustleExplorer({
  copy = [],
  text,
  footer,
}: {
  /** Published Bustle Styles from the Studio; their wording wins. */
  copy?: BustleCopy[];
  /** Wording from the Studio (Guides & tools). */
  text: BustleText;
  footer?: React.ReactNode;
}) {
  const uid = useId();
  const [style, setStyle] = useState<BustleStyleId>("american");
  const [train, setTrain] = useState<TrainId>("chapel");
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const raf = useRef(0);
  /** The one-time autoplay; any choice the visitor makes first cancels it. */
  const autoplay = useRef(0);
  const drawingRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);
  // Phones show one view at a time, big enough to follow; wider screens show both.
  const [narrow, setNarrow] = useState(false);
  const [view, setView] = useState<"back" | "side">("side");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const animateTo = useCallback((target: number, from = tRef.current) => {
    window.clearTimeout(autoplay.current);
    cancelAnimationFrame(raf.current);
    if (reduced.current) {
      setT(target);
      return;
    }
    const start = performance.now();
    // Slow enough to follow where each point goes.
    const duration = 400 + 2400 * Math.abs(target - from);
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setT(from + (target - from) * ease(p));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  // Bustle it once, the first time the drawing is properly in view.
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Watch the drawing, not the whole block: on phones the block is taller
    // than the screen, so half of it can never be in view at once.
    const el = drawingRef.current;
    if (!el || reduced.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        autoplay.current = window.setTimeout(() => animateTo(1), 400);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(autoplay.current);
      cancelAnimationFrame(raf.current);
    };
  }, [animateTo]);

  const pick = (next: BustleStyleId) => {
    if (next === style) return;
    analytics.toolUse("bustle", next);
    setStyle(next);
    // Show the new style doing its thing from the start.
    setT(0);
    animateTo(1, 0);
  };

  const pickTrain = (next: TrainId) => {
    if (next === train) return;
    analytics.toolUse("bustle_train", next);
    setTrain(next);
    setT(0);
    animateTo(1, 0);
  };

  const base = STYLES[style];
  const cms = copy.find((c) => c.slug === style);
  const info = {
    ...base,
    name: cms?.name || base.name,
    alsoCalled: cms?.alsoCalled || base.alsoCalled,
    typicalPoints: cms?.typicalPoints || base.typicalPoints,
    bestFor: cms?.bestFor || base.bestFor,
    fabricNotes: cms?.fabricNotes || base.fabricNotes,
    how: text[base.how],
  };
  const n = base.points[train];
  const bustled = t > 0.5;
  const steps = bustleSteps(text)[style];
  const step = steps[stepFor(t)];
  const stages = [text.bustleStageCeremony, text.bustleStageBustling, text.bustleStageReception];

  const state = bustled ? text.bustleStateUp : text.bustleStateDown;
  const toggleLabel = bustled ? text.bustleButtonDown : text.bustleButtonUp;
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:gap-12">
      {/* ── Drawing ── */}
      {/* On phones a tap anywhere on the drawing bustles it too. The button
          below does the same for keyboards and screen readers. */}
      <div ref={drawingRef} className="relative bg-[#1f1b1b] border border-ivory/10" onClick={() => animateTo(bustled ? 0 : 1)}>
        <svg
          viewBox={narrow ? (view === "back" ? "0 0 360 520" : "360 0 320 520") : "0 0 680 520"}
          className="block w-full h-auto max-h-[52vh] lg:max-h-[72vh]"
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
        >
          <title id={titleId}>{fill(text.bustleDrawingName, { style: info.name, state })}</title>
          <desc id={descId}>{`${info.how} ${steps.join(" ")}`}</desc>
          <defs>
            <radialGradient id={`${uid}-glow`} cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#3a3230" />
              <stop offset="100%" stopColor="#1f1b1b" />
            </radialGradient>
            <radialGradient id={`${uid}-pouf`} cx="50%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor={FOLD_FILL} />
            </radialGradient>
            <linearGradient id={`${uid}-silk`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#E9E1D6" />
              <stop offset="35%" stopColor="#FFFDF9" />
              <stop offset="65%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#E4DBCF" />
            </linearGradient>
            {/* Side view: light from the front (left), shadow toward the back. */}
            <linearGradient id={`${uid}-silk-side`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="55%" stopColor="#F6F0E8" />
              <stop offset="100%" stopColor="#E2D8CA" />
            </linearGradient>
            <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 Z" fill={GOLD} />
            </marker>
          </defs>
          <rect x="0" y="0" width="680" height="520" fill={`url(#${uid}-glow)`} />
          <line x1="360" y1="40" x2="360" y2="480" stroke="rgba(250,247,242,0.08)" />

          <BackView style={style} train={train} t={t} n={n} uid={uid} />
          <g transform="translate(360 0)">
            <SideView style={style} train={train} t={t} uid={uid} />
          </g>

          {!narrow && (
            <>
              <text x="20" y="34" fill="rgba(250,247,242,0.6)" fontSize="11" letterSpacing="2.2" fontFamily="sans-serif">{text.bustleBack.toUpperCase()}</text>
              <text x="380" y="34" fill="rgba(250,247,242,0.6)" fontSize="11" letterSpacing="2.2" fontFamily="sans-serif">{text.bustleSide.toUpperCase()}</text>
            </>
          )}
        </svg>

        {/* What is happening right now, step by step. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 bg-gradient-to-t from-[#1f1b1b] via-[#1f1b1b]/85 to-transparent"
          aria-hidden="true"
        >
          <p className="font-jost text-[0.65rem] tracking-[0.18em] uppercase text-gold">
            {stages[stepFor(t)]} · {fill(text.bustleStepCount, { step: stepFor(t) + 1, total: stages.length })}
          </p>
          <p className="font-cormorant italic text-ivory text-lg sm:text-xl leading-snug mt-0.5" data-testid="bustle-step">
            {step}
          </p>
        </div>

        {/* Phones: one view at a time, and the play button sits on the drawing. */}
        {narrow && (
          <div className="absolute left-3 top-3 flex border border-ivory/25" onClick={(e) => e.stopPropagation()}>
            {(["side", "back"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`font-jost text-[0.65rem] tracking-[0.18em] uppercase px-3 py-2 min-h-[36px] ${
                  view === v ? "bg-ivory text-near_black" : "text-ivory/80"
                }`}
              >
                {v === "side" ? text.bustleSide : text.bustleBack}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="lg:hidden absolute right-3 top-3 font-jost text-[0.7rem] tracking-[0.18em] uppercase text-near_black bg-gold px-4 py-2.5 min-h-[36px]"
          onClick={(e) => {
            e.stopPropagation();
            animateTo(bustled ? 0 : 1);
          }}
        >
          {toggleLabel}
        </button>
      </div>

      {/* ── Controls and notes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
        <div>
        <fieldset>
          <legend className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-2 lg:mb-3">
            {text.bustleStyleLegend}
          </legend>
          <div className="flex flex-wrap gap-2">
            {ORDER.map((id) => (
              <label
                key={id}
                className={`cursor-pointer select-none border px-3 lg:px-4 py-2 min-h-[44px] inline-flex items-center font-jost text-sm transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold_ink ${
                  style === id
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-charcoal/25 text-charcoal hover:border-charcoal/60"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-style`}
                  value={id}
                  checked={style === id}
                  onChange={() => pick(id)}
                  className="sr-only"
                />
                {cmsName(copy, id) ?? STYLES[id].name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4 lg:mt-6">
          <legend className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-2 lg:mb-3">
            {text.bustleTrainLegend}
          </legend>
          <div className="flex flex-wrap gap-2">
            {TRAINS.map(({ id, label }) => (
              <label
                key={id}
                className={`cursor-pointer select-none border px-3 lg:px-4 py-2 min-h-[44px] inline-flex items-center font-jost text-sm transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold_ink ${
                  train === id
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-charcoal/25 text-charcoal hover:border-charcoal/60"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-train`}
                  value={id}
                  checked={train === id}
                  onChange={() => pickTrain(id)}
                  className="sr-only"
                />
                {text[label]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 lg:mt-8 flex items-center gap-4">
          <button
            type="button"
            className="btn-gold shrink-0 whitespace-nowrap min-w-[10.5rem]"
            onClick={() => animateTo(bustled ? 0 : 1)}
          >
            {toggleLabel}
          </button>
          <label className="flex-1 min-w-0">
            <span className="sr-only">{text.bustleSliderLabel}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(t * 100)}
              aria-valuetext={state}
              onChange={(e) => {
                window.clearTimeout(autoplay.current);
                cancelAnimationFrame(raf.current);
                setT(Number(e.target.value) / 100);
              }}
              className="w-full accent-[#7A5F1E] h-11 cursor-pointer"
            />
          </label>
        </div>

        </div>

        <p className="sr-only" aria-live="polite">
          {fill(text.bustleSpokenUpdate, { style: info.name, state })}
        </p>

        <div className="mt-10 border-t border-blush pt-8 lg:mt-0 lg:border-t-0 lg:pt-0">
          <h2 className="font-cormorant italic text-charcoal text-3xl">{info.name}</h2>
          <p className="font-jost text-charcoal/75 text-xs mt-1">{fill(text.bustleAlsoCalled, { names: info.alsoCalled })}</p>
          <p className="font-jost text-charcoal text-base leading-[1.7] mt-5 max-w-[60ch]">{info.how}</p>
          <dl className="mt-5 space-y-2.5 font-jost text-sm text-charcoal/75 leading-[1.65] max-w-[60ch]">
            <div>
              <dt className="inline font-medium text-charcoal">{text.bustleTypicalPoints}: </dt>
              <dd className="inline">
                {info.typicalPoints}
                {n > 1 && ` ${fill(text.bustlePointsInDrawing, { count: n })}`}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-charcoal">{text.bustleBestFor}: </dt>
              <dd className="inline">{info.bestFor}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-charcoal">{text.bustleFabric}: </dt>
              <dd className="inline">{info.fabricNotes}</dd>
            </div>
          </dl>
          <p className="font-jost text-charcoal/75 text-xs mt-6 flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2">
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="3.5" fill={GOLD} /></svg>
              {text.bustleKeyHook}
            </span>
            <span className="inline-flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.2" fill="none" stroke={GOLD} strokeWidth="1.4" strokeDasharray="2.2 2" /></svg>
              {text.bustleKeyTie}
            </span>
            <span className="inline-flex items-center gap-2">
              <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
                <path d="M1,5 L15,5" stroke={GOLD} strokeWidth="1.4" strokeDasharray="4 3" />
                <path d="M14,1.5 L21,5 L14,8.5 Z" fill={GOLD} />
              </svg>
              {text.bustleKeyPull}
            </span>
          </p>
          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

function cmsName(copy: BustleCopy[], id: BustleStyleId) {
  return copy.find((c) => c.slug === id)?.name || null;
}
