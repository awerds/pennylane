import { Activity, Bookmark, Github } from 'lucide-react';
import type { PropertyListing } from '../types';
import { LocationSearch } from './LocationSearch';

interface TopNavProps {
  locationQuery: string;
  listings: PropertyListing[];
  activeCount: number;
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
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          type="button"
          onClick={onResetHome}
          className="flex shrink-0 cursor-pointer items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-xs">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M4 19V10.5L12 4.5L20 10.5V19"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="14.5" r="2.2" fill="#F43F5E" />
            </svg>
          </span>
          <div className="hidden sm:block">
            <span className="block text-[16px] font-semibold tracking-[-0.03em] text-zinc-950 leading-none">
              pennylane
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 leading-none tabular-nums">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {isSimulated ? 'Preview · ' : ''}
              {activeCount} live
            </span>
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
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
            title="Daily sync & auto-removed under-contract ledger"
          >
            <Activity className="h-3.5 w-3.5 text-rose-500" strokeWidth={2} />
            <span className="hidden md:inline">Daily Feed</span>
            <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 tabular-nums">
              −{removedToday}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleSavedLens}
            aria-pressed={isSavedLens}
            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
              isSavedLens
                ? 'border-zinc-950 bg-zinc-950 text-white'
                : 'border-zinc-200/90 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950'
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
                  isSavedLens ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-700'
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
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 sm:inline-flex"
          >
            <Github className="h-4 w-4" strokeWidth={1.85} />
          </a>
        </div>
      </div>
    </header>
  );
}
