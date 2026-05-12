"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealImageProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Wipes the image in from the bottom with a simultaneous subtle zoom-out
// on the inner content — a signature editorial reveal.
//
// Usage:
//   <RevealImage className="relative">
//     <SanityImage ... />
//   </RevealImage>
//
// Any absolutely-positioned decorative elements that extend beyond the
// image boundary (e.g. offset gold border) should live OUTSIDE this
// wrapper so they're not clipped by overflow:hidden.
export default function RevealImage({
  children,
  className = "",
  delay = 0,
}: RevealImageProps) {
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      <motion.div
        initial={{ scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
