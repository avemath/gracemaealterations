import { sanityClient } from "./sanity.client";
import {
  SITE,
  TRUST_STATS,
  SERVICES,
  TESTIMONIALS,
  PORTFOLIO_ITEMS,
  FAQ,
  BIO,
  VALUES,
  HOME_TEXT,
  PROCESS_STEPS,
  ABOUT_TEXT,
  SERVICES_TEXT,
  PRICING_CARDS,
  PORTFOLIO_TEXT,
  CONTACT_TEXT,
} from "@/data/content";

// ── TYPES ─────────────────────────────────────────────────────

export interface SanityImage {
  asset?: { _ref?: string; _id?: string; url?: string };
  alt?: string;
  hotspot?: { x: number; y: number };
}

export interface SanitySiteSettings {
  ownerName?: string;
  businessName?: string;
  tagline?: string;
  subTagline?: string;
  email?: string;
  instagram?: string;
  instagramUrl?: string;
  location?: string;
  availability?: string;
  responseTime?: string;
  bookingNote?: string;
  metaDescription?: string;
  isAcceptingClients?: boolean;
  phone?: string;
}

export interface SanityProcessStep {
  title: string;
  body: string;
  note?: string | null;
}

export interface SanityPricingCard {
  title: string;
  body: string;
}

export interface SanityHomePage {
  heroImage?: SanityImage;
  trustStats?: { value: string; label: string }[];
  heroSectionLabel?: string;
  heroCredentialText?: string;
  servicesLabel?: string;
  servicesHeading?: string;
  portfolioLabel?: string;
  portfolioHeading?: string;
  aboutTeaserLabel?: string;
  testimonialsLabel?: string;
  testimonialsHeading?: string;
  processLabel?: string;
  processHeading?: string;
  processCTA?: string;
  processSteps?: SanityProcessStep[];
  ctaHeadline?: string;
  ctaSubhead?: string;
  ctaButton?: string;
}

export interface SanityAboutPage {
  heroImage?: SanityImage;
  secondaryImage?: SanityImage;
  heroLabel?: string;
  storyLabel?: string;
  storyHeading?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  pullQuote?: string;
  valuesLabel?: string;
  valuesHeading?: string;
  independenceLabel?: string;
  independenceHeading?: string;
  independenceQuote?: string;
  ctaHeadline?: string;
  ctaSubhead?: string;
  ctaButton?: string;
}

export interface SanityServicesPage {
  heroImage?: SanityImage;
  heroLabel?: string;
  heroHeading?: string;
  pricingLabel?: string;
  pricingHeading?: string;
  pricingCards?: SanityPricingCard[];
  ctaHeadline?: string;
  ctaSubhead?: string;
  ctaButton?: string;
}

export interface SanityPortfolioPage {
  heroLabel?: string;
  heroHeading?: string;
  heroSubtext?: string;
  featuredSectionLabel?: string;
  featuredHeading?: string;
  featuredBody?: string;
  featuredLabel: string | null;
  featuredDescription: string | null;
  beforeImage: SanityImage | null;
  afterImage: SanityImage | null;
  ctaHeadline?: string;
  ctaSubhead?: string;
  ctaButton?: string;
}

export interface SanityContactPage {
  image?: SanityImage;
  heroLabel?: string;
  heroHeading?: string;
  waitlistBannerBold?: string;
  waitlistBannerText?: string;
  successHeading?: string;
  successMessage?: string;
  waitlistSuccessMessage?: string;
}

export interface SanityService {
  _id: string;
  title: string;
  id: string;
  icon: string;
  shortDescription: string;
  description: string;
  services: string[];
  priceRange: string;
  priceNote: string;
  freeConsult?: string;
}

export interface SanityPortfolioItem {
  _id: string;
  image?: SanityImage;
  label: string;
  type: "bridal" | "tailoring" | "custom";
  order: number;
}

export interface SanityTestimonial {
  _id: string;
  quote: string;
  name: string;
  occasion: string;
}

export interface SanityFaqItem {
  _id: string;
  question: string;
  answer: string;
}

export interface SanityValue {
  _id: string;
  title: string;
  description: string;
}

// ── HELPERS ───────────────────────────────────────────────────

