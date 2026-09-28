import Link from "next/link";

const InstagramIcon = () => (
  <svg
    width="16"
    height="16"
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

export interface GuideLink {
  title: string;
  slug: string;
}

interface FooterProps {
  siteName: string;
  businessName: string;
  location: string;
  availability: string;
  email: string;
  instagram: string;
  instagramUrl: string;
  /** Google Business Profile, when one exists. */
  googleReviewUrl?: string;
  /** Published guides only; the column is hidden when empty. */
  guides?: GuideLink[];
}

const columnHeading = "font-jost font-medium text-ivory text-xs tracking-[0.22em] uppercase mb-4";
const linkClass =
  "font-jost text-ivory/75 text-sm hover:text-ivory transition-colors duration-300";

export default function Footer({
  siteName,
  businessName,
  location,
  availability,
  email,
  instagram,
  instagramUrl,
  googleReviewUrl,
  guides = [],
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-near_black text-ivory/75" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-16">
        <div className="pb-10 border-b border-ivory/10">
          <Link
            href="/"
            className="font-cormorant italic text-2xl text-ivory hover:text-gold transition-colors duration-300"
          >
            {siteName}
          </Link>
          <p className="font-jost text-xs tracking-[0.22em] uppercase text-ivory/75 mt-1">
            Bridal &amp; Clothing Alterations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-10">
          {/* Studio */}
          <div>
            <h2 className={columnHeading}>Studio</h2>
            <p className="font-jost text-ivory/75 text-sm leading-[1.65]">
              {location} · By appointment
            </p>
            <p className="font-jost text-ivory/75 text-sm leading-[1.65] mt-2">{availability}</p>
          </div>

          {/* Contact: email only, by design. No phone anywhere on this site. */}
          <div>
            <h2 className={columnHeading}>Contact</h2>
            <a href={`mailto:${email}`} className={`${linkClass} block break-words`}>
              {email}
            </a>
            <Link href="/contact" className={`${linkClass} block mt-2`}>
              Send a request
            </Link>
          </div>

          {/* Guides: hidden until at least one is published */}
          {guides.length > 0 && (
            <div>
              <h2 className={columnHeading}>Guides</h2>
              <ul className="space-y-2">
                {guides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/guides/${guide.slug}`} className={linkClass}>
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Policies */}
          <div>
            <h2 className={columnHeading}>Policies</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/policies" className={linkClass}>
                  Policies
                </Link>
              </li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} inline-flex items-center gap-2`}
                >
                  <InstagramIcon />
                  {instagram}
                </a>
              </li>
              {googleReviewUrl && (
                <li>
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    Leave a Google review
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-ivory/10">
          <p className="font-jost text-xs text-ivory/75">
            &copy; {year} {businessName}. All rights reserved.
          </p>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-6">
              {[
                { label: "Services", href: "/services" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-jost text-xs tracking-[0.16em] uppercase text-ivory/75 hover:text-ivory transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
