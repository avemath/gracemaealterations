"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * An interactive drawing of a gown from the back. Pick a bustle and a train
 * length, then bustle it: the train lifts into that style, the way it would
 * after the ceremony. Everything is drawn from a handful of numbers, so one
 * value, t (0 = train down, 1 = bustled), drives every shape, and the slider
 * and the button simply move t.
 *
 * The copy for each style defaults to what is written here and is replaced by
 * the Studio's Bustle Styles once those are published.
 */

export type BustleStyleId = "american" | "french" | "austrian" | "ballroom" | "detachable-train";
type TrainId = "sweep" | "chapel" | "cathedral";

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
  how: string;
  /** How the points are drawn: hooks on top, ties underneath, or none. */
  points: Record<TrainId, number>;
}

const STYLES: Record<BustleStyleId, StyleInfo> = {
  american: {
    name: "American",
    alsoCalled: "Over-bustle, pickup bustle",
    typicalPoints: "2 to 7 points",
    how: "The train is lifted and hooked onto the back of the skirt, so it falls in soft poufs over the top.",
    bestFor: "Most skirts. It is the workhorse and the one I use most often.",
    fabricNotes: "Works on almost anything. Heavy satins hold the folds crisply; very soft chiffon can look limp.",
    points: { sweep: 1, chapel: 3, cathedral: 5 },
  },
  french: {
    name: "French",
    alsoCalled: "Under-bustle, Victorian bustle",
    typicalPoints: "2 to 5 points",
    how: "The train is tied up underneath the skirt with numbered ribbons, so it tucks under in a cascade.",
    bestFor: "Skirts where you want the train to disappear underneath rather than sit on top.",
    fabricNotes: "Lovely on lace and layered tulle. Needs enough structure underneath to carry the weight.",
    points: { sweep: 2, chapel: 3, cathedral: 5 },
  },
  austrian: {
    name: "Austrian",
    alsoCalled: "Ruched bustle, gathered bustle",
    typicalPoints: "One continuous gather",
    how: "A cord runs up the center back. Pulling it gathers the train straight up into ruched folds.",
    bestFor: "Simple skirts with no beading down the center back seam.",
    fabricNotes: "Draws the train up on a drawstring. Best on lighter fabrics; heavy satin fights it.",
    points: { sweep: 1, chapel: 1, cathedral: 1 },
  },
  ballroom: {
    name: "Ballroom",
    alsoCalled: "Floor-length bustle",
    typicalPoints: "3 to 9 points",
    how: "The train folds up underneath all the way round, so the hem sits level with the floor, like a ball gown.",
    bestFor: "Formal gowns where you want the hem to sit level all the way round after bustling.",
    fabricNotes: "Takes the most points and the most time, and it is worth it on a long cathedral train.",
    points: { sweep: 3, chapel: 5, cathedral: 7 },
  },
  "detachable-train": {
    name: "Detachable train",
    alsoCalled: "Removable train, convertible train",
    typicalPoints: "Not applicable",
    how: "The train is a separate piece that hooks on at the waist for the ceremony and comes off for the reception.",
    bestFor: "Gowns designed for it, or where a bustle would be too heavy.",
    fabricNotes: "The train comes off entirely at the reception. Needs to be planned, not retrofitted to any dress.",
    points: { sweep: 0, chapel: 0, cathedral: 0 },
  },
};

const ORDER: BustleStyleId[] = ["american", "french", "austrian", "ballroom", "detachable-train"];
const TRAINS: { id: TrainId; label: string }[] = [
  { id: "sweep", label: "Sweep" },
  { id: "chapel", label: "Chapel" },
  { id: "cathedral", label: "Cathedral" },
];

// ── Geometry ────────────────────────────────────────────────────────────────
// viewBox 0 0 360 520. The gown is seen from behind, standing on the floor at
// FLOOR; a train lying on the floor reads as extending below the hem.

const CX = 180;
const WAIST_Y = 150;
const WAIST_HALF = 34;
const FLOOR = 400;
const HEM_HALF = 112;
const TRAIN_LEN: Record<TrainId, number> = { sweep: 26, chapel: 60, cathedral: 96 };
/** The hem is never perfectly flat: a slight curve reads as a round skirt. */
const HEM_CURVE = 12;

const GOLD = "#C9A84C";
const SHADE = "rgba(28,28,28,0.22)";
const FOLD_FILL = "#EFE7DD";

