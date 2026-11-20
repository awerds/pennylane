import { Activity, BellRing, Bookmark, Compass, Flame } from 'lucide-react';
import type { FilterLens } from '../types';

interface MobileTabBarProps {
  activeLens: FilterLens;
  savedCount: number;
  removedToday: number;
  onSelectLens: (lens: FilterLens) => void;
  onOpenAlerts: () => void;
  onOpenLedger: () => void;
}

/**
 * Native app-style frosted glass bottom navigation bar for mobile (< md).
 * Respects iOS/Android safe-area-inset-bottom and >= 44px touch targets.
 */
export function MobileTabBar({
  activeLens,
  savedCount,
  removedToday,
  onSelectLens,
  onOpenAlerts,
  onOpenLedger,
}: MobileTabBarProps) {
  const isExplore = activeLens === 'all' || activeLens === 'deal' || activeLens === 'exceptional' || activeLens === 'new';

  return (
    <nav
      aria-label="Mobile navigation"
      className="pl-safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/90 px-2 pt-1.5 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.16)] backdrop-blur-2xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        <button
          type="button"
          onClick={() => {
            onSelectLens('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex min-h-[48px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] font-semibold transition-colors ${
            isExplore ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <Compass className="h-5 w-5" strokeWidth={isExplore ? 2.25 : 1.8} />
          <span>Explore</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectLens(activeLens === 'steals' ? 'all' : 'steals');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex min-h-[48px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] font-semibold transition-colors ${
            activeLens === 'steals' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <Flame className="h-5 w-5" strokeWidth={activeLens === 'steals' ? 2.25 : 1.8} />
          <span>5/5 Steals</span>
        </button>

        <button
          type="button"
          onClick={onOpenAlerts}
          className="flex min-h-[48px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] font-bold text-emerald-700"
        >
          <span className="flex h-7 w-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25">
            <BellRing className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span>Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectLens(activeLens === 'saved' ? 'all' : 'saved');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex min-h-[48px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] font-semibold transition-colors ${
            activeLens === 'saved' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <span className="relative">
            <Bookmark
              className="h-5 w-5"
              fill={activeLens === 'saved' ? 'currentColor' : 'none'}
              strokeWidth={activeLens === 'saved' ? 2.25 : 1.8}
            />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white tabular-nums">
                {savedCount}
              </span>
            )}
          </span>
          <span>Saved</span>
        </button>

        <button
          type="button"
          onClick={onOpenLedger}
          className="relative flex min-h-[48px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] font-semibold text-slate-500"
        >
          <span className="relative">
            <Activity className="h-5 w-5" strokeWidth={1.8} />
            {removedToday > 0 && (
              <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white tabular-nums">
                −{removedToday}
              </span>
            )}
          </span>
          <span>Feed</span>
        </button>
      </div>
    </nav>
  );
}

