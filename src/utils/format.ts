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
  const tokens = q.split(/[\s,]+/).filter(Boolean);
  const searchable = `${listing.city} ${listing.state} ${stateFull} ${listing.zip} ${listing.region} ${listing.title} ${listing.architecturalStyle} ${listing.raritySignals.join(' ')}`.toLowerCase();

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

export function dealTierMeta(tier: number): {
  label: string;
  barActive: string;
  textClass: string;
  badgeClass: string;
} {
  if (tier >= 5) {
    return {
      label: 'Steal',
      barActive: 'bg-gradient-to-t from-emerald-600 to-teal-400',
      textClass: 'text-emerald-700',
      badgeClass: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-600/30',
    };
  }
  if (tier === 4) {
    return {
      label: 'Standout Deal',
      barActive: 'bg-emerald-500',
      textClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-600 text-white shadow-emerald-600/25',
    };
  }
  if (tier === 3) {
    return {
      label: 'Strong Value',
      barActive: 'bg-teal-500',
      textClass: 'text-teal-700',
      badgeClass: 'bg-teal-600 text-white shadow-teal-600/25',
    };
  }
  if (tier === 2) {
    return {
      label: 'Fair Value',
      barActive: 'bg-indigo-500',
      textClass: 'text-indigo-700',
      badgeClass: 'bg-indigo-600 text-white shadow-indigo-600/25',
    };
  }
  return {
    label: 'Market Ask',
    barActive: 'bg-amber-500',
    textClass: 'text-amber-700',
    badgeClass: 'bg-amber-500 text-white shadow-amber-500/25',
  };
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
      hay.includes('studio') ||
      hay.includes('loft')
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
      hay.includes('boathouse') ||
      hay.includes('timber')
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
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
  }
  if (category === 'new') {
    return 'bg-yellow-100 text-emerald-950 ring-1 ring-amber-400/50';
  }
  return 'bg-teal-50 text-teal-800 ring-1 ring-teal-600/20';
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
  const pruneCount = Math.min(12, Math.max(2, Math.floor(feed.listings.length * 0.01)));
  const toRemove = sortedByDom.slice(0, pruneCount);
  const removeIds = new Set(toRemove.map((r) => r.id));

  const removedEntries: RemovedProperty[] = toRemove.map((item, idx) => ({
    id: item.id,
    title: item.title,
    city: item.city,
    state: item.state,
    finalPrice: item.price,
    daysOnMarket: item.daysOnMarket + 1,
    reason: idx % 3 === 0 ? 'Pending Sale' : 'Under Contract',
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

      if (idx < 5 && priceCutPct === 0) {
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

      const estimatedSavings = Math.max(0, item.zestimate - price);
      const zestimateDeltaPct = Math.round(((price - item.zestimate) / item.zestimate) * 100);
      const pricePerSqft = Math.round(price / Math.max(item.sqft, 400));
      const medianDeltaPct = Math.round(
        ((pricePerSqft - item.zipMedianPricePerSqft) / item.zipMedianPricePerSqft) * 100
      );

      const belowZest = -zestimateDeltaPct;
      const dealTier: 1 | 2 | 3 | 4 | 5 =
        belowZest >= 28 ? 5 : belowZest >= 20 ? 4 : belowZest >= 12 ? 3 : belowZest >= 5 ? 2 : 1;
      const dealLabel = dealTierMeta(dealTier).label;

      return {
        ...item,
        price,
        previousPrice,
        estimatedSavings,
        zestimateDeltaPct,
        dealTier,
        dealLabel,
        pricePerSqft,
        medianDeltaPct,
        priceCutPct,
        daysOnMarket: nextDom,
        isNewToday: false,
        lastVerifiedAt: isoNow,
      };
    });

  const addCount = Math.min(14, reservePool.length);
  const incoming = reservePool.slice(0, addCount).map((item) => ({
    ...item,
    daysOnMarket: 0,
    isNewToday: true,
    firstSeenAt: isoNow,
    lastVerifiedAt: isoNow,
    categories: Array.from(new Set([...item.categories, 'new' as CategoryKey])),
  }));
  const remainingReserve = [
    ...reservePool.slice(addCount),
    ...toRemove.map((r) => ({ ...r, daysOnMarket: 0, isNewToday: true })),
  ];

  const merged = [...incoming, ...survivors].sort(
    (a, b) =>
      b.dealTier - a.dealTier ||
      a.zestimateDeltaPct - b.zestimateDeltaPct ||
      b.scores.overall - a.scores.overall
  );

  const avgMedianDeltaPct = Math.round(
    merged.reduce((acc, l) => acc + l.zestimateDeltaPct, 0) / Math.max(merged.length, 1)
  );
  const statesCovered = new Set(merged.map((l) => l.state)).size;
  const stealCount = merged.filter((l) => l.dealTier >= 5).length;

  const nextFeed: ListingsFeed = {
    editionNumber: nextEdition,
    syncedAt: isoNow,
    provider: `${feed.provider} (simulated)`,
    summary: {
      activeCount: merged.length,
      statesCovered,
      stealCount,
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
        added: incoming.slice(0, 8).map((a) => ({
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
    removedArchive: [...removedEntries, ...changelog.removedArchive].slice(0, 50),
  };

  const summaryText = `Edition #${nextEdition}: +${incoming.length} new finds added · −${removedEntries.length} pruned under contract across ${statesCovered} states`;

  return { nextFeed, nextChangelog, nextReserve: remainingReserve, summaryText };
}
