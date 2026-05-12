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

const all = await client.fetch('*[]');
console.log('Total docs:', all.length);

// portfolioItem schema: image (with alt), label, type, order
const portfolioAllowed = ['_id','_type','_rev','_createdAt','_updatedAt','_system','image','label','type','order'];
const portfolioDocs = all.filter(d => d._type === 'portfolioItem');
let portfolioProblems = 0;
portfolioDocs.forEach(doc => {
  const unknown = Object.keys(doc).filter(k => !portfolioAllowed.includes(k));
  if (unknown.length > 0) {
    portfolioProblems++;
    console.log(`PORTFOLIO ${doc._id} — unknown: ${unknown.join(', ')}`);
    unknown.forEach(k => console.log(`  ${k} = ${JSON.stringify(doc[k])?.slice(0,80)}`));
  }
});
console.log(`portfolioItem: ${portfolioDocs.length} docs, ${portfolioProblems} with problems`);

// Check image nested fields within all documents
// For images, Sanity stores: _type: "image", asset: {...}, crop: {...}, hotspot: {...}, and custom fields (like alt)
// Custom fields defined in schema: just "alt" for our images
const allowedImageFields = ['_type','asset','crop','hotspot','alt'];
function checkImageFields(obj, path) {
  if (!obj || typeof obj !== 'object') return;
  if (obj._type === 'image') {
    const unknown = Object.keys(obj).filter(k => !allowedImageFields.includes(k));
    if (unknown.length > 0) {
      console.log(`IMAGE at ${path} — unknown subfields: ${unknown.join(', ')}`);
    }
  }
  // Recurse into arrays and objects
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('_')) continue;
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        val.forEach((item, i) => checkImageFields(item, `${path}.${key}[${i}]`));
      } else {
        checkImageFields(val, `${path}.${key}`);
      }
    }
  }
}

all.filter(d => !d._id.startsWith('_')).forEach(doc => {
  checkImageFields(doc, doc._id);
});

console.log('Full audit complete.');
