import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Flame, Pause, Play, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { FilterLens, FilterState, SortMode, StyleGroup } from '../types';
import { formatNumber, formatPriceCompact } from '../utils/format';

interface FilterStripProps {
  filters: FilterState;
  counts: {
    all: number;
    steals: number;
    exceptional: number;
    deal: number;
    new: number;
    saved: number;
  };
  resultCount: number;
  motionPaused: boolean;
  onToggleMotion: () => void;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  onSimulateNextDay: () => void;
}

const LENS_TABS: Array<{
  key: FilterLens;
  label: string;
  activeClass: string;
  dotClass: string;
}> = [
  {
    key: 'all',
    label: 'All',
    activeClass: 'bg-blue-700 text-white shadow-sm shadow-blue-700/25',
    dotClass: 'bg-blue-600',
  },
  {
    key: 'steals',
    label: '5/5 Steals',
    activeClass: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-600/25',
    dotClass: 'bg-emerald-500',
  },
  {
    key: 'deal',
    label: 'Good Deals',
    activeClass: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25',
    dotClass: 'bg-teal-500',
  },
  {
    key: 'exceptional',
    label: 'Unique',
    activeClass: 'bg-amber-500 text-white shadow-sm shadow-amber-500/25',
    dotClass: 'bg-amber-500',
  },
  {
    key: 'new',
    label: 'Just Listed',
    activeClass: 'bg-rose-500 text-white shadow-sm shadow-rose-500/25',
    dotClass: 'bg-rose-500',
  },
];

