import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8')
  .split('\n').filter(l => l && !l.startsWith('#'))
  .reduce((acc, l) => { const [k, ...v] = l.split('='); acc[k.trim()] = v.join('=').trim(); return acc; }, {});
const client = createClient({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: 'production', apiVersion: '2024-01-01', token: env.SANITY_API_TOKEN, useCdn: false });
const items = await client.fetch('*[_type == "portfolioItem"]');
const withSystem = items.filter(d => '_system' in d);
console.log(`portfolioItems with _system: ${withSystem.length}/${items.length}`);
if (withSystem.length) withSystem.forEach(d => console.log(' ', d._id));
else console.log('All clean.');

// Show _system contents
const withSys = items.filter(d => '_system' in d);
if (withSys[0]) {
  console.log('\n_system content:', JSON.stringify(withSys[0]._system, null, 2));
  console.log('_system keys:', Object.keys(withSys[0]._system));
}
