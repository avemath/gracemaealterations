/**
 * ============================================================
 * CONTENT.TS — Single Source of Truth
 * ============================================================
 * Update ALL site content here. You should never need to
 * touch a component file to update text, prices, or images.
 * ============================================================
 */

// ── IDENTITY ──────────────────────────────────────────────────
export const SITE = {
  name: "Grace Mae",          // ← UPDATE: Your full name
  businessName: "Grace Mae Alterations",
  tagline: "Sewn with precision.",
  subTagline: "Every stitch tailored to you — and only you.",
  location: "Pittsburgh, PA",
  email: "inquiries@gracemaealterations.com",
  instagram: "@gracemaealterations",         // ← UPDATE: Your Instagram handle
  instagramUrl: "https://instagram.com/gracemaealterations", // ← UPDATE
  availability: "Available by Appointment",
  responseTime: "I respond to all inquiries within 24 hours.",
  bookingNote: "Now scheduling Spring & Summer 2026 consultations",
  phone: "",                    // ← UPDATE: Your business phone number (e.g. "(412) 555-0000") — leave blank to hide
  isAcceptingClients: true,     // ← Set to false to put the WHOLE contact form into Waitlist mode

  // ── Limited availability ────────────────────────────────────
  // Per-service version of the switch above: the site stays open for
  // everything except the services listed in waitlistServices.
  // Toggle with: npm run availability:limited / npm run availability:open
  limitedMode: false,
  waitlistServices: [] as string[],   // e.g. ["bridal"]
  reopensLabel: "",                   // e.g. "early 2027"
  limitedNote: "",                    // one line shown under the hero and on the contact page
  metaDescription:
    "Expert bridal and clothing alterations in Pittsburgh, PA. Grace Mae offers precision tailoring, wedding dress alterations, and custom work by appointment. Honest timelines. Exceptional craft.",
};

// ── TRUST BAR STATS ───────────────────────────────────────────
// Displayed in the homepage trust bar. Edit numbers and labels here.
export const TRUST_STATS = [
  { value: "B.S. Fashion Design", label: "Indiana University of PA" },
  { value: "500+", label: "Garments Altered" },
  { value: "Pittsburgh, PA", label: "Proudly Local" },
];

// ── BIO / ABOUT ───────────────────────────────────────────────
export const BIO = {
  // Paragraph 1: Origin — IUP Fashion Design, Costume Shop
  paragraph1:
    "My path to alterations started at Indiana University of Pennsylvania, where I earned my Bachelor's degree in Fashion and Apparel Design in 2024. Throughout college I worked in the university's Costume Shop as an Alterations Assistant — fitting, pinning, and tailoring costumes for theater and dance productions each season. The work was detailed, deadline-driven, and taught me to handle everything from delicate chiffon to structured performance wear with equal care.",

  // Paragraph 2: David's Bridal, Lead Specialist, going independent
  paragraph2:
    "After graduating, I joined David's Bridal as a Lead Alterations Specialist, working directly with brides to make sure their gowns fit perfectly for their wedding day. High-stakes work under real deadlines — it deepened my technical skills and my understanding of what it means to show up for someone during one of the most important moments of their life. When I stepped away to build my own business, I brought that knowledge with me and left behind the volume pressures that kept me from doing the work the way I know it should be done.",

  // Paragraph 3: Philosophy — care, Pittsburgh focus, Master's degree
  paragraph3:
    "Going independent means every client gets my full attention — not a fraction of it. I work by appointment only, give honest timelines, and take pride in garments that leave here better than they arrived. In 2025 I also completed a Master's degree in Human Resources and Employment Relations — because running a client-first business means being as intentional about the relationship as the craft itself. I'm based in Pittsburgh, and when you bring something to me, you're trusting me with something that matters.",

  pullQuote: "Deadlines that are real. Craftsmanship that shows.",
  independenceQuote:
    "When I worked in a corporate shop, the pressure was to move fast, book more, and never slow down. I got very good at working quickly — but I missed the part of this craft that actually matters: giving a garment the attention it deserves, and giving a client the time to feel comfortable. Going independent let me do both. I don't overbook. I don't rush. And I don't work for a quota. I work for the people who trust me with something that matters to them.",
};

