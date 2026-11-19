import { ArrowRight, BellRing, Building2 } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface InlineLeadBannerProps {
  stealCount: number;
  statesCovered: number;
  onOpenAlerts: () => void;
  onOpenPartner: () => void;
}

export function InlineLeadBanner({
  stealCount,
  statesCovered,
  onOpenAlerts,
  onOpenPartner,
}: InlineLeadBannerProps) {
  return (
    <div className="col-span-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b2b59] via-[#15458a] to-[#1e3a8a] p-6 text-white shadow-[0_20px_50px_-20px_rgba(12,45,87,0.45)] ring-1 ring-sky-300/25 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-sky-100 ring-1 ring-white/20 backdrop-blur-md">
            <BellRing className="h-3.5 w-3.5 text-amber-300" />
            <span>{formatNumber(stealCount)} Homes Rated 5/5 Steal Across {statesCovered} States Today</span>
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-[-0.025em] text-white sm:text-2xl">
            Never miss an underpriced architectural gem before it goes under contract.
          </h2>
          <p className="mt-1.5 text-sm text-sky-100/85">
            Get instant alerts when a 25%+ below-Zestimate property drops in your state—or connect directly with a vetted local buyer agent &amp; lender to move first.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAlerts}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-blue-950 shadow-sm transition-colors hover:bg-sky-50"
          >
            <span>Get Free Deal Alerts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenPartner}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <Building2 className="h-3.5 w-3.5 text-sky-200" />
            <span>Agents &amp; Lenders: Sponsor a State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
