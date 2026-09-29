/**
 * Two lanes of call to action, driven by siteSettings.
 *
 * While limitedMode is on, the primary action is the work Grace can actually
 * take today and the secondary is the waitlist for the work she cannot. A
 * single "Book a Consultation" button is wrong in that window, because it
 * promises something bridal clients cannot have yet.
 */

export interface CtaSettings {
  limitedMode?: boolean;
  reopensLabel?: string;
}

export interface Cta {
  label: string;
  href: string;
}

export interface Ctas {
  primary: Cta;
  secondary: Cta;
}

/** First four digit year in a label like "early 2027", or null. */
export function reopenYear(label?: string): string | null {
  const match = label?.match(/\b(\d{4})\b/);
  return match ? match[1] : null;
}

export function ctas(site: CtaSettings): Ctas {
  if (site.limitedMode) {
    const year = reopenYear(site.reopensLabel);
    return {
      primary: { label: "Book tailoring or a repair", href: "/contact?service=tailoring" },
      secondary: {
        label: year ? `Join the ${year} bridal waitlist` : "Join the bridal waitlist",
        href: "/contact?service=bridal",
      },
    };
  }

  return {
    primary: { label: "Book a consultation", href: "/contact" },
    secondary: { label: "View services", href: "/services" },
  };
}

/** Pages where a visitor is plainly thinking about a wedding gown. */
const BRIDAL_PAGES = /^\/(guides\/(wedding-dress|what-to-bring)|david-s-bridal)/;

/**
 * The sticky buttons, matched to the page: on a bridal page in limited mode
 * the main action is the waitlist (not tailoring), on the bridal party page it
 * is a party request, and the other lane is offered as a quiet text link.
 */
export function pageCtas(pathname: string, site: CtaSettings): { main: Cta; alt: Cta | null } {
  const { primary, secondary } = ctas(site);
  if (!site.limitedMode) return { main: primary, alt: null };
  if (pathname === "/bridal-party-alterations") {
    return { main: { label: "Send a bridal party request", href: "/contact?service=party" }, alt: secondary };
  }
  if (BRIDAL_PAGES.test(pathname)) {
    return { main: secondary, alt: { label: "Tailoring and repairs are open now", href: primary.href } };
  }
  return { main: primary, alt: { ...secondary, label: `or ${secondary.label.charAt(0).toLowerCase()}${secondary.label.slice(1)}` } };
}
