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

// Fetch EVERYTHING with full content
const all = await client.fetch('*[!(_id in path("_.**"))]');
console.log('Total non-system docs:', all.length);

// For each document, show ALL stored fields (not just top-level)
// The Sanity warning counts fields across the ENTIRE document object
// Let's find docs with ANY field that shouldn't be there

const schemaFieldMap = {
  siteSettings: ['ownerName','businessName','tagline','subTagline','email','instagram','instagramUrl','location','availability','responseTime','bookingNote','metaDescription','isAcceptingClients','phone'],
  homePage: ['heroImage','heroSectionLabel','heroCredentialText','trustStats','servicesLabel','servicesHeading','portfolioLabel','portfolioHeading','aboutTeaserLabel','testimonialsLabel','testimonialsHeading','processLabel','processHeading','processCTA','processSteps','ctaHeadline','ctaSubhead','ctaButton'],
  aboutPage: ['heroImage','heroLabel','secondaryImage','storyLabel','storyHeading','paragraph1','paragraph2','paragraph3','pullQuote','valuesLabel','valuesHeading','independenceLabel','independenceHeading','independenceQuote','ctaHeadline','ctaSubhead','ctaButton'],
  servicesPage: ['heroLabel','heroHeading','heroImage','pricingLabel','pricingHeading','pricingCards','ctaHeadline','ctaSubhead','ctaButton'],
  portfolioPage: ['heroLabel','heroHeading','heroSubtext','featuredSectionLabel','featuredHeading','featuredBody','featuredLabel','featuredDescription','beforeImage','afterImage','ctaHeadline','ctaSubhead','ctaButton'],
  contactPage: ['heroLabel','heroHeading','waitlistBannerBold','waitlistBannerText','successHeading','successMessage','waitlistSuccessMessage','image'],
  service: ['title','slug','icon','shortDescription','description','services','priceRange','priceNote','freeConsult','order'],
  testimonial: ['quote','name','occasion','order'],
  value: ['title','description','order'],
  faqItem: ['question','answer','order'],
  portfolioItem: ['image','label','type','order'],
};

const sanityInternal = ['_id','_type','_rev','_createdAt','_updatedAt','_system'];

all.forEach(doc => {
  const type = doc._type;
  if (!schemaFieldMap[type]) return; // skip system types
  const allowed = [...sanityInternal, ...(schemaFieldMap[type] || [])];
  const unknown = Object.keys(doc).filter(k => !allowed.includes(k));
  if (unknown.length > 0) {
    console.log(`\n${doc._id} (${type}) — ${unknown.length} unknown fields:`);
    unknown.forEach(k => {
      const val = JSON.stringify(doc[k]);
      console.log(`  "${k}": ${val?.slice(0, 100)}`);
    });
  }
});

console.log('\nDeep audit complete.');
