import { Activity, Bookmark, Github } from 'lucide-react';
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
  isSavedLens: boolean;
  isSimulated: boolean;
  onLocationChange: (query: string) => void;
  onToggleSavedLens: () => void;
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
  isSavedLens,
  isSimulated,
  onLocationChange,
  onToggleSavedLens,
  onOpenLedger,
  onResetHome,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      {/* Signature 2.5px architectural color spectrum bar */}
      <div
        className="h-[2.5px] w-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-500 to-indigo-600"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 sm:gap-5 sm:px-6 lg:px-8">
        {/* High-Design Brand Lockup + Purpose Tagline */}
        <button
          type="button"
          onClick={onResetHome}
          className="flex shrink-0 cursor-pointer items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        >
          <PennyLaneLogo size="md" showWordmark={false} />

          <div className="hidden sm:block">
            <div className="flex items-center gap-2.5">
              <span className="font-brand text-[19px] leading-none select-none">
                <span className="font-bold tracking-[-0.045em] text-slate-950">penny</span>
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 bg-clip-text font-semibold tracking-[-0.04em] text-transparent">
                  lane
                </span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20 tabular-nums">
                <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {isSimulated ? 'Preview · ' : ''}
                {formatNumber(activeCount)} homes · {statesCovered} states
              </span>
            </div>
            <p className="mt-1 hidden text-[11.5px] font-medium text-slate-500 leading-none xl:block">
              Unique, high-value homes ranked by deal spread vs. Zestimate — updated daily, removed once under contract.
            </p>
          </div>
        </button>

        {/* Center City / State / ZIP Search */}
        <div className="flex flex-1 justify-center">
          <LocationSearch
            value={locationQuery}
            listings={listings}
            onChange={onLocationChange}
          />
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenLedger}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/75 px-3 text-xs font-medium text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100/80"
            title="Daily sync & auto-removed under-contract ledger"
          >
            <Activity className="h-3.5 w-3.5 text-rose-500" strokeWidth={2.2} />
            <span className="hidden md:inline">Contracted</span>
            <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
              −{removedToday}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleSavedLens}
            aria-pressed={isSavedLens}
            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all ${
              isSavedLens
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'border-slate-200/90 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700'
            }`}
          >
            <Bookmark
              className="h-3.5 w-3.5"
              fill={isSavedLens ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  isSavedLens ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>

          <a
            href="https://github.com/awerds/pennylane"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View PennyLane open-source repository on GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:inline-flex"
          >
            <Github className="h-4 w-4" strokeWidth={1.85} />
          </a>
        </div>
      </div>

      {/* Compact mobile/tablet tagline strip */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-1.5 text-center text-[11px] font-medium text-slate-600 xl:hidden">
        Unique, high-value homes across all {statesCovered} states — ranked by asking price vs. Zestimate, pruned once under contract.
      </div>
    </header>
  );
}
