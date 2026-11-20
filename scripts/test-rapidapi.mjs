/**
 * 1-Call RapidAPI Zillow Connection Smoke Test
 * Uses ONLY 1 API request against Hudson, NY to verify your key, host, and live listing shape.
 * Run: npm run test:rapidapi
 */

import path from 'node:path';
import { buildRapidApiRequest, extractPropsArray } from './providers.mjs';

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.join(process.cwd(), '.env'));
  } catch {
    // Ignore missing .env
  }
}

const key = process.env.ZILLOW_API_KEY;
const host = process.env.ZILLOW_API_HOST || 'zillow-com1.p.rapidapi.com';

if (!key || key === 'your_rapidapi_key_here') {
  console.error('Missing ZILLOW_API_KEY in .env (copy .env.example -> .env and add your RapidAPI key).');
  process.exit(1);
}

const testLocation = process.argv[2] || 'Asheville, NC';
const reqSpec = buildRapidApiRequest(host, testLocation);

console.log(`Testing 1 live call -> ${reqSpec.method} ${reqSpec.url} (${testLocation})`);

const headers = {
  'X-RapidAPI-Key': key.trim(),
  'X-RapidAPI-Host': host.trim(),
};
if (reqSpec.body) headers['Content-Type'] = 'application/json';

const res = await fetch(reqSpec.url, {
  method: reqSpec.method,
  headers,
  body: reqSpec.body,
});

const remaining = res.headers.get('x-ratelimit-requests-remaining');
const limit = res.headers.get('x-ratelimit-requests-limit');
if (remaining !== null) {
  console.log(`Quota remaining: ${remaining}${limit ? ` / ${limit}` : ''}`);
}

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}

const json = await res.json();
const props = extractPropsArray(json);
console.log(`Success! Received ${props.length} live properties for "${testLocation}".`);

if (props.length > 0) {
  const s = props[0];
  console.log('Sample listing:', {
    id: s.property_id || s.zpid || s.id,
    address: s.location?.address?.line || s.address || s.streetAddress,
    price: s.list_price ?? s.price,
    estimate: s.estimate?.estimate ?? s.zestimate,
    url: s.href || s.detailUrl || s.url,
    hasImage: Boolean(s.primary_photo?.href || s.imgSrc || s.carouselPhotos?.length),
  });
}

