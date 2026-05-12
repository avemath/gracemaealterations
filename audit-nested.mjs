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

// Expected nested fields per array
const nestedFields = {
  trustStats: ['_key','value','label'],
  processSteps: ['_key','title','body','note'],
  pricingCards: ['_key','tier','price','description','items'],
};

const docs = await client.fetch('*[_type in ["homePage","servicesPage"]]');
docs.forEach(doc => {
  for (const [arrName, allowed] of Object.entries(nestedFields)) {
    if (!doc[arrName]) continue;
    doc[arrName].forEach((item, i) => {
      const unknown = Object.keys(item).filter(k => !allowed.includes(k));
      if (unknown.length > 0) {
        console.log(`${doc._id}.${arrName}[${i}] — unknown: ${unknown.map(k => k + '=' + JSON.stringify(item[k])).join(', ')}`);
      }
    });
  }
});

// Also check services, testimonials, values, faqItems
const listDocs = await client.fetch('*[_type in ["service","testimonial","value","faqItem"]]');
const serviceFields = ['_id','_type','_rev','_createdAt','_updatedAt','title','slug','description','items','icon','order'];
const testimonialFields = ['_id','_type','_rev','_createdAt','_updatedAt','quote','attribution','service','order'];
const valueFields = ['_id','_type','_rev','_createdAt','_updatedAt','title','body','icon','order'];
const faqFields = ['_id','_type','_rev','_createdAt','_updatedAt','question','answer','order'];

listDocs.forEach(doc => {
  let allowed;
  if (doc._type === 'service') allowed = serviceFields;
  else if (doc._type === 'testimonial') allowed = testimonialFields;
  else if (doc._type === 'value') allowed = valueFields;
  else if (doc._type === 'faqItem') allowed = faqFields;
  else return;
  const unknown = Object.keys(doc).filter(k => !allowed.includes(k));
  if (unknown.length > 0) {
    console.log(`${doc._id} (${doc._type}) — unknown: ${unknown.join(', ')}`);
  }
});

console.log('Done.');
