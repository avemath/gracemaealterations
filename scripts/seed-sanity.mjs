/**
 * seed-sanity.mjs
 * Populates ALL Sanity documents with the content from src/data/content.ts
 * so the Studio shows real text instead of blank fields.
 *
 * Usage:
 *   1. Get a write token: sanity.io/manage → your project → API → Tokens
 *      → Add API token → choose "Editor" role → copy the token
 *   2. Add it to .env.local:
 *        SANITY_API_TOKEN=<your-token>
 *   3. Run from the /site directory:
 *        node scripts/seed-sanity.mjs
 *
 * Safe to re-run — singletons are patched (not duplicated), and list docs
 * are only created if that document ID doesn't already exist.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
let env = {};
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = val;
  }
} catch {
  // .env.local not found — fall back to process.env
}

const projectId =
  env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "qv75bufa";
const dataset =
  env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = env.SANITY_API_TOKEN ?? process.env.SANITY_API_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error("");
  console.error("❌  SANITY_API_TOKEN is not set.");
  console.error("");
  console.error("   Steps to fix:");
  console.error("   1. Go to https://sanity.io/manage → your project → API → Tokens");
  console.error("   2. Click 'Add API token', choose the 'Editor' role, copy the token");
  console.error("   3. Add this line to site/.env.local:");
  console.error("        SANITY_API_TOKEN=<paste-token-here>");
  console.error("   4. Re-run: node scripts/seed-sanity.mjs");
  console.error("");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Patch-or-create BOTH the published document AND its draft (drafts.<id>).
 * Sanity Studio v3 displays the draft when one exists; without a draft it
 * renders an empty editing form even if a published version is present.
 */
async function upsertSingleton(doc) {
  const { _id, _type, ...fields } = doc;
  const draftId = `drafts.${_id}`;

  // Published document
  const published = await client.getDocument(_id);
  if (published) {
    await client.patch(_id).set(fields).commit();
    console.log(`  ✓ patched  ${_id}`);
  } else {
    await client.createOrReplace(doc);
    console.log(`  ✓ created  ${_id}`);
  }

  // Draft document — guarantees the Studio form is pre-filled
  const draft = await client.getDocument(draftId);
  if (draft) {
    await client.patch(draftId).set(fields).commit();
    console.log(`  ✓ patched  ${draftId}`);
  } else {
    await client.createOrReplace({ ...doc, _id: draftId });
    console.log(`  ✓ created  ${draftId}`);
  }
}

/** Create a document only if its _id doesn't already exist. */
async function createIfMissing(doc) {
  const existing = await client.getDocument(doc._id);
  if (existing) {
    console.log(`  – skipped  ${doc._id} (already exists)`);
  } else {
    await client.createOrReplace(doc);
    console.log(`  ✓ created  ${doc._id}`);
  }
}

// ── Content ───────────────────────────────────────────────────────────────────
// Mirrors src/data/content.ts — update both places if you change your copy.

// ── Site Settings ─────────────────────────────────────────────────────────────
console.log("\n📋  Site Settings");
await upsertSingleton({
  _id: "siteSettings",
  _type: "siteSettings",
  ownerName: "Grace Mae",
  businessName: "Grace Mae Alterations",
  tagline: "Sewn with precision.",
  subTagline: "Every stitch tailored to you — and only you.",
  email: "inquiries@gracemaealterations.com",
  instagram: "@gracemaealterations",
  instagramUrl: "https://instagram.com/gracemaealterations",
  location: "Pittsburgh, PA",
  availability: "Available by Appointment",
  responseTime: "I respond to all inquiries within 24 hours.",
  bookingNote: "Now scheduling Spring & Summer 2026 consultations",
  phone: "",
  isAcceptingClients: true,
  metaDescription:
    "Expert bridal and clothing alterations in Pittsburgh, PA. Grace Mae offers precision tailoring, wedding dress alterations, and custom work by appointment. Honest timelines. Exceptional craft.",
});

