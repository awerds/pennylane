import type {
  CategoryKey,
  ChangelogFeed,
  ListingsFeed,
  PropertyListing,
  RemovedProperty,
  StyleGroup,
} from '../types';

export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

export function getStateName(code: string): string {
  return STATE_NAMES[code.toUpperCase()] || code;
}

export function matchesLocationQuery(listing: PropertyListing, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const stateFull = getStateName(listing.state).toLowerCase();
  const cityState = `${listing.city}, ${listing.state}`.toLowerCase();
  const cityStateFull = `${listing.city}, ${stateFull}`.toLowerCase();

  // Support multi-token queries like "Garrison NY 10524" or "California modern"
  const tokens = q.split(/[\s,]+/).filter(Boolean);
  const searchable = `${listing.city} ${listing.state} ${stateFull} ${listing.zip} ${listing.region} ${cityState} ${cityStateFull} ${listing.title} ${listing.architecturalStyle} ${listing.raritySignals.join(' ')}`.toLowerCase();

  return tokens.every((token) => searchable.includes(token));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${m >= 10 ? m.toFixed(1) : m.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')}M`;
  }
  return `$${Math.round(amount / 1000)}k`;
}

export function matchesStyleGroup(listing: PropertyListing, group: StyleGroup): boolean {
  if (group === 'all') return true;
  const hay = `${listing.architecturalStyle} ${listing.title}`.toLowerCase();
  if (group === 'modern') {
    return (
      hay.includes('modern') ||
      hay.includes('mid-century') ||
      hay.includes('brutalis') ||
      hay.includes('usonian') ||
      hay.includes('contemporary') ||
      hay.includes('googie')
    );
  }
  if (group === 'historic') {
    return (
      listing.yearBuilt <= 1935 ||
      hay.includes('historic') ||
      hay.includes('victorian') ||
      hay.includes('tudor')
    );
  }
  if (group === 'reuse') {
    return (
      hay.includes('reuse') ||
      hay.includes('mill') ||
      hay.includes('firehouse') ||
      hay.includes('chapel') ||
      hay.includes('schoolhouse') ||
      hay.includes('barn') ||
      hay.includes('carriage') ||
      hay.includes('studio')
    );
  }
  if (group === 'desert') {
    return (
      hay.includes('desert') ||
      hay.includes('adobe') ||
      hay.includes('earthship') ||
      hay.includes('geodesic')
    );
  }
  if (group === 'coastal') {
    return (
      hay.includes('coastal') ||
      hay.includes('cabin') ||
      hay.includes('a-frame') ||
      hay.includes('maritime') ||
      hay.includes('alpine') ||
      hay.includes('boathouse')
    );
  }
  return true;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Today';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatTimeUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function categoryLabel(category: CategoryKey): string {
  if (category === 'exceptional') return 'Exceptional';
  if (category === 'deal') return 'Good Deal';
  return 'New to Market';
}

export function categoryPillClasses(category: CategoryKey): string {
  if (category === 'deal') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15';
  }
  if (category === 'new') {
    return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/15';
  }
  return 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/15';
}

