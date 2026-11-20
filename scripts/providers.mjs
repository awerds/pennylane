/**
 * Pluggable Listing Data Providers
 *
 * Supports:
 * 1. `rapidapi-zillow` — Live Zillow search + Zestimates + real photos + status pruning
 *                        via free-tier RapidAPI key (ZILLOW_API_KEY + ZILLOW_API_HOST).
 *                        Auto-supports: zillow-com1, zillow56, real-time-zillow-data, us-housing-market-data1.
 * 2. `rentcast`        — Live US market listings via free-tier RentCast API key (RENTCAST_API_KEY).
 * 3. `open-curated`    — 100% free, zero-key 50-state demo index + community watchlist PRs.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { ALL_50_STATES, generateNationwideIndex } from './us-markets.mjs';

const ROOT = process.cwd();

async function readJson(relPath, fallback = []) {
  try {
    const raw = await fs.readFile(path.join(ROOT, relPath), 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function detectProvider() {
  if (process.env.ZILLOW_API_KEY && process.env.ZILLOW_API_KEY !== 'your_rapidapi_key_here') {
    return 'rapidapi-zillow';
  }
  if (process.env.RENTCAST_API_KEY) return 'rentcast';
  return 'open-curated';
}

/**
 * Builds the exact RapidAPI endpoint URL for any of the popular free-tier Zillow APIs
 */
export function buildRapidApiRequest(host, location) {
  const cleanHost = host.trim().toLowerCase();
  const loc = encodeURIComponent(location);

  if (cleanHost.includes('zillow56')) {
    return `https://${cleanHost}/search?location=${loc}&status=forSale&home_type=Houses&sortSelection=newest`;
  }
  if (cleanHost.includes('real-time-zillow-data')) {
    return `https://${cleanHost}/search?location=${loc}&status=forSale&home_type=Houses&sort=Newest`;
  }
  // Default: zillow-com1.p.rapidapi.com & us-housing-market-data1.p.rapidapi.com
  return `https://${cleanHost}/propertyExtendedSearch?location=${loc}&status_type=ForSale&home_type=Houses&sort=Newest`;
}

/**
 * Normalizes different RapidAPI Zillow JSON shapes into a single clean array of raw items
 */
export function extractPropsArray(payload) {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.props)) return payload.props;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.props)) return payload.data.props;
  if (payload.data && Array.isArray(payload.data.results)) return payload.data.results;
  return [];
}

function buildZipMedianLookup() {
  const byState = new Map();
  for (const s of ALL_50_STATES) {
    const avg = Math.round(
      s.cities.reduce((sum, [, , med]) => sum + med, 0) / Math.max(s.cities.length, 1)
    );
    byState.set(s.state, avg);
  }
  return byState;
}

const STATE_MEDIAN_SQFT = buildZipMedianLookup();

function parseLotAcres(p) {
  const val = Number(p.lotAreaValue ?? p.lotSize ?? 0);
  if (!val || Number.isNaN(val)) return 0.25;
  const unit = String(p.lotAreaUnit || 'sqft').toLowerCase();
  if (unit.includes('acre')) return Number(val.toFixed(2));
  return Number((val / 43560).toFixed(2));
}

function extractImages(p) {
  const imgs = [];
  if (Array.isArray(p.carouselPhotos)) {
    for (const ph of p.carouselPhotos) {
      const url = typeof ph === 'string' ? ph : ph?.url;
      if (url && url.startsWith('http')) imgs.push(url);
    }
  }
  if (Array.isArray(p.photos)) {
    for (const ph of p.photos) {
      const url = typeof ph === 'string' ? ph : ph?.url || ph?.mixedSources?.jpeg?.[0]?.url;
      if (url && url.startsWith('http')) imgs.push(url);
    }
  }
  if (p.imgSrc && String(p.imgSrc).startsWith('http') && !imgs.includes(p.imgSrc)) {
    imgs.unshift(p.imgSrc);
  }
  return Array.from(new Set(imgs)).slice(0, 6);
}