// ── VALUES ────────────────────────────────────────────────────
export const VALUES = [
  {
    title: "Honest Timelines",
    description:
      "I will never overcommit and underdeliver. Every timeline I give you is one I can keep — because your event date is not negotiable.",
  },
  {
    title: "Precision Craft",
    description:
      "Formal training in fashion design, hands-on work in a professional costume shop, and experience as a lead bridal alterations specialist means I've worked with the full range of fabrics, silhouettes, and fit challenges. I bring that foundation to every stitch.",
  },
  {
    title: "Personal Attention",
    description:
      "I work by appointment only, which means when you're here, you have my undivided focus. No rushing, no distractions.",
  },
];

// ── SERVICES ──────────────────────────────────────────────────
export const SERVICES = [
  {
    id: "bridal",
    title: "Bridal Alterations",
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
    icon: "bridal",
  },
  {
    id: "tailoring",
    title: "Everyday Tailoring",
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
    icon: "tailoring",
  },
  {
    id: "custom",
    title: "Custom & Repairs",
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
    icon: "custom",
  },
];

// ── TESTIMONIALS ──────────────────────────────────────────────
// Replace with real client testimonials as you collect them.
export const TESTIMONIALS = [
  {
    quote:
      "She took a dress I had given up on and made it the most beautiful thing I've ever worn. The fit was so perfect my mother cried at the fitting. I cannot recommend her enough.",
    name: "Olivia R.",
    occasion: "Wedding, August 2024",
  },
  {
    quote:
      "I've been to other seamstresses before and the difference is night and day. Grace Mae actually listened to what I wanted, explained exactly what she was going to do, and delivered ahead of schedule. Worth every penny.",
    name: "Danielle M.",
    occasion: "Mother of the Bride, June 2024",
  },
  {
    quote:
      "Brought in a vintage gown from the 1970s that I wanted to wear for my wedding. Most places turned me away. She took one look at it and said 'I can work with this.' She was right.",
    name: "Sarah K.",
    occasion: "Vintage Bridal, October 2023",
  },
];

// ── PORTFOLIO IMAGES ──────────────────────────────────────────
// Update the src paths once you have real photos.
// The label and type guide what photos work best in each slot.
export const PORTFOLIO_ITEMS = [
  {
    id: 1,
    src: "/images/portfolio/portfolio-1.jpg",
    alt: "Before and after bridal gown alteration — full length",
    label: "Bridal Gown",
    type: "bridal",
    // SHOT GUIDE: Before/after full-length shot of a wedding dress on a dress form
  },
  {
    id: 2,
    src: "/images/portfolio/portfolio-2.jpg",
    alt: "Detail shot of lace bodice alteration and beading work",
    label: "Lace Detail",
    type: "bridal",
    // SHOT GUIDE: Close-up of intricate lace or beadwork on a bodice
  },
  {
    id: 3,
    src: "/images/portfolio/portfolio-3.jpg",
    alt: "Tailored blazer jacket before and after waist suppression",
    label: "Tailored Blazer",
    type: "tailoring",
    // SHOT GUIDE: Jacket on dress form or model showing clean waist
  },
  {
    id: 4,
    src: "/images/portfolio/portfolio-4.jpg",
    alt: "Full bridal fitting — bride in altered wedding gown",
    label: "Bridal Fitting",
    type: "bridal",
    // SHOT GUIDE: Bride standing in fitted gown, ideally back view showing closure
  },
  {
    id: 5,
    src: "/images/portfolio/portfolio-5.jpg",
    alt: "Bustle detail on cathedral train wedding dress",
    label: "Bustle Work",
    type: "bridal",
    // SHOT GUIDE: Close-up of an American or French bustle on a cathedral train
  },
  {
    id: 6,
    src: "/images/portfolio/portfolio-6.jpg",
    alt: "Vintage gown restoration — full-length after",
    label: "Vintage Restoration",
    type: "custom",
    // SHOT GUIDE: Restored vintage garment on dress form, styled elegantly
  },
  {
    id: 7,
    src: "/images/portfolio/portfolio-7.jpg",
    alt: "Bridesmaid dress alterations — group of dresses on forms",
    label: "Bridesmaid Dresses",
    type: "bridal",
    // SHOT GUIDE: 3-4 matching bridesmaid dresses on forms, uniformly hemmed
  },
  {
    id: 8,
    src: "/images/portfolio/portfolio-8.jpg",
    alt: "Tailored trousers hemming detail — cuff and break",
    label: "Trouser Tailoring",
    type: "tailoring",
    // SHOT GUIDE: Close-up of trouser hem/break, ideally with cuff detail
  },
  {
    id: 9,
    src: "/images/portfolio/portfolio-9.jpg",
    alt: "Custom corset back conversion on wedding dress",
    label: "Corset Conversion",
    type: "bridal",
    // SHOT GUIDE: Back of wedding dress showing corset lace-up closure
  },
  {
    id: 10,
    src: "/images/portfolio/portfolio-10.jpg",
    alt: "Special occasion dress alteration — mother of bride gown",
    label: "Special Occasion",
    type: "custom",
    // SHOT GUIDE: Elegant special occasion gown, fitted and styled
  },
  {
    id: 11,
    src: "/images/portfolio/portfolio-11.jpg",
    alt: "Fabric and sewing detail — hands at work on bridal fabric",
    label: "Craft Detail",
    type: "custom",
    // SHOT GUIDE: Hands-at-work shot — needle, thread, and fabric close-up
  },
  {
    id: 12,
    src: "/images/portfolio/portfolio-12.jpg",
    alt: "Wedding dress hem alteration — floor-length with floral detail",
    label: "Hem & Finish",
    type: "bridal",
    // SHOT GUIDE: Beautiful hem close-up on finished gown, showing clean finish
  },
];

