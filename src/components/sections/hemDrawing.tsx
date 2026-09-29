/**
 * The drawing behind the hem explorer: one trouser leg from the side, over a
 * shoe, facing left.
 *
 * The leg hangs straight from the knee. What changes is how much fabric is
 * left over once the front of the hem meets the shoe (the "excess"): with
 * none, the hem skims the shoe; with more, the front has nowhere to go but
 * forward, so it buckles into a fold above the shoe while the back, which
 * hangs free, simply drops lower down the heel. Every shape here is drawn
 * from a handful of numbers (Geo), so the explorer can ease between two
 * lengths by easing those numbers.
 */

import type { BreakId, LegId, ShoeId } from "./HemExplorer";

type Pt = { x: number; y: number };
type Cubic = [Pt, Pt, Pt, Pt];

export const GOLD = "#C9A84C";
export const SHADE = "rgba(28,28,28,0.22)";
/** The visible part of the drawing, in viewBox units. */
export const VIEW = { x: 30, y: 150, w: 480, h: 318 };
export const FLOOR = 440;
/** The trouser starts above the top of the view. */
const TOP = 120;
/** Center of the leg: over the ankle, toward the back of the shoe. */
const CX = 297;

export const f = (n: number) => Math.round(n * 10) / 10;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const P = (p: Pt) => `${f(p.x)},${f(p.y)}`;
const pt = (x: number, y: number): Pt => ({ x, y });

function cubicAt([p0, c1, c2, p3]: Cubic, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
  };
}

/** Samples a run of curves into points sorted front to back, for looking up a height. */
function profile(curves: Cubic[]): Pt[] {
  const pts: Pt[] = [];
  for (const c of curves) for (let i = 0; i <= 24; i++) pts.push(cubicAt(c, i / 24));
  return pts.sort((a, b) => a.x - b.x);
}

/** The height of a sampled surface at x. */
function yAt(pts: Pt[], x: number) {
  if (x <= pts[0].x) return pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].x >= x) {
      const a = pts[i - 1];
      const b = pts[i];
      return lerp(a.y, b.y, (x - a.x) / (b.x - a.x || 1));
    }
  }
  return pts[pts.length - 1].y;
}

// ── Shoes ───────────────────────────────────────────────────────────────────

interface ShoeSpec {
  /** The top of the shoe (or foot) where the front of the hem comes to rest. */
  top: Pt[];
  /** Where the back of the hem sits for no, quarter, half and full break. */
  back: [number, number, number, number];
  /** The shoe's silhouette, for the shadow the hem casts on it. */
  outline: string;
}

const BREAK_INDEX: Record<BreakId, number> = { none: 0, quarter: 1, half: 2, full: 3 };

// Dress shoe: a cap-toe oxford on a stacked leather heel.
const DRESS_TOE: Cubic = [pt(92, 432), pt(90, 417), pt(104, 405), pt(132, 400)];
const DRESS_VAMP: Cubic = [pt(132, 400), pt(160, 395), pt(196, 393), pt(222, 388)];
const DRESS_LACES: Cubic = [pt(222, 388), pt(238, 385), pt(251, 380), pt(262, 375)];
const DRESS_OUTLINE = [
  "M92,432",
  "C90,417 104,405 132,400",
  "C160,395 196,393 222,388",
  "C238,385 251,380 262,375",
  "C280,382 300,387 322,387",
  "C337,387 348,384 356,379",
  "C364,391 367,409 361,421",
  "L359,440 L301,440 L303,424",
  "C268,425 228,433 196,440",
  "L118,440 C102,440 93,438 92,432 Z",
].join(" ");

// Sneaker: a plain leather low-top on a thick cupsole.
const SNEAKER_TOE: Cubic = [pt(96, 424), pt(92, 407), pt(106, 394), pt(136, 390)];
const SNEAKER_VAMP: Cubic = [pt(136, 390), pt(168, 386), pt(204, 383), pt(228, 378)];
const SNEAKER_LACES: Cubic = [pt(228, 378), pt(242, 375), pt(254, 369), pt(264, 362)];
const SNEAKER_OUTLINE = [
  "M96,424",
  "C92,407 106,394 136,390",
  "C168,386 204,383 228,378",
  "C242,375 254,369 264,362",
  "C284,370 306,375 324,374",
  "C340,373 352,366 360,359",
  "C370,371 374,396 371,418",
  "C375,426 375,440 360,440",
  "L112,440 C96,440 90,432 93,424 Z",
].join(" ");