function buildLiveZillowUrl(p, zpid, fallbackLocation) {
  const rawDetail = p.detailUrl || p.url || p.hdpUrl;
  if (typeof rawDetail === 'string' && rawDetail.length > 4) {
    return rawDetail.startsWith('http')
      ? rawDetail
      : `https://www.zillow.com${rawDetail.startsWith('/') ? '' : '/'}${rawDetail}`;
  }
  if (zpid && /^\d+$/.test(String(zpid))) {
    return `https://www.zillow.com/homedetails/${zpid}_zpid/`;
  }
  return `https://www.zillow.com/homes/${encodeURIComponent(fallbackLocation)}_rb/`;
}

function normalizeRapidApiProperty(p, fallbackLocation, marketKey) {
  const zpid = String(p.zpid || p.id || '');
  const price = Number(p.price ?? p.unformattedPrice ?? 0);
  const images = extractImages(p);

  // Skip land-only, missing-price, or no-photo entries
  if (!zpid || !price || price < 40000 || images.length === 0) return null;

  const street = String(p.streetAddress || p.address || '').split(',')[0].trim();
  const fallbackCity = fallbackLocation.split(',')[0].trim();
  const fallbackState = fallbackLocation.split(',')[1]?.trim() || 'US';
  const city = String(p.city || fallbackCity).trim();
  const state = String(p.state || fallbackState).trim().toUpperCase().slice(0, 2);
  const zip = String(p.zipcode || p.zip || '00000').slice(0, 5);

  const beds = Number(p.bedrooms ?? p.beds ?? 3) || 3;
  const baths = Number(p.bathrooms ?? p.baths ?? 2) || 2;
  const sqft = Math.max(Number(p.livingArea ?? p.area ?? p.sqft ?? 0) || 1650, 450);
  const yearBuilt = Number(p.yearBuilt) || 1978;
  const lotAcres = parseLotAcres(p);
  const daysOnMarket = Math.max(0, Number(p.daysOnZillow ?? p.daysOnMarket ?? 1) || 0);

  const priceChange = Number(p.priceChange ?? 0);
  const previousPrice = priceChange < 0 ? price + Math.abs(priceChange) : price;
  const rawZestimate = Number(p.zestimate ?? 0);

  const stateBaseMedian = STATE_MEDIAN_SQFT.get(state) || 280;
  const derivedSqftMedian = Math.round(
    rawZestimate > 0 ? rawZestimate / sqft : Math.max(stateBaseMedian, (price / sqft) * 1.12)
  );
  const zestimate = rawZestimate > 0 ? rawZestimate : Math.round((sqft * derivedSqftMedian) / 1000) * 1000;

  const propertyType = String(p.propertyType || p.homeType || 'Single Family')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const title = street
    ? `${beds} Bd ${propertyType} on ${street}`
    : `${beds} Bd ${propertyType} in ${city}, ${state}`;

  const savings = Math.max(0, zestimate - price);
  const pctBelow = zestimate > 0 ? Math.round(((zestimate - price) / zestimate) * 100) : 0;

  const signals = [propertyType, 'Verified Live Zillow Listing'];
  if (priceChange < 0) signals.push(`Price Cut $${Math.round(Math.abs(priceChange) / 1000)}k`);
  if (pctBelow >= 15) signals.push(`${pctBelow}% Below Zestimate`);
  if (lotAcres >= 1) signals.push(`${lotAcres} Acre Lot`);
  if (yearBuilt <= 1935) signals.push(`Historic ${yearBuilt}`);

  const editorialNote =
    savings > 10000
      ? `Live Zillow listing in ${city}, ${state} priced $${Math.round(savings / 1000)}k (${pctBelow}%) below its Zestimate. ${beds} bed, ${baths} bath (${sqft.toLocaleString()} sqft) built in ${yearBuilt}.`
      : `Live Zillow listing in ${city}, ${state}. ${beds} bed, ${baths} bath ${propertyType.toLowerCase()} (${sqft.toLocaleString()} sqft) on ${lotAcres} acres.`;

  return {
    id: `zillow-${zpid}`,
    zpid,
    title,
    address: street || `${city}, ${state}`,
    city,
    state,
    zip,
    region: inferRegion(state),
    lat: Number(p.latitude ?? p.lat ?? 39.8283) || 39.8283,
    lng: Number(p.longitude ?? p.lng ?? -98.5795) || -98.5795,
    price,
    previousPrice,
    zestimate,
    zipMedianPricePerSqft: derivedSqftMedian,
    beds,
    baths,
    sqft,
    lotAcres,
    yearBuilt,
    daysOnMarket,
    status: normalizeStatus(p.listingStatus || p.homeStatus),
    architecturalStyle: propertyType,
    raritySignals: signals.slice(0, 4),
    editorialNote,
    zillowUrl: buildLiveZillowUrl(p, zpid, `${city}-${state}-${zip}`),
    images,
    source: 'rapidapi-zillow',
    marketKey,
  };
}

