import { useEffect, useId, useRef, useState } from 'react';
import { CalendarClock, FastForward, GitBranch, RotateCcw, ShieldCheck, X } from 'lucide-react';
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
  editionNumber: number;
  isSimulated: boolean;
  onSimulateNextDay: () => void;
  onResetSimulation: () => void;
  onClose: () => void;
}

export function SyncLedgerModal({
  open,
  changelog,
  provider,
  editionNumber,
  isSimulated,
  onSimulateNextDay,
  onResetSimulation,
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
      className="modern-modal modern-modal--narrow"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-100 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-rose-600">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
            Edition #{editionNumber} · Automated Daily Sync
          </div>
          <h2 id={titleId} className="mt-0.5 text-xl font-semibold tracking-[-0.02em] text-zinc-950">
            Contract Removal Log &amp; Open Pipeline
          </h2>
        </div>

        <button
          type="button"
          autoFocus
          onClick={handleCloseClick}
          aria-label="Close daily sync log"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-950 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Action Bar + Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/70 px-6 py-3">
        <div className="inline-flex rounded-full bg-zinc-200/70 p-0.5">
          <button
            type="button"
            onClick={() => setTab('removed')}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              tab === 'removed' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Under Contract ({changelog?.removedArchive.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setTab('architecture')}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              tab === 'architecture' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            How It Works
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSimulateNextDay}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-zinc-950 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <FastForward className="h-3.5 w-3.5 text-rose-400" />
            <span>Preview +1 Day Sync</span>
          </button>
          {isSimulated && (
            <button
              type="button"
              onClick={onResetSimulation}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {tab === 'removed' ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-zinc-500">
              Every 24 hours, the sync job checks listing status and automatically purges any home marked{' '}
              <strong className="font-medium text-zinc-900">Pending</strong>,{' '}
              <strong className="font-medium text-zinc-900">Contingent</strong>,{' '}
              <strong className="font-medium text-zinc-900">Under Contract</strong>, or{' '}
              <strong className="font-medium text-zinc-900">Sold</strong>.
            </p>

            <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80">
              {(changelog?.removedArchive ?? []).map((item) => (
                <div
                  key={`${item.id}-${item.removedAt}`}
                  className="flex flex-col gap-2 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold text-rose-600">
                        {item.reason}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {item.city}, {item.state} · {item.architecturalStyle}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-sm font-medium text-zinc-800 line-through decoration-rose-400/70">
                      {item.title}
                    </div>
                  </div>

                  <div className="shrink-0 text-xs tabular-nums sm:text-right">
                    <div className="font-semibold text-zinc-400 line-through">
                      {formatCurrency(item.finalPrice)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-400">
                      {item.daysOnMarket}d on market · {formatTimeUtc(item.removedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed text-zinc-500">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-zinc-50 p-4">
                <CalendarClock className="h-4 w-4 text-rose-500" />
                <div className="mt-2.5 text-xs font-semibold text-zinc-950">Daily Cron Sync</div>
                <p className="mt-1 text-xs leading-relaxed">
                  Runs daily via GitHub Actions on public repos, updating static JSON editions with zero backend costs.
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <div className="mt-2.5 text-xs font-semibold text-zinc-950">Pluggable Free APIs</div>
                <p className="mt-1 text-xs leading-relaxed">
                  Works free with zero keys, or add a free-tier <code className="text-zinc-800">ZILLOW_API_KEY</code> or <code className="text-zinc-800">RENTCAST_API_KEY</code> secret.
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <GitBranch className="h-4 w-4 text-amber-600" />
                <div className="mt-2.5 text-xs font-semibold text-zinc-950">Open PR Watchlist</div>
                <p className="mt-1 text-xs leading-relaxed">
                  Anyone can submit wild finds via pull requests to <code className="text-zinc-800">data/watchlist.json</code>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200/80 px-4 py-3 text-xs text-zinc-600 tabular-nums">
              <span>Provider: <strong className="font-semibold text-zinc-950">{provider}</strong></span>
              <span>Runs Logged: <strong className="font-semibold text-zinc-950">{changelog?.runs.length ?? 0}</strong></span>
              <span>Total Pruned: <strong className="font-semibold text-zinc-950">{changelog?.totalRemovedUnderContract ?? 0}</strong></span>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
