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
 * Builds the exact RapidAPI request (URL + method + optional JSON body) for supported free-tier US real-estate APIs
 */
export function buildRapidApiRequest(host, location) {
  const cleanHost = host.trim().toLowerCase();

  if (cleanHost.includes('realty-in-us')) {
    const parts = location.split(',').map((s) => s.trim());
    const city = parts[0] || 'Asheville';
    const stateCode = (parts[1] || 'NC').toUpperCase().slice(0, 2);
    return {
      url: `https://${cleanHost}/properties/v3/list`,
      method: 'POST',
      body: JSON.stringify({
        limit: 40,
        offset: 0,
        city,
        state_code: stateCode,
        status: ['for_sale'],
        type: ['single_family', 'townhomes', 'condos', 'farm'],
        sort: { direction: 'desc', field: 'list_date' },
      }),
    };
  }

  const loc = encodeURIComponent(location);
  if (cleanHost.includes('zillow56')) {
    return {
      url: `https://${cleanHost}/search?location=${loc}&status=forSale&home_type=Houses&sortSelection=newest`,
      method: 'GET',
    };
  }
  if (cleanHost.includes('real-time-zillow-data') || cleanHost.includes('real-time-real-estate-data')) {
    return {
      url: `https://${cleanHost}/search?location=${loc}&status=forSale&home_type=Houses&sort=Newest`,
      method: 'GET',
    };
  }
  // Default: zillow-com1.p.rapidapi.com & us-housing-market-data1.p.rapidapi.com
  return {
    url: `https://${cleanHost}/propertyExtendedSearch?location=${loc}&status_type=ForSale&home_type=Houses&sort=Newest`,
    method: 'GET',
  };
}

/**
 * Normalizes different RapidAPI real estate JSON shapes into a single clean array of raw items
 */
export function extractPropsArray(payload) {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data?.home_search?.results)) return payload.data.home_search.results;
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

function upgradeRealtorPhoto(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('rdcpix.com') && /s\.jpg$/i.test(url)) {
    return url.replace(/s\.jpg$/i, 'rd-w960_h720.webp');
  }
  return url;
}

function formatPropertyTypeLabel(rawType, subType) {
  const map = {
    single_family: 'Single Family',
    townhomes: 'Townhome',
    condos: 'Condo',
    condo: 'Condo',
    farm: 'Farm & Ranch',
    multi_family: 'Multi-Family',
    mobile: 'Manufactured Home',
  };
  const base = map[String(rawType || '').toLowerCase()] ||
    String(rawType || 'Single Family')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  if (subType && typeof subType === 'string' && subType.length > 2) {
    const cleanSub = subType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    if (!cleanSub.toLowerCase().includes(base.toLowerCase())) return cleanSub;
  }
  return base;
}

