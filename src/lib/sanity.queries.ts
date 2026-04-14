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
  metaDescription?: string;
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

export interface SanityHomePage {
  heroImage?: SanityImage;
  trustStats?: { value: string; label: string }[];
}

export interface SanityAboutPage {
  heroImage?: SanityImage;
  secondaryImage?: SanityImage;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  pullQuote?: string;
}

export interface SanityServicesPage {
  heroImage?: SanityImage;
}

export interface SanityContactPage {
  image?: SanityImage;
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
  return safeFetch(`*[_type == "homePage"][0]{ heroImage{ asset->, alt, hotspot }, trustStats }`);
}

export async function getAboutPage(): Promise<SanityAboutPage | null> {
  return safeFetch(`*[_type == "aboutPage"][0]{
    heroImage{ asset->, alt, hotspot },
    secondaryImage{ asset->, alt, hotspot },
    paragraph1, paragraph2, paragraph3, pullQuote
  }`);
}

export async function getServicesPage(): Promise<SanityServicesPage | null> {
  return safeFetch(`*[_type == "servicesPage"][0]{ heroImage{ asset->, alt, hotspot } }`);
}

export async function getContactPage(): Promise<SanityContactPage | null> {
  return safeFetch(`*[_type == "contactPage"][0]{ image{ asset->, alt, hotspot } }`);
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
  };
}

export async function getMergedHomePage() {
  const h = await getHomePage();
  return {
    heroImage: h?.heroImage ?? null,
    trustStats: h?.trustStats?.length ? h.trustStats : TRUST_STATS,
  };
}

export async function getMergedAboutPage() {
  const a = await getAboutPage();
  return {
    heroImage: a?.heroImage ?? null,
    secondaryImage: a?.secondaryImage ?? null,
    paragraph1: a?.paragraph1 ?? BIO.paragraph1,
    paragraph2: a?.paragraph2 ?? BIO.paragraph2,
    paragraph3: a?.paragraph3 ?? BIO.paragraph3,
    pullQuote: a?.pullQuote ?? BIO.pullQuote,
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