const f = (n: number) => Math.round(n * 10) / 10;

/** Skirt half-width at height y, following the side curves closely enough. */
function halfAt(y: number, hemHalf: number) {
  const k = Math.min(1, Math.max(0, (y - WAIST_Y) / (FLOOR - WAIST_Y)));
  return WAIST_HALF + (hemHalf - WAIST_HALF) * Math.pow(k, 0.85);
}

function gownPath(depth: number, hemHalf: number) {
  const L = CX - hemHalf;
  const R = CX + hemHalf;
  return [
    `M${CX - WAIST_HALF},${WAIST_Y}`,
    `C${CX - WAIST_HALF - 18},232 ${L + 8},330 ${L},${FLOOR}`,
    `C${L - 2},${f(FLOOR + depth * 0.35)} ${f(CX - hemHalf * 0.62)},${f(FLOOR + depth)} ${CX},${f(FLOOR + depth)}`,
    `C${f(CX + hemHalf * 0.62)},${f(FLOOR + depth)} ${R + 2},${f(FLOOR + depth * 0.35)} ${R},${FLOOR}`,
    `C${R - 8},330 ${CX + WAIST_HALF + 18},232 ${CX + WAIST_HALF},${WAIST_Y}`,
    "Z",
  ].join(" ");
}

/** Faint drape lines from waist to hem, ending on the hem curve. */
function drapeLines(depth: number, hemHalf: number) {
  return [-0.62, -0.3, 0, 0.3, 0.62].map((o) => {
    const xTop = CX + o * WAIST_HALF * 0.8;
    const xBottom = CX + o * hemHalf * 0.92;
    const yBottom = FLOOR + depth * (1 - o * o) * 0.92;
    return `M${f(xTop)},${WAIST_Y + 6} C${f(xTop + o * 8)},240 ${f(xBottom - o * 10)},330 ${f(xBottom)},${f(yBottom)}`;
  });
}

function spread(n: number, width: number) {
  if (n <= 1) return [CX];
  return Array.from({ length: n }, (_, i) => CX - width / 2 + (i * width) / (n - 1));
}

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

// ── Component ───────────────────────────────────────────────────────────────