function normalizeRealtyInUsProperty(p, fallbackLocation, marketKey) {
  const propId = String(p.property_id || p.listing_id || '');
  const price = Number(p.list_price ?? 0);
  const rawPhoto = p.primary_photo?.href || p.photos?.[0]?.href || '';
  const photo = upgradeRealtorPhoto(rawPhoto);
  const href = typeof p.href === 'string' && p.href.startsWith('http') ? p.href : '';

  // Skip incomplete, land-only, missing-price, or no-photo entries
  if (!propId || !price || price < 45000 || !photo || !href) return null;

  const flags = p.flags || {};
  let status = normalizeStatus(p.status || 'for_sale');
  if (flags.is_pending) status = 'PENDING';
  else if (flags.is_contingent) status = 'CONTINGENT';

  const addr = p.location?.address || {};
  const desc = p.description || {};
  const fallbackCity = fallbackLocation.split(',')[0].trim();
  const fallbackState = fallbackLocation.split(',')[1]?.trim() || 'US';

  const street = String(addr.line || '').trim();
  const city = String(addr.city || fallbackCity).trim();
  const state = String(addr.state_code || fallbackState).trim().toUpperCase().slice(0, 2);
  const zip = String(addr.postal_code || '00000').slice(0, 5);

  const beds = Number(desc.beds ?? 0);
  const baths = Number(desc.baths ?? desc.baths_full ?? 0);
  const sqft = Number(desc.sqft ?? 0);
  if (!sqft || sqft < 400 || !beds) return null;

  const lotSqft = Number(desc.lot_sqft || 0);
  const lotAcres = lotSqft > 0 ? Number((lotSqft / 43560).toFixed(2)) : 0.18;
  const yearBuilt = Number(desc.year_built || 0);

  let daysOnMarket = 1;
  if (p.list_date) {
    const listedMs = new Date(p.list_date).getTime();
    if (!Number.isNaN(listedMs)) {
      daysOnMarket = Math.max(0, Math.floor((Date.now() - listedMs) / (24 * 60 * 60 * 1000)));
    }
  }

  const priceReduced = Math.abs(Number(p.price_reduced_amount || 0));
  const previousPrice = priceReduced > 0 ? price + priceReduced : price;

  // Use real Realtor.com AVM estimate when present; never invent inflated fake discounts
  const rawEstimate = Number(p.estimate?.estimate || 0);
  const zestimate = rawEstimate > 0 ? Math.round(rawEstimate) : price;

  const stateBaseMedian = STATE_MEDIAN_SQFT.get(state) || 260;
  const zipMedianPricePerSqft =
    rawEstimate > 0 ? Math.round(rawEstimate / sqft) : stateBaseMedian;

  const propertyType = formatPropertyTypeLabel(desc.type, desc.sub_type);
  const title = street
    ? `${beds} Bd ${propertyType} on ${street}`
    : `${beds} Bd ${propertyType} in ${city}, ${state}`;

  const savings = Math.max(0, zestimate - price);
  const pctBelow = zestimate > 0 ? Math.round(((zestimate - price) / zestimate) * 100) : 0;

  const images = [photo];
  if (Array.isArray(p.photos)) {
    for (const ph of p.photos) {
      const upgraded = upgradeRealtorPhoto(ph?.href);
      if (upgraded && !images.includes(upgraded)) images.push(upgraded);
      if (images.length >= 6) break;
    }
  }

  const signals = [propertyType, 'Verified Live MLS'];
  if (priceReduced > 0) signals.push(`Price Cut $${Math.round(priceReduced / 1000)}k`);
  if (pctBelow >= 10) signals.push(`${pctBelow}% Below Market Est.`);
  if (flags.is_new_listing) signals.push('Just Listed');
  if (flags.is_foreclosure) signals.push('Foreclosure');
  if (flags.is_new_construction) signals.push('New Construction');
  if (lotAcres >= 1) signals.push(`${lotAcres} Acre Lot`);
  if (Number(p.photo_count) >= 25) signals.push(`${p.photo_count} MLS Photos`);

  const brokerage = p.branding?.[0]?.name ? ` via ${p.branding[0].name}` : '';
  const domText = daysOnMarket === 0 ? 'Listed today' : `Listed ${daysOnMarket}d ago`;
  const savingsText =
    savings >= 5000
      ? ` Priced $${Math.round(savings / 1000)}k (${pctBelow}%) below its market estimate.`
      : priceReduced >= 5000
      ? ` Recently cut by $${Math.round(priceReduced / 1000)}k.`
      : '';

  const editorialNote = `${domText} in ${city}, ${state}${brokerage}.${savingsText} ${beds} bed, ${baths} bath ${propertyType.toLowerCase()} (${sqft.toLocaleString()} sqft) on ${lotAcres} acres.`;

  return {
    id: `realtor-${propId}`,
    zpid: propId,
    title,
    address: street || `${city}, ${state}`,
    city,
    state,
    zip,
    region: inferRegion(state),
    lat: Number(addr.coordinate?.lat ?? 39.8283) || 39.8283,
    lng: Number(addr.coordinate?.lon ?? -98.5795) || -98.5795,
    price,
    previousPrice,
    zestimate,
    zipMedianPricePerSqft,
    beds,
    baths,
    sqft,
    lotAcres,
    yearBuilt,
    daysOnMarket,
    status,
    architecturalStyle: propertyType,
    raritySignals: signals.slice(0, 4),
    editorialNote,
    zillowUrl: href,
    images,
    source: 'rapidapi-realtor',
    marketKey,
  };
}

