"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const EXCLUDED = ["/contact", "/studio"];

export default function StickyDesktopCTA() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const excluded = EXCLUDED.includes(pathname) || pathname.startsWith("/studio");

  useEffect(() => {
    if (excluded) { setVisible(false); return; }

    const onScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const nearBottom = scrollY + winH > docH - 220;
      setVisible(scrollY > winH * 0.6 && !nearBottom);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [excluded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 48 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-6 bottom-8 z-40 hidden lg:block"
        >
          <Link
            href="/contact"
            className="btn-gold shadow-[0_4px_24px_rgba(201,168,76,0.32)] whitespace-nowrap"
            aria-label="Book a consultation with Grace Mae"
          >
            Book a Consultation
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
