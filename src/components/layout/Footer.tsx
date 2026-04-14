import Link from "next/link";
import { SITE } from "@/data/content";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Instagram SVG icon
const InstagramIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-near_black text-ivory/60" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 border-b border-ivory/10">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-cormorant italic text-2xl text-ivory hover:text-gold transition-colors duration-300"
              aria-label={`${SITE.businessName} — home`}
            >
              {SITE.name}
            </Link>
            <p className="font-jost text-xs tracking-widest uppercase text-ivory/40 mt-1">
              Bridal &amp; Clothing Alterations
            </p>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-6 lg:gap-10">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-jost text-xs tracking-[0.16em] uppercase text-ivory/50 hover:text-ivory transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Location + Instagram */}
          <div className="flex flex-col items-start lg:items-end gap-3">
            <p className="font-jost text-xs tracking-widest uppercase text-ivory/50">
              {SITE.location} &nbsp;|&nbsp; {SITE.availability}
            </p>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-ivory/50 hover:text-gold transition-colors duration-300"
              aria-label={`Follow ${SITE.name} on Instagram`}
            >
              <InstagramIcon />
              <span className="font-jost text-xs">{SITE.instagram}</span>
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8">
          <p className="font-jost text-xs text-ivory/30">
            &copy; {year} {SITE.businessName}. All rights reserved.
          </p>
          <p className="font-jost text-xs text-ivory/25">
            Pittsburgh, PA &mdash; Available by Appointment
          </p>
        </div>
      </div>
    </footer>
  );
}
