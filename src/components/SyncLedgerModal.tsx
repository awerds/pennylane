import { useEffect, useId, useRef, useState } from 'react';
import { CalendarClock, GitBranch, ShieldCheck, X } from 'lucide-react';
import type { ChangelogFeed } from '../types';
import { formatCurrency, formatTimeUtc } from '../utils/format';
import {
  attachLightDismissFallback,
  closeDialogWithAnimation,
  supportsTopLayerExit,
} from '../utils/topLayer';

interface SyncLedgerModalProps {
  open: boolean;
  changelog: ChangelogFeed | null;
  provider: string;
  onClose: () => void;
}

export function SyncLedgerModal({
  open,
  changelog,
  provider,
  onClose,
}: SyncLedgerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [tab, setTab] = useState<'removed' | 'architecture'>('removed');

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
      className="editorial-modal editorial-modal--narrow"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--rule)] bg-[var(--paper-raised)] px-6 py-4">
        <div>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[var(--vermilion)]">
            Automated Lifecycle Log
          </span>
          <h2 id={titleId} className="font-serif-editorial text-2xl text-[var(--ink)]">
            Contract Removal Ledger &amp; Open-Source Pipeline
          </h2>
        </div>

        <button
          type="button"
          autoFocus
          onClick={handleCloseClick}
          aria-label="Close contract removal ledger"
          className="inline-flex cursor-pointer items-center justify-center border border-[var(--rule)] bg-[var(--paper)] p-1.5 text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-[var(--rule)] bg-[var(--paper)] px-6">
        <button
          type="button"
          onClick={() => setTab('removed')}
          className={`cursor-pointer border-b-2 px-3 py-3 font-mono-tech text-xs uppercase tracking-wider transition-colors ${
            tab === 'removed'
              ? 'border-[var(--ink)] text-[var(--ink)]'
              : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
          }`}
        >
          Removed Under Contract ({changelog?.removedArchive.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => setTab('architecture')}
          className={`cursor-pointer border-b-2 px-3 py-3 font-mono-tech text-xs uppercase tracking-wider transition-colors ${
            tab === 'architecture'
              ? 'border-[var(--ink)] text-[var(--ink)]'
              : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
          }`}
        >
          Free GitHub Pages Architecture
        </button>
      </div>

      <div className="p-6">
        {tab === 'removed' ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
              Every 24 hours, the GitHub Actions worker checks active listing status. Properties marked{' '}
              <strong className="font-medium text-[var(--ink)]">Pending</strong>,{' '}
              <strong className="font-medium text-[var(--ink)]">Contingent</strong>,{' '}
              <strong className="font-medium text-[var(--ink)]">Under Contract</strong>, or{' '}
              <strong className="font-medium text-[var(--ink)]">Sold</strong> are automatically purged from the live catalog and logged below.
            </p>

            <div className="divide-y divide-[var(--rule)] border border-[var(--rule)] bg-[var(--paper)]">
              {(changelog?.removedArchive ?? []).map((item) => (
                <div
                  key={`${item.id}-${item.removedAt}`}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[var(--vermilion-soft)] px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-wider text-[var(--vermilion)]">
                        {item.reason}
                      </span>
                      <span className="font-mono-tech text-[11px] text-[var(--ink-soft)]">
                        {item.city}, {item.state} · {item.architecturalStyle}
                      </span>
                    </div>
                    <div className="mt-1.5 font-serif-editorial text-xl text-[var(--ink)] line-through decoration-[var(--vermilion)]/55">
                      {item.title}
                    </div>
                  </div>

                  <div className="shrink-0 font-mono-tech text-xs sm:text-right">
                    <div className="text-[var(--ink)] line-through opacity-75">
                      {formatCurrency(item.finalPrice)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[var(--ink-soft)]">
                      Contracted in {item.daysOnMarket}d · {formatTimeUtc(item.removedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed text-[var(--ink-soft)]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="border border-[var(--rule)] bg-[var(--paper)] p-4">
                <CalendarClock className="h-4 w-4 text-[var(--vermilion)]" />
                <div className="mt-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--ink)]">
                  1. Daily Cron Action
                </div>
                <p className="mt-1 text-xs">
                  <code>.github/workflows/daily-sync.yml</code> runs at 13:00 UTC free on public repos, updating <code>public/data/listings.json</code>.
                </p>
              </div>
              <div className="border border-[var(--rule)] bg-[var(--paper)] p-4">
                <ShieldCheck className="h-4 w-4 text-[var(--sage)]" />
                <div className="mt-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--ink)]">
                  2. Pluggable Free APIs
                </div>
                <p className="mt-1 text-xs">
                  Zero-key open curated mode works out of the box, or drop in a free-tier <code>ZILLOW_API_KEY</code> (RapidAPI) or <code>RENTCAST_API_KEY</code> secret.
                </p>
              </div>
              <div className="border border-[var(--rule)] bg-[var(--paper)] p-4">
                <GitBranch className="h-4 w-4 text-[var(--ochre)]" />
                <div className="mt-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--ink)]">
                  3. PR Watchlist
                </div>
                <p className="mt-1 text-xs">
                  Open-source contributors submit wild finds via pull requests to <code>data/watchlist.json</code>; the scorer indexes them automatically.
                </p>
              </div>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--paper)] p-4 font-mono-tech text-xs">
              <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                Active Edition Telemetry
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[var(--ink)] sm:grid-cols-3">
                <div>Provider: {provider}</div>
                <div>Runs Logged: {changelog?.runs.length ?? 0}</div>
                <div>Total Pruned: {changelog?.totalRemovedUnderContract ?? 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

