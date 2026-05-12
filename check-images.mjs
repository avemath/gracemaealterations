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

const docs = await client.fetch('*[_type in ["homePage","servicesPage","aboutPage","contactPage","portfolioPage","portfolioItem"]]');
docs.forEach(doc => {
  // Check all image fields
  Object.entries(doc).forEach(([key, val]) => {
    if (val && typeof val === 'object' && val._type === 'image') {
      const imageKeys = Object.keys(val);
      console.log(`${doc._id}.${key} image fields: ${imageKeys.join(', ')}`);
    }
  });
});
