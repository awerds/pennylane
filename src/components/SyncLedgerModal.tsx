import { useEffect, useId, useRef, useState } from 'react';
import {
  CalendarClock,
  DollarSign,
  Download,
  FastForward,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { ChangelogFeed } from '../types';
import { formatCurrency, formatTimeUtc } from '../utils/format';
import { exportLeadsCsv, getLeadWebhookUrl, type LeadRecord } from '../utils/leads';
import {
  attachLightDismissFallback,
  closeDialogWithAnimation,
  supportsTopLayerExit,
} from '../utils/topLayer';

interface SyncLedgerModalProps {
  open: boolean;
  changelog: ChangelogFeed | null;
  leads: LeadRecord[];
  provider: string;
  editionNumber: number;
  isSimulated: boolean;
  onSimulateNextDay: () => void;
  onResetSimulation: () => void;
  onOpenLeadCapture: () => void;
  onClose: () => void;
}

export function SyncLedgerModal({
  open,
  changelog,
  leads,
  provider,
  editionNumber,
  isSimulated,
  onSimulateNextDay,
  onResetSimulation,
  onOpenLeadCapture,
  onClose,
}: SyncLedgerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [tab, setTab] = useState<'removed' | 'leads' | 'architecture'>('removed');

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

  const totalEstPipeline = leads.reduce((acc, l) => acc + l.estimatedRevenueValue, 0);
  const webhookLive = Boolean(getLeadWebhookUrl());

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby={titleId}
      className="modern-modal modern-modal--narrow"
    >
      <div
        className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600"
        aria-hidden="true"
      />

      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-600">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Edition #{editionNumber} · Automated Daily Operations
          </div>
          <h2 id={titleId} className="mt-0.5 text-xl font-bold tracking-[-0.02em] text-slate-950">
            Contract Removals, Lead Inbox &amp; Pipeline
          </h2>
        </div>

        <button
          type="button"
          autoFocus
          onClick={handleCloseClick}
          aria-label="Close daily operations modal"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mode Switcher + Sync Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-3">
        <div className="inline-flex rounded-full bg-slate-200/70 p-0.5">
          <button
            type="button"
            onClick={() => setTab('removed')}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === 'removed' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Contracted ({changelog?.removedArchive.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setTab('leads')}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === 'leads' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Lead Inbox ({leads.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('architecture')}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === 'architecture' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Monetization &amp; Setup
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSimulateNextDay}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-700 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <FastForward className="h-3.5 w-3.5" />
            <span>Preview +1 Day</span>
          </button>
          {isSimulated && (
            <button
              type="button"
              onClick={onResetSimulation}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {tab === 'removed' && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-500">
              Every 24 hours, the sync job checks listing status and automatically purges any home marked{' '}
              <strong className="font-semibold text-slate-900">Pending</strong>,{' '}
              <strong className="font-semibold text-slate-900">Contingent</strong>,{' '}
              <strong className="font-semibold text-slate-900">Under Contract</strong>, or{' '}
              <strong className="font-semibold text-slate-900">Sold</strong>.
            </p>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80">
              {(changelog?.removedArchive ?? []).map((item) => (
                <div
                  key={`${item.id}-${item.removedAt}`}
                  className="flex flex-col gap-2 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold text-rose-600 ring-1 ring-rose-200/70">
                        {item.reason}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.city}, {item.state} · {item.architecturalStyle}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-sm font-medium text-slate-800 line-through decoration-rose-400/70">
                      {item.title}
                    </div>
                  </div>

                  <div className="shrink-0 text-xs tabular-nums sm:text-right">
                    <div className="font-semibold text-slate-400 line-through">
                      {formatCurrency(item.finalPrice)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {item.daysOnMarket}d on market · {formatTimeUtc(item.removedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'leads' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50/80 p-4 ring-1 ring-emerald-200/80">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <DollarSign className="h-4.5 w-4.5" />
                </span>
                <div>
                  <div className="text-xs font-semibold text-emerald-800">
                    Captured Lead Pipeline ({leads.length} {leads.length === 1 ? 'lead' : 'leads'})
                  </div>
                  <div className="text-lg font-bold text-slate-950 tabular-nums">
                    Est. {formatCurrency(totalEstPipeline)} referral &amp; sponsor value
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {leads.length > 0 && (
                  <button
                    type="button"
                    onClick={() => exportLeadsCsv(leads)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleCloseClick();
                    onOpenLeadCapture();
                  }}
                  className="cursor-pointer rounded-full border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  Test Lead Form
                </button>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No leads captured yet in this browser. Click{' '}
                <strong className="text-slate-800">Get Deal Alerts</strong> or open any home and click{' '}
                <strong className="text-slate-800">Request Private Tour &amp; Local Agent</strong> to test lead capture &amp; CSV export.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col gap-2 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10.5px] font-semibold text-blue-700 ring-1 ring-blue-200/70">
                          {lead.kind === 'property-tour'
                            ? 'Buyer / Tour Lead'
                            : lead.kind === 'agent-partner'
                            ? 'Agent Sponsor'
                            : 'Deal Alert Sub'}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">{lead.name}</span>
                        <span className="text-xs text-slate-500">{lead.email}</span>
                      </div>
                      <div className="mt-1 truncate text-xs text-slate-600">
                        {lead.propertyTitle
                          ? `${lead.propertyTitle} (${lead.propertyLocation})`
                          : `${lead.targetMarket || 'Nationwide'} · ${lead.buyerType || lead.brokerageOrCompany || ''}`}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs tabular-nums sm:text-right">
                      <div className="font-bold text-emerald-700">
                        ~${lead.estimatedRevenueValue} est.
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {lead.financingStatus || lead.deliveryStatus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500">
              Webhook status:{' '}
              <strong className="text-slate-800">
                {webhookLive ? 'Live webhook connected' : 'Local Demo Mode (set VITE_LEAD_WEBHOOK_URL for Formspree / Zapier / HubSpot)'}
              </strong>
            </p>
          </div>
        )}

        {tab === 'architecture' && (
          <div className="space-y-4 text-sm leading-relaxed text-slate-500">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50/70 p-4 ring-1 ring-blue-100">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div className="mt-2.5 text-xs font-semibold text-slate-950">1. Buyer &amp; Lender Referrals</div>
                <p className="mt-1 text-xs leading-relaxed">
                  Every property dossier captures tour + pre-approval intent—monetize via 25%–35% agent referral agreements &amp; mortgage leads.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <div className="mt-2.5 text-xs font-semibold text-slate-950">2. Zero-Backend Webhook</div>
                <p className="mt-1 text-xs leading-relaxed">
                  Add <code className="text-slate-800">VITE_LEAD_WEBHOOK_URL</code> (Formspree, Web3Forms, Zapier, HubSpot) to route leads live from GitHub Pages.
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-100">
                <GitBranch className="h-4 w-4 text-amber-600" />
                <div className="mt-2.5 text-xs font-semibold text-slate-950">3. State/ZIP Sponsorships</div>
                <p className="mt-1 text-xs leading-relaxed">
                  Sell monthly territory placements to local agents &amp; brokers in all 50 states using the built-in Partner application funnel.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 px-4 py-3 text-xs text-slate-600 tabular-nums">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-blue-600" />
                Provider: <strong className="font-semibold text-slate-950">{provider}</strong>
              </span>
              <span>Runs Logged: <strong className="font-semibold text-slate-950">{changelog?.runs.length ?? 0}</strong></span>
              <span>Total Pruned: <strong className="font-semibold text-rose-600">{changelog?.totalRemovedUnderContract ?? 0}</strong></span>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