// ── FAQ ───────────────────────────────────────────────────────
export const FAQ = [
  {
    question: "How far in advance should I book?",
    answer:
      "For bridal alterations, I recommend booking as soon as you have your dress — ideally 3 to 6 months before your wedding date. This allows time for multiple fittings without rushing. For everyday tailoring, 2–3 weeks is typically sufficient, though I always recommend calling ahead to confirm availability.",
  },
  {
    question: "Do you work on garments that weren't purchased from a bridal shop?",
    answer:
      "Absolutely. I work on all wedding dresses regardless of where they were purchased — including online purchases, heirloom gowns, vintage finds, and secondhand dresses. Every garment is evaluated individually at a consultation.",
  },
  {
    question: "How many fittings will I need?",
    answer:
      "Most bridal alterations require 2 to 3 fittings: an initial consultation and pinning, a fitting to check progress, and a final fitting. The number can vary depending on the complexity of the alterations and how the garment responds to changes. For everyday tailoring, usually just one fitting is needed.",
  },
  {
    question: "Do you offer rush services?",
    answer:
      "Rush services are available on a case-by-case basis depending on my current schedule and the complexity of the work. Rush jobs (under 2 weeks for bridal, under 1 week for tailoring) do carry an additional fee. Please contact me as early as possible if you have a tight deadline — the sooner you reach out, the more options we have.",
  },
  {
    question: "What should I bring to my first fitting?",
    answer:
      "Bring the garment you need altered, any undergarments or shapewear you plan to wear with it (this matters significantly for fit), and the shoes you'll be wearing if a hem adjustment is needed. For bridal fittings, bring anything you're planning to wear underneath — the right foundation garments can change the fit dramatically.",
  },
  {
    question: "Are you taking new clients?",
    answer:
      "Yes, for everyday tailoring and small repairs. Bridal and larger custom projects reopen early 2027. You can join the waitlist now and I'll contact you in order as dates open. If your date is sooner, mention it in your request and I'll tell you honestly whether it's possible.",
  },
  {
    question: "When does bridal booking reopen?",
    answer:
      "Early 2027. Join the waitlist from the contact page and I'll reach out in order.",
  },
];

