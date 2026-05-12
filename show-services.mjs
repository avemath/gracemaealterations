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

const docs = await client.fetch('*[_type == "service"]');
docs.forEach(doc => {
  console.log(`\n=== ${doc._id} ===`);
  console.log('services field type:', typeof doc.services);
  if (doc.services) {
    console.log('services[0] type:', typeof doc.services[0]);
    console.log('services[0]:', JSON.stringify(doc.services[0]));
    console.log('services[0] keys:', doc.services[0] ? Object.keys(doc.services[0]) : 'N/A');
  }
});
