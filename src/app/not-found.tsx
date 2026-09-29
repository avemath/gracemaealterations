import Link from "next/link";
import type { Metadata } from "next";
import { ctas } from "@/lib/cta";
import { getMergedSite } from "@/lib/sanity.queries";
import { getText } from "@/lib/text";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  // A 404 must still render if Sanity is having a moment. (getText already
  // falls back to the original words on its own.)
  const [site, text] = await Promise.all([
    getMergedSite().catch(() => ({ limitedMode: false, reopensLabel: "" })),
    getText("site"),
  ]);
  const { primary } = ctas(site, text);
  const NAV_LINKS = [
    { label: text.notFoundHome, href: "/" },
    { label: text.navServices, href: "/services" },
    { label: text.navPortfolio, href: "/portfolio" },
    { label: text.navAbout, href: "/about" },
    { label: text.navContact, href: "/contact" },
  ];
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
        {text.notFoundHeading}
      </h1>

      <p className="font-jost text-charcoal/75 text-sm leading-relaxed max-w-xs mb-12">
        {text.notFoundBody}
      </p>

      <nav
        className="flex flex-wrap gap-x-8 gap-y-3 justify-center mb-12"
        aria-label={text.notFoundNav}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-jost text-xs tracking-[0.18em] uppercase text-charcoal/75 hover:text-gold_ink transition-colors duration-300"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link href={primary.href} className="btn-gold">
        {primary.label}
      </Link>
    </section>
  );
}