// Heel: a pointed pump on a slim heel. The foot shows above its low throat.
const PUMP_TOE: Cubic = [pt(70, 436), pt(95, 430), pt(130, 420), pt(160, 416)];
const FOOT_INSTEP: Cubic = [pt(160, 416), pt(188, 405), pt(214, 385), pt(234, 362)];
const FOOT_ANKLE: Cubic = [pt(234, 362), pt(247, 346), pt(256, 330), pt(258, 306)];
const PUMP_BODY = [
  "M70,436",
  "C95,430 130,420 160,416",
  "C168,414 175,412 181,410",
  "C230,404 298,372 330,336",
  "C338,328 346,322 352,319",
  "C360,330 363,352 356,369",
  "L322,377",
  "C282,388 214,420 168,436",
  "L112,439 C92,439 76,438 70,436 Z",
].join(" ");
const PUMP_HEEL = "M356,368 C353,396 350,420 350,437 L342,437 C342,420 338,398 322,377 Z";

export const SHOES: Record<ShoeId, ShoeSpec> = {
  dress: {
    top: profile([DRESS_TOE, DRESS_VAMP, DRESS_LACES]),
    back: [384, 392, 401, 413],
    outline: DRESS_OUTLINE,
  },
  sneaker: {
    top: profile([SNEAKER_TOE, SNEAKER_VAMP, SNEAKER_LACES]),
    back: [368, 379, 391, 405],
    outline: SNEAKER_OUTLINE,
  },
  heel: {
    top: profile([PUMP_TOE, FOOT_INSTEP, FOOT_ANKLE]),
    back: [384, 396, 410, 424],
    outline: `${PUMP_BODY} ${PUMP_HEEL}`,
  },
};

// ── Legs ────────────────────────────────────────────────────────────────────

/**
 * Width is the leg's depth at the hem, seen from the side. `give` is how much
 * of a given break actually shows: a slim opening sits right on the shoe and
 * buckles; a wide one falls past it and barely folds.
 */
const LEGS: Record<LegId, { w: number; taper: number; give: number }> = {
  slim: { w: 150, taper: 26, give: 1.15 },
  straight: { w: 172, taper: 8, give: 1 },
  wide: { w: 214, taper: -4, give: 0.55 },
};

/** Fabric left over at the front once the hem meets the shoe. */
const EXCESS: Record<BreakId, number> = { none: 0, quarter: 6, half: 15, full: 28 };

// ── Geometry ────────────────────────────────────────────────────────────────

export interface Geo {
  /** Front and back edges of the leg just above the break, and at the top. */
  xF: number;
  xB: number;
  xFt: number;
  xBt: number;
  /** Front of the hem, resting on the shoe. */
  xHF: number;
  yHF: number;
  /** Back of the hem. */
  yHB: number;
  /** Fabric left over at the front, which becomes the fold. */
  e: number;
}

export function targetGeo(brk: BreakId, shoe: ShoeId, leg: LegId, slanted: boolean): Geo {
  const spec = SHOES[shoe];
  const L = LEGS[leg];
  const xF = CX - L.w / 2;
  const xB = CX + L.w / 2;
  // A slanted hem is cut shorter at the front and longer at the back.
  const e = Math.max(0, EXCESS[brk] * L.give - (slanted ? 3 : 0));
  const xHF = xF - e * 0.3;
  const rest = yAt(spec.top, xHF);
  // No break hovers a hair above the shoe; with a break the hem sits on it.
  const lift = e < 2 ? 2.5 - e * 1.25 : 0;
  const yHF = rest - lift - (slanted && e < 2 ? 3 : 0) + Math.min(1.5, e * 0.06);
  const yHB = spec.back[BREAK_INDEX[brk]] + (leg === "wide" ? 3 : 0) + (slanted ? 8 : 0);
  return { xF, xB, xFt: xF - L.taper / 2, xBt: xB + L.taper / 2, xHF, yHF, yHB, e };
}

export function lerpGeo(a: Geo, b: Geo, t: number): Geo {
  const out = {} as Geo;
  for (const k of Object.keys(a) as (keyof Geo)[]) out[k] = lerp(a[k], b[k], t);
  return out;
}

