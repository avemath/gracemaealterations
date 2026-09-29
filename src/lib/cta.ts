/**
 * Two lanes of call to action, driven by siteSettings.
 *
 * While limitedMode is on, the primary action is the work Grace can actually
 * take today and the secondary is the waitlist for the work she cannot. A
 * single "Book a Consultation" button is wrong in that window, because it
 * promises something bridal clients cannot have yet.
 *
 * The button words themselves live in the Studio's "Site-wide words"
 * (src/lib/text/specs/site.json). This file is shared by server pages and
 * client components, so it imports only the spec's types, never the spec or
 * the Studio fetch.
 */
import type { Text } from "@/lib/text";
import { fill } from "@/lib/text/fill";

export type SiteText = Text<"site">;

/** Every site-wide field whose key starts with one of the prefixes. */
export type TextFor<P extends string> = Pick<SiteText, Extract<keyof SiteText, `${P}${string}`>>;

/**
 * Just the fields a component needs, by key prefix ("nav", "home", ...).
 * Client components get their wording as props, and handing each one the
 * whole document would repeat all of it in every page's payload.
 */
export function pickText<P extends string>(text: SiteText, ...prefixes: P[]): TextFor<P> {
  return Object.fromEntries(
    Object.entries(text).filter(([key]) => prefixes.some((prefix) => key.startsWith(prefix)))
  ) as TextFor<P>;
}

/**
 * Studio wording with a {link} in it, split either side of the link. If the
 * placeholder has been deleted, the link goes at the end rather than vanish.
 */
export function aroundLink(template: string): [string, string] {
  const at = template.indexOf("{link}");
  return at === -1 ? [`${template} `, ""] : [template.slice(0, at), template.slice(at + "{link}".length)];
}

export type CtaText = TextFor<"cta">;

/**
 * The original button words, for a caller that wasn't handed the Studio's.
 * A copy of the defaults in site.json rather than an import of it: every
 * page loads this file, and importing the spec put all of it (every title
 * and note) into the code each visitor downloads. tests/wording.spec.ts
 * fails if the two ever differ.
 */
export const CTA_DEFAULTS: CtaText = {
  ctaTailoring: "Book tailoring or a repair",
  ctaWaitlistYear: "Join the {year} bridal waitlist",
  ctaWaitlist: "Join the bridal waitlist",
  ctaConsult: "Book a consultation",
  ctaServices: "View services",
  ctaParty: "Send a bridal party request",
  ctaTailoringOpen: "Tailoring and repairs are open now",
  ctaOr: "or {action}",
};

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

/** Callers that weren't handed the Studio's words get the original ones. */
export function ctas(site: CtaSettings, text: CtaText = CTA_DEFAULTS): Ctas {
  if (site.limitedMode) {
    const year = reopenYear(site.reopensLabel);
    return {
      primary: { label: text.ctaTailoring, href: "/contact?service=tailoring" },
      secondary: {
        label: year ? fill(text.ctaWaitlistYear, { year }) : text.ctaWaitlist,
        href: "/contact?service=bridal",
      },
    };
  }

  return {
    primary: { label: text.ctaConsult, href: "/contact" },
    secondary: { label: text.ctaServices, href: "/services" },
  };
}

/** Pages where a visitor is plainly thinking about a wedding gown. */
const BRIDAL_PAGES = /^\/(guides\/(wedding-dress|what-to-bring)|david-s-bridal)/;

/**
 * The sticky buttons, matched to the page: on a bridal page in limited mode
 * the main action is the waitlist (not tailoring), on the bridal party page it
 * is a party request, and the other lane is offered as a quiet text link.
 */
export function pageCtas(
  pathname: string,
  site: CtaSettings,
  text: CtaText = CTA_DEFAULTS
): { main: Cta; alt: Cta | null } {
  const { primary, secondary } = ctas(site, text);
  if (!site.limitedMode) return { main: primary, alt: null };
  if (pathname === "/bridal-party-alterations") {
    return { main: { label: text.ctaParty, href: "/contact?service=party" }, alt: secondary };
  }
  if (BRIDAL_PAGES.test(pathname)) {
    return { main: secondary, alt: { label: text.ctaTailoringOpen, href: primary.href } };
  }
  const action = `${secondary.label.charAt(0).toLowerCase()}${secondary.label.slice(1)}`;
  return { main: primary, alt: { ...secondary, label: fill(text.ctaOr, { action }) } };
}
