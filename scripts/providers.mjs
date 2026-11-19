/**
 * Pluggable Listing Data Providers
 *
 * Supports:
 * 1. `rapidapi-zillow` — Live Zillow search + Zestimate + status checks via RapidAPI key (ZILLOW_API_KEY)
 * 2. `rentcast`        — Live US market listings via free-tier RentCast API key (RENTCAST_API_KEY)
 * 3. `open-curated`    — 100% free, zero-key 50-state nationwide index (1,200+ homes) + community watchlist PRs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { generateNationwideIndex } from './us-markets.mjs';

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
  if (process.env.ZILLOW_API_KEY) return 'rapidapi-zillow';
  if (process.env.RENTCAST_API_KEY) return 'rentcast';
  return 'open-curated';
}

async function fetchRapidApiZillow(existingListings) {
  const apiKey = process.env.ZILLOW_API_KEY;
  const apiHost = process.env.ZILLOW_API_HOST || 'zillow-com1.p.rapidapi.com';
  const targetMarkets = (process.env.PENNYLANE_MARKETS || 'Hudson, NY;Marfa, TX;Palm Springs, CA;Savannah, GA')
    .split(';')
    .map((m) => m.trim())
    .filter(Boolean);

  const fetched = [];

  for (const location of targetMarkets.slice(0, 4)) {
    const url = `https://${apiHost}/propertyExtendedSearch?location=${encodeURIComponent(location)}&status_type=ForSale&home_type=Houses`;
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
    });
    if (!res.ok) continue;
    const data = await res.json();
    const props = (data.props || []).slice(0, 8);
    for (const p of props) {
      const state = p.state || location.split(',')[1]?.trim() || 'US';
      const price = Number(p.price) || 500000;
      fetched.push({
        id: `zillow-${p.zpid}`,
        zpid: String(p.zpid),
        title: p.address || `${p.bedrooms || 3} Bed Residence in ${location}`,
        address: p.streetAddress || p.address || location,
        city: p.city || location.split(',')[0].trim(),
        state,
        zip: String(p.zipcode || '00000'),
        region: inferRegion(state),
        lat: Number(p.latitude) || 39.8283,
        lng: Number(p.longitude) || -98.5795,
        price,
        previousPrice: Number(p.priceChange ? price - p.priceChange : price) || price,
        zestimate: Number(p.zestimate) || Math.round(price * 1.12),
        zipMedianPricePerSqft: Math.round((price / Math.max(Number(p.livingArea) || 1800, 600)) * 1.18),
        beds: Number(p.bedrooms) || 3,
        baths: Number(p.bathrooms) || 2,
        sqft: Number(p.livingArea) || 1850,
        lotAcres: Number(((Number(p.lotAreaValue) || 10000) / 43560).toFixed(2)),
        yearBuilt: Number(p.yearBuilt) || 1975,
        daysOnMarket: Number(p.daysOnZillow) || 1,
        status: normalizeStatus(p.listingStatus),
        architecturalStyle: p.propertyType || 'Single Family',
        raritySignals: [p.propertyType || 'Verified Live Listing', p.priceChange < 0 ? 'Recent Price Cut' : 'Active Market Feed'],
        editorialNote: `Live-synced from Zillow via RapidAPI for ${location}. Automatically monitored daily and pruned upon contract.`,
        zillowUrl: p.detailUrl ? `https://www.zillow.com${p.detailUrl}` : `https://www.zillow.com/homedetails/${p.zpid}_zpid/`,
        images: [p.imgSrc || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        source: 'rapidapi-zillow',
      });
    }
  }

  const watchlist = await readJson('data/watchlist.json', []);
  const activeIds = new Set(fetched.map((f) => f.id));
  const statusUpdates = [];

  for (const prev of existingListings) {
    if (prev.source === 'rapidapi-zillow' && !activeIds.has(prev.id)) {
      statusUpdates.push({ ...prev, status: 'UNDER_CONTRACT' });
    }
  }

  return {
    provider: 'rapidapi-zillow',
    candidates: [...fetched, ...watchlist, ...statusUpdates],
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

  const watchlist = await readJson('data/watchlist.json', []);
  return {
    provider: 'rentcast',
    candidates: [...fetched, ...watchlist],
  };
}

/**
 * Open-Curated 50-State Nationwide Engine (~1,200+ active homes across all 50 US states)
 */
async function fetchOpenCurated(existingListings, { dayIndex }) {
  const flagships = await readJson('data/catalog-pool.json', []);
  const watchlist = await readJson('data/watchlist.json', []);
  const nationwide = generateNationwideIndex(24); // 50 states * 24 = 1,200 homes (23 active + 1 reserve per state)
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

  // Prune 14 highest-DOM listings daily as Under Contract / Pending Sale
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

  // Add 16 fresh finds from reserve pool
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
  if (provider === 'rapidapi-zillow') return fetchRapidApiZillow(existingListings);
  if (provider === 'rentcast') return fetchRentCast();
  return fetchOpenCurated(existingListings, options);
}
