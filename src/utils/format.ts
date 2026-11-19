import type { CategoryKey, ChangelogFeed, ListingsFeed, PropertyListing, RemovedProperty } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
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
    year: 'numeric',
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

export function categoryBadgeClasses(category: CategoryKey): string {
  if (category === 'deal') {
    return 'bg-[var(--sage-soft)] text-[var(--sage)] border border-[#c3dccf]';
  }
  if (category === 'new') {
    return 'bg-[var(--vermilion-soft)] text-[var(--vermilion)] border border-[#ecc9c1]';
  }
  return 'bg-[var(--ochre-soft)] text-[var(--ochre)] border border-[#e6d3b3]';
}

/**
 * Interactive sandbox simulation for the GitHub Pages demo:
 * Advances the edition by +24h in-memory so visitors can witness:
 *  - older listings automatically removed as Under Contract
 *  - fresh finds rotating in from the reserve pool
 *  - organic price drops recalculating deal scores
 */
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

  // Prune up to 2 highest-DOM listings as Under Contract / Pending Sale
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
      const medianDeltaPct = Math.round(((pricePerSqft - item.zipMedianPricePerSqft) / item.zipMedianPricePerSqft) * 100);
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

  // Pull up to 2 fresh listings from reserve pool
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
    // Recycle removed listings back to tail of reserve only for endless interactive demo exploration
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
  const summaryText = `Edition #${nextEdition}: +${incoming.length} fresh finds added · −${removedEntries.length} removed under contract (${removedNames})${
    priceDrops.length > 0 ? ` · ${priceDrops.length} price drop` : ''
  }`;

  return { nextFeed, nextChangelog, nextReserve: remainingReserve, summaryText };
}

