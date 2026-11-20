import { ArrowRight, BellRing, Building2, X } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface InlineLeadBannerProps {
  stealCount: number;
  statesCovered: number;
  onOpenAlerts: () => void;
  onOpenPartner: () => void;
  onDismiss?: () => void;
}

export function InlineLeadBanner({
  stealCount,
  statesCovered,
  onOpenAlerts,
  onOpenPartner,
  onDismiss,
}: InlineLeadBannerProps) {
  return (
    <section
      aria-label="Daily deal alerts"
      className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0f766e] px-4 py-4 text-white shadow-[0_14px_36px_-16px_rgba(6,78,59,0.45)] ring-1 ring-emerald-300/25 sm:rounded-3xl sm:px-6 sm:py-4.5"
    >
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss deal alerts banner"
          className="absolute top-2.5 right-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/10 text-emerald-100 transition-colors hover:bg-white/25 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="flex flex-col gap-3.5 pr-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-50 ring-1 ring-white/20 backdrop-blur-md">
            <BellRing className="h-3 w-3 shrink-0 text-amber-300" />
            <span>
              {formatNumber(stealCount)} Steals (5/5) Live Across All {statesCovered} States Today
            </span>
          </div>

          <h1 className="mt-2 text-lg font-bold tracking-[-0.025em] text-white leading-snug sm:text-xl">
            Never miss an underpriced architectural gem before it goes under contract.
          </h1>

          <p className="mt-1 text-xs text-emerald-50/85 sm:text-[13px]">
            Get instant alerts when a 25%+ below-Zestimate home drops in your state—or connect with a vetted local buyer agent &amp; lender to move first.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAlerts}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-sm transition-colors hover:bg-emerald-50"
          >
            <span>Get Free Deal Alerts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenPartner}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <Building2 className="h-3.5 w-3.5 text-emerald-200" />
            <span>Agents &amp; Lenders: Sponsor a State</span>
          </button>
        </div>
      </div>
    </section>
  );
}
