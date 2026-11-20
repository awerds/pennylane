import { useEffect, useId, useRef, useState } from 'react';
import { BellRing, Building2, CheckCircle2, Home, ShieldCheck, X } from 'lucide-react';
import type { PropertyListing } from '../types';
import { formatCurrency } from '../utils/format';
import {
  attachAccessibleValidation,
  buildPropertyLeadContext,
  getLeadWebhookUrl,
  submitLead,
  type LeadKind,
  type LeadRecord,
} from '../utils/leads';
import {
  attachLightDismissFallback,
  closeDialogWithAnimation,
  supportsTopLayerExit,
} from '../utils/topLayer';

interface LeadCaptureModalProps {
  open: boolean;
  initialTab: LeadKind;
  property: PropertyListing | null;
  defaultMarket?: string;
  onLeadCaptured: (lead: LeadRecord) => void;
  onClose: () => void;
}

export function LeadCaptureModal({
  open,
  initialTab,
  property,
  defaultMarket = '',
  onLeadCaptured,
  onClose,
}: LeadCaptureModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const uid = useId().replace(/:/g, '');

  const [tab, setTab] = useState<LeadKind>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetMarket, setTargetMarket] = useState(defaultMarket);
  const [maxBudget, setMaxBudget] = useState('$500k – $1M');
  const [buyerType, setBuyerType] = useState('Primary Residence');
  const [financingStatus, setFinancingStatus] = useState('Need Lender / Pre-Approval');
  const [timeline, setTimeline] = useState('Ready Now (0–30 days)');
  const [brokerage, setBrokerage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<LeadRecord | null>(null);

  useEffect(() => {
    if (open) {
      setTab(property ? 'property-tour' : initialTab);
      setTargetMarket(
        property ? `${property.city}, ${property.state} ${property.zip}` : defaultMarket
      );
      setSubmittedLead(null);
    }
  }, [open, initialTab, property, defaultMarket]);

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

  useEffect(() => {
    const form = formRef.current;
    if (!form || !open || submittedLead) return;
    return attachAccessibleValidation(form);
  }, [open, tab, submittedLead]);

  const handleCloseClick = () => {
    if (dialogRef.current) {
      void closeDialogWithAnimation(dialogRef.current);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return;

    setSubmitting(true);
    try {
      const propContext = property && tab === 'property-tour' ? buildPropertyLeadContext(property) : {};
      const record = await submitLead({
        kind: tab,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        targetMarket: targetMarket.trim() || undefined,
        maxBudget: tab !== 'agent-partner' ? maxBudget : undefined,
        buyerType: tab !== 'agent-partner' ? buyerType : undefined,
        financingStatus: tab !== 'agent-partner' ? financingStatus : undefined,
        timeline: tab === 'property-tour' ? timeline : undefined,
        brokerageOrCompany: tab === 'agent-partner' ? brokerage.trim() || undefined : undefined,
        ...propContext,
      });
      setSubmittedLead(record);
      onLeadCaptured(record);
    } finally {
      setSubmitting(false);
    }
  };

  const webhookConfigured = Boolean(getLeadWebhookUrl());

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

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
            {tab === 'property-tour'
              ? 'Buyer Agent & Financing Concierge'
              : tab === 'agent-partner'
              ? 'Agent & Lender Territory Sponsorship'
              : 'Daily 5/5 Steal Alerts'}
          </span>
          <h2 id={titleId} className="mt-0.5 text-xl font-bold tracking-[-0.02em] text-slate-950">
            {tab === 'property-tour'
              ? 'Tour This Property or Request Local Comps'
              : tab === 'agent-partner'
              ? 'Partner With CurbSteals for Exclusive Leads'
              : 'Get High-Value Finds Before They Go Under Contract'}
          </h2>
        </div>

        <button
          type="button"
          autoFocus
          onClick={handleCloseClick}
          aria-label="Close lead form"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      {!submittedLead && (
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 bg-slate-50/75 px-6 py-3">
          {[
            { key: 'deal-alerts' as LeadKind, label: 'Daily Deal Alerts', Icon: BellRing },
            { key: 'property-tour' as LeadKind, label: 'Tour / Buyer Agent', Icon: Home },
            { key: 'agent-partner' as LeadKind, label: 'For Agents & Lenders', Icon: Building2 },
          ].map(({ key, label, Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-950'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="p-6">
        {submittedLead ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">
              {submittedLead.kind === 'property-tour'
                ? 'Inquiry Received — Matching You With a Local Specialist'
                : submittedLead.kind === 'agent-partner'
                ? 'Partner Application Logged'
                : 'You’re on the Daily Steal Dispatch'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              We recorded your request for <strong className="text-slate-900">{submittedLead.email}</strong>
              {submittedLead.propertyLocation ? ` regarding ${submittedLead.propertyLocation}` : ''}.
            </p>

            <div className="mx-auto mt-5 max-w-md rounded-2xl bg-slate-50 p-4 text-left text-xs text-slate-600 ring-1 ring-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Lead Capture Telemetry</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 tabular-nums">
                  Est. Value: ${submittedLead.estimatedRevenueValue}
                </span>
              </div>
              <p className="mt-1.5 leading-relaxed">
                {webhookConfigured
                  ? 'Delivered live to your configured CRM webhook and mirrored to your local Lead Inbox.'
                  : 'Saved to your browser Lead Inbox (Demo Mode). Open "Contracted / Daily Feed → Lead Inbox" anytime to view leads & export CSV, or set VITE_LEAD_WEBHOOK_URL to route to Formspree / Zapier / HubSpot.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseClick}
              className="mt-6 cursor-pointer rounded-full bg-blue-700 px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Back to Homes
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Property Context Card when inquiring on a specific home */}
            {tab === 'property-tour' && property && (
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-blue-50/75 p-4 ring-1 ring-blue-200/70">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-blue-700">
                    Selected Property · {property.city}, {property.state} {property.zip}
                  </div>
                  <div className="truncate text-sm font-bold text-slate-950">{property.title}</div>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <div className="text-sm font-bold text-slate-950">
                    {formatCurrency(property.price)}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700">
                    {property.zestimateDeltaPct}% vs Zest.
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="pl-field">
                <label
                  htmlFor={`${uid}-name`}
                  className="block text-xs font-semibold text-slate-800"
                >
                  Full Name
                </label>
                <span id={`${uid}-name-hint`} className="mt-0.5 block text-[11px] text-slate-400">
                  First and last name
                </span>
                <input
                  id={`${uid}-name`}
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  aria-describedby={`${uid}-name-hint`}
                  data-error={`${uid}-name-err`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="pl-input mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-950 focus:border-blue-600 focus:outline-none sm:min-h-0 sm:text-sm"
                />
                <div id={`${uid}-name-err`} className="pl-error-msg mt-1 text-xs text-rose-600">
                  <span role="img" aria-label="Error">
                    !
                  </span>{' '}
                  Please enter your name (at least 2 characters).
                </div>
              </div>

              <div className="pl-field">
                <label
                  htmlFor={`${uid}-email`}
                  className="block text-xs font-semibold text-slate-800"
                >
                  Email Address
                </label>
                <span id={`${uid}-email-hint`} className="mt-0.5 block text-[11px] text-slate-400">
                  Format: you@example.com
                </span>
                <input
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-describedby={`${uid}-email-hint`}
                  data-error={`${uid}-email-err`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="pl-input mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-950 focus:border-blue-600 focus:outline-none sm:min-h-0 sm:text-sm"
                />
                <div id={`${uid}-email-err`} className="pl-error-msg mt-1 text-xs text-rose-600">
                  <span role="img" aria-label="Error">
                    !
                  </span>{' '}
                  Enter an email address in the format you@example.com.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="pl-field">
                <label
                  htmlFor={`${uid}-phone`}
                  className="block text-xs font-semibold text-slate-800"
                >
                  Phone {tab === 'deal-alerts' ? '(Optional)' : '(Recommended)'}
                </label>
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  For fast tour or SMS steal alerts
                </span>
                <input
                  id={`${uid}-phone`}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 234-5678"
                  className="pl-input mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-950 focus:border-blue-600 focus:outline-none sm:min-h-0 sm:text-sm"
                />
              </div>

              <div className="pl-field">
                <label
                  htmlFor={`${uid}-market`}
                  className="block text-xs font-semibold text-slate-800"
                >
                  {tab === 'agent-partner' ? 'Target State / ZIP Territory' : 'Target City, State, or ZIP'}
                </label>
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  e.g. Hudson, NY or California
                </span>
                <input
                  id={`${uid}-market`}
                  name="targetMarket"
                  type="text"
                  required
                  data-error={`${uid}-market-err`}
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  placeholder="Austin, TX or All 50 States"
                  className="pl-input mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-950 focus:border-blue-600 focus:outline-none sm:min-h-0 sm:text-sm"
                />
                <div id={`${uid}-market-err`} className="pl-error-msg mt-1 text-xs text-rose-600">
                  <span role="img" aria-label="Error">
                    !
                  </span>{' '}
                  Enter at least one city, state, or ZIP code.
                </div>
              </div>
            </div>

            {tab === 'agent-partner' ? (
              <div className="pl-field">
                <label
                  htmlFor={`${uid}-brokerage`}
                  className="block text-xs font-semibold text-slate-800"
                >
                  Brokerage / Lending Company &amp; Role
                </label>
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  Buyer agent referral network (25%–30%) or exclusive ZIP sponsorship
                </span>
                <input
                  id={`${uid}-brokerage`}
                  type="text"
                  required
                  data-error={`${uid}-brok-err`}
                  value={brokerage}
                  onChange={(e) => setBrokerage(e.target.value)}
                  placeholder="Compass / Sotheby's / Local Mortgage Broker"
                  className="pl-input mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-950 focus:border-blue-600 focus:outline-none sm:min-h-0 sm:text-sm"
                />
                <div id={`${uid}-brok-err`} className="pl-error-msg mt-1 text-xs text-rose-600">
                  <span role="img" aria-label="Error">
                    !
                  </span>{' '}
                  Please share your brokerage or company name.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-800">Buyer Goal</span>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value)}
                    className="mt-1.5 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  >
                    <option>Primary Residence</option>
                    <option>Cash Investor / Flip</option>
                    <option>Second Home / STR</option>
                    <option>Architectural Collector</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-800">Financing Status</span>
                  <select
                    value={financingStatus}
                    onChange={(e) => setFinancingStatus(e.target.value)}
                    className="mt-1.5 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  >
                    <option>Need Lender / Pre-Approval</option>
                    <option>Pre-Approved Buyer</option>
                    <option>All-Cash Buyer</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-800">
                    {tab === 'property-tour' ? 'Timeline' : 'Target Budget'}
                  </span>
                  {tab === 'property-tour' ? (
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="mt-1.5 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    >
                      <option>Ready Now (0–30 days)</option>
                      <option>1–3 Months</option>
                      <option>3–6 Months</option>
                      <option>Just Researching</option>
                    </select>
                  ) : (
                    <select
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="mt-1.5 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    >
                      <option>Under $350k</option>
                      <option>$350k – $500k</option>
                      <option>$500k – $1M</option>
                      <option>$1M – $2M</option>
                      <option>$2M+</option>
                    </select>
                  )}
                </label>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Free service · Unsubscribe anytime · Direct local agent &amp; lender match</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 cursor-pointer rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-700/25 transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting
                  ? 'Sending...'
                  : tab === 'property-tour'
                  ? 'Request Tour & Comps'
                  : tab === 'agent-partner'
                  ? 'Claim Territory'
                  : 'Activate Free Alerts'}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}

