/**
 * PennyLane Scoring, Zestimate Deal Valuation & 5-Tier Deal Scale Engine
 */

const RARE_KEYWORDS = [
  'cantilever', 'lighthouse', 'chapel', 'firehouse', 'mill', 'bunker', 'dome',
  'earthship', 'treehouse', 'floating', 'usonian', 'brutalis', 'rammed',
  'waterfall', 'island', 'turret', 'observatory', 'pewabic', 'terrazzo',
  'conversation pit', 'geodesic', 'historic', 'a-frame', 'courtyard', 'glass',
  'boathouse', 'schoolhouse', 'vineyard', 'sauna', 'adobe', 'mansard'
];

export const CONTRACT_STATUSES = new Set([
  'PENDING',
  'CONTINGENT',
  'UNDER_CONTRACT',
  'SOLD',
  'OFF_MARKET',
]);

export function isUnderContract(status) {
  return CONTRACT_STATUSES.has(String(status || '').toUpperCase());
}

/**
 * 5-Tier Deal Scale based on Asking Price vs Zestimate & Zip Median value
 */
export function computeDealScale(zestimateDeltaPct, priceCutPct, medianDeltaPct) {
  // zestimateDeltaPct is negative when asking is BELOW Zestimate (e.g. -28 means 28% below Zestimate)
  const belowZest = -zestimateDeltaPct;
  const compositeDiscount = belowZest * 0.72 + Math.max(0, -medianDeltaPct) * 0.2 + priceCutPct * 0.25;

  if (belowZest >= 28 || compositeDiscount >= 31) {
    return { dealTier: 5, dealLabel: 'Steal' };
  }
  if (belowZest >= 20 || compositeDiscount >= 23) {
    return { dealTier: 4, dealLabel: 'Standout Deal' };
  }
  if (belowZest >= 12 || compositeDiscount >= 15) {
    return { dealTier: 3, dealLabel: 'Strong Value' };
  }
  if (belowZest >= 5 || compositeDiscount >= 8) {
    return { dealTier: 2, dealLabel: 'Fair Value' };
  }
  return { dealTier: 1, dealLabel: 'Market Ask' };
}

export function scoreListing(raw) {
  const sqft = Math.max(Number(raw.sqft) || 1200, 400);
  const price = Math.max(Number(raw.price) || 100000, 1);
  const previousPrice = Number(raw.previousPrice) || price;
  const pricePerSqft = Math.round(price / sqft);
  const zipMedian = Math.max(Number(raw.zipMedianPricePerSqft) || pricePerSqft, 100);

  // Use live AVM/Zestimate directly when supplied; fall back to zip-median derivation only for curated demo entries
  const derivedZestimate = Math.round(
    Math.max(
      price * 1.04,
      (sqft * zipMedian * 0.94 + previousPrice * 0.14) / 1.08
    ) / 1000
  ) * 1000;
  const rawZest = Number(raw.zestimate);
  const zestimate = rawZest > 0 ? Math.round(rawZest) : derivedZestimate;

  const estimatedSavings = Math.max(0, zestimate - price);
  // Negative percentage means BELOW Zestimate (good deal)
  const zestimateDeltaPct = Math.round(((price - zestimate) / zestimate) * 100);

  // Negative percentage means BELOW local zip median $/sqft
  const medianDeltaPct = Math.round(((pricePerSqft - zipMedian) / zipMedian) * 100);
  const priceCutPct =
    previousPrice > price
      ? Math.round(((previousPrice - price) / previousPrice) * 100)
      : 0;

  const { dealTier, dealLabel } = computeDealScale(zestimateDeltaPct, priceCutPct, medianDeltaPct);

  // 1. Deal Score (0-100) driven primarily by Zestimate spread + price cut + zip median
  const zestPoints = zestimateDeltaPct < 0 ? Math.min(64, Math.abs(zestimateDeltaPct) * 1.95) : 5;
  const zipPoints = medianDeltaPct < 0 ? Math.min(20, Math.abs(medianDeltaPct) * 0.65) : 0;
  const priceCutPoints = Math.min(24, priceCutPct * 1.5);
  const dealScore = Math.round(Math.min(100, Math.max(18, zestPoints + zipPoints + priceCutPoints)));

  // 2. Architectural Rarity Score (0-100)
  const haystack = `${raw.title} ${raw.architecturalStyle} ${raw.editorialNote} ${(raw.raritySignals || []).join(' ')}`.toLowerCase();
  const keywordHits = RARE_KEYWORDS.filter((kw) => haystack.includes(kw)).length;
  const signalCount = (raw.raritySignals || []).length;
  const ageBonus = raw.yearBuilt && raw.yearBuilt <= 1930 ? 12 : raw.yearBuilt && raw.yearBuilt <= 1978 ? 8 : 4;
  const acreageBonus = raw.lotAcres >= 2 ? 10 : raw.lotAcres >= 0.8 ? 5 : 0;
  const rarityScore = Math.round(
    Math.min(99, Math.max(35, 38 + signalCount * 9 + keywordHits * 5 + ageBonus + acreageBonus))
  );

  // 3. Freshness Score (0-100)
  const dom = Math.max(0, Number(raw.daysOnMarket ?? 1));
  let freshnessScore = 35;
  if (dom <= 1) freshnessScore = 98;
  else if (dom <= 2) freshnessScore = 91;
  else if (dom <= 3) freshnessScore = 84;
  else if (dom <= 7) freshnessScore = 68;
  else if (dom <= 14) freshnessScore = 52;

  // Weighted PennyLane Index Score (emphasizes both Deal Value & Architectural Uniqueness)
  const pennyLaneScore = Math.round(
    dealScore * 0.46 + rarityScore * 0.36 + freshnessScore * 0.18
  );

  const categories = [];
  if (rarityScore >= 76 || signalCount >= 3) categories.push('exceptional');
  if (zestimateDeltaPct <= -14 || medianDeltaPct <= -14 || priceCutPct >= 8 || dealTier >= 3) {
    categories.push('deal');
  }
  if (dom <= 3) categories.push('new');
  if (categories.length === 0) categories.push('exceptional');

  const primaryCategory =
    dealTier >= 4
      ? 'deal'
      : dom <= 1 && freshnessScore >= 95
      ? 'new'
      : 'exceptional';

  return {
    ...raw,
    zestimate,
    estimatedSavings,
    zestimateDeltaPct,
    dealTier,
    dealLabel,
    pricePerSqft,
    medianDeltaPct,
    priceCutPct,
    scores: {
      overall: pennyLaneScore,
      rarity: rarityScore,
      deal: dealScore,
      freshness: freshnessScore,
    },
    categories,
    primaryCategory,
  };
}
