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

const portfolioAllowed = ['_id','_type','_rev','_createdAt','_updatedAt','image','label','type','order'];
const faqAllowed = ['_id','_type','_rev','_createdAt','_updatedAt','question','answer','order'];

const items = await client.fetch('*[_type in ["portfolioItem","faqItem"]]');
let found = false;
items.forEach(doc => {
  const allowed = doc._type === 'portfolioItem' ? portfolioAllowed : faqAllowed;
  const extra = Object.keys(doc).filter(k => !allowed.includes(k));
  if (extra.length > 0) {
    found = true;
    console.log(`${doc._id} (${doc._type}) — extra: ${extra.join(', ')}`);
    extra.forEach(k => console.log(`  ${k} = ${JSON.stringify(doc[k])?.slice(0, 100)}`));
  }
});
if (!found) console.log('All portfolioItem and faqItem documents are clean.');
