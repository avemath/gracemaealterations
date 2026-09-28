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
