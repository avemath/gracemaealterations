import Link from "next/link";
import type { TextFor } from "@/lib/cta";
import { fill } from "@/lib/text/fill";

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
  /** Defaults to /guides/<slug>; landing pages live at the root. */
  href?: string;
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
  /** Hidden until the policies singleton is published. */
  hasPolicies?: boolean;
  /** The Studio's words; the bottom links reuse the header's. */
  text: TextFor<"footer" | "nav">;
}

const columnHeading = "font-jost font-medium text-ivory text-xs tracking-[0.22em] uppercase mb-4";
// The vertical padding makes each link a comfortable tap target (32px tall)
// without spreading the columns out; the lists below tighten to match.
// No display here: each link sets its own. With inline-block in here, "block"
// on the email link lost to it (Tailwind orders inline-block later), and the
// email and "Send a request" ran together on one line.
const linkClass =
  "py-1.5 font-jost text-ivory/75 text-sm hover:text-ivory transition-colors duration-300";

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
  hasPolicies = false,
  text,
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
            {text.footerTagline}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-10">
          {/* Studio */}
          <div>
            <h2 className={columnHeading}>{text.footerStudioHeading}</h2>
            <p className="font-jost text-ivory/75 text-sm leading-[1.65]">
              {fill(text.footerStudioLine, { location })}
            </p>
            <p className="font-jost text-ivory/75 text-sm leading-[1.65] mt-2">{availability}</p>
          </div>

          {/* Contact: email only, by design. No phone anywhere on this site. */}
          <div>
            <h2 className={columnHeading}>{text.footerContactHeading}</h2>
            <a href={`mailto:${email}`} className={`${linkClass} block break-words`}>
              {email}
            </a>
            <Link href="/contact" className={`${linkClass} block`}>
              {text.footerSendRequest}
            </Link>
          </div>

          {/* Guides: hidden until at least one is published */}
          {guides.length > 0 && (
            <div>
              <h2 className={columnHeading}>{text.footerGuidesHeading}</h2>
              <ul>
                {guides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={guide.href ?? `/guides/${guide.slug}`} className={`${linkClass} inline-block`}>
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Policies */}
          <div>
            <h2 className={columnHeading}>{hasPolicies ? text.footerPoliciesHeading : text.footerElsewhereHeading}</h2>
            <ul>
              {hasPolicies && (
                <li>
                  <Link href="/policies" className={`${linkClass} inline-block`}>
                    {text.footerPoliciesLink}
                  </Link>
                </li>
              )}
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
                    className={`${linkClass} inline-block`}
                  >
                    {text.footerReview}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-ivory/10">
          <p className="font-jost text-xs text-ivory/75">
            {fill(text.footerCopyright, { year, business: businessName })}
          </p>
          <nav aria-label={text.footerNavLabel}>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1">
              {[
                { label: text.navServices, href: "/services" },
                { label: text.navPortfolio, href: "/portfolio" },
                ...(guides.some((g) => !g.href) ? [{ label: text.navGuides, href: "/guides" }] : []),
                { label: text.navAbout, href: "/about" },
                { label: text.navContact, href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-2 font-jost text-xs tracking-[0.16em] uppercase text-ivory/75 hover:text-ivory transition-colors duration-300"
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