/** Every line of the trouser, worked out from a Geo. */
function trouser(g: Geo) {
  const w = g.xB - g.xF;
  const b = g.e * 0.5; // how far the fold stands forward
  const drop = 5 + g.e * 1.15; // fold height above the front of the hem
  const yFold = g.yHF - drop;
  const rise = 12 + g.e * 0.9;
  const yA = yFold - rise;
  const apex = pt(g.xF - b, yFold);
  const hemF = pt(g.xHF, g.yHF);
  const hemB = pt(g.xB, g.yHB);

  // Below the fold the fabric tucks back in, then comes out to the hem on the shoe.
  const lower: Cubic = [apex, pt(apex.x + b * 0.08, yFold + drop * 0.45), pt(g.xHF + b * 0.3, g.yHF - drop * 0.3), hemF];
  // The hem's near edge dips a touch as it wraps round the leg.
  const hem: Cubic = [
    hemF,
    pt(lerp(hemF.x, hemB.x, 1 / 3), lerp(hemF.y, hemB.y, 1 / 3) + 3),
    pt(lerp(hemF.x, hemB.x, 2 / 3), lerp(hemF.y, hemB.y, 2 / 3) + 3),
    hemB,
  ];
  const hemYAt = (x: number) => cubicAt(hem, clamp01((x - hemF.x) / (hemB.x - hemF.x))).y;

  const outline = [
    `M${f(g.xFt)},${TOP}`,
    `L${f(g.xF)},${f(yA)}`,
    `C${f(g.xF)},${f(yA + rise * 0.55)} ${f(apex.x)},${f(yFold - rise * 0.3)} ${P(apex)}`,
    `C${P(lower[1])} ${P(lower[2])} ${P(hemF)}`,
    `C${P(hem[1])} ${P(hem[2])} ${P(hemB)}`,
    `L${f(g.xBt)},${TOP}`,
    "Z",
  ].join(" ");

  const hemLine = `M${P(hemF)} C${P(hem[1])} ${P(hem[2])} ${P(hemB)}`;

  // The pressed front crease, just inside the front edge: straight down the
  // leg, then pushed forward by the fold and bent back under it.
  const k = clamp01(g.e / 10);
  const c = w * 0.13;
  const cApex = apex.x + c * (1 - 0.15 * k);
  const cEnd = g.xHF + c * (1 - 0.2 * k);
  const crease = [
    `M${f(g.xFt + c * 1.1)},${TOP}`,
    `L${f(g.xF + c)},${f(yA)}`,
    `C${f(g.xF + c)},${f(yA + rise * 0.55)} ${f(cApex)},${f(yFold - rise * 0.3)} ${f(cApex)},${f(yFold + 0.5)}`,
    `Q${f(lerp(cApex, cEnd, 0.5) + b * 0.35)},${f(yFold + drop * 0.55)} ${f(cEnd)},${f(hemYAt(cEnd) - 1.5)}`,
  ].join(" ");

  // The fold itself: a ridge from the front edge running back round the leg
  // and fading out, with shadow where the fabric turns under.
  const foldCurve: Cubic = [
    pt(apex.x + 0.5, yFold),
    pt(apex.x + w * 0.12, yFold + 0.5),
    pt(g.xF + w * 0.2, yFold + 1 + g.e * 0.1),
    pt(g.xF + w * (0.24 + g.e * 0.004), yFold + 4 + g.e * 0.5),
  ];
  const foldEnd = foldCurve[3];
  const under = cubicAt(lower, 0.5);
  const shadow = [
    `M${P(foldCurve[0])}`,
    `C${P(foldCurve[1])} ${P(foldCurve[2])} ${P(foldEnd)}`,
    `C${f(foldEnd.x - w * 0.04)},${f(foldEnd.y + drop * 0.15)} ${f(under.x + w * 0.08)},${f(under.y + 1)} ${P(under)}`,
    `Q${f(apex.x + b * 0.05)},${f((yFold + under.y) / 2)} ${P(foldCurve[0])}`,
    "Z",
  ].join(" ");
  const fold = tapered(foldCurve, 0.7 + g.e * 0.035);
  const ridge = tapered(foldCurve, 0.8, -1.8);
  // A second, softer ripple below a deep fold.
  const r0 = cubicAt(lower, 0.7);
  const rEnd = pt(r0.x + w * 0.2, Math.min(hemYAt(r0.x + w * 0.2) - 3, r0.y + 4 + g.e * 0.15));
  const ripple = tapered([pt(r0.x + 1, r0.y), pt(r0.x + w * 0.09, r0.y + 0.5), pt(r0.x + w * 0.15, r0.y + 1.5), rEnd], 0.6);

  return { outline, hemLine, crease, fold, ridge, shadow, ripple, apex, hemF, hemB, yFold, w };
}

