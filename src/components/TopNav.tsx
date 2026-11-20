import { Activity, BellRing, Bookmark, SlidersHorizontal } from 'lucide-react';
import type { PropertyListing } from '../types';
import { formatNumber } from '../utils/format';
import { LocationSearch } from './LocationSearch';
import { PennyLaneLogo } from './PennyLaneLogo';

interface TopNavProps {
  locationQuery: string;
  listings: PropertyListing[];
  activeCount: number;
  statesCovered: number;
  removedToday: number;
  savedCount: number;
  leadCount: number;
  mobileFilterCount: number;
  isSavedLens: boolean;
  isSimulated: boolean;
  onLocationChange: (query: string) => void;
  onToggleSavedLens: () => void;
  onOpenAlerts: () => void;
  onOpenLedger: () => void;
  onOpenMobileSheet: () => void;
  onResetHome: () => void;
}

export function TopNav({
  locationQuery,
  listings,
  activeCount,
  statesCovered,
  removedToday,
  savedCount,
  leadCount,
  mobileFilterCount,
  isSavedLens,
  isSimulated,
  onLocationChange,
  onToggleSavedLens,
  onOpenAlerts,
  onOpenLedger,
  onOpenMobileSheet,
  onResetHome,
}: TopNavProps) {
  return (
    <header className="pl-safe-top w-full border-b border-sky-200/20 bg-gradient-to-r from-[#0b2b59]/88 via-[#15458a]/86 to-[#1e40af]/84 text-white shadow-[0_8px_28px_-12px_rgba(11,43,89,0.45)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto w-full max-w-[1600px] px-3.5 py-2 sm:px-6 md:py-2.5 lg:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-5">
          {/* Row 1 on Mobile: Native Compact Brand + Filter Pill */}
          <div className="flex min-w-0 items-center justify-between gap-2">
            <button
              type="button"
              onClick={onResetHome}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 md:flex-initial"
            >
              <PennyLaneLogo size="sm" variant="dark" showWordmark={false} className="md:hidden" />
              <PennyLaneLogo size="md" variant="dark" showWordmark={false} className="hidden md:inline-flex" />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-brand text-[17.5px] leading-none select-none md:text-[19px]">
                    <span className="font-bold tracking-[-0.045em] text-white">curb</span>
                    <span className="bg-gradient-to-r from-sky-200 via-amber-200 to-rose-300 bg-clip-text font-semibold tracking-[-0.04em] text-transparent">
                      steals
                    </span>
                  </span>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/14 px-2 py-0.5 text-[10px] font-semibold text-sky-100 ring-1 ring-white/20 tabular-nums">
                    <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="sm:hidden">{formatNumber(activeCount)} · 50st</span>
                    <span className="hidden sm:inline">
                      {isSimulated ? 'Preview · ' : ''}
                      {formatNumber(activeCount)} · {statesCovered} states
                    </span>
                  </span>
                </div>
                <p className="mt-1 hidden truncate text-[11.5px] font-medium text-sky-100/80 leading-none xl:block">
                  Unique, high-value homes ranked by deal spread vs. Zestimate — updated daily, pruned once under contract.
                </p>
              </div>
            </button>

            {/* Mobile right: Native compact Filter button (Alerts/Saved/Log live cleanly in MobileTabBar) */}
            <button
              type="button"
              onClick={onOpenMobileSheet}
              aria-label="Open filters and sort"
              className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold backdrop-blur-md transition-colors md:hidden ${
                mobileFilterCount > 0
                  ? 'border-white bg-white text-blue-950 shadow-xs'
                  : 'border-white/25 bg-white/14 text-white active:bg-white/25'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>Filters</span>
              {mobileFilterCount > 0 && (
                <span className="rounded-full bg-blue-700 px-1.5 py-0.2 text-[10px] font-bold text-white tabular-nums">
                  {mobileFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2 on Mobile (Full-width native search pill) / Center on Desktop */}
          <div className="flex min-w-0 flex-1 justify-center">
            <LocationSearch
              value={locationQuery}
              listings={listings}
              variant="glass-blue"
              onChange={onLocationChange}
            />
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <button
              type="button"
              onClick={onOpenAlerts}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-bold text-blue-950 shadow-sm shadow-blue-950/20 transition-all hover:bg-sky-50"
            >
              <BellRing className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.25} />
              <span>Get Deal Alerts</span>
            </button>

            <button
              type="button"
              onClick={onOpenLedger}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/12 px-3 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
              title="Daily sync, contract removals & captured lead inbox"
            >
              <Activity className="h-3.5 w-3.5 text-rose-300" strokeWidth={2.2} />
              <span className="hidden lg:inline">
                {leadCount > 0 ? `Leads (${leadCount})` : 'Daily Log'}
              </span>
              <span className="rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                −{removedToday}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleSavedLens}
              aria-pressed={isSavedLens}
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium backdrop-blur-md transition-all ${
                isSavedLens
                  ? 'border-sky-300 bg-sky-400/30 text-white'
                  : 'border-white/20 bg-white/12 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark
                className="h-3.5 w-3.5"
                fill={isSavedLens ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
