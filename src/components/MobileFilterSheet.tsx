import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import type { FilterState, SortMode, StyleGroup } from '../types';
import { formatNumber } from '../utils/format';
import {
  attachLightDismissFallback,
  closeDialogWithAnimation,
  supportsTopLayerExit,
} from '../utils/topLayer';

interface MobileFilterSheetProps {
  open: boolean;
  filters: FilterState;
  resultCount: number;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  onClose: () => void;
}

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

export function MobileFilterSheet({
  open,
  filters,
  resultCount,
  onChange,
  onReset,
  onClose,
}: MobileFilterSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleRequestClose = () => {
      void closeDialogWithAnimation(dialog);
    };

    const handleCancel = (event: Event) => {
      if (!supportsTopLayerExit()) {
        event.preventDefault();
        handleRequestClose();
      }
    };

    const handleClose = () => {
      dialog.returnValue = '';
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);
    const detachFallback = attachLightDismissFallback(dialog, handleRequestClose);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      detachFallback();
    };
  }, [onClose]);

  const handleCloseClick = () => {
    if (dialogRef.current) {
      void closeDialogWithAnimation(dialogRef.current);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby={titleId}
      className="modern-modal modern-modal--narrow"
    >
      {/* Grab handle for bottom-sheet feel */}
      <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
        <span className="h-1 w-10 rounded-full bg-slate-300" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-3.5 backdrop-blur-md">
        <h2 id={titleId} className="text-lg font-bold tracking-tight text-slate-950">
          Filter &amp; Sort
        </h2>
        <button
          type="button"
          autoFocus
          onClick={handleCloseClick}
          aria-label="Close filters"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-700 hover:text-white"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="space-y-5 p-5">
        {/* Sort */}
        <div>
          <label htmlFor="mobile-sort" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Sort By
          </label>
          <select
            id="mobile-sort"
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortMode })}
            className="mt-2 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none sm:text-sm"
          >
            <option value="deal-value">Best Deal Value (vs. Zestimate)</option>
            <option value="savings">Biggest $ Savings</option>
            <option value="score">Top CurbSteals Score</option>
            <option value="newest">Just Listed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="sqft-desc">Largest SqFt</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select
              aria-label="Minimum price"
              value={filters.minPrice}
              onChange={(e) => {
                const nextMin = Number(e.target.value);
                onChange({
                  minPrice: nextMin,
                  ...(filters.maxPrice > 0 && nextMin > filters.maxPrice ? { maxPrice: 0 } : {}),
                });
              }}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-medium text-slate-900 tabular-nums focus:border-blue-600 focus:bg-white focus:outline-none sm:text-sm"
            >
              <option value={0}>Min Price</option>
              <option value={200000}>$200k+</option>
              <option value={350000}>$350k+</option>
              <option value={500000}>$500k+</option>
              <option value={750000}>$750k+</option>
              <option value={1000000}>$1.0M+</option>
              <option value={1500000}>$1.5M+</option>
            </select>

            <select
              aria-label="Maximum price"
              value={filters.maxPrice}
              onChange={(e) => {
                const nextMax = Number(e.target.value);
                onChange({
                  maxPrice: nextMax,
                  ...(nextMax > 0 && filters.minPrice > nextMax ? { minPrice: 0 } : {}),
                });
              }}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-medium text-slate-900 tabular-nums focus:border-blue-600 focus:bg-white focus:outline-none sm:text-sm"
            >
              <option value={0}>Max Price</option>
              <option value={350000}>≤ $350k</option>
              <option value={500000}>≤ $500k</option>
              <option value={750000}>≤ $750k</option>
              <option value={1000000}>≤ $1.0M</option>
              <option value={1500000}>≤ $1.5M</option>
              <option value={2500000}>≤ $2.5M</option>
            </select>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
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
                  className={`min-h-[44px] cursor-pointer rounded-xl border px-3 text-xs font-semibold tabular-nums transition-colors ${
                    active
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {tier.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deal Scale */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Minimum Deal Scale
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
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
                className={`min-h-[44px] cursor-pointer rounded-xl border text-xs font-semibold transition-colors ${
                  filters.minDealTier === opt.val
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Beds & Baths */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Bedrooms</div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {[0, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange({ minBeds: n })}
                  className={`min-h-[44px] cursor-pointer rounded-xl border text-xs font-semibold transition-colors ${
                    filters.minBeds === n
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {n === 0 ? 'Any' : `${n}+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Bathrooms</div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[0, 2, 2.5, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange({ minBaths: n })}
                  className={`min-h-[44px] cursor-pointer rounded-xl border text-xs font-semibold transition-colors ${
                    filters.minBaths === n
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {n === 0 ? 'Any' : `${n}+`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Min SqFt */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Minimum Size</div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[
              { val: 0, label: 'Any' },
              { val: 1500, label: '1.5k+ sf' },
              { val: 2200, label: '2.2k+ sf' },
              { val: 3000, label: '3k+ sf' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => onChange({ minSqft: opt.val })}
                className={`min-h-[44px] cursor-pointer rounded-xl border text-xs font-semibold tabular-nums transition-colors ${
                  filters.minSqft === opt.val
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Style</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChange({ styleGroup: opt.key })}
                className={`min-h-[40px] cursor-pointer rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                  filters.styleGroup === opt.key
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Checkboxes */}
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
          <label className="pl-check-label flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-3.5 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={filters.priceCutsOnly}
              onChange={(e) => onChange({ priceCutsOnly: e.target.checked })}
              className="pl-native-check h-4 w-4 cursor-pointer"
            />
            <span>Recent Price Cuts Only</span>
          </label>

          <label className="pl-check-label flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-3.5 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={filters.belowMedianOnly}
              onChange={(e) => onChange({ belowMedianOnly: e.target.checked })}
              className="pl-native-check h-4 w-4 cursor-pointer"
            />
            <span>20%+ Below Zip Median $/SqFt</span>
          </label>
        </div>
      </div>

      {/* Sticky Bottom Apply Bar */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-slate-100 bg-white/95 px-5 py-3.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onReset}
          className="min-h-[44px] cursor-pointer px-3 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          Reset All
        </button>

        <button
          type="button"
          onClick={handleCloseClick}
          className="min-h-[44px] flex-1 cursor-pointer rounded-full bg-gradient-to-r from-blue-700 to-indigo-600 px-5 text-sm font-bold text-white shadow-sm"
        >
          Show {formatNumber(resultCount)} {resultCount === 1 ? 'Home' : 'Homes'}
        </button>
      </div>
    </dialog>
  );
}
