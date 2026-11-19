/**
 * PennyLane Scoring & Classification Engine
 * Pure, deterministic scoring for architectural rarity, deal value, and freshness.
 */

const RARE_KEYWORDS = [
  'cantilever', 'lighthouse', 'chapel', 'firehouse', 'mill', 'bunker', 'dome',
  'earthship', 'treehouse', 'floating', 'usonian', 'brutalis', 'rammed',
  'waterfall', 'island', 'turret', 'observatory', 'pewabic', 'terrazzo',
  'conversation pit', 'geodesic', 'historic', 'a-frame', 'courtyard', 'glass'
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

export function scoreListing(raw) {
  const sqft = Math.max(Number(raw.sqft) || 1200, 400);
  const price = Math.max(Number(raw.price) || 100000, 1);
  const previousPrice = Number(raw.previousPrice) || price;
  const pricePerSqft = Math.round(price / sqft);
  const zipMedian = Math.max(Number(raw.zipMedianPricePerSqft) || pricePerSqft, 100);

  // Negative percentage means BELOW local median (a good deal)
  const medianDeltaPct = Math.round(((pricePerSqft - zipMedian) / zipMedian) * 100);
  const priceCutPct =
    previousPrice > price
      ? Math.round(((previousPrice - price) / previousPrice) * 100)
      : 0;

  // 1. Deal Score (0-100)
  const belowMedianPoints = medianDeltaPct < 0 ? Math.min(62, Math.abs(medianDeltaPct) * 1.9) : Math.max(0, 18 - medianDeltaPct);
  const priceCutPoints = Math.min(38, priceCutPct * 2.4);
  const dealScore = Math.round(Math.min(100, Math.max(15, belowMedianPoints + priceCutPoints)));

  // 2. Architectural Rarity Score (0-100)
  const haystack = `${raw.title} ${raw.architecturalStyle} ${raw.editorialNote} ${(raw.raritySignals || []).join(' ')}`.toLowerCase();
  const keywordHits = RARE_KEYWORDS.filter((kw) => haystack.includes(kw)).length;
  const signalCount = (raw.raritySignals || []).length;
  const ageBonus = raw.yearBuilt && raw.yearBuilt <= 1930 ? 12 : raw.yearBuilt && raw.yearBuilt <= 1978 ? 8 : 4;
  const acreageBonus = raw.lotAcres >= 2 ? 10 : raw.lotAcres >= 0.8 ? 5 : 0;
  const rarityScore = Math.round(
    Math.min(99, Math.max(30, 38 + signalCount * 9 + keywordHits * 5 + ageBonus + acreageBonus))
  );

  // 3. Freshness Score (0-100)
  const dom = Math.max(0, Number(raw.daysOnMarket ?? 1));
  let freshnessScore = 35;
  if (dom <= 1) freshnessScore = 98;
  else if (dom <= 2) freshnessScore = 91;
  else if (dom <= 3) freshnessScore = 84;
  else if (dom <= 7) freshnessScore = 68;
  else if (dom <= 14) freshnessScore = 52;

  // Weighted PennyLane Index Score
  const pennyLaneScore = Math.round(
    rarityScore * 0.44 + dealScore * 0.34 + freshnessScore * 0.22
  );

  // Category Lenses
  const categories = [];
  if (rarityScore >= 76 || signalCount >= 3) categories.push('exceptional');
  if (medianDeltaPct <= -14 || priceCutPct >= 8 || dealScore >= 65) categories.push('deal');
  if (dom <= 3) categories.push('new');
  if (categories.length === 0) categories.push('exceptional');

  const primaryCategory =
    dom <= 1 && freshnessScore >= 95 && dealScore < 75
      ? 'new'
      : dealScore >= 75 && medianDeltaPct <= -20
      ? 'deal'
      : 'exceptional';

  return {
    ...raw,
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

