/**
 * clean-singletons.mjs
 * Replaces published singleton documents with ONLY schema-defined fields.
 * This strips any _system metadata or stale fields that the patch approach left behind.
 * Safe to run — drafts are untouched, only published documents are replaced.
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8')
  .split('\n').filter(l => l && !l.startsWith('#'))
  .reduce((acc, l) => { const [k, ...v] = l.split('='); acc[k.trim()] = v.join('=').trim(); return acc; }, {});

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false
});

// Fetch existing image references so we don't lose uploaded images
async function getImages(docId) {
  const doc = await client.getDocument(docId);
  if (!doc) return {};
  const images = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v && typeof v === 'object' && v._type === 'image') {
      images[k] = v;
    }
  }
  return images;
}

async function cleanReplace(docData) {
  const { _id } = docData;
  console.log(`  Replacing ${_id}...`);
  // createOrReplace writes EXACTLY what we provide — no extra fields
  await client.createOrReplace(docData);
  console.log(`  ✓ ${_id} replaced cleanly`);
}

// ── Fetch current image fields to preserve uploads ─────────────────────────
console.log('Fetching existing images...');
const [homeImages, aboutImages, servicesImages, portfolioImages, contactImages] = await Promise.all([
  getImages('homePage'),
  getImages('aboutPage'),
  getImages('servicesPage'),
  getImages('portfolioPage'),
  getImages('contactPage'),
]);

console.log('\nReplacing published singletons...');

await cleanReplace({
  _id: 'siteSettings',
  _type: 'siteSettings',
  ownerName: 'Grace Mae',
  businessName: 'Grace Mae Alterations',
  tagline: 'Sewn with precision.',
  subTagline: 'Every stitch tailored to you — and only you.',
  email: 'inquiries@gracemaealterations.com',
  instagram: '@gracemaealterations',
  instagramUrl: 'https://instagram.com/gracemaealterations',
  location: 'Pittsburgh, PA',
  availability: 'Available by Appointment',
  responseTime: 'I respond to all inquiries within 24 hours.',
  bookingNote: 'Now scheduling Spring & Summer 2026 consultations',
  phone: '',
  isAcceptingClients: true,
  metaDescription: 'Expert bridal and clothing alterations in Pittsburgh, PA. Grace Mae offers precision tailoring, wedding dress alterations, and custom work by appointment. Honest timelines. Exceptional craft.',
});

await cleanReplace({
  _id: 'homePage',
  _type: 'homePage',
  ...(homeImages.heroImage ? { heroImage: homeImages.heroImage } : {}),
  heroSectionLabel: 'Pittsburgh Bridal Alterations',
  heroCredentialText: 'Precision bridal alterations by a formally trained designer and former Lead Alterations Specialist at David\'s Bridal.',
  trustStats: [
    { _key: 'ts0', value: 'B.S. Fashion Design', label: 'Indiana University of PA' },
    { _key: 'ts1', value: '500+', label: 'Garments Altered' },
    { _key: 'ts2', value: 'Pittsburgh, PA', label: 'Proudly Local' },
  ],
  servicesLabel: 'What I Do',
  servicesHeading: 'Services',
  portfolioLabel: 'Selected Work',
  portfolioHeading: 'The Work',
  aboutTeaserLabel: 'The Seamstress',
  testimonialsLabel: 'Kind Words',
  testimonialsHeading: 'What clients say',
  processLabel: 'No Surprises',
  processHeading: 'What to Expect',
  processCTA: 'Ready to begin?',
  processSteps: [
    { _key: 'ps0', title: 'Reach Out',          body: 'Fill out the contact form with a few details about your garment. I respond to every inquiry within 24 hours.' },
    { _key: 'ps1', title: 'Free Consultation',   body: 'We look at the garment together. I assess what needs to be done and give you an honest, itemized quote. No commitment required.' },
    { _key: 'ps2', title: 'First Fitting',       body: 'I pin and mark every adjustment directly on you, so we both see exactly what changes before a single seam is cut.' },
    { _key: 'ps3', title: 'The Work',            body: 'I complete your alterations with full attention. For complex bridal gowns this may involve multiple stages of careful work.' },
    { _key: 'ps4', title: 'Progress Check',      body: 'For intricate bridal alterations, we do a mid-point fitting to verify fit and make fine adjustments before final finishing.', note: 'Bridal' },
    { _key: 'ps5', title: 'Pickup',              body: 'Your garment is finished, pressed, and ready. We do a final try-on together — we don\'t say goodbye until it\'s perfect.' },
  ],
  ctaHeadline: 'Your dress deserves to fit perfectly.',
  ctaSubhead: 'Book a consultation in Pittsburgh today.',
  ctaButton: 'Get in Touch',
});

await cleanReplace({
  _id: 'aboutPage',
  _type: 'aboutPage',
  ...(aboutImages.heroImage ? { heroImage: aboutImages.heroImage } : {}),
  ...(aboutImages.secondaryImage ? { secondaryImage: aboutImages.secondaryImage } : {}),
  heroLabel: 'The Seamstress',
  storyLabel: 'Background',
  storyHeading: 'From the classroom to the fitting room',
  paragraph1: "My path to alterations started at Indiana University of Pennsylvania, where I earned my Bachelor's degree in Fashion and Apparel Design in 2024. Throughout college I worked in the university's Costume Shop as an Alterations Assistant — fitting, pinning, and tailoring costumes for theater and dance productions each season. The work was detailed, deadline-driven, and taught me to handle everything from delicate chiffon to structured performance wear with equal care.",
  paragraph2: "After graduating, I joined David's Bridal as a Lead Alterations Specialist, working directly with brides to make sure their gowns fit perfectly for their wedding day. High-stakes work under real deadlines — it deepened my technical skills and my understanding of what it means to show up for someone during one of the most important moments of their life. When I stepped away to build my own business, I brought that knowledge with me and left behind the volume pressures that kept me from doing the work the way I know it should be done.",
  paragraph3: "Going independent means every client gets my full attention — not a fraction of it. I work by appointment only, give honest timelines, and take pride in garments that leave here better than they arrived. In 2025 I also completed a Master's degree in Human Resources and Employment Relations — because running a client-first business means being as intentional about the relationship as the craft itself. I'm based in Pittsburgh, and when you bring something to me, you're trusting me with something that matters.",
  pullQuote: 'Deadlines that are real. Craftsmanship that shows.',
  valuesLabel: 'What I Stand By',
  valuesHeading: 'My Values',
  independenceLabel: 'Why Independent',
  independenceHeading: 'Working for myself means working for you.',
  independenceQuote: "When I worked in a corporate shop, the pressure was to move fast, book more, and never slow down. I got very good at working quickly — but I missed the part of this craft that actually matters: giving a garment the attention it deserves, and giving a client the time to feel comfortable. Going independent let me do both. I don't overbook. I don't rush. And I don't work for a quota. I work for the people who trust me with something that matters to them.",
  ctaHeadline: 'Ready to work together?',
  ctaSubhead: "Let's talk about your garment.",
  ctaButton: 'Get in Touch',
});

await cleanReplace({
  _id: 'servicesPage',
  _type: 'servicesPage',
  ...(servicesImages.heroImage ? { heroImage: servicesImages.heroImage } : {}),
  heroLabel: 'What I Offer',
  heroHeading: 'Services',
  pricingLabel: 'Transparency First',
  pricingHeading: 'How Pricing Works',
  pricingCards: [
    { _key: 'pc0', title: 'Consultation First', body: 'Every project starts with a consultation so I can assess the garment, understand your needs, and give you an accurate quote — not a ballpark.' },
    { _key: 'pc1', title: 'No Surprise Charges', body: "The price I quote is the price you pay. If something unexpected comes up, I'll discuss it with you before proceeding." },
    { _key: 'pc2', title: 'Complexity & Timeline', body: 'Pricing reflects fabric type, alteration complexity, and your timeline. Rush requests may carry an additional fee — always communicated upfront.' },
  ],
  ctaHeadline: 'Ready to get started?',
  ctaSubhead: 'Book your consultation — no commitment, just a conversation.',
  ctaButton: 'Book a Consultation',
});

// Fetch full portfolioPage to preserve before/after images
const portfolioPageDoc = await client.getDocument('portfolioPage');
await cleanReplace({
  _id: 'portfolioPage',
  _type: 'portfolioPage',
  ...(portfolioImages.beforeImage ? { beforeImage: portfolioImages.beforeImage } : {}),
  ...(portfolioImages.afterImage ? { afterImage: portfolioImages.afterImage } : {}),
  ...(portfolioPageDoc?.featuredLabel ? { featuredLabel: portfolioPageDoc.featuredLabel } : {}),
  ...(portfolioPageDoc?.featuredDescription ? { featuredDescription: portfolioPageDoc.featuredDescription } : {}),
  heroLabel: 'Selected Work',
  heroHeading: 'The Work',
  heroSubtext: 'Each garment is a collaboration between craft and vision.',
  featuredSectionLabel: 'Featured Transformation',
  featuredHeading: 'Drag to see the difference.',
  featuredBody: 'Every alteration starts with a garment that almost fits and ends with one that feels made for you. Use the slider to compare the before and after — or scroll down to browse the full portfolio.',
  ctaHeadline: 'Your dress deserves to fit perfectly.',
  ctaSubhead: 'Book a consultation in Pittsburgh today.',
  ctaButton: 'Get in Touch',
});

await cleanReplace({
  _id: 'contactPage',
  _type: 'contactPage',
  ...(contactImages.image ? { image: contactImages.image } : {}),
  heroLabel: 'Get in Touch',
  heroHeading: "Let's Talk About Your Garment",
  waitlistBannerBold: "I'm currently fully booked.",
  waitlistBannerText: "Fill out the form below to join my waitlist — I'll reach out as soon as a spot opens up.",
  successHeading: 'Thank you.',
  successMessage: "Your message has been received. Check your inbox — I've sent a confirmation with next steps. I'll follow up within 24 hours.",
  waitlistSuccessMessage: "You're on my waitlist. I'll reach out as soon as a spot opens up.",
});

console.log('\n✅ All published singletons replaced cleanly.');
console.log('   Hard-refresh your Sanity Studio (Ctrl+Shift+R) to see the changes.');
