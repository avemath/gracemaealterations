"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE =
  'a, button, [role="button"], input, select, textarea, label, [tabindex]:not([tabindex="-1"])';

export default function CustomCursor() {
  // Position lives in motion values, not React state: writing to them moves the
  // arrow without re-rendering, so it sits exactly under the pointer instead of
  // trailing a frame or two behind it.
  const x = useMotionValue(-120);
  const y = useMotionValue(-120);
  const opacity = useMotionValue(0);

  // The ring is allowed to trail — that reads as deliberate, unlike a lagging
  // arrow tip.
  const ringX = useSpring(x, { damping: 26, stiffness: 420, mass: 0.3 });
  const ringY = useSpring(y, { damping: 26, stiffness: 420, mass: 0.3 });

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("custom-cursor");
    setReady(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      opacity.set(1);
    };

    // Leaving the viewport for the browser chrome (address bar, tabs) hands
    // control back to the real cursor — hide ours rather than stranding it at
    // the edge of the page.
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) opacity.set(0);
    };

    // Coming back in: jump to the pointer before showing, so it never glides in
    // from wherever it was left.
    const onEnter = (e: MouseEvent) => {
      x.jump(e.clientX);
      y.jump(e.clientY);
      ringX.jump(e.clientX);
      ringY.jump(e.clientY);
      opacity.set(1);
    };

    const onOver = (e: MouseEvent) =>
      setHovered(!!(e.target as Element).closest(INTERACTIVE));
    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    const onBlur = () => opacity.set(0);
    window.addEventListener("blur", onBlur);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [x, y, opacity, ringX, ringY]);

  if (!ready) return null;

  return (
    <>
      {/* Hover ring — expands when over interactive elements */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[998] rounded-full border border-gold/50"
            style={{ x: ringX, y: ringY, marginLeft: -18, marginTop: -18, opacity }}
            initial={{ width: 4, height: 4 }}
            animate={{ width: 36, height: 36 }}
            exit={{ width: 4, height: 4 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Gold pointer arrow — pinned to the pointer, no positional easing */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999]"
        style={{ x, y, opacity }}
        animate={{ scale: clicked ? 0.8 : hovered ? 1.15 : 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 380 }}
        aria-hidden="true"
      >
        {/* Standard cursor arrow shape — tip at top-left (0,0) of SVG */}
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
          <path
            d="M1.5 1.5 L1.5 19 L6 14.5 L9 22 L11.5 21 L8.5 13.5 L15 13.5 Z"
            fill="#C9A84C"
            fillOpacity={hovered ? 1 : 0.88}
            stroke="#1C1C1C"
            strokeWidth="0.75"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </>
  );
}