// Safe fetch — returns null on error so we can fall back to content.ts
async function safeFetch<T>(query: string): Promise<T | null> {
  if (!sanityClient) return null;
  try {
    return await sanityClient.fetch<T>(query, {}, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

// ── QUERIES ───────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  return safeFetch(`*[_type == "siteSettings"][0]`);
}

export async function getHomePage(): Promise<SanityHomePage | null> {
  return safeFetch(`*[_type == "homePage"][0]{
    heroImage{ asset->, alt, hotspot },
    trustStats,
    heroSectionLabel, heroCredentialText,
    servicesLabel, servicesHeading,
    portfolioLabel, portfolioHeading,
    aboutTeaserLabel,
    testimonialsLabel, testimonialsHeading,
    processLabel, processHeading, processCTA,
    processSteps[]{ title, body, note },
    ctaHeadline, ctaSubhead, ctaButton
  }`);
}

export async function getAboutPage(): Promise<SanityAboutPage | null> {
  return safeFetch(`*[_type == "aboutPage"][0]{
    heroImage{ asset->, alt, hotspot },
    secondaryImage{ asset->, alt, hotspot },
    heroLabel, storyLabel, storyHeading,
    paragraph1, paragraph2, paragraph3, pullQuote,
    valuesLabel, valuesHeading,
    independenceLabel, independenceHeading, independenceQuote,
    ctaHeadline, ctaSubhead, ctaButton
  }`);
}

export async function getServicesPage(): Promise<SanityServicesPage | null> {
  return safeFetch(`*[_type == "servicesPage"][0]{
    heroImage{ asset->, alt, hotspot },
    heroLabel, heroHeading,
    pricingLabel, pricingHeading,
    pricingCards[]{ title, body },
    ctaHeadline, ctaSubhead, ctaButton
  }`);
}

export async function getContactPage(): Promise<SanityContactPage | null> {
  return safeFetch(`*[_type == "contactPage"][0]{
    image{ asset->, alt, hotspot },
    heroLabel, heroHeading,
    waitlistBannerBold, waitlistBannerText,
    successHeading, successMessage, waitlistSuccessMessage
  }`);
}

export async function getPortfolioPage(): Promise<SanityPortfolioPage | null> {
  return safeFetch(`*[_type == "portfolioPage"][0]{
    heroLabel, heroHeading, heroSubtext,
    featuredSectionLabel, featuredHeading, featuredBody,
    featuredLabel, featuredDescription,
    beforeImage{ asset->, alt, hotspot },
    afterImage{ asset->, alt, hotspot },
    ctaHeadline, ctaSubhead, ctaButton
  }`);
}

export async function getServices(): Promise<SanityService[] | null> {
  return safeFetch(`*[_type == "service"] | order(order asc) {
    _id, title, "id": slug.current, icon,
    shortDescription, description, services,
    priceRange, priceNote, freeConsult
  }`);
}

export async function getTestimonials(): Promise<SanityTestimonial[] | null> {
  return safeFetch(`*[_type == "testimonial"] | order(order asc) { _id, quote, name, occasion }`);
}

export async function getPortfolioItems(): Promise<SanityPortfolioItem[] | null> {
  return safeFetch(`*[_type == "portfolioItem"] | order(order asc) {
    _id, image{ asset->, alt, hotspot }, label, type, order
  }`);
}

export async function getFaqItems(): Promise<SanityFaqItem[] | null> {
  return safeFetch(`*[_type == "faqItem"] | order(order asc) { _id, question, answer }`);
}

export async function getValues(): Promise<SanityValue[] | null> {
  return safeFetch(`*[_type == "value"] | order(order asc) { _id, title, description }`);
}

// ── MERGED DATA FETCHERS (Sanity → fallback to content.ts) ────
// These are what the pages actually call.

export async function getMergedSite() {
  const s = await getSiteSettings();
  return {
    name: s?.ownerName ?? SITE.name,
    businessName: s?.businessName ?? SITE.businessName,
    tagline: s?.tagline ?? SITE.tagline,
    subTagline: s?.subTagline ?? SITE.subTagline,
    email: s?.email ?? SITE.email,
    instagram: s?.instagram ?? SITE.instagram,
    instagramUrl: s?.instagramUrl ?? SITE.instagramUrl,
    location: s?.location ?? SITE.location,
    availability: s?.availability ?? SITE.availability,
    responseTime: s?.responseTime ?? SITE.responseTime,
    metaDescription: s?.metaDescription ?? SITE.metaDescription,
    bookingNote: s?.bookingNote ?? SITE.bookingNote,
    isAcceptingClients: s?.isAcceptingClients ?? SITE.isAcceptingClients,
    phone: s?.phone ?? SITE.phone,
  };
}

export async function getMergedHomePage() {
  const h = await getHomePage();
  return {
    heroImage: h?.heroImage ?? null,
    trustStats: h?.trustStats?.length ? h.trustStats : TRUST_STATS,
    heroSectionLabel: h?.heroSectionLabel ?? HOME_TEXT.heroSectionLabel,
    heroCredentialText: h?.heroCredentialText ?? HOME_TEXT.heroCredentialText,
    servicesLabel: h?.servicesLabel ?? HOME_TEXT.servicesLabel,
    servicesHeading: h?.servicesHeading ?? HOME_TEXT.servicesHeading,
    portfolioLabel: h?.portfolioLabel ?? HOME_TEXT.portfolioLabel,
    portfolioHeading: h?.portfolioHeading ?? HOME_TEXT.portfolioHeading,
    aboutTeaserLabel: h?.aboutTeaserLabel ?? HOME_TEXT.aboutTeaserLabel,
    testimonialsLabel: h?.testimonialsLabel ?? HOME_TEXT.testimonialsLabel,
    testimonialsHeading: h?.testimonialsHeading ?? HOME_TEXT.testimonialsHeading,
    processLabel: h?.processLabel ?? HOME_TEXT.processLabel,
    processHeading: h?.processHeading ?? HOME_TEXT.processHeading,
    processCTA: h?.processCTA ?? HOME_TEXT.processCTA,
    processSteps: h?.processSteps?.length ? h.processSteps : PROCESS_STEPS,
    ctaHeadline: h?.ctaHeadline ?? HOME_TEXT.ctaHeadline,
    ctaSubhead: h?.ctaSubhead ?? HOME_TEXT.ctaSubhead,
    ctaButton: h?.ctaButton ?? HOME_TEXT.ctaButton,
  };
}

export async function getMergedAboutPage() {
  const a = await getAboutPage();
  return {
    heroImage: a?.heroImage ?? null,
    secondaryImage: a?.secondaryImage ?? null,
    heroLabel: a?.heroLabel ?? ABOUT_TEXT.heroLabel,
    storyLabel: a?.storyLabel ?? ABOUT_TEXT.storyLabel,
    storyHeading: a?.storyHeading ?? ABOUT_TEXT.storyHeading,
    paragraph1: a?.paragraph1 ?? BIO.paragraph1,
    paragraph2: a?.paragraph2 ?? BIO.paragraph2,
    paragraph3: a?.paragraph3 ?? BIO.paragraph3,
    pullQuote: a?.pullQuote ?? BIO.pullQuote,
    valuesLabel: a?.valuesLabel ?? ABOUT_TEXT.valuesLabel,
    valuesHeading: a?.valuesHeading ?? ABOUT_TEXT.valuesHeading,
    independenceLabel: a?.independenceLabel ?? ABOUT_TEXT.independenceLabel,
    independenceHeading: a?.independenceHeading ?? ABOUT_TEXT.independenceHeading,
    independenceQuote: a?.independenceQuote ?? BIO.independenceQuote,
    ctaHeadline: a?.ctaHeadline ?? ABOUT_TEXT.ctaHeadline,
    ctaSubhead: a?.ctaSubhead ?? ABOUT_TEXT.ctaSubhead,
    ctaButton: a?.ctaButton ?? ABOUT_TEXT.ctaButton,
  };
}

export async function getMergedServicesPage() {
  const p = await getServicesPage();
  return {
    heroImage: p?.heroImage ?? null,
    heroLabel: p?.heroLabel ?? SERVICES_TEXT.heroLabel,
    heroHeading: p?.heroHeading ?? SERVICES_TEXT.heroHeading,
    pricingLabel: p?.pricingLabel ?? SERVICES_TEXT.pricingLabel,
    pricingHeading: p?.pricingHeading ?? SERVICES_TEXT.pricingHeading,
    pricingCards: p?.pricingCards?.length ? p.pricingCards : PRICING_CARDS,
    ctaHeadline: p?.ctaHeadline ?? SERVICES_TEXT.ctaHeadline,
    ctaSubhead: p?.ctaSubhead ?? SERVICES_TEXT.ctaSubhead,
    ctaButton: p?.ctaButton ?? SERVICES_TEXT.ctaButton,
  };
}

export async function getMergedPortfolioPage() {
  const p = await getPortfolioPage();
  return {
    heroLabel: p?.heroLabel ?? PORTFOLIO_TEXT.heroLabel,
    heroHeading: p?.heroHeading ?? PORTFOLIO_TEXT.heroHeading,
    heroSubtext: p?.heroSubtext ?? PORTFOLIO_TEXT.heroSubtext,
    featuredSectionLabel: p?.featuredSectionLabel ?? PORTFOLIO_TEXT.featuredSectionLabel,
    featuredHeading: p?.featuredHeading ?? PORTFOLIO_TEXT.featuredHeading,
    featuredBody: p?.featuredBody ?? PORTFOLIO_TEXT.featuredBody,
    featuredLabel: p?.featuredLabel ?? null,
    featuredDescription: p?.featuredDescription ?? null,
    beforeImage: p?.beforeImage ?? null,
    afterImage: p?.afterImage ?? null,
    ctaHeadline: p?.ctaHeadline ?? PORTFOLIO_TEXT.ctaHeadline,
    ctaSubhead: p?.ctaSubhead ?? PORTFOLIO_TEXT.ctaSubhead,
    ctaButton: p?.ctaButton ?? PORTFOLIO_TEXT.ctaButton,
  };
}

export async function getMergedContactPage() {
  const c = await getContactPage();
  return {
    image: c?.image ?? null,
    heroLabel: c?.heroLabel ?? CONTACT_TEXT.heroLabel,
    heroHeading: c?.heroHeading ?? CONTACT_TEXT.heroHeading,
    waitlistBannerBold: c?.waitlistBannerBold ?? CONTACT_TEXT.waitlistBannerBold,
    waitlistBannerText: c?.waitlistBannerText ?? CONTACT_TEXT.waitlistBannerText,
    successHeading: c?.successHeading ?? CONTACT_TEXT.successHeading,
    successMessage: c?.successMessage ?? CONTACT_TEXT.successMessage,
    waitlistSuccessMessage: c?.waitlistSuccessMessage ?? CONTACT_TEXT.waitlistSuccessMessage,
  };
}

export async function getMergedServices() {
  const s = await getServices();
  if (s && s.length > 0) return s;
  return SERVICES.map((svc) => ({
    _id: svc.id,
    title: svc.title,
    id: svc.id,
    icon: svc.icon,
    shortDescription: svc.shortDescription,
    description: svc.description,
    services: svc.services,
    priceRange: svc.priceRange,
    priceNote: svc.priceNote,
    freeConsult: svc.freeConsult,
  }));
}

export async function getMergedTestimonials() {
  const t = await getTestimonials();
  if (t && t.length > 0) return t;
  return TESTIMONIALS.map((t, i) => ({ _id: String(i), ...t }));
}

export async function getMergedPortfolioItems() {
  const p = await getPortfolioItems();
  if (p && p.length > 0) return p;
  return PORTFOLIO_ITEMS.map((item) => ({
    _id: String(item.id),
    image: undefined as SanityImage | undefined,
    label: item.label,
    type: item.type as "bridal" | "tailoring" | "custom",
    order: item.id,
  }));
}

export async function getMergedFaq() {
  const f = await getFaqItems();
  if (f && f.length > 0) return f;
  return FAQ.map((item, i) => ({ _id: String(i), ...item }));
}

export async function getMergedValues() {
  const v = await getValues();
  if (v && v.length > 0) return v;
  return VALUES.map((v, i) => ({ _id: String(i), ...v }));
}
