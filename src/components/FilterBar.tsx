import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { FilterLens, FilterState, SortMode } from '../types';

interface FilterBarProps {
  filters: FilterState;
  counts: {
    all: number;
    exceptional: number;
    deal: number;
    new: number;
    saved: number;
  };
  regions: string[];
  resultCount: number;
  onChange: (next: Partial<FilterState>) => void;
  onReset: () => void;
}

const LENS_OPTIONS: Array<{ key: FilterLens; label: string }> = [
  { key: 'all', label: 'All Finds' },
  { key: 'exceptional', label: 'Exceptional' },
  { key: 'deal', label: 'Good Deals' },
  { key: 'new', label: 'New to Market' },
  { key: 'saved', label: 'Saved' },
];

export function FilterBar({
  filters,
  counts,
  regions,
  resultCount,
  onChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.lens !== 'all' ||
    filters.region !== 'All' ||
    filters.maxPrice > 0 ||
    filters.query.trim().length > 0;

  return (
    <section
      aria-label="Filter and sort listings"
      className="sticky top-0 z-20 border-y border-[var(--rule)] bg-[var(--paper)]/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1380px] flex-col gap-3 px-5 py-3.5 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
        {/* Curated Lens Tabs */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Curated category lens">
          {LENS_OPTIONS.map((opt) => {
            const active = filters.lens === opt.key;
            const count = counts[opt.key];
            return (
              <button
                key={opt.key}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ lens: opt.key })}
                className={`inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                    : 'border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`font-mono-tech text-[10px] ${
                    active ? 'text-[var(--paper)]/75' : 'text-[var(--ink-soft)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Region, Price & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex-1 sm:w-56 sm:flex-initial">
            <span className="sr-only">Search properties by city, style, or feature</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-soft)]"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => onChange({ query: e.target.value })}
              placeholder="City, style, waterfall..."
              className="w-full border border-[var(--rule)] bg-[var(--paper-raised)] py-1.5 pr-3 pl-8 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)]/70 focus:border-[var(--ink)] focus:outline-none"
            />
          </label>

          <label className="inline-flex items-center">
            <span className="sr-only">Region</span>
            <select
              value={filters.region}
              onChange={(e) => onChange({ region: e.target.value })}
              className="cursor-pointer border border-[var(--rule)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            >
              <option value="All">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center">
            <span className="sr-only">Max price</span>
            <select
              value={filters.maxPrice}
              onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
              className="cursor-pointer border border-[var(--rule)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            >
              <option value={0}>Any Price</option>
              <option value={600000}>Under $600k</option>
              <option value={900000}>Under $900k</option>
              <option value={1300000}>Under $1.3M</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-1.5 border border-[var(--rule)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink)]">
            <SlidersHorizontal className="h-3 w-3 text-[var(--ink-soft)]" />
            <span className="sr-only">Sort listings</span>
            <select
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortMode })}
              className="cursor-pointer bg-transparent text-xs text-[var(--ink)] focus:outline-none"
            >
              <option value="score">PL Index Score</option>
              <option value="newest">Newest Listed</option>
              <option value="discount">Biggest Deal vs Median</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex cursor-pointer items-center gap-1 px-2 py-1.5 font-mono-tech text-[11px] text-[var(--vermilion)] hover:underline"
            >
              <X className="h-3 w-3" />
              <span>Clear ({resultCount})</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

