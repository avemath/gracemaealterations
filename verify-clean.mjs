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

const singletons = await client.fetch('*[_type in ["siteSettings","homePage","aboutPage","servicesPage","portfolioPage","contactPage"] && !(_id in path("drafts.**"))]');
singletons.forEach(doc => {
  const allKeys = Object.keys(doc);
  const userKeys = allKeys.filter(k => !k.startsWith('_'));
  const underscoreExtras = allKeys.filter(k => k.startsWith('_') && !['_id','_type','_rev','_createdAt','_updatedAt'].includes(k));
  console.log(`${doc._id}`);
  console.log(`  user fields: ${userKeys.join(', ')}`);
  if (underscoreExtras.length) console.log(`  ⚠️  extra _ fields: ${underscoreExtras.join(', ')}`);
  else console.log(`  ✓ no extra underscore fields`);
});