/** A line drawn as a sliver that is widest at its start and tapers to nothing. */
function tapered(c: Cubic, half: number, dy = 0) {
  const n = 14;
  const upper: string[] = [];
  const lowerEdge: string[] = [];
  for (let i = 0; i <= n; i++) {
    const p = cubicAt(c, i / n);
    const h = half * Math.pow(1 - i / n, 1.2);
    upper.push(`${f(p.x)},${f(p.y + dy - h)}`);
    lowerEdge.unshift(`${f(p.x)},${f(p.y + dy + h)}`);
  }
  return `M${upper.join(" L")} L${lowerEdge.join(" L")} Z`;
}

// ── Drawing ─────────────────────────────────────────────────────────────────

export function HemDrawing({
  geo,
  brk,
  shoe,
  fadingShoe,
  uid,
}: {
  geo: Geo;
  /** The chosen break, for the label; the drawing itself follows geo. */
  brk: BreakId;
  shoe: ShoeId;
  /** The shoe being swapped out, fading away on top of the new one. */
  fadingShoe?: { id: ShoeId; opacity: number } | null;
  uid: string;
}) {
  const t = trouser(geo);
  const foldOn = clamp01(geo.e / 7);
  const deep = clamp01((geo.e - 16) / 10);
  const hasBreak = geo.e > 0.8;

  const breakTarget = hasBreak ? pt(t.apex.x - 3, t.yFold) : pt(t.hemF.x - 3, t.hemF.y);
  const label = { x: 58, y: 322 };

  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-cloth`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="45%" stopColor="#F7F1E9" />
          <stop offset="100%" stopColor="#E0D6C8" />
        </linearGradient>
        <clipPath id={`${uid}-shoe-clip`}>
          <path d={SHOES[shoe].outline} />
        </clipPath>
        <filter id={`${uid}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id={`${uid}-blur`} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <ShoeDefs uid={uid} />
      </defs>

      {/* Floor */}
      <ellipse cx={228} cy={FLOOR + 1} rx={168} ry={7} fill="#000" opacity={0.38} />
      <line x1={VIEW.x + 20} y1={FLOOR + 0.5} x2={VIEW.x + VIEW.w - 20} y2={FLOOR + 0.5} stroke="rgba(250,247,242,0.07)" />

      <Ankle shoe={shoe} uid={uid} />
      <Shoe id={shoe} uid={uid} />
      {fadingShoe && fadingShoe.id !== shoe && (
        <g opacity={f(fadingShoe.opacity * 100) / 100}>
          <Shoe id={fadingShoe.id} uid={uid} />
        </g>
      )}

      {/* The shadow the hem casts on the shoe. */}
      <g clipPath={`url(#${uid}-shoe-clip)`}>
        <path d={t.hemLine} transform="translate(2 4)" fill="none" stroke="#000" strokeWidth={7} opacity={0.45} filter={`url(#${uid}-soft)`} />
      </g>

      <g data-testid="hem-trouser">
        <path d={t.outline} fill={`url(#${uid}-cloth)`} stroke={SHADE} strokeWidth={1} />
        {hasBreak && <path d={t.shadow} fill="rgb(70,52,36)" opacity={f(foldOn * 0.2)} filter={`url(#${uid}-blur)`} />}
        <path d={t.crease} fill="none" stroke="rgba(28,28,28,0.28)" strokeWidth={0.9} />
        <path d={t.crease} transform="translate(1.1 0)" fill="none" stroke="#FFFFFF" strokeWidth={0.8} opacity={0.9} />
        {hasBreak && (
          <>
            <path d={t.ridge} fill="#FFFFFF" opacity={f(foldOn * 0.9)} />
            <path d={t.fold} fill="rgba(40,30,22,0.42)" opacity={f(foldOn)} />
            <path d={t.ripple} fill="rgba(40,30,22,0.3)" opacity={f(deep)} />
          </>
        )}
        {/* Hem edge, a little darker where the fabric turns up inside. */}
        <path d={t.hemLine} fill="none" stroke="rgba(28,28,28,0.3)" strokeWidth={1.1} />
      </g>

      {/* ── Labels ── */}
      <g fontFamily="sans-serif" fontSize={12.5} letterSpacing={2}>
        <path
          d={`M${label.x},${label.y + 7} L${label.x + (brk === "none" ? 88 : 56)},${label.y + 7} L${f(breakTarget.x)},${f(breakTarget.y)}`}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.8}
          opacity={0.85}
        />
        <circle cx={f(breakTarget.x)} cy={f(breakTarget.y)} r={2.6} fill={GOLD} />
        <text x={label.x} y={label.y} fill="rgba(250,247,242,0.72)">
          {brk === "none" ? "NO BREAK" : "BREAK"}
        </text>

        <path
          d={`M${f(t.hemB.x + 5)},${f(t.hemB.y)} L${f(t.hemB.x + 26)},${f(t.hemB.y)}`}
          stroke={GOLD}
          strokeWidth={0.9}
          strokeDasharray="3 2.5"
        />
        <circle cx={f(t.hemB.x)} cy={f(t.hemB.y)} r={2.6} fill={GOLD} />
        <text x={f(t.hemB.x + 31)} y={f(t.hemB.y + 4.5)} fill="rgba(250,247,242,0.72)">
          HEM
        </text>
      </g>
    </g>
  );
}

