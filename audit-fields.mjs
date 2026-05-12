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

// Schema fields for each type (manually compiled from schema files)
const schemaFields = {
  siteSettings: ['ownerName','businessName','tagline','subTagline','email','instagram','instagramUrl','location','availability','responseTime','bookingNote','metaDescription','isAcceptingClients','phone'],
  homePage: ['heroImage','heroSectionLabel','heroCredentialText','trustStats','servicesLabel','servicesHeading','portfolioLabel','portfolioHeading','aboutTeaserLabel','testimonialsLabel','testimonialsHeading','processLabel','processHeading','processCTA','processSteps','ctaHeadline','ctaSubhead','ctaButton'],
  aboutPage: ['heroImage','heroLabel','secondaryImage','storyLabel','storyHeading','paragraph1','paragraph2','paragraph3','pullQuote','valuesLabel','valuesHeading','independenceLabel','independenceHeading','independenceQuote','ctaHeadline','ctaSubhead','ctaButton'],
  servicesPage: ['heroLabel','heroHeading','heroImage','pricingLabel','pricingHeading','pricingCards','ctaHeadline','ctaSubhead','ctaButton'],
  portfolioPage: ['heroLabel','heroHeading','heroSubtext','featuredSectionLabel','featuredHeading','featuredBody','featuredLabel','featuredDescription','beforeImage','afterImage','ctaHeadline','ctaSubhead','ctaButton'],
  contactPage: ['heroLabel','heroHeading','waitlistBannerBold','waitlistBannerText','successHeading','successMessage','waitlistSuccessMessage','image'],
};

const docs = await client.fetch('*[_type in ["siteSettings","homePage","aboutPage","servicesPage","portfolioPage","contactPage"]]');
docs.forEach(doc => {
  const type = doc._type;
  const allowed = schemaFields[type] || [];
  const stored = Object.keys(doc).filter(k => !k.startsWith('_'));
  const unknown = stored.filter(k => !allowed.includes(k));
  if (unknown.length > 0) {
    console.log(`\n=== ${doc._id} (${type}) — ${unknown.length} UNKNOWN FIELDS ===`);
    unknown.forEach(f => console.log('  ❌', f, '=', JSON.stringify(doc[f])?.slice(0, 80)));
  } else {
    console.log(`✓ ${doc._id} — all fields valid`);
  }
});