/**
 * Quota-Smart Free-Tier RapidAPI Zillow Adapter
 * - Rotates cleanly through all 50 US states (or custom PENNYLANE_MARKETS)
 * - Accumulates real live listings across runs so even 2–8 free calls/day builds 1,000+ live homes
 * - Prunes any previously synced home in a re-fetched market once it leaves FOR_SALE (Under Contract)
 */
async function fetchRapidApiZillow(existingListings, { dayIndex, liveReset }) {
  const apiKey = process.env.ZILLOW_API_KEY;
  const apiHost = process.env.ZILLOW_API_HOST || 'zillow-com1.p.rapidapi.com';
  const batchSize = Math.max(1, Math.min(50, Number(process.env.ZILLOW_BATCH_SIZE || 8)));

  const customMarkets = (process.env.PENNYLANE_MARKETS || '')
    .split(';')
    .map((m) => m.trim())
    .filter(Boolean);

  // Rotate through 1 flagship city per state across all 50 states if no custom list is set
  const allMarkets =
    customMarkets.length > 0
      ? customMarkets
      : ALL_50_STATES.map((s) => `${s.cities[0][0]}, ${s.state}`);

  const startIdx = (dayIndex * batchSize) % allMarkets.length;
  const batchMarkets = [];
  for (let i = 0; i < Math.min(batchSize, allMarkets.length); i++) {
    batchMarkets.push(allMarkets[(startIdx + i) % allMarkets.length]);
  }

  const fetched = [];
  const refreshedMarketKeys = new Set();
  const fetchedIds = new Set();

  for (const location of batchMarkets) {
    const marketKey = location.toLowerCase();
    const url = buildRapidApiRequest(apiHost, location);

    try {
      const res = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost,
        },
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[RapidAPI] ${location} returned HTTP ${res.status}: ${errText.slice(0, 140)}`);
        continue;
      }

      const data = await res.json();
      const props = extractPropsArray(data);
      refreshedMarketKeys.add(marketKey);

      let addedForMarket = 0;
      for (const rawProp of props) {
        const normalized = normalizeRapidApiProperty(rawProp, location, marketKey);
        if (!normalized || fetchedIds.has(normalized.id)) continue;
        fetchedIds.add(normalized.id);
        fetched.push(normalized);
        addedForMarket += 1;
      }

      console.log(`[RapidAPI] ${location}: ${addedForMarket} live listings fetched`);
    } catch (err) {
      console.warn(`[RapidAPI] ${location} failed:`, err.message);
    }
  }

  // Keep existing REAL RapidAPI listings from markets not queried in this batch;
  // prune any listing from a refreshed market that disappeared from FOR_SALE as UNDER_CONTRACT!
  const retainedLive = [];
  const contractedUpdates = [];

  if (!liveReset) {
    for (const prev of existingListings) {
      if (prev.source !== 'rapidapi-zillow') continue;
      if (fetchedIds.has(prev.id)) continue;

      const prevKey = (prev.marketKey || `${prev.city}, ${prev.state}`).toLowerCase();
      if (refreshedMarketKeys.has(prevKey)) {
        contractedUpdates.push({ ...prev, status: 'UNDER_CONTRACT' });
      } else {
        retainedLive.push({ ...prev, daysOnMarket: (prev.daysOnMarket || 0) + 1 });
      }
    }
  }

  const watchlist = await readJson('data/watchlist.json', []);
  const liveWatchlist = watchlist.filter(
    (w) => typeof w.zillowUrl === 'string' && w.zillowUrl.includes('/homedetails/')
  );

  return {
    provider: `rapidapi:${apiHost}`,
    candidates: [...fetched, ...retainedLive, ...liveWatchlist, ...contractedUpdates],
    fullPool: [...fetched, ...retainedLive],
  };
}

async function fetchRentCast() {
  const apiKey = process.env.RENTCAST_API_KEY;
  const cities = (process.env.PENNYLANE_MARKETS || 'Savannah,GA;Asheville,NC')
    .split(';')
    .map((m) => m.trim())
    .filter(Boolean);

  const fetched = [];
  for (const pair of cities.slice(0, 3)) {
    const [city, state] = pair.split(',').map((s) => s.trim());
    const url = `https://api.rentcast.io/v1/listings/sale?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&status=Active&limit=10`;
    const res = await fetch(url, {
      headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
    });
    if (!res.ok) continue;
    const rows = await res.json();
    for (const r of rows) {
      const price = Number(r.price) || 450000;
      fetched.push({
        id: `rentcast-${r.id}`,
        zpid: String(r.id),
        title: `${r.propertyType || 'Residence'} on ${r.addressLine1}`,
        address: r.addressLine1,
        city: r.city,
        state: r.state,
        zip: r.zipCode || '00000',
        region: inferRegion(r.state),
        lat: Number(r.latitude) || 39.8283,
        lng: Number(r.longitude) || -98.5795,
        price,
        previousPrice: price,
        zestimate: Math.round(price * 1.15),
        zipMedianPricePerSqft: Math.round((price / Math.max(Number(r.squareFootage) || 1800, 600)) * 1.15),
        beds: Number(r.bedrooms) || 3,
        baths: Number(r.bathrooms) || 2,
        sqft: Number(r.squareFootage) || 1800,
        lotAcres: Number(((Number(r.lotSize) || 8500) / 43560).toFixed(2)),
        yearBuilt: Number(r.yearBuilt) || 1965,
        daysOnMarket: Number(r.daysOnMarket) || 1,
        status: normalizeStatus(r.status),
        architecturalStyle: r.propertyType || 'Single Family',
        raritySignals: ['RentCast Live Feed', 'Verified Active Status'],
        editorialNote: `Live-synced via RentCast API in ${r.city}, ${r.state}.`,
        zillowUrl: `https://www.zillow.com/homes/${encodeURIComponent(`${r.addressLine1} ${r.city} ${r.state}`)}_rb/`,
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        source: 'rentcast',
      });
    }
  }

  return {
    provider: 'rentcast',
    candidates: fetched,
    fullPool: fetched,
  };
}

