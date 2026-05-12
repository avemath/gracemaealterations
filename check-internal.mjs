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

// Get raw documents with ALL keys including underscore-prefixed ones
const docs = await client.fetch('*[_type in ["siteSettings","homePage","aboutPage","servicesPage","portfolioPage","contactPage","service","testimonial","value"]]');
docs.forEach(doc => {
  const allKeys = Object.keys(doc);
  const underscoreExtras = allKeys.filter(k => k.startsWith('_') && !['_id','_type','_rev','_createdAt','_updatedAt'].includes(k));
  if (underscoreExtras.length > 0) {
    console.log(`${doc._id}: extra underscore fields: ${underscoreExtras.join(', ')}`);
  }
});
console.log('Done checking internal fields.');
