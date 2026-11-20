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

const testLocation = process.argv[2] || 'Hudson, NY';
const url = buildRapidApiRequest(host, testLocation);

console.log(`Testing 1 live call -> ${url}`);

const res = await fetch(url, {
  headers: {
    'X-RapidAPI-Key': key,
    'X-RapidAPI-Host': host,
  },
});

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}

const json = await res.json();
const props = extractPropsArray(json);
console.log(`Success! Received ${props.length} live Zillow properties for "${testLocation}".`);

if (props.length > 0) {
  const sample = props[0];
  console.log('Sample listing:', {
    zpid: sample.zpid || sample.id,
    address: sample.address || sample.streetAddress,
    price: sample.price,
    zestimate: sample.zestimate,
    detailUrl: sample.detailUrl || sample.url,
    hasImage: Boolean(sample.imgSrc || sample.carouselPhotos?.length),
  });
}