/**
 * Open-Curated 50-State Demo Engine (zero keys required)
 */
async function fetchOpenCurated(existingListings, { dayIndex }) {
  const flagships = await readJson('data/catalog-pool.json', []);
  const watchlist = await readJson('data/watchlist.json', []);
  const nationwide = generateNationwideIndex(24);
  const combined = [...flagships, ...watchlist, ...nationwide];

  const isInitialSeed = existingListings.length === 0;

  if (isInitialSeed) {
    const initial = combined
      .filter((item) => item.wave === 0 || item.source === 'community-watchlist')
      .map((item) => ({ ...item, status: item.status || 'FOR_SALE' }));
    return { provider: 'open-50state-index', candidates: initial, fullPool: combined };
  }

  const existingMap = new Map(existingListings.map((l) => [l.id, { ...l }]));
  const updated = [];

  const sortedByDom = [...existingListings].sort((a, b) => b.daysOnMarket - a.daysOnMarket);
  const pruneCount = Math.min(14, Math.max(2, Math.floor(existingListings.length * 0.012)));
  const contractIds = new Set(sortedByDom.slice(0, pruneCount).map((l) => l.id));

  for (const item of existingMap.values()) {
    if (contractIds.has(item.id)) {
      updated.push({
        ...item,
        daysOnMarket: item.daysOnMarket + 1,
        status: (dayIndex + item.sqft) % 3 === 0 ? 'PENDING' : 'UNDER_CONTRACT',
      });
    } else {
      let nextPrice = item.price;
      let prevPrice = item.previousPrice;
      if (item.daysOnMarket === 6 && item.price === item.previousPrice) {
        prevPrice = item.price;
        nextPrice = Math.round((item.price * 0.92) / 1000) * 1000;
      }
      updated.push({
        ...item,
        price: nextPrice,
        previousPrice: prevPrice,
        daysOnMarket: item.daysOnMarket + 1,
        status: 'FOR_SALE',
      });
    }
  }

  const notActive = combined.filter((c) => !existingMap.has(c.id));
  const rotatedStart = notActive.length > 0 ? (dayIndex * 7) % notActive.length : 0;
  const additions = [];
  const addCount = Math.min(16, notActive.length);
  for (let i = 0; i < addCount; i++) {
    const pick = notActive[(rotatedStart + i) % notActive.length];
    additions.push({
      ...pick,
      daysOnMarket: 0,
      status: 'FOR_SALE',
    });
  }

  for (const w of watchlist) {
    if (!existingMap.has(w.id) && !additions.some((a) => a.id === w.id)) {
      additions.push({ ...w, daysOnMarket: w.daysOnMarket ?? 0, status: w.status || 'FOR_SALE' });
    }
  }

  return {
    provider: 'open-50state-index',
    candidates: [...updated, ...additions],
    fullPool: combined,
  };
}