export function simulateNextDayClient(
  feed: ListingsFeed,
  changelog: ChangelogFeed,
  reservePool: PropertyListing[]
): {
  nextFeed: ListingsFeed;
  nextChangelog: ChangelogFeed;
  nextReserve: PropertyListing[];
  summaryText: string;
} {
  const prevDate = new Date(feed.syncedAt);
  const nextDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
  const isoNow = nextDate.toISOString();
  const nextEdition = feed.editionNumber + 1;

  const sortedByDom = [...feed.listings].sort((a, b) => b.daysOnMarket - a.daysOnMarket);
  const toRemove = sortedByDom.slice(0, Math.min(2, Math.max(1, feed.listings.length > 6 ? 2 : 1)));
  const removeIds = new Set(toRemove.map((r) => r.id));

  const removedEntries: RemovedProperty[] = toRemove.map((item, idx) => ({
    id: item.id,
    title: item.title,
    city: item.city,
    state: item.state,
    finalPrice: item.price,
    daysOnMarket: item.daysOnMarket + 1,
    reason: idx % 2 === 0 ? 'Under Contract' : 'Pending Sale',
    removedAt: isoNow,
    architecturalStyle: item.architecturalStyle,
  }));

  const priceDrops: Array<{
    id: string;
    title: string;
    oldPrice: number;
    newPrice: number;
    dropPct: number;
  }> = [];

  const survivors: PropertyListing[] = feed.listings
    .filter((l) => !removeIds.has(l.id))
    .map((item, idx) => {
      const nextDom = item.daysOnMarket + 1;
      let price = item.price;
      let previousPrice = item.previousPrice;
      let priceCutPct = item.priceCutPct;

      if (idx === 1 && priceCutPct === 0) {
        previousPrice = price;
        price = Math.round((price * 0.91) / 1000) * 1000;
        priceCutPct = Math.round(((previousPrice - price) / previousPrice) * 100);
        priceDrops.push({
          id: item.id,
          title: item.title,
          oldPrice: previousPrice,
          newPrice: price,
          dropPct: priceCutPct,
        });
      }

      const pricePerSqft = Math.round(price / Math.max(item.sqft, 400));
      const medianDeltaPct = Math.round(
        ((pricePerSqft - item.zipMedianPricePerSqft) / item.zipMedianPricePerSqft) * 100
      );
      const nextCategories: CategoryKey[] = Array.from(
        new Set([
          ...item.categories.filter((c) => c !== 'new' || nextDom <= 3),
          ...(medianDeltaPct <= -14 || priceCutPct >= 8 ? (['deal'] as CategoryKey[]) : []),
        ])
      );
      if (nextCategories.length === 0) nextCategories.push('exceptional');

      return {
        ...item,
        price,
        previousPrice,
        pricePerSqft,
        medianDeltaPct,
        priceCutPct,
        daysOnMarket: nextDom,
        categories: nextCategories,
        isNewToday: false,
        lastVerifiedAt: isoNow,
      };
    });

  const incoming = reservePool.slice(0, 2).map((item) => ({
    ...item,
    daysOnMarket: 0,
    isNewToday: true,
    firstSeenAt: isoNow,
    lastVerifiedAt: isoNow,
    categories: Array.from(new Set([...item.categories, 'new' as CategoryKey])),
  }));
  const remainingReserve = [
    ...reservePool.slice(2),
    ...toRemove.map((r) => ({ ...r, daysOnMarket: 0, isNewToday: true })),
  ];

  const merged = [...incoming, ...survivors].sort(
    (a, b) => b.scores.overall - a.scores.overall || a.daysOnMarket - b.daysOnMarket
  );

  const avgMedianDeltaPct = Math.round(
    merged.reduce((acc, l) => acc + l.medianDeltaPct, 0) / Math.max(merged.length, 1)
  );

  const nextFeed: ListingsFeed = {
    editionNumber: nextEdition,
    syncedAt: isoNow,
    provider: `${feed.provider} (simulated)`,
    summary: {
      activeCount: merged.length,
      addedToday: incoming.length,
      removedToday: removedEntries.length,
      priceDropsToday: priceDrops.length,
      avgMedianDeltaPct,
      exceptionalCount: merged.filter((l) => l.categories.includes('exceptional')).length,
      dealCount: merged.filter((l) => l.categories.includes('deal')).length,
      newToMarketCount: merged.filter((l) => l.categories.includes('new')).length,
    },
    listings: merged,
  };

  const nextChangelog: ChangelogFeed = {
    lastSyncedAt: isoNow,
    totalRemovedUnderContract: changelog.totalRemovedUnderContract + removedEntries.length,
    runs: [
      {
        editionNumber: nextEdition,
        syncedAt: isoNow,
        provider: 'sandbox-simulation',
        addedCount: incoming.length,
        removedCount: removedEntries.length,
        priceDropsCount: priceDrops.length,
        added: incoming.map((a) => ({
          id: a.id,
          title: a.title,
          city: a.city,
          state: a.state,
          price: a.price,
          score: a.scores.overall,
        })),
        removed: removedEntries,
        priceDrops,
      },
      ...changelog.runs,
    ].slice(0, 14),
    removedArchive: [...removedEntries, ...changelog.removedArchive].slice(0, 40),
  };

  const removedNames = removedEntries.map((r) => `${r.city}, ${r.state}`).join(' & ');
  const summaryText = `Edition #${nextEdition}: +${incoming.length} new finds · −${removedEntries.length} removed under contract (${removedNames})`;

  return { nextFeed, nextChangelog, nextReserve: remainingReserve, summaryText };
}
