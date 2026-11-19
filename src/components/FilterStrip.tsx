import { useEffect, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { FilterLens, FilterState, SortMode, StyleGroup } from '../types';
import { formatPriceCompact } from '../utils/format';

interface FilterStripProps {
  filters: FilterState;
  counts: {
    all: number;
    exceptional: number;
    deal: number;
    new: number;
    saved: number;
  };
  resultCount: number;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  onSimulateNextDay: () => void;
}

const LENS_TABS: Array<{ key: FilterLens; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'exceptional', label: 'Exceptional' },
  { key: 'deal', label: 'Good Deals' },
  { key: 'new', label: 'Just Listed' },
];

const PRICE_TIERS = [
  { label: 'Under $400k', min: 0, max: 400000 },
  { label: '$400k – $800k', min: 400000, max: 800000 },
  { label: '$800k – $1.5M', min: 800000, max: 1500000 },
  { label: '$1.5M+', min: 1500000, max: 0 },
];

const STYLE_OPTIONS: Array<{ key: StyleGroup; label: string }> = [
  { key: 'all', label: 'Any Style' },
  { key: 'modern', label: 'Modern & MCM' },
  { key: 'historic', label: 'Historic' },
  { key: 'reuse', label: 'Adaptive Reuse' },
  { key: 'desert', label: 'Desert & Adobe' },
  { key: 'coastal', label: 'Coastal & Cabin' },
];

