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

// Check for draft versions of non-singleton documents
const drafts = await client.fetch('*[_id match "drafts.*" && _type in ["service","testimonial","value","faqItem","portfolioItem"]]{ _id, _type }');
console.log('Non-singleton drafts:', drafts.length);
drafts.forEach(d => console.log(' ', d._id));

// Also check if there's something stored with type "homePage" but a weird _id
const allHomePage = await client.fetch('*[_type == "homePage"]{ _id }');
console.log('\nAll homePage docs:', allHomePage.map(d => d._id).join(', '));
