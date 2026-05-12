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

function findNulls(obj, path) {
  if (obj === null) return [path];
  if (typeof obj !== 'object') return [];
  const results = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === null) {
      results.push(`${path}.${key}`);
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (item === null) results.push(`${path}.${key}[${i}]`);
        else if (typeof item === 'object') results.push(...findNulls(item, `${path}.${key}[${i}]`));
      });
    } else if (typeof val === 'object') {
      results.push(...findNulls(val, `${path}.${key}`));
    }
  }
  return results;
}

const all = await client.fetch('*[_type in ["siteSettings","homePage","aboutPage","servicesPage","portfolioPage","contactPage","service","testimonial","value","faqItem"]]');

let totalNulls = 0;
all.forEach(doc => {
  const nullPaths = findNulls(doc, doc._id);
  if (nullPaths.length > 0) {
    totalNulls += nullPaths.length;
    console.log(`${doc._id}: ${nullPaths.length} null(s):`);
    nullPaths.forEach(p => console.log('  ', p));
  }
});
if (totalNulls === 0) console.log('No null values found in any documents.');
else console.log(`\nTotal nulls: ${totalNulls}`);