// ── Home Page ────────────────────────────────────────────────────────────────
console.log("\n🏠  Home Page");
await upsertSingleton({
  _id: "homePage",
  _type: "homePage",
  heroSectionLabel: "Pittsburgh Bridal Alterations",
  heroCredentialText:
    "Precision bridal alterations by a formally trained designer and former Lead Alterations Specialist at David's Bridal.",
  trustStats: [
    { _key: "ts0", value: "B.S. Fashion Design", label: "Indiana University of PA" },
    { _key: "ts1", value: "500+", label: "Garments Altered" },
    { _key: "ts2", value: "Pittsburgh, PA", label: "Proudly Local" },
  ],
  servicesLabel: "What I Do",
  servicesHeading: "Services",
  portfolioLabel: "Selected Work",
  portfolioHeading: "The Work",
  aboutTeaserLabel: "The Seamstress",
  testimonialsLabel: "Kind Words",
  testimonialsHeading: "What clients say",
  processLabel: "No Surprises",
  processHeading: "What to Expect",
  processCTA: "Ready to begin?",
  processSteps: [
    { _key: "ps0", title: "Reach Out",          body: "Fill out the contact form with a few details about your garment. I respond to every inquiry within 24 hours." },
    { _key: "ps1", title: "Free Consultation",   body: "We look at the garment together. I assess what needs to be done and give you an honest, itemized quote. No commitment required." },
    { _key: "ps2", title: "First Fitting",       body: "I pin and mark every adjustment directly on you, so we both see exactly what changes before a single seam is cut." },
    { _key: "ps3", title: "The Work",            body: "I complete your alterations with full attention. For complex bridal gowns this may involve multiple stages of careful work." },
    { _key: "ps4", title: "Progress Check",      body: "For intricate bridal alterations, we do a mid-point fitting to verify fit and make fine adjustments before final finishing.", note: "Bridal" },
    { _key: "ps5", title: "Pickup",              body: "Your garment is finished, pressed, and ready. We do a final try-on together — we don't say goodbye until it's perfect." },
  ],
  ctaHeadline: "Your dress deserves to fit perfectly.",
  ctaSubhead: "Book a consultation in Pittsburgh today.",
  ctaButton: "Get in Touch",
});

// ── About Page ───────────────────────────────────────────────────────────────
console.log("\n👤  About Page");
await upsertSingleton({
  _id: "aboutPage",
  _type: "aboutPage",
  heroLabel: "The Seamstress",
  storyLabel: "Background",
  storyHeading: "From the classroom to the fitting room",
  paragraph1:
    "My path to alterations started at Indiana University of Pennsylvania, where I earned my Bachelor's degree in Fashion and Apparel Design in 2024. Throughout college I worked in the university's Costume Shop as an Alterations Assistant — fitting, pinning, and tailoring costumes for theater and dance productions each season. The work was detailed, deadline-driven, and taught me to handle everything from delicate chiffon to structured performance wear with equal care.",
  paragraph2:
    "After graduating, I joined David's Bridal as a Lead Alterations Specialist, working directly with brides to make sure their gowns fit perfectly for their wedding day. High-stakes work under real deadlines — it deepened my technical skills and my understanding of what it means to show up for someone during one of the most important moments of their life. When I stepped away to build my own business, I brought that knowledge with me and left behind the volume pressures that kept me from doing the work the way I know it should be done.",
  paragraph3:
    "Going independent means every client gets my full attention — not a fraction of it. I work by appointment only, give honest timelines, and take pride in garments that leave here better than they arrived. In 2025 I also completed a Master's degree in Human Resources and Employment Relations — because running a client-first business means being as intentional about the relationship as the craft itself. I'm based in Pittsburgh, and when you bring something to me, you're trusting me with something that matters.",
  pullQuote: "Deadlines that are real. Craftsmanship that shows.",
  valuesLabel: "What I Stand By",
  valuesHeading: "My Values",
  independenceLabel: "Why Independent",
  independenceHeading: "Working for myself means working for you.",
  independenceQuote:
    "When I worked in a corporate shop, the pressure was to move fast, book more, and never slow down. I got very good at working quickly — but I missed the part of this craft that actually matters: giving a garment the attention it deserves, and giving a client the time to feel comfortable. Going independent let me do both. I don't overbook. I don't rush. And I don't work for a quota. I work for the people who trust me with something that matters to them.",
  ctaHeadline: "Ready to work together?",
  ctaSubhead: "Let's talk about your garment.",
  ctaButton: "Get in Touch",
});

// ── Services Page ────────────────────────────────────────────────────────────
console.log("\n✂️   Services Page");
await upsertSingleton({
  _id: "servicesPage",
  _type: "servicesPage",
  heroLabel: "What I Offer",
  heroHeading: "Services",
  pricingLabel: "Transparency First",
  pricingHeading: "How Pricing Works",
  pricingCards: [
    {
      _key: "pc0",
      title: "Consultation First",
      body: "Every project starts with a consultation so I can assess the garment, understand your needs, and give you an accurate quote — not a ballpark.",
    },
    {
      _key: "pc1",
      title: "No Surprise Charges",
      body: "The price I quote is the price you pay. If something unexpected comes up, I'll discuss it with you before proceeding.",
    },
    {
      _key: "pc2",
      title: "Complexity & Timeline",
      body: "Pricing reflects fabric type, alteration complexity, and your timeline. Rush requests may carry an additional fee — always communicated upfront.",
    },
  ],
  ctaHeadline: "Ready to get started?",
  ctaSubhead: "Book your consultation — no commitment, just a conversation.",
  ctaButton: "Book a Consultation",
});