export default function BustleExplorer({
  copy = [],
  footer,
}: {
  /** Published Bustle Styles from the Studio; their wording wins. */
  copy?: BustleCopy[];
  footer?: React.ReactNode;
}) {
  const uid = useId();
  const [style, setStyle] = useState<BustleStyleId>("american");
  const [train, setTrain] = useState<TrainId>("chapel");
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const raf = useRef(0);
  const drawingRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const animateTo = useCallback((target: number, from = tRef.current) => {
    cancelAnimationFrame(raf.current);
    if (reduced.current) {
      setT(target);
      return;
    }
    const start = performance.now();
    const duration = 300 + 1200 * Math.abs(target - from);
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
        window.setTimeout(() => animateTo(1), 400);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [animateTo]);

  const pick = (next: BustleStyleId) => {
    if (next === style) return;
    setStyle(next);
    // Show the new style doing its thing from the start.
    setT(0);
    animateTo(1, 0);
  };

  const pickTrain = (next: TrainId) => {
    if (next === train) return;
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
  };
  const n = base.points[train];
  const L = TRAIN_LEN[train];
  const bustled = t > 0.5;

  // ── Shapes for this frame ──
  const detachable = style === "detachable-train";
  const lift = detachable ? 1 : t;
  const depth = HEM_CURVE + L * (1 - lift);
  const fullness = style === "american" || style === "french" ? 6 * t : 0;
  const hemHalf = HEM_HALF + fullness;

  const overlay: React.ReactNode[] = [];

  if (style === "american") {
    const P = 238;
    // Kept inside the skirt: the outer poufs must not spill past its sides.
    const gap = n === 1 ? 60 : Math.min(30, 96 / (n - 1));
    const xs = spread(n, n === 1 ? 0 : gap * (n - 1));
    const h = (34 + L * 0.5) * t;
    const w = gap * 0.7 + 10;
    // Swags between the hooks, and out to the skirt sides.
    const anchors = [
      { x: CX - halfAt(P + 40, hemHalf) + 6, y: P + 40 },
      ...xs.map((x) => ({ x, y: P })),
      { x: CX + halfAt(P + 40, hemHalf) - 6, y: P + 40 },
    ];
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i];
      const b = anchors[i + 1];
      const sag = (22 + L * 0.35) * t;
      for (const extra of [0, 10]) {
        overlay.push(
          <path
            key={`swag-${i}-${extra}`}
            d={`M${f(a.x)},${f(a.y)} Q${f((a.x + b.x) / 2)},${f(Math.max(a.y, b.y) + sag + extra * t)} ${f(b.x)},${f(b.y)}`}
            fill="none"
            stroke={SHADE}
            strokeWidth={1.1}
            opacity={Math.min(1, t * 2)}
          />
        );
      }
    }
    // Outer poufs first so the centre ones sit on top, like real fabric.
    xs.map((_, i) => i)
      .sort((a, b) => Math.abs(b - (n - 1) / 2) - Math.abs(a - (n - 1) / 2))
      .forEach((i) => {
        const x = xs[i];
        overlay.push(
          <path
            key={`pouf-${i}`}
            d={`M${f(x - 3)},${P} C${f(x - w * 1.15)},${f(P + h * 0.3)} ${f(x - w * 0.95)},${f(P + h)} ${f(x)},${f(P + h)} C${f(x + w * 0.95)},${f(P + h)} ${f(x + w * 1.15)},${f(P + h * 0.3)} ${f(x + 3)},${P} Z`}
            fill={`url(#${uid}-pouf)`}
            stroke={SHADE}
            strokeWidth={1}
            opacity={Math.min(1, t * 2)}
          />,
          <path
            key={`pouf-fold-${i}`}
            d={`M${f(x)},${P + 2} Q${f(x - w * 0.25)},${f(P + h * 0.6)} ${f(x - w * 0.12)},${f(P + h * 0.95)} M${f(x)},${P + 2} Q${f(x + w * 0.3)},${f(P + h * 0.55)} ${f(x + w * 0.2)},${f(P + h * 0.92)}`}
            fill="none"
            stroke={SHADE}
            strokeWidth={0.8}
            opacity={Math.min(1, t * 2) * 0.45}
          />
        );
      });
    xs.forEach((x, i) =>
      overlay.push(<circle key={`pt-${i}`} cx={f(x)} cy={P} r={3.4} fill={GOLD} opacity={0.45 + 0.55 * t} />)
    );
  }

  if (style === "french") {
    const rows = n <= 2 ? 2 : 3;
    const top = 292;
    const rh = ((FLOOR - top - 6) / rows) * t;
    for (let r = 0; r < rows; r++) {
      const y = top + r * rh * 0.8;
      const half = halfAt(y + rh, hemHalf) * (0.52 + r * 0.1);
      const k = 3 + (r % 2);
      const xs = spread(k + 1, half * 2);
      // Arched top, tucked under at the sides; the bottom falls in soft loops.
      let d = `M${f(xs[0])},${f(y + rh * 0.3)} Q${CX},${f(y - rh * 0.25)} ${f(xs[k])},${f(y + rh * 0.3)}`;
      for (let j = k; j > 0; j--) {
        d += ` C${f(xs[j] + 2)},${f(y + rh * 1.1)} ${f(xs[j - 1] - 2)},${f(y + rh * 1.1)} ${f(xs[j - 1])},${f(y + rh * 0.3)}`;
      }
      overlay.push(
        <path
          key={`tier-${r}`}
          d={`${d} Z`}
          fill={`url(#${uid}-pouf)`}
          stroke={SHADE}
          strokeWidth={1}
          opacity={Math.min(1, t * 1.6)}
        />
      );
    }
    spread(n, Math.min(120, 34 * (n - 1))).forEach((x, i) =>
      overlay.push(
        <circle
          key={`tie-${i}`}
          cx={f(x)}
          cy={top - 4}
          r={4.2}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.4}
          strokeDasharray="2.2 2"
          opacity={0.45 + 0.55 * t}
        />
      )
    );
  }

  if (style === "austrian") {
    const top = 250;
    const bottom = FLOOR + depth * 0.95;
    const half = 30;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const y = top + ((bottom - top) * (i + 0.5)) / count;
      const hw = half + (i / count) * 10;
      overlay.push(
        <path
          key={`ruche-${i}`}
          d={`M${f(CX - hw)},${f(y)} Q${CX},${f(y + 11 * t)} ${f(CX + hw)},${f(y)}`}
          fill="none"
          stroke={SHADE}
          strokeWidth={1.2}
          opacity={Math.min(1, t * 1.4)}
        />
      );
    }
    overlay.push(
      <line
        key="cord"
        x1={CX}
        y1={top}
        x2={CX}
        y2={f(bottom)}
        stroke={GOLD}
        strokeWidth={1.2}
        strokeDasharray="3 3"
        opacity={0.35 + 0.5 * t}
      />,
      <circle key="ring" cx={CX} cy={top} r={3.4} fill={GOLD} />
    );
  }

  if (style === "ballroom") {
    const y = 364;
    const half = halfAt(y, hemHalf) * 0.86;
    spread(n, half * 2).forEach((x, i) => {
      const yi = y + 6 * (1 - Math.pow((x - CX) / half, 2));
      overlay.push(
        <path
          key={`fold-${i}`}
          d={`M${f(x)},${f(yi + 4)} q3,${f(14 * t)} 0,${f(28 * t)}`}
          fill="none"
          stroke={SHADE}
          strokeWidth={1.1}
          opacity={t}
        />,
        <circle
          key={`tie-${i}`}
          cx={f(x)}
          cy={f(yi)}
          r={3.8}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.4}
          strokeDasharray="2.2 2"
          opacity={0.45 + 0.55 * t}
        />
      );
    });
  }

  // The detachable train is its own panel over a floor-length gown.
  let trainPanel: React.ReactNode = null;
  if (detachable) {
    const hw = HEM_HALF * 0.76;
    const tip = FLOOR + L + HEM_CURVE;
    const d = [
      `M${CX - 26},${WAIST_Y + 3}`,
      `C${CX - 46},250 ${CX - hw - 4},352 ${CX - hw},${FLOOR}`,
      `C${CX - hw + 2},${f(FLOOR + (tip - FLOOR) * 0.7)} ${CX - 52},${tip} ${CX},${tip}`,
      `C${CX + 52},${tip} ${CX + hw - 2},${f(FLOOR + (tip - FLOOR) * 0.7)} ${CX + hw},${FLOOR}`,
      `C${CX + hw + 4},352 ${CX + 46},250 ${CX + 26},${WAIST_Y + 3}`,
      "Z",
    ].join(" ");
    trainPanel = (
      <g transform={`translate(0 ${f(56 * t)})`} opacity={f(1 - t)}>
        <path d={d} fill="#FFFDF9" stroke={SHADE} strokeWidth={1} />
        <path d={`M${CX},${WAIST_Y + 8} L${CX},${tip - 6}`} stroke={SHADE} strokeWidth={0.8} strokeDasharray="1 5" />
      </g>
    );
    [-18, 0, 18].forEach((dx) =>
      overlay.push(<circle key={`hook-${dx}`} cx={CX + dx} cy={WAIST_Y + 4} r={3.2} fill={GOLD} />)
    );
  }

  const state = bustled ? "bustled for the reception" : "train down for the ceremony";
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-5 lg:gap-16 items-start">
      {/* ── Drawing ── */}
      {/* On phones a tap anywhere on the drawing bustles it too. The button
          below does the same for keyboards and screen readers. */}
      <div ref={drawingRef} className="relative bg-[#1f1b1b] border border-ivory/10" onClick={() => animateTo(bustled ? 0 : 1)}>
        <svg
          viewBox="0 0 360 520"
          className="block w-full h-auto max-h-[46vh] lg:max-h-[70vh]"
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
        >
          <title id={titleId}>{`${info.name} bustle, ${state}`}</title>
          <desc id={descId}>{info.how}</desc>
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
          </defs>
          <rect width="360" height="520" fill={`url(#${uid}-glow)`} />

          {/* Floor shadow */}
          <ellipse cx={CX} cy={f(FLOOR + depth * 0.55)} rx={f(hemHalf + 10)} ry={f(10 + depth * 0.35)} fill="#000" opacity={0.28} />

          {/* Dress form: neck, cap and shoulders */}
          <path d="M168,22 L192,22 L192,52 L168,52 Z" fill="#3d3533" />
          <ellipse cx={CX} cy={22} rx={14} ry={4} fill={GOLD} opacity={0.9} />
          <path d="M168,50 C150,52 128,60 124,76 C122,86 128,98 136,104 L224,104 C232,98 238,86 236,76 C232,60 210,52 192,50 Z" fill="#3d3533" />

          {/* Skirt and train */}
          <path d={gownPath(depth, hemHalf)} fill={`url(#${uid}-silk)`} stroke={SHADE} strokeWidth={1} />
          {!detachable && (
            <path
              d={`M${CX - hemHalf},${FLOOR} Q${CX},${FLOOR + HEM_CURVE * 2} ${CX + hemHalf},${FLOOR}`}
              fill="none"
              stroke={SHADE}
              strokeWidth={1}
              strokeDasharray="3 4"
              opacity={f(Math.max(0, 1 - t * 1.4))}
            />
          )}
          {drapeLines(depth, hemHalf).map((d, i) => (
            <path key={i} d={d} fill="none" stroke={SHADE} strokeWidth={0.8} opacity={0.7} />
          ))}

          {trainPanel}

          {/* Bodice, open V back with straps and covered buttons */}
          <path
            d="M146,150 C142,128 136,108 138,92 L150,56 L156,56 L162,86 Q180,100 198,86 L204,56 L210,56 L222,92 C224,108 218,128 214,150 Z"
            fill="#FFFDF9"
            stroke={SHADE}
            strokeWidth={1}
          />
          {[106, 116, 126, 136, 146].map((y) => (
            <circle key={y} cx={CX} cy={y} r={1.6} fill="#E4DBCF" stroke={SHADE} strokeWidth={0.5} />
          ))}
          <path d={`M${CX - WAIST_HALF},${WAIST_Y} Q${CX},${WAIST_Y + 5} ${CX + WAIST_HALF},${WAIST_Y}`} fill="none" stroke={SHADE} strokeWidth={1} />

          {overlay}
        </svg>

        <p className="absolute left-4 bottom-3 font-jost text-[0.65rem] tracking-[0.18em] uppercase text-ivory/75" aria-hidden="true">
          {bustled ? "Reception" : "Ceremony"}
        </p>
        {/* Phones: the play button sits on the drawing, so the result is always in view. */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="lg:hidden absolute left-1/2 -translate-x-1/2 bottom-2 font-jost text-[0.7rem] tracking-[0.18em] uppercase text-near_black bg-gold px-4 py-2.5 min-h-[40px]"
          onClick={(e) => {
            e.stopPropagation();
            animateTo(bustled ? 0 : 1);
          }}
        >
          {bustled ? "Let it down" : "Bustle it"}
        </button>
        <p className="absolute right-4 bottom-3 font-jost text-[0.65rem] tracking-[0.18em] uppercase text-ivory/75" aria-hidden="true">
          Back view
        </p>
      </div>

      {/* ── Controls and notes ── */}
      <div>
        <fieldset>
          <legend className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-2 lg:mb-3">
            Bustle style
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
            Train length
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
                {label}
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
            {bustled ? "Let it down" : "Bustle it"}
          </button>
          <label className="flex-1 min-w-0">
            <span className="sr-only">Train position, from ceremony to reception</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(t * 100)}
              aria-valuetext={state}
              onChange={(e) => {
                cancelAnimationFrame(raf.current);
                setT(Number(e.target.value) / 100);
              }}
              className="w-full accent-[#7A5F1E] h-11 cursor-pointer"
            />
          </label>
        </div>

        <p className="sr-only" aria-live="polite">
          {`${info.name}, ${state}.`}
        </p>

        <div className="mt-10 border-t border-blush pt-8">
          <h3 className="font-cormorant italic text-charcoal text-3xl">{info.name}</h3>
          <p className="font-jost text-charcoal/75 text-xs mt-1">Also called: {info.alsoCalled}</p>
          <p className="font-jost text-charcoal text-base leading-[1.7] mt-5 max-w-[60ch]">{info.how}</p>
          <dl className="mt-5 space-y-2.5 font-jost text-sm text-charcoal/75 leading-[1.65] max-w-[60ch]">
            <div>
              <dt className="inline font-medium text-charcoal">Typical points: </dt>
              <dd className="inline">
                {info.typicalPoints}
                {n > 1 && ` (${n} in this drawing)`}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-charcoal">Best for: </dt>
              <dd className="inline">{info.bestFor}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-charcoal">Fabric: </dt>
              <dd className="inline">{info.fabricNotes}</dd>
            </div>
          </dl>
          <p className="font-jost text-charcoal/75 text-xs mt-6 flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2">
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="3.5" fill={GOLD} /></svg>
              Hook on top
            </span>
            <span className="inline-flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.2" fill="none" stroke={GOLD} strokeWidth="1.4" strokeDasharray="2.2 2" /></svg>
              Tied underneath
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