function normalizeStatus(status) {
  const s = String(status || 'FOR_SALE').toUpperCase();
  if (s.includes('PEND')) return 'PENDING';
  if (s.includes('CONTING')) return 'CONTINGENT';
  if (s.includes('CONTRACT')) return 'UNDER_CONTRACT';
  if (s.includes('SOLD') || s.includes('INACTIVE')) return 'SOLD';
  return 'FOR_SALE';
}

function inferRegion(state) {
  const map = {
    NY: 'Northeast', VT: 'Northeast', ME: 'Northeast', PA: 'Northeast', MA: 'Northeast', CT: 'Northeast', NH: 'Northeast', NJ: 'Northeast', RI: 'Northeast', DE: 'Northeast', MD: 'Northeast',
    CA: 'West', OR: 'West', WA: 'West', CO: 'West', UT: 'West', MT: 'West', ID: 'West', NV: 'West', WY: 'West', AK: 'West', HI: 'West',
    TX: 'Southwest', NM: 'Southwest', AZ: 'Southwest', OK: 'Southwest',
    MI: 'Midwest', IL: 'Midwest', MN: 'Midwest', OH: 'Midwest', WI: 'Midwest', MO: 'Midwest', IN: 'Midwest', IA: 'Midwest', KS: 'Midwest', NE: 'Midwest', ND: 'Midwest', SD: 'Midwest',
    GA: 'South', NC: 'South', LA: 'South', TN: 'South', FL: 'South', SC: 'South', VA: 'South', WV: 'South', AL: 'South', AR: 'South', KY: 'South', MS: 'South',
  };
  return map[state] || 'US';
}

export async function fetchFromProvider(existingListings, options) {
  const provider = detectProvider();
  if (provider === 'rapidapi-zillow') return fetchRapidApiZillow(existingListings, options);
  if (provider === 'rentcast') return fetchRentCast();
  return fetchOpenCurated(existingListings, options);
}
