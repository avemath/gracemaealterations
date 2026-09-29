"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { m as motion, AnimatePresence } from "framer-motion";

import { pageCtas, type CtaText } from "@/lib/cta";

// Pages where the sticky CTA is not useful
const EXCLUDED = ["/contact", "/studio"];

interface Props {
  /** Limited availability: some services are waitlisted, the rest book normally. */
  limitedMode?: boolean;
  reopensLabel?: string;
  /** The Studio's button words. */
  text?: CtaText;
}

export default function StickyMobileCTA({ limitedMode = false, reopensLabel = "", text }: Props) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const { main, alt } = pageCtas(pathname, { limitedMode, reopensLabel }, text);

  const excluded =
    EXCLUDED.includes(pathname) || pathname.startsWith("/studio") || pathname.startsWith("/care");

  useEffect(() => {
    if (excluded) { setVisible(false); return; }

    const onScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const nearBottom = scrollY + winH > docH - 180;
      setVisible(scrollY > winH * 0.75 && !nearBottom);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // check on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, [excluded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden [@media(max-height:500px)]:hidden"
        >
          {/* bg-ivory/97 and pb-safe are not real Tailwind classes, so this bar
              rendered transparent and ignored the iPhone home indicator. */}
          <div
            className="bg-ivory/95 backdrop-blur-md border-t border-charcoal/10 px-4 py-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <Link href={main.href} className="btn-gold w-full text-center">
              {main.label}
            </Link>
            {alt && (
              <Link
                href={alt.href}
                className="block text-center font-jost text-xs text-charcoal/75 underline underline-offset-4 decoration-charcoal/25 pt-2 pb-0.5 hover:text-charcoal"
              >
                {alt.label}
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
