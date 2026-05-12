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

// Fetch all documents — FULL content including nested arrays
const all = await client.fetch('*[_type in ["homePage","servicesPage","service","testimonial","value","faqItem"]]');

// Check processSteps items: schema allows _key, title, body, note only
const homeDocs = all.filter(d => d._type === 'homePage');
homeDocs.forEach(doc => {
  if (!doc.processSteps) return;
  doc.processSteps.forEach((step, i) => {
    const extra = Object.keys(step).filter(k => !['_key','_type','title','body','note'].includes(k));
    if (extra.length) console.log(`${doc._id}.processSteps[${i}] extra: ${extra.join(', ')}`);
  });
  if (!doc.trustStats) return;
  doc.trustStats.forEach((stat, i) => {
    const extra = Object.keys(stat).filter(k => !['_key','_type','value','label'].includes(k));
    if (extra.length) console.log(`${doc._id}.trustStats[${i}] extra: ${extra.join(', ')}`);
  });
});

// Check pricingCards: schema allows _key, title, body only
const servicesDocs = all.filter(d => d._type === 'servicesPage');
servicesDocs.forEach(doc => {
  if (!doc.pricingCards) return;
  doc.pricingCards.forEach((card, i) => {
    const extra = Object.keys(card).filter(k => !['_key','_type','title','body'].includes(k));
    if (extra.length) console.log(`${doc._id}.pricingCards[${i}] extra: ${extra.join(', ')} = ${JSON.stringify(extra.map(k => [k, card[k]]))}`);
  });
});

// Check service documents: schema allows title, slug, icon, shortDescription, description, services, priceRange, priceNote, freeConsult, order
const serviceDocs = all.filter(d => d._type === 'service');
const serviceAllowed = ['_id','_type','_rev','_createdAt','_updatedAt','title','slug','icon','shortDescription','description','services','priceRange','priceNote','freeConsult','order'];
serviceDocs.forEach(doc => {
  const extra = Object.keys(doc).filter(k => !serviceAllowed.includes(k));
  if (extra.length) console.log(`${doc._id} (service) extra: ${extra.join(', ')}`);
  if (doc.services) {
    doc.services.forEach((s, i) => {
      const allowedItem = ['_key','_type','name'];
      const itemExtra = Object.keys(s).filter(k => !allowedItem.includes(k));
      if (itemExtra.length) console.log(`  ${doc._id}.services[${i}] extra: ${itemExtra.join(', ')}`);
    });
  }
});

// testimonials: schema allows quote, name, occasion, order
const testDocs = all.filter(d => d._type === 'testimonial');
const testAllowed = ['_id','_type','_rev','_createdAt','_updatedAt','quote','name','occasion','order'];
testDocs.forEach(doc => {
  const extra = Object.keys(doc).filter(k => !testAllowed.includes(k));
  if (extra.length) console.log(`${doc._id} (testimonial) extra: ${extra.join(', ')}`);
});

// values: schema allows title, description, order
const valueDocs = all.filter(d => d._type === 'value');
const valueAllowed = ['_id','_type','_rev','_createdAt','_updatedAt','title','description','order'];
valueDocs.forEach(doc => {
  const extra = Object.keys(doc).filter(k => !valueAllowed.includes(k));
  if (extra.length) console.log(`${doc._id} (value) extra: ${extra.join(', ')}`);
});

console.log('Audit complete.');
