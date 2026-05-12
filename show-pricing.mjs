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

const docs = await client.fetch('*[_type in ["servicesPage","homePage","portfolioPage","contactPage","aboutPage","siteSettings"]]');
docs.forEach(doc => {
  console.log(`\n=== ${doc._id} ===`);
  // Check each array field for unexpected keys in items
  ['pricingCards','processSteps','trustStats'].forEach(arr => {
    if (!doc[arr]) return;
    doc[arr].forEach((item, i) => {
      const keys = Object.keys(item);
      console.log(`  ${arr}[${i}] keys: ${keys.join(', ')}`);
    });
  });
});
