"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { HemDrawing, VIEW, lerpGeo, targetGeo, type Geo } from "./hemDrawing";

/**
 * A trouser leg from the side, over a shoe. Pick a break, a shoe and a leg,
 * and the hem eases to where it would sit: the front comes to rest on the
 * shoe and folds, the back drops down the heel.
 */

export type BreakId = "none" | "quarter" | "half" | "full";
export type ShoeId = "dress" | "sneaker" | "heel";
export type LegId = "slim" | "straight" | "wide";

const BREAKS: { id: BreakId; label: string; caption: string; desc: string }[] = [
  {
    id: "none",
    label: "No break",
    caption:
      "The hem just skims the top of the shoe, so the leg falls in one clean line with no fold. I love it on slim, modern suits and cropped trousers.",
    desc: "The front of the hem just grazes the top of the shoe with no fold, and the back sits at the top of the heel.",
  },
  {
    id: "quarter",
    label: "Quarter break",
    caption:
      "The hem just touches the shoe, leaving a barely-there dimple at the front. It’s the length I suggest most often for suits and chinos today.",
    desc: "The front of the hem rests lightly on the shoe with a small dimple, and the back covers the top of the heel.",
  },
  {
    id: "half",
    label: "Half break",
    caption:
      "One soft fold sits just above the shoe, and the back of the hem covers about half the heel. It’s the classic suit length, and a safe choice if you’re unsure.",
    desc: "One soft horizontal fold sits above the shoe at the front, and the back of the hem covers about half of the heel.",
  },
  {
    id: "full",
    label: "Full break",
    caption:
      "The front folds into a deep crease across the shoe, and the back covers most of the heel. I keep it for fuller, traditional trousers; on a slim leg it just looks too long.",
    desc: "A deep fold creases across the front above the shoe, and the back of the hem covers most of the heel.",
  },
];

const SHOE_OPTIONS: { id: ShoeId; label: string; noun: string; note: string }[] = [
  {
    id: "dress",
    label: "Dress shoe",
    noun: "a dress shoe",
    note: "Dress shoes are low and sleek, so small changes in length show. Most suit hems I pin are pinned over a pair like these.",
  },
  {
    id: "sneaker",
    label: "Sneaker",
    noun: "a sneaker",
    note: "Sneakers are chunkier and higher at the back, so the same trousers break sooner. I usually take casual pants a touch shorter for them.",
  },
  {
    id: "heel",
    label: "Heel",
    noun: "a heeled pump",
    note: "A heel lifts the back of your foot and tips it forward, so the hem lands somewhere quite different than it does in flats. Bring the shoes you’ll wear, and I’ll pin to those.",
  },
];

const LEG_OPTIONS: { id: LegId; label: string; note: string }[] = [
  {
    id: "slim",
    label: "Slim",
    note: "A slim opening sits right on the shoe, so every bit of break shows. Slim trousers look sharpest with a little break or none.",
  },
  {
    id: "straight",
    label: "Straight",
    note: "A straight leg is the middle ground. Most suits and chinos are cut this way, and any of these breaks can work.",
  },
  {
    id: "wide",
    label: "Wide",
    note: "A wide leg falls past the shoe instead of resting on it, so it barely folds. I usually hem wide legs longer, just clear of the floor.",
  },
];

const SLANT_NOTE =
  "The hem is angled a little longer at the back than the front, so it covers more of the heel without piling up on the shoe. It’s a nice finish on slim trousers.";

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const DURATION = 750;

interface Choice {
  brk: BreakId;
  shoe: ShoeId;
  leg: LegId;
  slanted: boolean;
}

const START: Choice = { brk: "half", shoe: "dress", leg: "straight", slanted: false };

export default function HemExplorer() {
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
    update(next, choice.shoe);
  };

  const brk = BREAKS.find((b) => b.id === choice.brk)!;
  const shoe = SHOE_OPTIONS.find((s) => s.id === choice.shoe)!;
  const leg = LEG_OPTIONS.find((l) => l.id === choice.leg)!;
  const label = `Side view of a ${leg.label.toLowerCase()} trouser leg over ${shoe.noun}, hemmed with ${
    brk.id === "none" ? "no break" : `a ${brk.label.toLowerCase()}`
  }${choice.slanted ? " and a slanted hem" : ""}.`;
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
          <HemDrawing geo={geo} brk={choice.brk} shoe={choice.shoe} fadingShoe={fading} uid={uid} />
        </svg>

        <div className="px-4 sm:px-6 pb-5 pt-1">
          <p className="font-jost text-[0.65rem] tracking-[0.18em] uppercase text-gold">
            {brk.label} · {shoe.label} · {leg.label} leg{choice.slanted ? " · Slanted" : ""}
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
          legend="Break"
          name={`${uid}-break`}
          options={BREAKS}
          value={choice.brk}
          onChange={(id) => set({ brk: id })}
        />
        <ChipGroup
          className="mt-4 lg:mt-6"
          legend="Shoe"
          name={`${uid}-shoe`}
          options={SHOE_OPTIONS}
          value={choice.shoe}
          onChange={(id) => set({ shoe: id })}
        />
        <ChipGroup
          className="mt-4 lg:mt-6"
          legend="Leg"
          name={`${uid}-leg`}
          options={LEG_OPTIONS}
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
          Slanted hem
        </label>

        <p className="sr-only" aria-live="polite">
          {`${brk.label}, ${shoe.label.toLowerCase()}, ${leg.label.toLowerCase()} leg${choice.slanted ? ", slanted hem" : ""}. ${brk.caption}`}
        </p>

        <dl className="mt-8 border-t border-blush pt-6 space-y-3 font-jost text-sm text-charcoal/75 leading-[1.65] max-w-[60ch]">
          <div>
            <dt className="inline font-medium text-charcoal">{shoe.label}: </dt>
            <dd className="inline">{shoe.note}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-charcoal">{leg.label} leg: </dt>
            <dd className="inline">{leg.note}</dd>
          </div>
          {choice.slanted && (
            <div>
              <dt className="inline font-medium text-charcoal">Slanted hem: </dt>
              <dd className="inline">{SLANT_NOTE}</dd>
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
