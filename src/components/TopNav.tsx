import { Activity, BellRing, Bookmark } from 'lucide-react';
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
  isSavedLens: boolean;
  isSimulated: boolean;
  onLocationChange: (query: string) => void;
  onToggleSavedLens: () => void;
  onOpenAlerts: () => void;
  onOpenLedger: () => void;
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
  isSavedLens,
  isSimulated,
  onLocationChange,
  onToggleSavedLens,
  onOpenAlerts,
  onOpenLedger,
  onResetHome,
}: TopNavProps) {
  return (
    <header className="pl-safe-top sticky top-0 z-30 border-b border-sky-200/20 bg-gradient-to-r from-[#0b2b59]/84 via-[#15458a]/82 to-[#1e40af]/80 text-white shadow-[0_10px_34px_-12px_rgba(11,43,89,0.45)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto max-w-[1600px] px-3.5 py-2.5 sm:px-6 lg:px-8">
        {/* Responsive Layout: Stacked cleanly on mobile (< md), single sleek row on desktop (md+) */}
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-5">
          {/* Row 1 on Mobile: Brand + Live Pill + Mobile Alerts Trigger */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onResetHome}
              className="flex min-w-0 cursor-pointer items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
            >
              <PennyLaneLogo size="md" variant="dark" showWordmark={false} />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-brand text-[18px] leading-none select-none sm:text-[19px]">
                    <span className="font-bold tracking-[-0.045em] text-white">curb</span>
                    <span className="bg-gradient-to-r from-sky-200 via-amber-200 to-rose-300 bg-clip-text font-semibold tracking-[-0.04em] text-transparent">
                      steals
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-white/14 px-2 py-0.5 text-[10px] font-semibold text-sky-100 ring-1 ring-white/20 tabular-nums">
                    <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {isSimulated ? 'Preview · ' : ''}
                    {formatNumber(activeCount)} · {statesCovered} states
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] font-medium text-sky-100/80 leading-none sm:text-[11.5px]">
                  Unique, high-value homes ranked vs. Zestimate · daily updates
                </p>
              </div>
            </button>

            {/* Compact mobile right CTA (rest lives cleanly in MobileTabBar) */}
            <button
              type="button"
              onClick={onOpenAlerts}
              className="inline-flex min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 text-xs font-bold text-blue-950 shadow-sm md:hidden"
            >
              <BellRing className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.25} />
              <span>Alerts</span>
            </button>
          </div>

          {/* Row 2 on Mobile (Full Width 44px Thumb Search) / Center on Desktop */}
          <div className="flex flex-1 justify-center">
            <LocationSearch
              value={locationQuery}
              listings={listings}
              variant="glass-blue"
              onChange={onLocationChange}
            />
          </div>

          {/* Desktop Right Actions (Mobile uses native MobileTabBar at bottom) */}
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