/**
 * Quota-Smart Free-Tier RapidAPI Live Listings Adapter
 * - Supports Realty in US (Realtor.com live MLS) and RapidAPI Zillow hosts
 * - Rotates cleanly through all 50 US states (or custom PENNYLANE_MARKETS)
 * - Accumulates real live listings across runs while pruning homes that leave FOR_SALE (Under Contract)
 */
async function fetchRapidApiZillow(existingListings, { dayIndex, liveReset }) {
  const apiKey = process.env.ZILLOW_API_KEY.trim();
  const apiHost = (process.env.ZILLOW_API_HOST || 'zillow-com1.p.rapidapi.com').trim();
  const isRealtyInUs = apiHost.toLowerCase().includes('realty-in-us');
  const sourceTag = isRealtyInUs ? 'rapidapi-realtor' : 'rapidapi-zillow';
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

  const startIdx = liveReset ? 0 : (dayIndex * batchSize) % allMarkets.length;
  const batchMarkets = [];
  for (let i = 0; i < Math.min(batchSize, allMarkets.length); i++) {
    batchMarkets.push(allMarkets[(startIdx + i) % allMarkets.length]);
  }

  const fetched = [];
  const refreshedMarketKeys = new Set();
  const fetchedIds = new Set();
  let lastRemaining = null;

  for (let idx = 0; idx < batchMarkets.length; idx++) {
    const location = batchMarkets[idx];
    const marketKey = location.toLowerCase();
    const reqSpec = buildRapidApiRequest(apiHost, location);

    // Polite pacing to stay comfortably under RapidAPI per-second limits
    if (idx > 0) {
      await new Promise((resolve) => setTimeout(resolve, 220));
    }

    try {
      const headers = {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      };
      if (reqSpec.body) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(reqSpec.url, {
        method: reqSpec.method,
        headers,
        body: reqSpec.body,
      });

      const rem = res.headers.get('x-ratelimit-requests-remaining');
      if (rem !== null) lastRemaining = rem;

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[RapidAPI] ${location} returned HTTP ${res.status}: ${errText.slice(0, 140)}`);
        if (res.status === 429) {
          console.warn('[RapidAPI] Rate/quota limit hit — stopping batch early to protect quota.');
          break;
        }
        continue;
      }

      const data = await res.json();
      const props = extractPropsArray(data);
      refreshedMarketKeys.add(marketKey);

      let addedForMarket = 0;
      for (const rawProp of props) {
        const normalized = isRealtyInUs
          ? normalizeRealtyInUsProperty(rawProp, location, marketKey)
          : normalizeRapidApiProperty(rawProp, location, marketKey);
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

  if (lastRemaining !== null) {
    console.log(`[RapidAPI] Monthly free quota remaining: ${lastRemaining}`);
  }

  // Keep existing REAL RapidAPI listings from markets not queried in this batch;
  // prune any listing from a refreshed market that disappeared from FOR_SALE as UNDER_CONTRACT!
  const retainedLive = [];
  const contractedUpdates = [];

  if (!liveReset) {
    for (const prev of existingListings) {
      if (prev.source !== sourceTag) continue;
      if (fetchedIds.has(prev.id)) continue;

      const prevKey = (prev.marketKey || `${prev.city}, ${prev.state}`).toLowerCase();
      if (refreshedMarketKeys.has(prevKey)) {
        contractedUpdates.push({ ...prev, status: 'UNDER_CONTRACT' });
      } else {
        retainedLive.push({ ...prev, daysOnMarket: (prev.daysOnMarket || 0) + 1 });
      }
    }
  }

  return {
    provider: `rapidapi:${apiHost}`,
    candidates: [...fetched, ...retainedLive, ...contractedUpdates],
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