// ── Shoe drawings ───────────────────────────────────────────────────────────

function ShoeDefs({ uid }: { uid: string }) {
  return (
    <>
      <linearGradient id={`${uid}-leather`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#8A5A3E" />
        <stop offset="55%" stopColor="#6A432E" />
        <stop offset="100%" stopColor="#4A2E20" />
      </linearGradient>
      <linearGradient id={`${uid}-canvas`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#8E8680" />
        <stop offset="100%" stopColor="#625A55" />
      </linearGradient>
      <linearGradient id={`${uid}-rubber`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#EFE8DE" />
        <stop offset="100%" stopColor="#C9BFB2" />
      </linearGradient>
      <linearGradient id={`${uid}-wine`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#9A4650" />
        <stop offset="55%" stopColor="#7A303A" />
        <stop offset="100%" stopColor="#56202A" />
      </linearGradient>
      <linearGradient id={`${uid}-skin`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stopColor="#C9A48E" />
        <stop offset="100%" stopColor="#A9856F" />
      </linearGradient>
    </>
  );
}

/** The leg inside the trouser: a dark sock, or the foot above a pump. */
function Ankle({ shoe, uid }: { shoe: ShoeId; uid: string }) {
  if (shoe === "heel") {
    return (
      <path
        d={[
          "M160,416",
          `C${P(FOOT_INSTEP[1])} ${P(FOOT_INSTEP[2])} ${P(FOOT_INSTEP[3])}`,
          `C${P(FOOT_ANKLE[1])} ${P(FOOT_ANKLE[2])} ${P(FOOT_ANKLE[3])}`,
          "C259,300 260,290 261,280 L338,280 C338,290 339,296 342,300 C348,314 354,322 354,340 L330,368 L250,398 L200,410 Z",
        ].join(" ")}
        fill={`url(#${uid}-skin)`}
      />
    );
  }
  const top = shoe === "sneaker" ? 364 : 377;
  return (
    <path
      d={`M258,${top + 4} C256,340 256,300 257,280 L341,280 C341,300 344,340 356,${top + 6} Z`}
      fill="#2E2725"
    />
  );
}

function Shoe({ id, uid }: { id: ShoeId; uid: string }) {
  if (id === "sneaker") return <Sneaker uid={uid} />;
  if (id === "heel") return <Pump uid={uid} />;
  return <DressShoe uid={uid} />;
}

const SEAM = "rgba(20,10,5,0.4)";
const SHINE = "rgba(255,236,214,0.32)";

function DressShoe({ uid }: { uid: string }) {
  return (
    <g>
      <path d={DRESS_OUTLINE} fill={`url(#${uid}-leather)`} />
      {/* Stacked heel and sole. */}
      <path d="M303,421 L361,421 L359,440 L301,440 Z" fill="#2B1D16" />
      <path d="M302,427.5 L360.5,427.5 M301.5,434 L359.8,434" stroke="rgba(255,236,214,0.12)" strokeWidth={0.8} />
      <path
        d="M92,432 C93,437 102,440 118,440 L196,440 C228,433 268,425 303,424 L303,420 C268,421 229,429 197,436 L120,436 C106,436 97,434 94,428 Z"
        fill="#2B1D16"
      />
      {/* Welt stitching. */}
      <path d="M97,431 C104,434 110,434 120,434 L197,434 C228,427 266,419 302,418" fill="none" stroke="rgba(255,236,214,0.2)" strokeWidth={0.7} strokeDasharray="1.6 1.8" />
      {/* Cap toe, with a line of broguing. */}
      <path d="M158,397 C148,406 139,419 136,434" fill="none" stroke={SEAM} strokeWidth={1} />
      <path d="M163,398 C153,407 145,419 142,433" fill="none" stroke="rgba(255,236,214,0.18)" strokeWidth={1} strokeDasharray="0.1 3" strokeLinecap="round" />
      {/* Toe shine. */}
      <path d="M104,414 C112,406 124,402 140,400" fill="none" stroke={SHINE} strokeWidth={2.2} strokeLinecap="round" />
      {/* Lacing: the facing, eyelets and laces. */}
      <path d="M224,392 C236,389 250,383 264,377" fill="none" stroke={SEAM} strokeWidth={1} />
      <path d="M226,391 C236,404 252,414 276,420" fill="none" stroke={SEAM} strokeWidth={0.9} />
      {[0, 1, 2, 3].map((i) => {
        const x = 230 + i * 9;
        const y = 388 - i * 3.6;
        return <circle key={i} cx={x} cy={y} r={1.1} fill="rgba(255,236,214,0.4)" />;
      })}
      <path d="M229,387 L239,383 M238,384 L248,379.5 M247,380.5 L257,375.5" stroke="#241712" strokeWidth={1.3} strokeLinecap="round" />
      {/* Topline and heel counter. */}
      <path d="M262,375 C280,382 300,387 322,387 C337,387 348,384 356,379" fill="none" stroke="#2B1D16" strokeWidth={2} />
      <path d="M344,387 C338,398 337,410 340,421" fill="none" stroke={SEAM} strokeWidth={0.9} />
    </g>
  );
}

function Sneaker({ uid }: { uid: string }) {
  return (
    <g>
      <path d={SNEAKER_OUTLINE} fill={`url(#${uid}-canvas)`} />
      {/* Cupsole. */}
      <path d="M93,423 C150,421 300,419 371,416 C375,426 375,440 360,440 L112,440 C96,440 90,432 93,423 Z" fill={`url(#${uid}-rubber)`} />
      <path d="M96,431 C160,429 300,427 372,425" fill="none" stroke="rgba(28,28,28,0.18)" strokeWidth={0.9} />
      <path d="M100,438.5 L366,438.5" stroke="#8C8176" strokeWidth={3} strokeLinecap="round" />
      {/* Toe cap and eyestay. */}
      <path d="M140,390 C129,399 122,410 121,422" fill="none" stroke="rgba(20,20,20,0.3)" strokeWidth={1} />
      <path d="M224,381 C240,398 270,410 318,414" fill="none" stroke="rgba(20,20,20,0.3)" strokeWidth={1} />
      <path d="M108,410 C116,400 128,394 144,392" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={233 + i * 8.5} cy={380 - i * 4} r={1.3} fill="#EFE8DE" opacity={0.8} />
      ))}
      <path d="M232,379 L242,375 M241,376 L250,371 M249,372 L258,367" stroke="#EFE8DE" strokeWidth={1.2} strokeLinecap="round" opacity={0.75} />
      {/* Padded collar and heel tab. */}
      <path d="M264,362 C284,370 306,375 324,374 C340,373 352,366 360,359" fill="none" stroke="#4E4743" strokeWidth={3} />
      <path d="M352,366 C360,382 364,400 364,417" fill="none" stroke="rgba(20,20,20,0.28)" strokeWidth={1} />
      <path d="M358,357 L364,354 C368,362 370,368 369,372 Z" fill="#4E4743" />
    </g>
  );
}

function Pump({ uid }: { uid: string }) {
  return (
    <g>
      <path d={PUMP_HEEL} fill="#4E1C24" />
      <path d="M342,435 L350,435 L350,440 L342,440 Z" fill="#2B1D16" />
      <path d={PUMP_BODY} fill={`url(#${uid}-wine)`} />
      {/* Sole edge and the line of the throat. */}
      <path d="M322,377 C282,388 214,420 168,436 L112,439 C92,439 76,438 70,436" fill="none" stroke="#2B1216" strokeWidth={1.8} />
      <path d="M160,416 C168,414 175,412 181,410 C230,404 298,372 330,336 C338,328 346,322 352,319" fill="none" stroke="#3E1419" strokeWidth={1.4} />
      <path d="M88,431 C106,425 128,419 150,417" fill="none" stroke="rgba(255,236,236,0.4)" strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}
