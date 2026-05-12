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

const all = await client.fetch('*[_type in ["service","testimonial","value","faqItem"]]');
all.forEach(doc => {
  const userFields = Object.keys(doc).filter(k => !['_id','_type','_rev','_createdAt','_updatedAt','_system'].includes(k));
  console.log(`${doc._id.padEnd(30)} [${doc._type.padEnd(12)}]: ${userFields.join(', ')}`);
});
