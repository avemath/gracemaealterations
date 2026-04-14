"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";

export interface ProcessStep {
  title: string;
  body: string;
  note?: string | null;
}

interface ProcessStepsProps {
  sectionLabel: string;
  heading: string;
  ctaText: string;
  steps: ProcessStep[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

// ── Thread path ────────────────────────────────────────────────────────────
//
// ViewBox "0 0 300 200". Grid: 3 columns × 2 rows (100 SVG units each).
//
// ENTRY  — two-segment S-wave coming in from upper-left. The second segment's
//   last control at (4,46) means the thread arrives nearly horizontal so the
//   junction with row 1 is smooth (no visible kink).
//
// ROW 1/2 — single cubic with P1 *above* baseline and P2 *below* so the
//   thread makes one gentle wave up then down (like a real loose strand).
//   Row 2 mirrors row 1 shifted +100 in y.
//
// U-TURNS — x=316 / x=-16 for generous, well-rounded hooks.
// CONNECTOR — bows to y=105, stays in the visible gap zone (y=94–106).
const THREAD_PATH =
  "M -10,2 " +
  "C 0,8 2,18 -4,26 " +
  "C -10,34 4,46 6,46 " +
  "C 70,34 220,58 294,46 " +     // row 1: wave ±12 above/below y=46
  "C 316,46 316,100 294,100 " +
  "C 200,82 80,118 6,100 " +   // S-curve connector: rises right, dips left
  "C -16,100 -16,146 6,146 " +
  "C 70,134 220,158 294,146 " +  // row 2: wave ±12 above/below y=146
  "C 308,146 316,172 306,190 " + // trail: curves right and down out of block 6
  "C 296,208 264,216 230,216";   // trail: curves left below block 6

// ── Pierce points ──────────────────────────────────────────────────────────
//
// cy values from cubic C 70,34 220,58 294,46 (P0=(6,46)…P3=(294,46)):
//   x=92  → y≈45 (thread is above baseline — P1 pulls it up)
//   x=192 → y≈48 (thread is below baseline — P2 pushes it down)
//
// Row 2 note: block 4 entry cx=4 (inside the left U-turn arc, before the row
// reaches x=6) so the thread disappears well to the left of "The Work" title.
const PIERCE_POINTS = [
  // Row 1
  // Entries of blocks 1/2/3: pierce marks are placed deeper into the LEFT side
  // of each block so the visible inter-block stitch segment is ~27 SVG units.
  // Exits of blocks 2/3 shifted LEFT so the visible segment ends right at each
  // block's left visual edge — no thread visible inside the block to the right.
  { cx: 8,   cy: 46,  threshold: 0.03 }, // enter block 1
  { cx: 72,  cy: 43,  threshold: 0.10 }, // exit  block 1  (shifted left from 84)
  { cx: 100, cy: 43,  threshold: 0.11 }, // enter block 2  (at column 1–2 boundary)
  { cx: 173, cy: 47,  threshold: 0.21 }, // exit  block 2  (shifted left from 184)
  { cx: 200, cy: 49,  threshold: 0.22 }, // enter block 3  (at block 3 left edge)
  { cx: 282, cy: 47,  threshold: 0.30 }, // exit  block 3  (shifted left from 288)
  // Row 2 — same strategy
  { cx: 4,   cy: 146, threshold: 0.72 }, // enter block 4 (far-left, on U-turn)
  { cx: 72,  cy: 143, threshold: 0.78 }, // exit  block 4  (shifted left from 84)
  { cx: 100, cy: 143, threshold: 0.82 }, // enter block 5  (at column boundary)
  { cx: 173, cy: 147, threshold: 0.88 }, // exit  block 5
  { cx: 200, cy: 149, threshold: 0.91 }, // enter block 6
  { cx: 282, cy: 147, threshold: 0.97 }, // exit  block 6
] as const;

// ── Block body rectangles ──────────────────────────────────────────────────
//
// Same extents as the stitch-mask black rects. Used imperatively to hide the
// needle when it is inside a block (mask="url(#stitch-mask)" on the needle <g>
// doesn't work because maskUnits="userSpaceOnUse" evaluates in the SVG root
// frame, not in the translated group frame).
const BLOCK_BODIES = [
  { x1: 8,   y1: 0,   x2: 72,  y2: 94  }, // exit at cx=72
  { x1: 100, y1: 0,   x2: 173, y2: 94  }, // entry at cx=100, exit at cx=173
  { x1: 200, y1: 0,   x2: 282, y2: 94  },
  { x1: 4,   y1: 106, x2: 72,  y2: 200 }, // exit at cx=72
  { x1: 100, y1: 106, x2: 173, y2: 200 }, // entry at cx=100, exit at cx=173
  { x1: 200, y1: 106, x2: 282, y2: 200 },
];

export default function ProcessSteps({
  sectionLabel,
  heading,
  ctaText,
  steps,
}: ProcessStepsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  // ── Scroll driver ──────────────────────────────────────────────
  // offset ["start 0.8", "end 0.45"]:
  //   v=0 → grid 20% into viewport (row 1 well-visible, start late)
  //   v=1 → grid bottom at 45% from viewport top (row 2 centred, end early)
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start 0.65", "end 0.45"],
  });

