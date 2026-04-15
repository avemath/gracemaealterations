"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  siteName: string;
  businessName: string;
}

export default function Navbar({ siteName, businessName }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const showBg = scrolled || menuOpen;

  return (
    <>
      {/* ── HEADER — z-50 so it always floats above the mobile menu ── */}
      <header className="fixed top-0 left-0 right-0 z-50" role="banner">

        {/* Dark gradient layer — visible when not scrolled, fades out on scroll */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${showBg ? "opacity-0" : "opacity-100"}`}
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.26) 65%, transparent 100%)" }}
          aria-hidden="true"
        />

        {/* Ivory background layer — fades in on scroll */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 backdrop-blur-md shadow-[0_1px_0_rgba(232,224,216,0.8)] ${showBg ? "opacity-100" : "opacity-0"}`}
          style={{ background: "rgba(250,247,242,0.93)" }}
          aria-hidden="true"
        />

        <nav
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16 lg:h-20"
          aria-label="Main navigation"
        >
          {/* Logo / Name */}
          <Link
            href="/"
            className={`font-cormorant italic text-xl lg:text-2xl transition-colors duration-300 tracking-wide ${showBg ? "text-gold hover:text-gold_light" : "text-gold_light hover:text-ivory"}`}
            aria-label={`${businessName} — home`}
          >
            {siteName}
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-jost font-medium text-xs tracking-[0.18em] uppercase transition-colors duration-300 group ${
                  showBg
                    ? pathname === link.href ? "text-gold" : "text-gold/70 hover:text-gold"
                    : pathname === link.href ? "text-ivory" : "text-ivory/80 hover:text-ivory"
                }`}
              >
                {link.label}
                {/* Sliding underline */}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
                    showBg ? "bg-gold" : "bg-ivory"
                  } ${pathname === link.href ? "w-full" : "w-0 group-hover:w-full"}`}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {(["origin-center", "", "origin-center"] as const).map((origin, idx) => (
              <motion.span
                key={idx}
                className={`w-6 h-px block ${origin} transition-colors duration-500 ${showBg ? "bg-gold" : "bg-ivory"}`}
                animate={
                  idx === 1
                    ? menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
                    : menuOpen
                    ? { rotate: idx === 0 ? 45 : -45, y: idx === 0 ? 6 : -6 }
                    : { rotate: 0, y: 0 }
                }
                transition={{ duration: idx === 1 ? 0.25 : 0.35, ease: "easeInOut" }}
              />
            ))}
          </button>
        </nav>
      </header>

      {/* ── MOBILE MENU — z-40 (below header z-50, so X is always visible) ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ivory flex flex-col items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Decorative gold rule */}
            <div className="w-px h-16 bg-gold/30 mb-10" aria-hidden="true" />

            <nav className="flex flex-col items-center gap-2" aria-label="Mobile navigation">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.45, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    className={`block font-cormorant italic text-5xl py-2 transition-colors duration-300 ${
                      pathname === link.href ? "text-gold" : "text-charcoal hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45 }}
              className="mt-10"
            >
              <Link href="/contact" className="btn-gold">
                Book a Consultation
              </Link>
            </motion.div>

            {/* Contact info at bottom */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="absolute bottom-10 font-jost text-xs text-charcoal/30 tracking-widest uppercase"
            >
              Pittsburgh, PA &nbsp;·&nbsp; By Appointment
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
