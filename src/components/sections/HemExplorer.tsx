"use client";

import { analytics } from "@/lib/analytics";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { fill } from "@/lib/text/fill";
import type { Text } from "@/lib/text";
import { HemDrawing, VIEW, lerpGeo, targetGeo, type Geo } from "./hemDrawing";

/**
 * A trouser leg from the side, over a shoe. Pick a break, a shoe and a leg,
 * and the hem eases to where it would sit: the front comes to rest on the
 * shoe and folds, the back drops down the heel.
 */

export type BreakId = "none" | "quarter" | "half" | "full";
export type ShoeId = "dress" | "sneaker" | "heel";
export type LegId = "slim" | "straight" | "wide";

interface BreakOption {
  id: BreakId;
  label: string;
  caption: string;
  desc: string;
}
interface ShoeOption {
  id: ShoeId;
  label: string;
  noun: string;
  note: string;
}
interface LegOption {
  id: LegId;
  label: string;
  note: string;
}

/** The explorer's own wording from the Studio (Guides & tools): every "hem" field. */
export type HemText = Pick<Text<"tools">, Extract<keyof Text<"tools">, `hem${string}`>>;

// The wording lives in the Studio (Guides & tools); these just line it up
// with the choices the drawing knows how to draw.
const breakOptions = (text: HemText): BreakOption[] => [
  { id: "none", label: text.hemBreakNone, caption: text.hemBreakNoneCaption, desc: text.hemBreakNoneSpoken },
  { id: "quarter", label: text.hemBreakQuarter, caption: text.hemBreakQuarterCaption, desc: text.hemBreakQuarterSpoken },
  { id: "half", label: text.hemBreakHalf, caption: text.hemBreakHalfCaption, desc: text.hemBreakHalfSpoken },
  { id: "full", label: text.hemBreakFull, caption: text.hemBreakFullCaption, desc: text.hemBreakFullSpoken },
];

const shoeOptions = (text: HemText): ShoeOption[] => [
  { id: "dress", label: text.hemShoeDress, noun: text.hemShoeDressSpoken, note: text.hemShoeDressNote },
  { id: "sneaker", label: text.hemShoeSneaker, noun: text.hemShoeSneakerSpoken, note: text.hemShoeSneakerNote },
  { id: "heel", label: text.hemShoeHeel, noun: text.hemShoeHeelSpoken, note: text.hemShoeHeelNote },
];

const legOptions = (text: HemText): LegOption[] => [
  { id: "slim", label: text.hemLegSlim, note: text.hemLegSlimNote },
  { id: "straight", label: text.hemLegStraight, note: text.hemLegStraightNote },
  { id: "wide", label: text.hemLegWide, note: text.hemLegWideNote },
];

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const DURATION = 750;

interface Choice {
  brk: BreakId;
  shoe: ShoeId;
  leg: LegId;
  slanted: boolean;
}

const START: Choice = { brk: "half", shoe: "dress", leg: "straight", slanted: false };

