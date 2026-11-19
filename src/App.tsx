import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { TopNav } from './components/TopNav';
import { FilterStrip } from './components/FilterStrip';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDossierModal } from './components/PropertyDossierModal';
import { SyncLedgerModal } from './components/SyncLedgerModal';
import type { ChangelogFeed, FilterState, ListingsFeed, PropertyListing } from './types';
import {
  formatDateShort,
  matchesLocationQuery,
  matchesStyleGroup,
  simulateNextDayClient,
} from './utils/format';

const SAVED_STORAGE_KEY = 'pennylane:saved-listings:v1';

const DEFAULT_FILTERS: FilterState = {
  lens: 'all',
  locationQuery: '',
  minPrice: 0,
  maxPrice: 0,
  minBeds: 0,
  minBaths: 0,
  minSqft: 0,
  styleGroup: 'all',
  priceCutsOnly: false,
  belowMedianOnly: false,
  sort: 'score',
};

function loadSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function App() {
  const [liveFeed, setLiveFeed] = useState<ListingsFeed | null>(null);
  const [liveChangelog, setLiveChangelog] = useState<ChangelogFeed | null>(null);
  const [liveReserve, setLiveReserve] = useState<PropertyListing[]>([]);

  const [feed, setFeed] = useState<ListingsFeed | null>(null);
  const [changelog, setChangelog] = useState<ChangelogFeed | null>(null);
  const [reservePool, setReservePool] = useState<PropertyListing[]>([]);

  const [isSimulated, setIsSimulated] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [motionPaused, setMotionPaused] = useState<boolean>(() => prefersReducedMotion());
  const [savedIds, setSavedIds] = useState<string[]>(() => loadSavedIds());
  const [selectedListing, setSelectedListing] = useState<PropertyListing | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadEdition() {
      try {
        const [listingsRes, changelogRes, reserveRes] = await Promise.all([
          fetch('./data/listings.json'),
          fetch('./data/changelog.json'),
          fetch('./data/reserve.json').catch(() => null),
        ]);
        if (!listingsRes.ok) throw new Error('Unable to load daily property index.');
        const listingsData: ListingsFeed = await listingsRes.json();
        const changelogData: ChangelogFeed = changelogRes.ok
          ? await changelogRes.json()
          : {
              lastSyncedAt: listingsData.syncedAt,
              totalRemovedUnderContract: 0,
              runs: [],
              removedArchive: [],
            };
        const reserveData: PropertyListing[] =
          reserveRes && reserveRes.ok ? await reserveRes.json() : [];

        if (!active) return;
        setLiveFeed(listingsData);
        setLiveChangelog(changelogData);
        setLiveReserve(reserveData);
        setFeed(listingsData);
        setChangelog(changelogData);
        setReservePool(reserveData);

        const propertyId = new URLSearchParams(window.location.search).get('property');
        if (propertyId) {
          const match = listingsData.listings.find((l) => l.id === propertyId);
          if (match) setSelectedListing(match);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load edition.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadEdition();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleInspect = useCallback((listing: PropertyListing) => {
    setSelectedListing(listing);
    const url = new URL(window.location.href);
    url.searchParams.set('property', listing.id);
    window.history.replaceState({}, '', url);
  }, []);

  const handleCloseDossier = useCallback(() => {
    setSelectedListing(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('property')) {
      url.searchParams.delete('property');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const handleSimulateNextDay = () => {
    if (!feed || !changelog) return;
    const { nextFeed, nextChangelog, nextReserve, summaryText } = simulateNextDayClient(
      feed,
      changelog,
      reservePool
    );
    setFeed(nextFeed);
    setChangelog(nextChangelog);
    setReservePool(nextReserve);
    setIsSimulated(true);
    setSimulationNotice(summaryText);
  };

  const handleResetSimulation = () => {
    if (!liveFeed || !liveChangelog) return;
    setFeed(liveFeed);
    setChangelog(liveChangelog);
    setReservePool(liveReserve);
    setIsSimulated(false);
    setSimulationNotice(null);
  };

  const allListings = feed?.listings ?? [];

  const counts = useMemo(
    () => ({
      all: allListings.length,
      exceptional: allListings.filter((l) => l.categories.includes('exceptional')).length,
      deal: allListings.filter((l) => l.categories.includes('deal')).length,
      new: allListings.filter((l) => l.categories.includes('new')).length,
      saved: allListings.filter((l) => savedSet.has(l.id)).length,
    }),
    [allListings, savedSet]
  );

  const filteredListings = useMemo(() => {
    const list = allListings.filter((item) => {
      if (filters.lens === 'saved' && !savedSet.has(item.id)) return false;
      if (
        filters.lens !== 'all' &&
        filters.lens !== 'saved' &&
        !item.categories.includes(filters.lens)
      ) {
        return false;
      }
      if (!matchesLocationQuery(item, filters.locationQuery)) return false;
      if (filters.minPrice > 0 && item.price < filters.minPrice) return false;
      if (filters.maxPrice > 0 && item.price > filters.maxPrice) return false;
      if (filters.minBeds > 0 && item.beds < filters.minBeds) return false;
      if (filters.minBaths > 0 && item.baths < filters.minBaths) return false;
      if (filters.minSqft > 0 && item.sqft < filters.minSqft) return false;
      if (!matchesStyleGroup(item, filters.styleGroup)) return false;
      if (filters.priceCutsOnly && item.priceCutPct <= 0) return false;
      if (filters.belowMedianOnly && item.medianDeltaPct > -20) return false;
      return true;
    });

    const sorted = [...list];
    if (filters.sort === 'newest') {
      sorted.sort((a, b) => a.daysOnMarket - b.daysOnMarket || b.scores.overall - a.scores.overall);
    } else if (filters.sort === 'discount') {
      sorted.sort((a, b) => a.medianDeltaPct - b.medianDeltaPct || b.priceCutPct - a.priceCutPct);
    } else if (filters.sort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'sqft-desc') {
      sorted.sort((a, b) => b.sqft - a.sqft);
    } else {
      sorted.sort((a, b) => b.scores.overall - a.scores.overall || a.daysOnMarket - b.daysOnMarket);
    }
    return sorted;
  }, [allListings, filters, savedSet]);

  const isDefaultUnfiltered =
    filters.lens === 'all' &&
    filters.locationQuery.trim() === '' &&
    filters.minPrice === 0 &&
    filters.maxPrice === 0 &&
    filters.minBeds === 0 &&
    filters.minBaths === 0 &&
    filters.minSqft === 0 &&
    filters.styleGroup === 'all' &&
    !filters.priceCutsOnly &&
    !filters.belowMedianOnly &&
    filters.sort === 'score';

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold tracking-[-0.03em] text-slate-950">
            penny<span className="text-indigo-600">lane</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">Loading daily property index...</p>
        </div>
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">Feed Unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || 'Run `npm run sync` to generate today’s daily listing feed.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh text-slate-950">
      <TopNav
        locationQuery={filters.locationQuery}
        listings={allListings}
        activeCount={feed.summary.activeCount}
        removedToday={feed.summary.removedToday}
        savedCount={counts.saved}
        isSavedLens={filters.lens === 'saved'}
        isSimulated={isSimulated}
        onLocationChange={(locationQuery) => setFilters((prev) => ({ ...prev, locationQuery }))}
        onToggleSavedLens={() =>
          setFilters((prev) => ({ ...prev, lens: prev.lens === 'saved' ? 'all' : 'saved' }))
        }
        onOpenLedger={() => setLedgerOpen(true)}
        onResetHome={() => setFilters(DEFAULT_FILTERS)}
      />

      <FilterStrip
        filters={filters}
        counts={counts}
        resultCount={filteredListings.length}
        motionPaused={motionPaused}
        onToggleMotion={() => setMotionPaused((p) => !p)}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        onSimulateNextDay={handleSimulateNextDay}
      />

      {/* Compact Simulated Sync Banner */}
      {simulationNotice && (
        <div
          role="status"
          aria-live="polite"
          className="border-b border-indigo-200/70 bg-gradient-to-r from-indigo-50 via-rose-50/70 to-amber-50/60 px-4 py-2 text-xs text-slate-900 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              {simulationNotice}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLedgerOpen(true)}
                className="cursor-pointer font-semibold text-rose-600 hover:underline"
              >
                View Removed
              </button>
              <button
                type="button"
                onClick={handleResetSimulation}
                className="inline-flex cursor-pointer items-center gap-1 text-slate-600 hover:text-slate-950"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main High-Density Bento Photo Gallery */}
      <main className="mx-auto max-w-[1600px] px-4 pt-5 pb-16 sm:px-6 lg:px-8">
        {filteredListings.length === 0 ? (
          <div className="mx-auto my-12 max-w-md rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-slate-200/80 shadow-xs">
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              No matching homes in today&apos;s feed
            </p>
            <p className="mt-1.5 text-sm text-slate-500">
              {filters.lens === 'saved'
                ? 'Bookmark properties as you browse to track them here until they go under contract.'
                : 'Try searching a different city, state, or ZIP, or widening your price range.'}
            </p>
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-5 cursor-pointer rounded-full bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing, idx) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                index={idx}
                isSaved={savedSet.has(listing.id)}
                motionPaused={motionPaused}
                featured={isDefaultUnfiltered && idx === 0}
                isLcp={idx === 0}
                onInspect={handleInspect}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-950">
              penny<span className="text-indigo-600">lane</span>
            </span>
            <span>·</span>
            <span>Updated {formatDateShort(feed.syncedAt)}</span>
            <span>·</span>
            <span className="font-medium text-rose-600">
              {changelog?.totalRemovedUnderContract ?? 0} removed under contract
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSimulateNextDay}
              className="cursor-pointer font-medium text-indigo-600 transition-colors hover:text-indigo-800"
            >
              Preview +1 Day Sync
            </button>
            <button
              type="button"
              onClick={() => setLedgerOpen(true)}
              className="cursor-pointer font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              Removal Log &amp; Docs
            </button>
            <a
              href="https://github.com/awerds/pennylane"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              MIT Open Source
            </a>
          </div>
        </div>
      </footer>

      <PropertyDossierModal
        listing={selectedListing}
        isSaved={selectedListing ? savedSet.has(selectedListing.id) : false}
        onClose={handleCloseDossier}
        onToggleSave={toggleSave}
      />

      <SyncLedgerModal
        open={ledgerOpen}
        changelog={changelog}
        provider={feed.provider}
        editionNumber={feed.editionNumber}
        isSimulated={isSimulated}
        onSimulateNextDay={handleSimulateNextDay}
        onResetSimulation={handleResetSimulation}
        onClose={() => setLedgerOpen(false)}
      />
    </div>
  );
}

export default App;
