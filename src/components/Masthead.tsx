import { Bookmark, FileClock, Github } from 'lucide-react';
import { formatDateShort } from '../utils/format';

interface MastheadProps {
  editionNumber: number;
  syncedAt: string;
  activeCount: number;
  savedCount: number;
  removedTotal: number;
  isSimulated: boolean;
  onOpenLedger: () => void;
  onSelectSaved: () => void;
}

export function Masthead({
  editionNumber,
  syncedAt,
  activeCount,
  savedCount,
  removedTotal,
  isSimulated,
  onOpenLedger,
  onSelectSaved,
}: MastheadProps) {
  return (
    <header className="border-b border-[var(--rule)] bg-[var(--paper)]">
      {/* Top editorial colophon rail */}
      <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] px-5 py-2.5 text-[11px] font-mono-tech uppercase tracking-[0.12em] text-[var(--ink-soft)] sm:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
            <span
              className="sync-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--vermilion)]"
              aria-hidden="true"
            />
            {isSimulated ? 'Sandbox Preview' : 'Automated Daily Index'}
          </span>
          <span className="hidden text-[var(--rule)] sm:inline">/</span>
          <span className="hidden sm:inline">Edition No. {String(editionNumber).padStart(3, '0')}</span>
          <span className="text-[var(--rule)]">/</span>
          <span>{formatDateShort(syncedAt)}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline">{activeCount} Active Finds</span>
          <span className="hidden text-[var(--rule)] md:inline">·</span>
          <span className="hidden md:inline">{removedTotal} Pruned Under Contract</span>
          <a
            href="https://github.com/awerds/pennylane"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--ink)] transition-colors hover:text-[var(--vermilion)]"
            title="Open-source repository"
          >
            <Github className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Open Source</span>
          </a>
        </div>
      </div>

      {/* Main broadsheet masthead */}
      <div className="mx-auto flex max-w-[1380px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-9">
        <div>
          <h1 className="font-serif-editorial text-5xl leading-[0.94] tracking-[-0.02em] text-[var(--ink)] sm:text-6xl md:text-7xl">
            PennyLane
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)] sm:text-[15px]">
            Daily dispatches of architectural outliers, below-median deals, and fresh-to-market Zillow finds — automatically cleared the day they go under contract.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSelectSaved}
            className="inline-flex cursor-pointer items-center gap-2 border border-[var(--rule)] bg-[var(--paper-raised)] px-3.5 py-2 text-xs font-medium tracking-wide text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
          >
            <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Saved</span>
            <span className="font-mono-tech text-[11px] text-[var(--ink-soft)]">{savedCount}</span>
          </button>

          <button
            type="button"
            onClick={onOpenLedger}
            className="inline-flex cursor-pointer items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-xs font-medium tracking-wide text-[var(--paper)] transition-colors hover:bg-[#2a2926]"
          >
            <FileClock className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Contract Removal Ledger</span>
          </button>
        </div>
      </div>
    </header>
  );
}

