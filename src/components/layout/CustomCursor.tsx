"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INTERACTIVE =
  'a, button, [role="button"], input, select, textarea, label, [tabindex]:not([tabindex="-1"])';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -120, y: -120 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("custom-cursor");
    setReady(true);

    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onOver = (e: MouseEvent) =>
      setHovered(!!(e.target as Element).closest(INTERACTIVE));
    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      {/* Hover ring — expands when over interactive elements */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[998] rounded-full border border-gold/50"
            style={{ x: pos.x - 18, y: pos.y - 18 }}
            initial={{ width: 4, height: 4, opacity: 0 }}
            animate={{ width: 36, height: 36, opacity: 1 }}
            exit={{ width: 4, height: 4, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Gold pointer arrow — snappy spring tracking */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999]"
        animate={{
          x: pos.x,
          y: pos.y,
          scale: clicked ? 0.8 : hovered ? 1.15 : 1,
        }}
        transition={{
          x: { type: "spring", damping: 28, stiffness: 520, mass: 0.25 },
          y: { type: "spring", damping: 28, stiffness: 520, mass: 0.25 },
          scale: { type: "spring", damping: 18, stiffness: 380 },
        }}
        aria-hidden="true"
      >
        {/* Standard cursor arrow shape — tip at top-left (0,0) of SVG */}
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
          <path
            d="M1.5 1.5 L1.5 19 L6 14.5 L9 22 L11.5 21 L8.5 13.5 L15 13.5 Z"
            fill="#C9A84C"
            fillOpacity={hovered ? 1 : 0.88}
            stroke="#C9A84C"
            strokeWidth="0.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </>
  );
}