  // ── SVG refs ───────────────────────────────────────────────────
  const threadPathRef      = useRef<SVGPathElement>(null);
  const needleRef          = useRef<SVGGElement>(null);
  const threadLenRef       = useRef(0);
  const pierceRefsArr      = useRef<(SVGGElement | null)[]>([]);
  // Thresholds computed dynamically from actual path geometry so they stay
  // accurate when the path length changes (e.g. after adding the trail).
  const pierceThresholdsRef = useRef<number[]>(PIERCE_POINTS.map(p => p.threshold));

  useEffect(() => {
    // Use rAF so the SVG is laid out before we call getTotalLength().
    // Without this, the browser may return 0 before paint, which sets
    // strokeDasharray/offset to "0" (overrides the SVG attributes) and
    // makes the thread render solid from the start.
    const init = () => {
      const path = threadPathRef.current;
      if (!path) return;
      const len = path.getTotalLength();
      if (len <= 0) { requestAnimationFrame(init); return; }
      threadLenRef.current = len;

      // Walk the path at 800 steps and find the v value where the thread tip
      // is closest to each pierce point's (cx, cy). This gives exact thresholds
      // that automatically account for the actual path length.
      const computed: number[] = [];
      for (const { cx, cy } of PIERCE_POINTS) {
        let bestV = 0, bestDist = Infinity;
        for (let i = 0; i <= 800; i++) {
          const frac = i / 800;
          const p = path.getPointAtLength(frac * len);
          const d = Math.hypot(p.x - cx, p.y - cy);
          if (d < bestDist) { bestDist = d; bestV = frac; }
        }
        computed.push(bestV);
      }
      pierceThresholdsRef.current = computed;

      // Apply current scroll immediately so a mid-scroll page load looks right
      const v = Math.max(0, Math.min(1, scrollYProgress.get()));
      path.style.strokeDasharray  = String(len);
      path.style.strokeDashoffset = String(len * (1 - v));

      PIERCE_POINTS.forEach((_pt, i) => {
        const el = pierceRefsArr.current[i];
        if (el) el.style.opacity = v >= computed[i] ? "1" : "0";
      });
    };
    requestAnimationFrame(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mobile line ref ────────────────────────────────────────────
  const mobileLineRef = useRef<HTMLDivElement>(null);

  // ── Scroll handler ─────────────────────────────────────────────
  useMotionValueEvent(scrollYProgress, "change", (raw) => {
    const v = Math.max(0, Math.min(1, raw));

    const path     = threadPathRef.current;
    const totalLen = threadLenRef.current;
    if (path && totalLen > 0) {
      path.style.strokeDashoffset = String(totalLen * (1 - v));

      // Needle — stays on main thread path the whole way.
      // BLOCK_BODIES check hides it inside blocks; once past cx=282 (block 6 exit)
      // it becomes visible on the straight piece before the trail begins.
      const needle = needleRef.current;
      if (needle) {
        const dist = v * totalLen;
        const pt   = path.getPointAtLength(dist);
        const pt2  = path.getPointAtLength(Math.min(dist + 1.5, totalLen));
        needle.setAttribute(
          "transform",
          `translate(${pt.x},${pt.y}) rotate(${Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI})`
        );
        const isInBlock = BLOCK_BODIES.some(
          b => pt.x >= b.x1 && pt.x <= b.x2 && pt.y >= b.y1 && pt.y <= b.y2
        );
        needle.style.opacity = (!isInBlock && v > 0) ? "1" : "0";
      }
    }

    const thresholds = pierceThresholdsRef.current;
    PIERCE_POINTS.forEach((_pt, i) => {
      const el = pierceRefsArr.current[i];
      if (el) el.style.opacity = v >= thresholds[i] ? "1" : "0";
    });

    if (mobileLineRef.current) {
      mobileLineRef.current.style.height = `${v * 100}%`;
    }
  });

  return (
    <section
      ref={sectionRef}
      className="bg-near_black py-16 lg:py-24 px-6"
      aria-labelledby="process-heading"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-14 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
        >
          <p className="section-label text-gold/70 mb-4">{sectionLabel}</p>
          <h2
            id="process-heading"
            className="font-cormorant italic text-ivory text-4xl lg:text-5xl mb-5"
          >
            {heading}
          </h2>
          <div className="w-12 h-px bg-gold mx-auto" aria-hidden="true" />
        </motion.div>

        <div ref={gridRef}>

          {/* ── Desktop: 3×2 grid + thread overlay ──────────── */}
          <div className="hidden md:block relative">
            <div className="grid grid-cols-3 gap-px bg-ivory/8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeUp}
                  viewport={{ once: true, margin: "-40px" }}
                  className="group relative bg-near_black p-8 lg:p-10 flex flex-col gap-4 cursor-default transition-colors duration-300 hover:bg-ivory/[0.04]"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <p
                    className="font-cormorant font-light leading-none transition-colors duration-400"
                    style={{
                      fontSize: "4.5rem",
                      color: hovered === i
                        ? "rgba(201,168,76,0.55)"
                        : "rgba(201,168,76,0.45)",
                    }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>

                  <div className="flex items-center gap-2">
                    <div
                      className="h-px bg-gold transition-all duration-400"
                      style={{ width: hovered === i ? "2.5rem" : "1.5rem" }}
                      aria-hidden="true"
                    />
                    {step.note && (
                      <span className="font-jost text-[0.65rem] tracking-[0.18em] uppercase text-gold/70 border border-gold/35 px-1.5 py-0.5">
                        {step.note}
                      </span>
                    )}
                  </div>

                  <h3 className="font-cormorant italic text-ivory text-xl leading-snug">
                    {step.title}
                  </h3>
                  <p className="font-jost text-ivory/45 text-sm leading-relaxed">
                    {step.body}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* SVG thread overlay — overflow-visible for entry/U-turn overhang */}
            <svg
              viewBox="0 0 300 200"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <filter id="needle-glow" x="-150%" y="-400%" width="400%" height="900%">
                  {/* Asymmetric blur: tighter in x (3px/SVG-unit) than y (2px/unit)
                      so the glow stays needle-shaped rather than boxy */}
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.35 0.6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="thread-glow" x="-5%" y="-300%" width="110%" height="700%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="pierce-hole" x="-120%" y="-300%" width="340%" height="700%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="shadow" />
                  <feOffset in="shadow" dx="0" dy="0.6" result="shadowOffset" />
                  <feFlood floodColor="rgba(0,0,0,0.75)" result="shadowColor" />
                  <feComposite in="shadowColor" in2="shadowOffset" operator="in" result="finalShadow" />
                  <feMerge>
                    <feMergeNode in="finalShadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/*
                  Stitch mask — hides thread/needle inside each block body.
                  Visible entry/exit strips:
                    Block 1 : x=6–8   entry (4u, in left padding)
                    Block 4 : x=4 entry (on the U-turn arc, well left of "The Work")
                    Block 2/3/5/6 entries at their respective column gaps.
                  Between rows (y=94–106) always visible — connector lives here.
                */}
                <mask id="stitch-mask" maskUnits="userSpaceOnUse">
                  <rect x="-20" y="-20" width="340" height="240" fill="white" />
                  {/* Row 1 — black rects match BLOCK_BODIES x-ranges */}
                  <rect x="8"   y="0"   width="64" height="94" fill="black" />{/* x=8–72    */}
                  <rect x="100" y="0"   width="73" height="94" fill="black" />{/* x=100–173 */}
                  <rect x="200" y="0"   width="82" height="94" fill="black" />{/* x=200–282 */}
                  {/* Row 2 */}
                  <rect x="4"   y="106" width="68" height="94" fill="black" />{/* x=4–72    */}
                  <rect x="100" y="106" width="73" height="94" fill="black" />{/* x=100–173 */}
                  <rect x="200" y="106" width="82" height="94" fill="black" />{/* x=200–282 */}
                </mask>
              </defs>

              {/* Pierce marks */}
              {PIERCE_POINTS.map((pt, i) => (
                <g
                  key={i}
                  ref={el => { pierceRefsArr.current[i] = el; }}
                  style={{ opacity: 0 }}
                  filter="url(#pierce-hole)"
                >
                  <ellipse cx={pt.cx} cy={pt.cy} rx="2.6" ry="1.0"  fill="rgba(30,24,18,0.60)" />
                  <ellipse cx={pt.cx} cy={pt.cy} rx="1.3" ry="0.52" fill="rgba(8,6,4,0.92)" />
                  <ellipse cx={pt.cx} cy={pt.cy - 0.38} rx="0.75" ry="0.22" fill="rgba(201,168,76,0.28)" />
                </g>
              ))}

              {/* Animated thread — draw-in via dashoffset, masked */}
              <path
                ref={threadPathRef}
                d={THREAD_PATH}
                fill="none"
                stroke="rgba(201,168,76,0.22)"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 9999, strokeDashoffset: 9999 }}
                mask="url(#stitch-mask)"
                filter="url(#thread-glow)"
              />

              {/*
                Needle — realistic steel sewing needle.
                No SVG mask here (maskUnits="userSpaceOnUse" doesn't work on a
                translated group). Visibility is controlled imperatively in the
                scroll handler using BLOCK_BODIES position checks.
                Tip points forward (positive x), eye at back (x≈-4.5).
              */}
              <g
                ref={needleRef}
                style={{ opacity: 0 }}
                filter="url(#needle-glow)"
              >
                {/* Outline — drawn first so it sits beneath the fill */}
                <path
                  d="M 4.5,0 C 3.5,-0.32 -0.5,-0.55 -2.5,0 C -0.5,0.55 3.5,0.32 4.5,0 Z"
                  fill="none"
                  stroke="rgba(90,100,118,0.80)"
                  strokeWidth="0.22"
                />
                {/* Body — steel blue-grey */}
                <path
                  d="M 4.5,0 C 3.5,-0.32 -0.5,-0.55 -2.5,0 C -0.5,0.55 3.5,0.32 4.5,0 Z"
                  fill="rgba(190,200,215,0.95)"
                />
                {/* Top highlight ridge */}
                <path
                  d="M 4.2,0 C 2.5,-0.14 -0.2,-0.28 -2,-0.12 L -2,0 C -0.2,-0.12 2.5,-0.08 4.2,0 Z"
                  fill="rgba(235,245,255,0.55)"
                />
                {/* Eye — dark surround */}
                <ellipse cx="-1.8" cy="0" rx="0.52" ry="0.26" fill="rgba(70,80,95,0.92)" />
                {/* Eye — void */}
                <ellipse cx="-1.8" cy="0" rx="0.24" ry="0.11" fill="rgba(4,6,12,0.97)" />
              </g>
            </svg>
          </div>

          {/* ── Mobile: vertical timeline ───────────────────── */}
          <div className="md:hidden relative pl-10">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-gold/10" aria-hidden="true" />
            <div
              ref={mobileLineRef}
              className="absolute left-3 top-2 w-px bg-gold/45 origin-top"
              style={{ height: "0%" }}
              aria-hidden="true"
            />

            <div className="space-y-10">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeUp}
                  viewport={{ once: true, margin: "-30px" }}
                  className="relative"
                >
                  <div
                    className="absolute -left-10 top-1 w-2.5 h-2.5 rounded-full bg-gold/40 ring-4 ring-near_black"
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-cormorant text-gold/30 text-3xl font-light leading-none" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    {step.note && (
                      <span className="font-jost text-[0.65rem] tracking-[0.18em] uppercase text-gold/70 border border-gold/35 px-1.5 py-0.5">
                        {step.note}
                      </span>
                    )}
                  </div>
                  <h3 className="font-cormorant italic text-ivory text-xl mb-2">{step.title}</h3>
                  <p className="font-jost text-ivory/45 text-sm leading-relaxed">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-14 lg:mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-jost text-ivory/60 text-sm tracking-[0.18em] uppercase mb-6">
            {ctaText}
          </p>
          <Link href="/contact" className="btn-outline-ivory">
            Book a Consultation
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