// ── PAGE SECTION TEXT ─────────────────────────────────────────
// Fallback values for all section labels, headings, and body copy.
// These are used when the corresponding Sanity document field is empty.
// Edit them here OR (preferred) through the Sanity Studio CMS.

export const HOME_TEXT = {
  heroSectionLabel: "Pittsburgh Bridal Alterations",
  heroCredentialText:
    "Precision bridal alterations by a formally trained designer and former Lead Alterations Specialist at David's Bridal.",
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
  ctaHeadline: "Your dress deserves to fit perfectly.",
  ctaSubhead: "Book a consultation in Pittsburgh today.",
  ctaButton: "Get in Touch",
};

export const PROCESS_STEPS: { title: string; body: string; note?: string }[] = [
  { title: "Reach Out",        body: "Fill out the contact form with a few details about your garment. I respond to every inquiry within 24 hours." },
  { title: "Free Consultation", body: "We look at the garment together. I assess what needs to be done and give you an honest, itemized quote. No commitment required." },
  { title: "First Fitting",    body: "I pin and mark every adjustment directly on you, so we both see exactly what changes before a single seam is cut." },
  { title: "The Work",         body: "I complete your alterations with full attention. For complex bridal gowns this may involve multiple stages of careful work." },
  { title: "Progress Check",   body: "For intricate bridal alterations, we do a mid-point fitting to verify fit and make fine adjustments before final finishing.", note: "Bridal" },
  { title: "Pickup",           body: "Your garment is finished, pressed, and ready. We do a final try-on together — we don't say goodbye until it's perfect." },
];

export const ABOUT_TEXT = {
  heroLabel: "The Seamstress",
  storyLabel: "Background",
  storyHeading: "From the classroom to the fitting room",
  valuesLabel: "What I Stand By",
  valuesHeading: "My Values",
  independenceLabel: "Why Independent",
  independenceHeading: "Working for myself means working for you.",
  ctaHeadline: "Ready to work together?",
  ctaSubhead: "Let's talk about your garment.",
  ctaButton: "Get in Touch",
};

export const SERVICES_TEXT = {
  heroLabel: "What I Offer",
  heroHeading: "Services",
  pricingLabel: "Transparency First",
  pricingHeading: "How Pricing Works",
  ctaHeadline: "Ready to get started?",
  ctaSubhead: "Book your consultation — no commitment, just a conversation.",
  ctaButton: "Book a Consultation",
};

export const PRICING_CARDS: { title: string; body: string }[] = [
  {
    title: "Consultation First",
    body: "Every project starts with a consultation so I can assess the garment, understand your needs, and give you an accurate quote — not a ballpark.",
  },
  {
    title: "No Surprise Charges",
    body: "The price I quote is the price you pay. If something unexpected comes up, I'll discuss it with you before proceeding.",
  },
  {
    title: "Complexity & Timeline",
    body: "Pricing reflects fabric type, alteration complexity, and your timeline. Rush requests may carry an additional fee — always communicated upfront.",
  },
];

export const PORTFOLIO_TEXT = {
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
};

export const CONTACT_TEXT = {
  heroLabel: "Get in Touch",
  heroHeading: "Let's Talk About Your Garment",
  waitlistBannerBold: "I'm currently fully booked.",
  waitlistBannerText:
    "Fill out the form below to join my waitlist — I'll reach out as soon as a spot opens up.",
  successHeading: "Thank you.",
  successMessage:
    "Your message has been received. Check your inbox — I've sent a confirmation with next steps. I'll follow up within 24 hours.",
  waitlistSuccessMessage: "You're on my waitlist. I'll reach out as soon as a spot opens up.",
};

// ── IMAGE PATHS ───────────────────────────────────────────────
// Update these paths when you add real photos.
// All images go in /public/images/
export const IMAGES = {
  HERO_PORTRAIT: "/images/hero-portrait.jpg",
  ABOUT_HERO: "/images/about-hero.jpg",
  ABOUT_SECONDARY: "/images/about-secondary.jpg",
  SERVICES_HERO: "/images/services-hero.jpg",
  CONTACT: "/images/contact.jpg",
};
