import { Columns2, LayoutGrid, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react';
import type { FilterLens, FilterState, SortMode, StyleGroup, ViewMode } from '../types';

interface FilterBarProps {
  filters: FilterState;
  viewMode: ViewMode;
  hasMapBounds: boolean;
  counts: {
    all: number;
    exceptional: number;
    deal: number;
    new: number;
    saved: number;
  };
  resultCount: number;
  totalCount: number;
  onChange: (next: Partial<FilterState>) => void;
  onChangeView: (mode: ViewMode) => void;
  onReset: () => void;
}

const LENS_OPTIONS: Array<{ key: FilterLens; label: string }> = [
  { key: 'all', label: 'All Finds' },
  { key: 'exceptional', label: 'Exceptional' },
  { key: 'deal', label: 'Good Deals' },
  { key: 'new', label: 'New to Market' },
  { key: 'saved', label: 'Saved' },
];

const PRICE_PRESETS: Array<{ label: string; min: number; max: number }> = [
  { label: 'Under $400k', min: 0, max: 400000 },
  { label: '$400k–$800k', min: 400000, max: 800000 },
  { label: '$800k–$1.5M', min: 800000, max: 1500000 },
  { label: '$1.5M+', min: 1500000, max: 0 },
];

export function FilterBar({
  filters,
  viewMode,
  hasMapBounds,
  counts,
  resultCount,
  totalCount,
  onChange,
  onChangeView,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.lens !== 'all' ||
    filters.region !== 'All' ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.minBeds > 0 ||
    filters.minBaths > 0 ||
    filters.minSqft > 0 ||
    filters.styleGroup !== 'all' ||
    filters.priceCutsOnly ||
    filters.belowMedianOnly ||
    filters.query.trim().length > 0 ||
    hasMapBounds;

  return (
    <section
      aria-label="Filter and sort listings"
      className="sticky top-0 z-20 border-y border-[var(--rule)] bg-[var(--paper)]/96 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-3 sm:px-8">
        {/* Row 1: Category Lenses + View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          {/* Layout View Switcher (Split Map / Grid / Full Map) */}
          <div className="flex items-center gap-2">
            <span className="hidden font-mono-tech text-[11px] text-[var(--ink-soft)] sm:inline">
              {resultCount} of {totalCount} homes
            </span>
            <div
              className="inline-flex border border-[var(--rule)] bg-[var(--paper-raised)]"
              role="group"
              aria-label="Layout view"
            >
              {[
                { key: 'split' as ViewMode, label: 'Split', Icon: Columns2 },
                { key: 'grid' as ViewMode, label: 'Grid', Icon: LayoutGrid },
                { key: 'map' as ViewMode, label: 'Map', Icon: MapIcon },
              ].map(({ key, label, Icon }) => {
                const active = viewMode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChangeView(key)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider transition-colors ${
                      active
                        ? 'bg-[var(--ink)] text-[var(--paper)]'
                        : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Search, Pricing Filters, Basic Property Specs & Sort */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--rule)]/70 pt-3">
          {/* Search */}
          <label className="relative min-w-[190px] flex-1 sm:max-w-[230px]">
            <span className="sr-only">Search properties by city, state, style, or feature</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-soft)]"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => onChange({ query: e.target.value })}
              placeholder="City, state, adobe, glass..."
              className="w-full border border-[var(--rule)] bg-[var(--paper-raised)] py-1.5 pr-3 pl-8 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)]/70 focus:border-[var(--ink)] focus:outline-none"
            />
          </label>

          {/* Price Min / Max Pair */}
          <div className="inline-flex items-center border border-[var(--rule)] bg-[var(--paper-raised)]">
            <label className="inline-flex items-center">
              <span className="sr-only">Minimum price</span>
              <select
                value={filters.minPrice}
                onChange={(e) => {
                  const nextMin = Number(e.target.value);
                  onChange({
                    minPrice: nextMin,
                    ...(filters.maxPrice > 0 && nextMin > filters.maxPrice ? { maxPrice: 0 } : {}),
                  });
                }}
                className="cursor-pointer bg-transparent px-2.5 py-1.5 font-mono-tech text-[11px] text-[var(--ink)] focus:outline-none"
              >
                <option value={0}>Min $</option>
                <option value={200000}>$200k+</option>
                <option value={350000}>$350k+</option>
                <option value={500000}>$500k+</option>
                <option value={750000}>$750k+</option>
                <option value={1000000}>$1.0M+</option>
                <option value={1500000}>$1.5M+</option>
              </select>
            </label>
            <span className="text-[var(--rule)]" aria-hidden="true">–</span>
            <label className="inline-flex items-center">
              <span className="sr-only">Maximum price</span>
              <select
                value={filters.maxPrice}
                onChange={(e) => {
                  const nextMax = Number(e.target.value);
                  onChange({
                    maxPrice: nextMax,
                    ...(nextMax > 0 && filters.minPrice > nextMax ? { minPrice: 0 } : {}),
                  });
                }}
                className="cursor-pointer bg-transparent px-2.5 py-1.5 font-mono-tech text-[11px] text-[var(--ink)] focus:outline-none"
              >
                <option value={0}>Max $</option>
                <option value={350000}>≤ $350k</option>
                <option value={500000}>≤ $500k</option>
                <option value={750000}>≤ $750k</option>
                <option value={1000000}>≤ $1.0M</option>
                <option value={1500000}>≤ $1.5M</option>
                <option value={2500000}>≤ $2.5M</option>
              </select>
            </label>
          </div>

          {/* Beds */}
          <label className="inline-flex items-center">
            <span className="sr-only">Minimum bedrooms</span>
            <select
              value={filters.minBeds}
              onChange={(e) => onChange({ minBeds: Number(e.target.value) })}
              className="cursor-pointer border border-[var(--rule)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            >
              <option value={0}>Beds: Any</option>
              <option value={2}>2+ Beds</option>
              <option value={3}>3+ Beds</option>
              <option value={4}>4+ Beds</option>
              <option value={5}>5+ Beds</option>
            </select>
          </label>

          {/* Baths */}
          <label className="inline-flex items-center">
            <span className="sr-only">Minimum bathrooms</span>
            <select
              value={filters.minBaths}
              onChange={(e) => onChange({ minBaths: Number(e.target.value) })}
              className="cursor-pointer border border-[var(--rule)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            >
              <option value={0}>Baths: Any</option>
              <option value={2}>2+ Baths</option>
              <option value={2.5}>2.5+ Baths</option>
              <option value={3}>3+ Baths</option>
            </select>
          </label>

          {/* SqFt */}
          <label className="inline-flex items-center">
            <span className="sr-only">Minimum square footage</span>
            <select
              value={filters.minSqft}
              onChange={(e) => onChange({ minSqft: Number(e.target.value) })}
              className="cursor-pointer border border-[var(--rule)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            >
              <option value={0}>SqFt: Any</option>
              <option value={1500}>1,500+ sf</option>
              <option value={2200}>2,200+ sf</option>
              <option value={3000}>3,000+ sf</option>
            </select>
          </label>

          {/* Architectural Style */}
          <label className="inline-flex items-center">
            <span className="sr-only">Architectural style</span>
            <select
              value={filters.styleGroup}
              onChange={(e) => onChange({ styleGroup: e.target.value as StyleGroup })}
              className="cursor-pointer border border-[var(--rule)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            >
              <option value="all">All Styles</option>
              <option value="modern">Mid-Century &amp; Modern</option>
              <option value="historic">Historic (Pre-1935)</option>
              <option value="reuse">Adaptive Reuse</option>
              <option value="desert">Desert &amp; Adobe</option>
              <option value="coastal">Coastal &amp; Cabin</option>
            </select>
          </label>

          {/* Sort */}
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
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="sqft-desc">Largest SqFt</option>
            </select>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex cursor-pointer items-center gap-1 px-2 py-1.5 font-mono-tech text-[11px] text-[var(--vermilion)] hover:underline"
            >
              <X className="h-3 w-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Row 3: Quick Price Brackets & Deal Checkboxes */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
              Price Tiers:
            </span>
            {PRICE_PRESETS.map((preset) => {
              const active = filters.minPrice === preset.min && filters.maxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange(
                      active
                        ? { minPrice: 0, maxPrice: 0 }
                        : { minPrice: preset.min, maxPrice: preset.max }
                    )
                  }
                  className={`cursor-pointer border px-2 py-0.5 font-mono-tech text-[10px] transition-colors ${
                    active
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                      : 'border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="pl-check-label inline-flex cursor-pointer items-center gap-1.5 font-mono-tech text-[11px] text-[var(--ink)] select-none">
              <input
                type="checkbox"
                checked={filters.priceCutsOnly}
                onChange={(e) => onChange({ priceCutsOnly: e.target.checked })}
                className="pl-native-check h-3.5 w-3.5 cursor-pointer"
              />
              <span>Price Cuts Only</span>
            </label>

            <label className="pl-check-label inline-flex cursor-pointer items-center gap-1.5 font-mono-tech text-[11px] text-[var(--ink)] select-none">
              <input
                type="checkbox"
                checked={filters.belowMedianOnly}
                onChange={(e) => onChange({ belowMedianOnly: e.target.checked })}
                className="pl-native-check h-3.5 w-3.5 cursor-pointer"
              />
              <span>20%+ Below Zip Median</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
