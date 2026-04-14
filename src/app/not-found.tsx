import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "Services",  href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About",     href: "/about" },
  { label: "Contact",   href: "/contact" },
];

export default function NotFound() {
  return (
    <section
      className="bg-ivory min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 text-center"
      aria-labelledby="not-found-heading"
    >
      {/* Decorative large number */}
      <p
        className="font-cormorant font-light leading-none select-none pointer-events-none mb-2"
        style={{ fontSize: "clamp(7rem, 22vw, 16rem)", color: "rgba(201,168,76,0.12)" }}
        aria-hidden="true"
      >
        404
      </p>

      <div className="w-12 h-px bg-gold mx-auto mb-8" aria-hidden="true" />

      <h1
        id="not-found-heading"
        className="font-cormorant italic text-charcoal text-3xl lg:text-4xl mb-4"
      >
        This page has come undone.
      </h1>

      <p className="font-jost text-charcoal/50 text-sm leading-relaxed max-w-xs mb-12">
        The link may have moved or no longer exists. Let&rsquo;s get you back to the right place.
      </p>

      <nav
        className="flex flex-wrap gap-x-8 gap-y-3 justify-center mb-12"
        aria-label="Recovery navigation"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-jost text-xs tracking-[0.18em] uppercase text-charcoal/40 hover:text-gold transition-colors duration-300"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link href="/contact" className="btn-gold">
        Book a Consultation
      </Link>
    </section>
  );
}