// ── Portfolio Page ───────────────────────────────────────────────────────────
console.log("\n🖼️   Portfolio Page");
await upsertSingleton({
  _id: "portfolioPage",
  _type: "portfolioPage",
  heroLabel: "Selected Work",
  heroHeading: "The Work",
  heroSubtext: "Each garment is a collaboration between craft and vision.",
  featuredSectionLabel: "Featured Transformation",
  featuredHeading: "Drag to see the difference.",
  featuredBody:
    "Every alteration starts with a garment that almost fits and ends with one that feels made for you. Use the slider to compare the before and after — or scroll down to browse the full portfolio.",
  ctaHeadline: "Your dress deserves to fit perfectly.",
  ctaSubhead: "Book a consultation in Pittsburgh today.",
  ctaButton: "Get in Touch",
});

// ── Contact Page ─────────────────────────────────────────────────────────────
console.log("\n📬  Contact Page");
await upsertSingleton({
  _id: "contactPage",
  _type: "contactPage",
  heroLabel: "Get in Touch",
  heroHeading: "Let's Talk About Your Garment",
  waitlistBannerBold: "I'm currently fully booked.",
  waitlistBannerText:
    "Fill out the form below to join my waitlist — I'll reach out as soon as a spot opens up.",
  successHeading: "Thank you.",
  successMessage:
    "Your message has been received. Check your inbox — I've sent a confirmation with next steps. I'll follow up within 24 hours.",
  waitlistSuccessMessage: "You're on my waitlist. I'll reach out as soon as a spot opens up.",
});

// ── Services (list) ──────────────────────────────────────────────────────────
console.log("\n🧵  Services");
await createIfMissing({
  _id: "service-bridal",
  _type: "service",
  title: "Bridal Alterations",
  slug: { _type: "slug", current: "bridal" },
  icon: "bridal",
  order: 1,
  shortDescription:
    "From sweeping cathedral trains to intricate lace bodices, bridal work is where precision is non-negotiable.",
  description:
    "Your wedding dress is the most important garment you'll ever wear — and it deserves to fit as if it was made for you alone. With extensive bridal alteration experience including time at David's Bridal, I understand exactly what it takes to transform an off-the-rack gown into something that feels completely custom. Every fitting is unhurried, every stitch deliberate.",
  services: [
    "Hem adjustments (standard, cathedral, horsehair)",
    "Bustle addition (American, French, Austrian)",
    "Taking in or letting out (bodice, waist, hips)",
    "Strap adjustments and additions",
    "Corset back conversion and boning work",
    "Lace and beading repair and transfer",
    "Veil customization and attachment",
    "Train preservation and preservation prep",
  ],
  priceRange: "$75 – $450+",
  priceNote: "depending on complexity and fabric",
  freeConsult: "All bridal work includes a complimentary fitting consultation.",
});

await createIfMissing({
  _id: "service-tailoring",
  _type: "service",
  title: "Everyday Tailoring",
  slug: { _type: "slug", current: "tailoring" },
  icon: "tailoring",
  order: 2,
  shortDescription:
    "Well-fitting clothes change how you carry yourself. I make sure everything you wear feels like it was made for you.",
  description:
    "Off-the-rack clothes are made for a statistical average that fits almost nobody perfectly. Tailoring changes that. Whether it's a pair of trousers you love but can never get right, a dress that's close but not quite, or a jacket that needs to come in through the waist — I handle it cleanly, quickly, and affordably.",
  services: [
    "Pants and trouser hemming",
    "Dress and skirt alterations",
    "Jacket and blazer tailoring",
    "Zipper replacement and repair",
    "Waist and seat adjustments",
    "Sleeve shortening and tapering",
    "Side seam adjustments",
  ],
  priceRange: "$20 – $120",
  priceNote: "most items quoted at consultation",
});

await createIfMissing({
  _id: "service-custom",
  _type: "service",
  title: "Custom & Repairs",
  slug: { _type: "slug", current: "custom" },
  icon: "custom",
  order: 3,
  shortDescription:
    "Vintage restoration, costume construction, and garments that need more than a simple hem — I take on the complicated work.",
  description:
    "Some garments deserve more than a quick fix. Vintage pieces carry history and require a careful hand. Costumes require creativity under construction constraints. Special occasion wear demands the same level of attention as bridal work. I take on these projects with the same care I give every garment that comes through my door.",
  services: [
    "Vintage garment restoration and repair",
    "Costume construction and alterations",
    "Patch and structural repair",
    "Lining replacement",
    "Mother-of-the-bride and special occasion alterations",
    "Bridesmaid dress alterations",
    "Heirloom garment preservation",
  ],
  priceRange: "Quoted individually",
  priceNote: "based on scope and materials",
});

