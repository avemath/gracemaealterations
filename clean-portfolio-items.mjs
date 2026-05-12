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

const items = await client.fetch('*[_type == "portfolioItem"]');
const withSystem = items.filter(d => '_system' in d);
console.log(`Cleaning ${withSystem.length} portfolio items with _system...`);

for (const item of withSystem) {
  // Rebuild with only schema-defined fields
  const clean = {
    _id: item._id,
    _type: item._type,
    ...(item.image ? { image: item.image } : {}),
    ...(item.label ? { label: item.label } : {}),
    ...(item.type ? { type: item.type } : {}),
    ...(item.order !== undefined ? { order: item.order } : {}),
  };
  await client.createOrReplace(clean);
  console.log(`  ✓ ${item._id}`);
}

console.log('\nDone. Hard-refresh Sanity Studio (Ctrl+Shift+R) to clear the warning.');
