"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealTextProps {
  children: ReactNode;
  /** Applied to the outer overflow-hidden wrapper (for margin / layout control) */
  className?: string;
  delay?: number;
  /** true → animate on page mount (heroes); false → trigger on scroll (sections) */
  onMount?: boolean;
}

// Wraps any heading in an overflow-hidden slot and slides the text up from
// below — the standard editorial "masked text reveal" used on luxury sites.
// Layout space is always reserved (transform doesn't affect flow) so nothing
// shifts when the heading appears.
export default function RevealText({
  children,
  className = "",
  delay = 0,
  onMount = false,
}: RevealTextProps) {
  const ease = [0.22, 1, 0.36, 1] as const;
  const transition = { duration: 0.78, ease, delay };

  return (
    <div className={`overflow-hidden ${className}`}>
      {onMount ? (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={transition}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: "110%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={transition}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
