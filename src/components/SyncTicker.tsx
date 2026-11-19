import { FastForward, RotateCcw, ArrowUpRight } from 'lucide-react';
import type { ListingsSummary } from '../types';
import { formatTimeUtc } from '../utils/format';

interface SyncTickerProps {
  syncedAt: string;
  provider: string;
  summary: ListingsSummary;
  isSimulated: boolean;
  simulationNotice: string | null;
  onSimulateDay: () => void;
  onResetSimulation: () => void;
  onOpenLedger: () => void;
}

export function SyncTicker({
  syncedAt,
  provider,
  summary,
  isSimulated,
  simulationNotice,
  onSimulateDay,
  onResetSimulation,
  onOpenLedger,
}: SyncTickerProps) {
  return (
    <section
      aria-label="Daily sync status"
      className="border-b border-[var(--rule)] bg-[var(--paper-raised)]"
    >
      <div className="mx-auto flex max-w-[1380px] flex-col gap-3 px-5 py-3.5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <div className="flex items-center gap-2 font-mono-tech">
            <span className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">
              Last Sync
            </span>
            <span className="font-medium text-[var(--ink)]">{formatTimeUtc(syncedAt)}</span>
          </div>

          <span className="hidden h-3.5 w-px bg-[var(--rule)] sm:inline-block" aria-hidden="true" />

          <div className="flex flex-wrap items-center gap-3 font-mono-tech text-[11px]">
            <span className="inline-flex items-center gap-1 text-[var(--sage)]">
              +{summary.addedToday} Added
            </span>
            <button
              type="button"
              onClick={onOpenLedger}
              className="inline-flex cursor-pointer items-center gap-1 text-[var(--vermilion)] underline decoration-[var(--vermilion)]/40 underline-offset-4 hover:decoration-[var(--vermilion)]"
            >
              −{summary.removedToday} Under Contract
              <ArrowUpRight className="h-3 w-3" />
            </button>
            <span className="text-[var(--ink-soft)]">
              Avg vs Zip Median:{' '}
              <strong className="font-medium text-[var(--ink)]">
                {summary.avgMedianDeltaPct > 0 ? '+' : ''}
                {summary.avgMedianDeltaPct}%
              </strong>
            </span>
            <span className="hidden text-[var(--ink-soft)] xl:inline">
              Source: <strong className="font-medium text-[var(--ink)]">{provider}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSimulateDay}
            className="inline-flex cursor-pointer items-center gap-1.5 border border-[var(--rule)] bg-[var(--paper)] px-3 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider text-[var(--ink)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--paper-inset)]"
            title="Watch how the automated daily GitHub Action adds fresh drops and prunes under-contract listings"
          >
            <FastForward className="h-3.5 w-3.5 text-[var(--vermilion)]" />
            <span>Preview Next Day&apos;s Sync</span>
          </button>

          {isSimulated && (
            <button
              type="button"
              onClick={onResetSimulation}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-[var(--rule)] px-2.5 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider text-[var(--ink-soft)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Live</span>
            </button>
          )}
        </div>
      </div>

      {simulationNotice && (
        <div
          role="status"
          aria-live="polite"
          className="border-t border-[var(--rule)] bg-[var(--vermilion-soft)]/70 px-5 py-2 text-xs font-mono-tech text-[var(--ink)] sm:px-8"
        >
          <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4">
            <span>{simulationNotice}</span>
            <button
              type="button"
              onClick={onOpenLedger}
              className="shrink-0 cursor-pointer underline underline-offset-4 hover:text-[var(--vermilion)]"
            >
              Inspect Ledger
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