const PRICE_TIERS = [
  { label: 'Under $350k', min: 0, max: 350000 },
  { label: '$350k – $750k', min: 350000, max: 750000 },
  { label: '$750k – $1.5M', min: 750000, max: 1500000 },
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
  motionPaused,
  onToggleMotion,
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
    (filters.minDealTier > 0 ? 1 : 0) +
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
      className="w-full max-w-full border-b border-emerald-200/60 bg-emerald-50/82 backdrop-blur-xl"
    >
      {/* MOBILE (< md): Constrained min-w-0 horizontal swipeable chip rail — ZERO overhang */}
      <div className="flex w-full min-w-0 items-center md:hidden">
        <div
          role="region"
          aria-label="Quick category filters"
          tabIndex={0}
          className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-3.5 py-2"
        >
          {LENS_TABS.map((tab) => {
            const active = filters.lens === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ lens: tab.key })}
                className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? tab.activeClass
                    : 'border border-slate-200/80 bg-white text-slate-700'
                }`}
              >
                {tab.key === 'steals' ? (
                  <Flame className={`h-3 w-3 ${active ? 'text-amber-200' : 'text-emerald-600'}`} />
                ) : (
                  !active && (
                    <span className={`h-1.5 w-1.5 rounded-full ${tab.dotClass}`} aria-hidden="true" />
                  )
                )}
                <span>{tab.label}</span>
                <span className={`text-[10px] tabular-nums ${active ? 'text-white/85' : 'text-slate-400'}`}>
                  {formatNumber(counts[tab.key])}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onToggleMotion}
            className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-slate-200/80 bg-white px-3 text-xs font-medium whitespace-nowrap text-slate-600"
          >
            {motionPaused ? (
              <>
                <Play className="h-3 w-3 fill-current text-blue-600" />
                <span>Play</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-blue-600" />
                <span>Pause</span>
              </>
            )}
          </button>

          {hasAnyFilter && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-rose-50 px-3 text-xs font-semibold whitespace-nowrap text-rose-600"
            >
              <X className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* DESKTOP (md+): Full sleek single-row filter rail with floating popovers */}
      <div className="mx-auto hidden max-w-[1600px] items-center justify-between gap-2.5 px-6 py-2 md:flex lg:px-8">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div
            className="inline-flex items-center rounded-full bg-white/85 p-0.5 ring-1 ring-slate-200/80"
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
                    active ? tab.activeClass : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {tab.key === 'steals' ? (
                    <Flame className={`h-3 w-3 ${active ? 'text-amber-200' : 'text-emerald-600'}`} />
                  ) : (
                    !active && (
                      <span className={`h-1.5 w-1.5 rounded-full ${tab.dotClass}`} aria-hidden="true" />
                    )
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10.5px] tabular-nums ${
                      active ? 'text-white/85' : 'text-slate-400'
                    }`}
                  >
                    {formatNumber(counts[tab.key])}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="h-4 w-px bg-sky-200" aria-hidden="true" />

          {/* Price Popover */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openMenu === 'price'}
              onClick={() => setOpenMenu((m) => (m === 'price' ? null : 'price'))}
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-all tabular-nums ${
                priceActive || openMenu === 'price'
                  ? 'border-blue-700 bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700'
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
              <div className="absolute top-[calc(100%+8px)] left-0 z-40 w-[300px] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_20px_56px_-16px_rgba(15,23,42,0.22)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-950">Price Range</span>
                  {priceActive && (
                    <button
                      type="button"
                      onClick={() => onChange({ minPrice: 0, maxPrice: 0 })}
                      className="cursor-pointer text-[11px] font-medium text-blue-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] text-slate-500">Minimum</span>
                    <select
                      value={filters.minPrice}
                      onChange={(e) => {
                        const nextMin = Number(e.target.value);
                        onChange({
                          minPrice: nextMin,
                          ...(filters.maxPrice > 0 && nextMin > filters.maxPrice ? { maxPrice: 0 } : {}),
                        });
                      }}
                      className="mt-1 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-950 tabular-nums focus:border-blue-600 focus:bg-white focus:outline-none"
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
                    <span className="text-[11px] text-slate-500">Maximum</span>
                    <select
                      value={filters.maxPrice}
                      onChange={(e) => {
                        const nextMax = Number(e.target.value);
                        onChange({
                          maxPrice: nextMax,
                          ...(nextMax > 0 && filters.minPrice > nextMax ? { minPrice: 0 } : {}),
                        });
                      }}
                      className="mt-1 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-950 tabular-nums focus:border-blue-600 focus:bg-white focus:outline-none"
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

                <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-3">
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
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : 'border-slate-200/80 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
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

          {/* Specs Popover */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openMenu === 'specs'}
              onClick={() => setOpenMenu((m) => (m === 'specs' ? null : 'specs'))}
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-all ${
                specsCount > 0 || openMenu === 'specs'
                  ? 'border-blue-700 bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Filters</span>
              {specsCount > 0 && (
                <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[10px] font-semibold tabular-nums">
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
              <div className="absolute top-[calc(100%+8px)] left-0 z-40 w-[340px] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_20px_56px_-16px_rgba(15,23,42,0.22)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-950">Deal Scale &amp; Specs</span>
                  {specsCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          minBeds: 0,
                          minBaths: 0,
                          minSqft: 0,
                          minDealTier: 0,
                          styleGroup: 'all',
                        })
                      }
                      className="cursor-pointer text-[11px] font-medium text-blue-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-medium text-slate-500">Minimum Deal Scale</div>
                  <div className="mt-1.5 grid grid-cols-4 gap-1">
                    {[
                      { val: 0, label: 'Any' },
                      { val: 3, label: '3/5+' },
                      { val: 4, label: '4/5+' },
                      { val: 5, label: '5/5 Steal' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => onChange({ minDealTier: opt.val })}
                        className={`cursor-pointer rounded-xl border py-1.5 text-[11.5px] font-semibold transition-colors ${
                          filters.minDealTier === opt.val
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-medium text-slate-500">Bedrooms</div>
                  <div className="mt-1.5 grid grid-cols-5 gap-1">
                    {[0, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => onChange({ minBeds: n })}
                        className={`cursor-pointer rounded-xl border py-1.5 text-xs font-medium transition-colors ${
                          filters.minBeds === n
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {n === 0 ? 'Any' : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-medium text-slate-500">Bathrooms</div>
                  <div className="mt-1.5 grid grid-cols-4 gap-1">
                    {[0, 2, 2.5, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => onChange({ minBaths: n })}
                        className={`cursor-pointer rounded-xl border py-1.5 text-xs font-medium transition-colors ${
                          filters.minBaths === n
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {n === 0 ? 'Any' : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-medium text-slate-500">Minimum Size</div>
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
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="text-[11px] font-medium text-slate-500">Architectural Style</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => onChange({ styleGroup: opt.key })}
                        className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                          filters.styleGroup === opt.key
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
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

          <label className="pl-check-label hidden h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-700 transition-colors select-none hover:border-rose-300 hover:bg-rose-50/40 xl:inline-flex">
            <input
              type="checkbox"
              checked={filters.priceCutsOnly}
              onChange={(e) => onChange({ priceCutsOnly: e.target.checked })}
              className="pl-native-check h-3.5 w-3.5 cursor-pointer rounded"
            />
            <span>Price Cuts</span>
          </label>

          {hasAnyFilter && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            {formatNumber(resultCount)} {resultCount === 1 ? 'home' : 'homes'}
          </span>

          <button
            type="button"
            onClick={onToggleMotion}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
            title={motionPaused ? 'Resume automatic photo transitions' : 'Pause automatic photo transitions'}
          >
            {motionPaused ? (
              <>
                <Play className="h-3 w-3 fill-current text-blue-600" />
                <span className="hidden xl:inline">Play Motion</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-blue-600" />
                <span className="hidden xl:inline">Pause Motion</span>
              </>
            )}
          </button>

          <label className="inline-flex h-9 items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 text-xs font-semibold text-emerald-800 transition-colors hover:border-emerald-300">
            <span className="sr-only">Sort listings</span>
            <select
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortMode })}
              className="cursor-pointer bg-transparent pr-1 text-xs font-semibold text-emerald-900 focus:outline-none"
            >
              <option value="deal-value">Sort: Best Deal Value</option>
              <option value="savings">Sort: Biggest $ Savings</option>
              <option value="score">Sort: Top Overall Score</option>
              <option value="newest">Sort: Just Listed</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
              <option value="sqft-desc">Sort: Largest SqFt</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onSimulateNextDay}
            title="Preview tomorrow's automated sync (adds new drops & removes under-contract homes)"
            className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-700 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm shadow-blue-700/20 transition-opacity hover:opacity-90 2xl:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>+1 Day Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
}