export function FilterStrip({
  filters,
  counts,
  resultCount,
  onChange,
  onReset,
  onSimulateNextDay,
}: FilterStripProps) {
  const [openMenu, setOpenMenu] = useState<'price' | 'specs' | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (stripRef.current && !stripRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const priceActive = filters.minPrice > 0 || filters.maxPrice > 0;
  const priceLabel = !priceActive
    ? 'Price'
    : filters.minPrice > 0 && filters.maxPrice > 0
    ? `${formatPriceCompact(filters.minPrice)}–${formatPriceCompact(filters.maxPrice)}`
    : filters.minPrice > 0
    ? `${formatPriceCompact(filters.minPrice)}+`
    : `Up to ${formatPriceCompact(filters.maxPrice)}`;

  const specsCount =
    (filters.minBeds > 0 ? 1 : 0) +
    (filters.minBaths > 0 ? 1 : 0) +
    (filters.minSqft > 0 ? 1 : 0) +
    (filters.styleGroup !== 'all' ? 1 : 0);

  const hasAnyFilter =
    filters.lens !== 'all' ||
    filters.locationQuery.trim().length > 0 ||
    priceActive ||
    specsCount > 0 ||
    filters.priceCutsOnly ||
    filters.belowMedianOnly;

  return (
    <div
      ref={stripRef}
      className="sticky top-16 z-20 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Left: Category Segmented Pills + Filter Popover Triggers */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Lens Segmented Control */}
          <div
            className="inline-flex items-center rounded-full bg-zinc-100/90 p-0.5"
            role="group"
            aria-label="Category filter"
          >
            {LENS_TABS.map((tab) => {
              const active = filters.lens === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ lens: tab.key })}
                  className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${
                    active
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10.5px] tabular-nums ${
                      active ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="hidden h-4 w-px bg-zinc-200 sm:inline-block" aria-hidden="true" />

          {/* Price Popover Trigger */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openMenu === 'price'}
              onClick={() => setOpenMenu((m) => (m === 'price' ? null : 'price'))}
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors tabular-nums ${
                priceActive || openMenu === 'price'
                  ? 'border-zinc-950 bg-zinc-950 text-white'
                  : 'border-zinc-200/90 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950'
              }`}
            >
              <span>{priceLabel}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  openMenu === 'price' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openMenu === 'price' && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-40 w-[300px] rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_20px_56px_-16px_rgba(9,9,11,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-950">Price Range</span>
                  {priceActive && (
                    <button
                      type="button"
                      onClick={() => onChange({ minPrice: 0, maxPrice: 0 })}
                      className="cursor-pointer text-[11px] font-medium text-zinc-500 hover:text-zinc-950"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] text-zinc-500">Minimum</span>
                    <select
                      value={filters.minPrice}
                      onChange={(e) => {
                        const nextMin = Number(e.target.value);
                        onChange({
                          minPrice: nextMin,
                          ...(filters.maxPrice > 0 && nextMin > filters.maxPrice ? { maxPrice: 0 } : {}),
                        });
                      }}
                      className="mt-1 w-full cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs font-medium text-zinc-950 tabular-nums focus:border-zinc-950 focus:bg-white focus:outline-none"
                    >
                      <option value={0}>No min</option>
                      <option value={200000}>$200k</option>
                      <option value={350000}>$350k</option>
                      <option value={500000}>$500k</option>
                      <option value={750000}>$750k</option>
                      <option value={1000000}>$1.0M</option>
                      <option value={1500000}>$1.5M</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[11px] text-zinc-500">Maximum</span>
                    <select
                      value={filters.maxPrice}
                      onChange={(e) => {
                        const nextMax = Number(e.target.value);
                        onChange({
                          maxPrice: nextMax,
                          ...(nextMax > 0 && filters.minPrice > nextMax ? { minPrice: 0 } : {}),
                        });
                      }}
                      className="mt-1 w-full cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs font-medium text-zinc-950 tabular-nums focus:border-zinc-950 focus:bg-white focus:outline-none"
                    >
                      <option value={0}>No max</option>
                      <option value={350000}>$350k</option>
                      <option value={500000}>$500k</option>
                      <option value={750000}>$750k</option>
                      <option value={1000000}>$1.0M</option>
                      <option value={1500000}>$1.5M</option>
                      <option value={2500000}>$2.5M</option>
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-zinc-100 pt-3">
                  {PRICE_TIERS.map((tier) => {
                    const active = filters.minPrice === tier.min && filters.maxPrice === tier.max;
                    return (
                      <button
                        key={tier.label}
                        type="button"
                        onClick={() =>
                          onChange(
                            active
                              ? { minPrice: 0, maxPrice: 0 }
                              : { minPrice: tier.min, maxPrice: tier.max }
                          )
                        }
                        className={`cursor-pointer rounded-xl border px-2.5 py-1.5 text-[11.5px] font-medium tabular-nums transition-colors ${
                          active
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200/80 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Beds, Baths, SqFt & Style Popover Trigger */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openMenu === 'specs'}
              onClick={() => setOpenMenu((m) => (m === 'specs' ? null : 'specs'))}
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors ${
                specsCount > 0 || openMenu === 'specs'
                  ? 'border-zinc-950 bg-zinc-950 text-white'
                  : 'border-zinc-200/90 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Beds &amp; Style</span>
              {specsCount > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-semibold tabular-nums">
                  {specsCount}
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  openMenu === 'specs' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openMenu === 'specs' && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-40 w-[330px] rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_20px_56px_-16px_rgba(9,9,11,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-950">Property Specs</span>
                  {specsCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ minBeds: 0, minBaths: 0, minSqft: 0, styleGroup: 'all' })
                      }
                      className="cursor-pointer text-[11px] font-medium text-zinc-500 hover:text-zinc-950"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Beds */}
                <div className="mt-3">
                  <div className="text-[11px] font-medium text-zinc-500">Bedrooms</div>
                  <div className="mt-1.5 grid grid-cols-5 gap-1">
                    {[0, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => onChange({ minBeds: n })}
                        className={`cursor-pointer rounded-xl border py-1.5 text-xs font-medium transition-colors ${
                          filters.minBeds === n
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {n === 0 ? 'Any' : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Baths */}
                <div className="mt-3">
                  <div className="text-[11px] font-medium text-zinc-500">Bathrooms</div>
                  <div className="mt-1.5 grid grid-cols-4 gap-1">
                    {[0, 2, 2.5, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => onChange({ minBaths: n })}
                        className={`cursor-pointer rounded-xl border py-1.5 text-xs font-medium transition-colors ${
                          filters.minBaths === n
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {n === 0 ? 'Any' : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min SqFt */}
                <div className="mt-3">
                  <div className="text-[11px] font-medium text-zinc-500">Minimum Size</div>
                  <div className="mt-1.5 grid grid-cols-4 gap-1">
                    {[
                      { val: 0, label: 'Any' },
                      { val: 1500, label: '1.5k+' },
                      { val: 2200, label: '2.2k+' },
                      { val: 3000, label: '3k+' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => onChange({ minSqft: opt.val })}
                        className={`cursor-pointer rounded-xl border py-1.5 text-xs font-medium tabular-nums transition-colors ${
                          filters.minSqft === opt.val
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Architectural Style */}
                <div className="mt-3 border-t border-zinc-100 pt-3">
                  <div className="text-[11px] font-medium text-zinc-500">Architectural Style</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => onChange({ styleGroup: opt.key })}
                        className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                          filters.styleGroup === opt.key
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Deal Checkboxes */}
          <label className="pl-check-label hidden h-9 cursor-pointer items-center gap-2 rounded-full border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors select-none hover:border-zinc-300 hover:bg-zinc-50 lg:inline-flex">
            <input
              type="checkbox"
              checked={filters.priceCutsOnly}
              onChange={(e) => onChange({ priceCutsOnly: e.target.checked })}
              className="pl-native-check h-3.5 w-3.5 cursor-pointer rounded"
            />
            <span>Price Cuts</span>
          </label>

          <label className="pl-check-label hidden h-9 cursor-pointer items-center gap-2 rounded-full border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors select-none hover:border-zinc-300 hover:bg-zinc-50 xl:inline-flex">
            <input
              type="checkbox"
              checked={filters.belowMedianOnly}
              onChange={(e) => onChange({ belowMedianOnly: e.target.checked })}
              className="pl-native-check h-3.5 w-3.5 cursor-pointer rounded"
            />
            <span>20%+ Below Zip</span>
          </label>

          {hasAnyFilter && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Result Telemetry, Sort & +1 Day Demo Action */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs font-medium text-zinc-400 tabular-nums md:inline">
            {resultCount} {resultCount === 1 ? 'find' : 'finds'}
          </span>

          <label className="inline-flex h-9 items-center rounded-full border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300">
            <span className="sr-only">Sort listings</span>
            <select
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortMode })}
              className="cursor-pointer bg-transparent pr-1 text-xs font-medium text-zinc-800 focus:outline-none"
            >
              <option value="score">Top Ranked</option>
              <option value="newest">Just Listed</option>
              <option value="discount">Biggest Deal</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="sqft-desc">Largest SqFt</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onSimulateNextDay}
            title="Preview tomorrow's automated sync (adds new drops & removes under-contract homes)"
            className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-full bg-zinc-100 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-950 hover:text-white 2xl:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span>+1 Day Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
}
