import type { PropertyListing } from '../types';

export type LeadKind = 'property-tour' | 'deal-alerts' | 'agent-partner';

export interface LeadRecord {
  id: string;
  kind: LeadKind;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  targetMarket?: string;
  maxBudget?: string;
  buyerType?: string;
  financingStatus?: string;
  timeline?: string;
  brokerageOrCompany?: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyPrice?: number;
  propertyZestimate?: number;
  estimatedRevenueValue: number;
  deliveryStatus: 'webhook-sent' | 'saved-locally';
}

const LEADS_STORAGE_KEY = 'pennylane:leads:v1';

/**
 * Set VITE_LEAD_WEBHOOK_URL in .env or GitHub Actions repo variables
 * (supports Formspree, Web3Forms, Zapier, Make, HubSpot, Airtable, or custom webhooks).
 */
export function getLeadWebhookUrl(): string {
  return (import.meta.env.VITE_LEAD_WEBHOOK_URL as string | undefined)?.trim() || '';
}

export function loadLeads(): LeadRecord[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function estimateLeadValue(input: {
  kind: LeadKind;
  propertyPrice?: number;
  financingStatus?: string;
}): number {
  if (input.kind === 'agent-partner') return 499; // Monthly state/ZIP sponsor lead
  if (input.kind === 'property-tour') {
    const price = input.propertyPrice || 550000;
    // Standard 25% buyer-agent referral fee on ~2.5% commission, risk-weighted at ~8% close rate + lender upside
    const referralBase = Math.round(price * 0.025 * 0.25 * 0.08);
    const lenderBonus = input.financingStatus === 'Need Lender / Pre-Approval' ? 85 : 0;
    return Math.max(95, referralBase + lenderBonus);
  }
  return input.financingStatus === 'Need Lender / Pre-Approval' ? 65 : 25;
}

export async function submitLead(
  payload: Omit<LeadRecord, 'id' | 'createdAt' | 'estimatedRevenueValue' | 'deliveryStatus'>
): Promise<LeadRecord> {
  const webhookUrl = getLeadWebhookUrl();
  let deliveryStatus: 'webhook-sent' | 'saved-locally' = 'saved-locally';

  const record: LeadRecord = {
    ...payload,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    estimatedRevenueValue: estimateLeadValue({
      kind: payload.kind,
      propertyPrice: payload.propertyPrice,
      financingStatus: payload.financingStatus,
    }),
    deliveryStatus,
  };

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(record),
      });
      if (res.ok) {
        record.deliveryStatus = 'webhook-sent';
      }
    } catch {
      // Keep local capture fallback so zero leads are ever lost
    }
  }

  try {
    const existing = loadLeads();
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([record, ...existing].slice(0, 200)));
  } catch {
    // Ignore storage quota errors
  }

  return record;
}

export function exportLeadsCsv(leads: LeadRecord[]): void {
  const headers = [
    'ID',
    'Date',
    'Lead Type',
    'Name',
    'Email',
    'Phone',
    'Target Market',
    'Max Budget',
    'Buyer Type',
    'Financing',
    'Timeline',
    'Company/Brokerage',
    'Property',
    'Location',
    'Asking Price',
    'Zestimate',
    'Est. Lead Value ($)',
    'Delivery',
  ];

  const escape = (val: unknown) => {
    const str = String(val ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const rows = leads.map((l) => [
    l.id,
    l.createdAt,
    l.kind,
    l.name,
    l.email,
    l.phone || '',
    l.targetMarket || '',
    l.maxBudget || '',
    l.buyerType || '',
    l.financingStatus || '',
    l.timeline || '',
    l.brokerageOrCompany || '',
    l.propertyTitle || '',
    l.propertyLocation || '',
    l.propertyPrice ?? '',
    l.propertyZestimate ?? '',
    l.estimatedRevenueValue,
    l.deliveryStatus,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pennylane-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildPropertyLeadContext(listing: PropertyListing) {
  return {
    propertyId: listing.id,
    propertyTitle: listing.title,
    propertyLocation: `${listing.city}, ${listing.state} ${listing.zip}`,
    propertyPrice: listing.price,
    propertyZestimate: listing.zestimate,
  };
}

/**
 * Syncs `aria-invalid` and dynamic `aria-describedby` with CSS `:user-invalid`
 * per modern-web-guidance `validate-input-after-interaction`.
 */
export function attachAccessibleValidation(form: HTMLFormElement): () => void {
  const flagged = new WeakSet<Element>();

  const linkError = (el: HTMLElement, shown: boolean) => {
    const errorId = el.dataset.error;
    if (!errorId) return;
    const ids = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  const syncAria = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches('input, select, textarea')) return;

    const supportsUserInvalid = typeof CSS !== 'undefined' && CSS.supports('selector(:user-invalid)');
    const invalid = supportsUserInvalid
      ? target.matches(':user-invalid')
      : !(target as HTMLInputElement).validity.valid;

    if (!supportsUserInvalid) {
      target.classList.toggle('user-invalid-fallback', invalid);
    }

    if (invalid) {
      target.setAttribute('aria-invalid', 'true');
      linkError(target, true);
      flagged.add(target);
    } else if (flagged.has(target) || target.getAttribute('aria-invalid') !== 'true') {
      target.setAttribute('aria-invalid', 'false');
      linkError(target, false);
      flagged.delete(target);
    }
  };

  // Initialize every field at aria-invalid="false" so screen readers don't announce empty required fields on load
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.setAttribute('aria-invalid', 'false');
  });

  const onBlur = (e: Event) => syncAria(e.target);
  const onInput = (e: Event) => {
    if (e.target instanceof HTMLElement && e.target.getAttribute('aria-invalid') === 'true') {
      syncAria(e.target);
    }
  };
  const onInvalid = (e: Event) => syncAria(e.target);

  form.addEventListener('blur', onBlur, true);
  form.addEventListener('input', onInput);
  form.addEventListener('invalid', onInvalid, true);

  return () => {
    form.removeEventListener('blur', onBlur, true);
    form.removeEventListener('input', onInput);
    form.removeEventListener('invalid', onInvalid, true);
  };
}