export default function HemExplorer({ text }: { text: HemText }) {
  const uid = useId();
  const [choice, setChoice] = useState<Choice>(START);
  const [geo, setGeo] = useState<Geo>(() => targetGeo(START.brk, START.shoe, START.leg, START.slanted));
  const [fading, setFading] = useState<{ id: ShoeId; opacity: number } | null>(null);
  const [animating, setAnimating] = useState(false);
  const geoRef = useRef(geo);
  const raf = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    geoRef.current = geo;
  }, [geo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => (reduced.current = mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const update = useCallback((next: Choice, prevShoe: ShoeId) => {
    setChoice(next);
    const to = targetGeo(next.brk, next.shoe, next.leg, next.slanted);
    cancelAnimationFrame(raf.current);
    if (reduced.current) {
      setGeo(to);
      setFading(null);
      setAnimating(false);
      return;
    }
    const from = geoRef.current;
    const swap = prevShoe !== next.shoe;
    const start = performance.now();
    setAnimating(true);
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setGeo(lerpGeo(from, to, ease(p)));
      setFading(swap && p < 1 ? { id: prevShoe, opacity: 1 - ease(Math.min(1, p * 1.5)) } : null);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setAnimating(false);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  const set = (patch: Partial<Choice>) => {
    const next = { ...choice, ...patch };
    if (next.brk === choice.brk && next.shoe === choice.shoe && next.leg === choice.leg && next.slanted === choice.slanted) return;
    analytics.toolUse("hem", `${next.brk}/${next.shoe}/${next.leg}${next.slanted ? "/slanted" : ""}`);
    update(next, choice.shoe);
  };

  const breaks = breakOptions(text);
  const shoes = shoeOptions(text);
  const legs = legOptions(text);
  const brk = breaks.find((b) => b.id === choice.brk)!;
  const shoe = shoes.find((s) => s.id === choice.shoe)!;
  const leg = legs.find((l) => l.id === choice.leg)!;
  const legName = fill(text.hemLegName, { leg: leg.label });
  const label = fill(choice.slanted ? text.hemDrawingNameSlanted : text.hemDrawingName, {
    leg: leg.label.toLowerCase(),
    shoe: shoe.noun,
    break: brk.id === "none" ? brk.label.toLowerCase() : `a ${brk.label.toLowerCase()}`,
  });
  const descId = `${uid}-desc`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 lg:items-start">
      {/* ── Drawing and caption ── */}
      <div className="bg-[#1f1b1b] border border-ivory/10 min-w-0">
        <svg
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
          className="block w-full h-auto"
          role="img"
          aria-label={label}
          aria-describedby={descId}
          data-testid="hem-drawing"
          data-break={choice.brk}
          data-shoe={choice.shoe}
          data-leg={choice.leg}
          data-slanted={choice.slanted ? "true" : "false"}
          data-animating={animating ? "true" : "false"}
        >
          <desc id={descId}>{`${brk.desc} ${leg.note} ${shoe.note}`}</desc>
          <defs>
            <radialGradient id={`${uid}-glow`} cx="45%" cy="62%" r="70%">
              <stop offset="0%" stopColor="#3a3230" />
              <stop offset="100%" stopColor="#1f1b1b" />
            </radialGradient>
          </defs>
          <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} fill={`url(#${uid}-glow)`} />
          <HemDrawing
            geo={geo}
            brk={choice.brk}
            shoe={choice.shoe}
            fadingShoe={fading}
            uid={uid}
            labels={{ breakLabel: text.hemLabelBreak, noBreak: text.hemLabelNoBreak, hem: text.hemLabelHem }}
          />
        </svg>

        <div className="px-4 sm:px-6 pb-5 pt-1">
          <p className="font-jost text-[0.65rem] tracking-[0.18em] uppercase text-gold">
            {brk.label} · {shoe.label} · {legName}
            {choice.slanted ? ` · ${text.hemSlantShort}` : ""}
          </p>
          <p
            className="font-cormorant italic text-ivory text-lg sm:text-xl leading-snug mt-1 min-h-[4.1em] sm:min-h-[2.75em]"
            data-testid="hem-caption"
          >
            {brk.caption}
          </p>
        </div>
      </div>

      {/* ── Controls and notes ── */}
      <div className="min-w-0">
        <ChipGroup
          legend={text.hemBreakLegend}
          name={`${uid}-break`}
          options={breaks}
          value={choice.brk}
          onChange={(id) => set({ brk: id })}
        />
        <ChipGroup
          className="mt-4 lg:mt-6"
          legend={text.hemShoeLegend}
          name={`${uid}-shoe`}
          options={shoes}
          value={choice.shoe}
          onChange={(id) => set({ shoe: id })}
        />
        <ChipGroup
          className="mt-4 lg:mt-6"
          legend={text.hemLegLegend}
          name={`${uid}-leg`}
          options={legs}
          value={choice.leg}
          onChange={(id) => set({ leg: id })}
        />

        <label className="mt-5 lg:mt-7 inline-flex items-center gap-3 cursor-pointer select-none min-h-[44px] font-jost text-sm text-charcoal has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold_ink">
          <input
            type="checkbox"
            role="switch"
            checked={choice.slanted}
            onChange={(e) => set({ slanted: e.target.checked })}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={`relative inline-block w-10 h-6 border transition-colors duration-200 ${
              choice.slanted ? "bg-charcoal border-charcoal" : "bg-transparent border-charcoal/40"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 transition-all duration-200 ${
                choice.slanted ? "left-5 bg-ivory" : "left-1 bg-charcoal/60"
              }`}
            />
          </span>
          {text.hemSlantLabel}
        </label>

        <p className="sr-only" aria-live="polite">
          {`${brk.label}, ${shoe.label.toLowerCase()}, ${legName.toLowerCase()}${
            choice.slanted ? `, ${text.hemSlantLabel.toLowerCase()}` : ""
          }. ${brk.caption}`}
        </p>

        <dl className="mt-8 border-t border-blush pt-6 space-y-3 font-jost text-sm text-charcoal/75 leading-[1.65] max-w-[60ch]">
          <div>
            <dt className="inline font-medium text-charcoal">{shoe.label}: </dt>
            <dd className="inline">{shoe.note}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-charcoal">{legName}: </dt>
            <dd className="inline">{leg.note}</dd>
          </div>
          {choice.slanted && (
            <div>
              <dt className="inline font-medium text-charcoal">{text.hemSlantLabel}: </dt>
              <dd className="inline">{text.hemSlantNote}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function ChipGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  className = "",
}: {
  legend: string;
  name: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <fieldset className={className} role="radiogroup" aria-labelledby={`${name}-legend`}>
      <legend id={`${name}-legend`} className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-2 lg:mb-3">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map(({ id, label }) => (
          <label
            key={id}
            className={`cursor-pointer select-none border px-3 lg:px-4 py-2 min-h-[44px] inline-flex items-center font-jost text-sm transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold_ink ${
              value === id ? "border-charcoal bg-charcoal text-ivory" : "border-charcoal/25 text-charcoal hover:border-charcoal/60"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={id}
              checked={value === id}
              onChange={() => onChange(id)}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
