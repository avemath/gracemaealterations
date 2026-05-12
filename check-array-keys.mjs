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

// Fetch services with raw data
const services = await client.fetch('*[_type == "service"]');
services.forEach(svc => {
  console.log(`\n=== ${svc._id} ===`);
  if (svc.services) {
    // Are the items plain strings or objects with _key?
    console.log('services type:', Array.isArray(svc.services) ? 'array' : typeof svc.services);
    if (Array.isArray(svc.services)) {
      svc.services.forEach((item, i) => {
        if (typeof item === 'string') {
          console.log(`  [${i}] string (no _key): "${item.slice(0, 40)}..."`);
        } else if (typeof item === 'object') {
          console.log(`  [${i}] object keys: ${Object.keys(item).join(', ')}`);
        }
      });
    }
  }
});
