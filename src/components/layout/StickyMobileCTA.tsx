"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Pages where the sticky CTA is not useful
const EXCLUDED = ["/contact", "/studio"];

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  const excluded =
    EXCLUDED.includes(pathname) || pathname.startsWith("/studio");

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
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
          aria-label="Book a consultation"
        >
          <div className="bg-ivory/97 backdrop-blur-md border-t border-blush px-4 py-3 pb-safe">
            <Link
              href="/contact"
              className="btn-gold block w-full text-center"
              aria-label="Book a consultation with Grace Mae"
            >
              Book a Consultation
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