// ── Testimonials (list) ──────────────────────────────────────────────────────
console.log("\n💬  Testimonials");
await createIfMissing({
  _id: "testimonial-olivia",
  _type: "testimonial",
  order: 1,
  quote:
    "She took a dress I had given up on and made it the most beautiful thing I've ever worn. The fit was so perfect my mother cried at the fitting. I cannot recommend her enough.",
  name: "Olivia R.",
  occasion: "Wedding, August 2024",
});
await createIfMissing({
  _id: "testimonial-danielle",
  _type: "testimonial",
  order: 2,
  quote:
    "I've been to other seamstresses before and the difference is night and day. Grace Mae actually listened to what I wanted, explained exactly what she was going to do, and delivered ahead of schedule. Worth every penny.",
  name: "Danielle M.",
  occasion: "Mother of the Bride, June 2024",
});
await createIfMissing({
  _id: "testimonial-sarah",
  _type: "testimonial",
  order: 3,
  quote:
    "Brought in a vintage gown from the 1970s that I wanted to wear for my wedding. Most places turned me away. She took one look at it and said 'I can work with this.' She was right.",
  name: "Sarah K.",
  occasion: "Vintage Bridal, October 2023",
});

// ── Values (list) ────────────────────────────────────────────────────────────
console.log("\n💎  Values");
await createIfMissing({
  _id: "value-timelines",
  _type: "value",
  order: 1,
  title: "Honest Timelines",
  description:
    "I will never overcommit and underdeliver. Every timeline I give you is one I can keep — because your event date is not negotiable.",
});
await createIfMissing({
  _id: "value-craft",
  _type: "value",
  order: 2,
  title: "Precision Craft",
  description:
    "Formal training in fashion design, hands-on work in a professional costume shop, and experience as a lead bridal alterations specialist means I've worked with the full range of fabrics, silhouettes, and fit challenges. I bring that foundation to every stitch.",
});
await createIfMissing({
  _id: "value-attention",
  _type: "value",
  order: 3,
  title: "Personal Attention",
  description:
    "I work by appointment only, which means when you're here, you have my undivided focus. No rushing, no distractions.",
});

// ── FAQ (list) ───────────────────────────────────────────────────────────────
console.log("\n❓  FAQ Items");
await createIfMissing({
  _id: "faq-booking",
  _type: "faqItem",
  order: 1,
  question: "How far in advance should I book?",
  answer:
    "For bridal alterations, I recommend booking as soon as you have your dress — ideally 3 to 6 months before your wedding date. This allows time for multiple fittings without rushing. For everyday tailoring, 2–3 weeks is typically sufficient, though I always recommend calling ahead to confirm availability.",
});
await createIfMissing({
  _id: "faq-garments",
  _type: "faqItem",
  order: 2,
  question: "Do you work on garments that weren't purchased from a bridal shop?",
  answer:
    "Absolutely. I work on all wedding dresses regardless of where they were purchased — including online purchases, heirloom gowns, vintage finds, and secondhand dresses. Every garment is evaluated individually at a consultation.",
});
await createIfMissing({
  _id: "faq-fittings",
  _type: "faqItem",
  order: 3,
  question: "How many fittings will I need?",
  answer:
    "Most bridal alterations require 2 to 3 fittings: an initial consultation and pinning, a fitting to check progress, and a final fitting. The number can vary depending on the complexity of the alterations and how the garment responds to changes. For everyday tailoring, usually just one fitting is needed.",
});
await createIfMissing({
  _id: "faq-rush",
  _type: "faqItem",
  order: 4,
  question: "Do you offer rush services?",
  answer:
    "Rush services are available on a case-by-case basis depending on my current schedule and the complexity of the work. Rush jobs (under 2 weeks for bridal, under 1 week for tailoring) do carry an additional fee. Please contact me as early as possible if you have a tight deadline — the sooner you reach out, the more options we have.",
});
await createIfMissing({
  _id: "faq-bring",
  _type: "faqItem",
  order: 5,
  question: "What should I bring to my first fitting?",
  answer:
    "Bring the garment you need altered, any undergarments or shapewear you plan to wear with it (this matters significantly for fit), and the shoes you'll be wearing if a hem adjustment is needed. For bridal fittings, bring anything you're planning to wear underneath — the right foundation garments can change the fit dramatically.",
});
await createIfMissing({
  _id: "faq-accepting",
  _type: "faqItem",
  order: 6,
  question: "Are you taking new clients?",
  answer:
    "Yes — I'm currently accepting new clients for both bridal and everyday tailoring. I work by appointment only, so reach out through the contact form or email to check availability and schedule your first consultation.",
});

console.log("\n✅  All done! Open your Studio and every section should now show real content.");
console.log("   Remember: the text shown on the website is the fallback from content.ts,");
console.log("   but now Sanity has the same values so they match.");
console.log("");
