import { ArrowUpRight, Bookmark } from 'lucide-react';
import type { PropertyListing } from '../types';
import {
  categoryBadgeClasses,
  categoryLabel,
  formatCurrency,
  formatNumber,
} from '../utils/format';
import { PropertyImage } from './PropertyImage';

interface PropertyCardProps {
  listing: PropertyListing;
  isSaved: boolean;
  isHighlighted?: boolean;
  onInspect: (listing: PropertyListing) => void;
  onToggleSave: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export function PropertyCard({
  listing,
  isSaved,
  isHighlighted = false,
  onInspect,
  onToggleSave,
  onHover,
}: PropertyCardProps) {
  return (
    <article
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group flex flex-col border bg-[var(--paper-raised)] transition-colors ${
        isHighlighted
          ? 'border-[var(--ink)] ring-1 ring-[var(--ink)]'
          : 'border-[var(--rule)] hover:border-[#b9b1a2]'
      }`}
    >
      {/* Architectural plate */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--paper-inset)]">
        <button
          type="button"
          onClick={() => onInspect(listing)}
          className="block h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ink)]"
          aria-label={`Inspect dossier for ${listing.title}`}
        >
          <PropertyImage
            src={listing.images[0]}
            alt={`${listing.title} in ${listing.city}, ${listing.state}`}
            priority="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </button>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          {listing.isNewToday && (
            <span className="bg-[var(--vermilion)] px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-[0.12em] text-white">
              Added Today
            </span>
          )}
          <span
            className={`px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-wider backdrop-blur-xs ${categoryBadgeClasses(
              listing.primaryCategory
            )}`}
          >
            {categoryLabel(listing.primaryCategory)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleSave(listing.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${listing.title} from saved` : `Save ${listing.title}`}
          className={`absolute top-3 right-3 inline-flex cursor-pointer items-center justify-center border p-1.5 backdrop-blur-xs transition-colors ${
            isSaved
              ? 'border-[var(--vermilion)] bg-[var(--vermilion)] text-white'
              : 'border-white/40 bg-[var(--ink)]/55 text-white hover:bg-[var(--ink)]'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        <div className="pointer-events-none absolute right-3 bottom-3 bg-[var(--paper-raised)]/95 px-2 py-0.5 font-mono-tech text-[10px] text-[var(--ink)]">
          PL <strong>{listing.scores.overall}</strong>
        </div>
      </div>

      {/* Editorial Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 font-mono-tech text-[11px] text-[var(--ink-soft)]">
            <span className="truncate uppercase tracking-wider">
              {listing.city}, {listing.state}
            </span>
            <span className="shrink-0">
              {listing.daysOnMarket === 0 ? 'Today' : `${listing.daysOnMarket}d`}
            </span>
          </div>

          <h3 className="mt-2 font-serif-editorial text-[23px] leading-[1.12] tracking-[-0.01em] text-[var(--ink)]">
            <button
              type="button"
              onClick={() => onInspect(listing)}
              className="cursor-pointer text-left transition-colors hover:text-[var(--vermilion)]"
            >
              {listing.title}
            </button>
          </h3>

          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">
            {listing.editorialNote}
          </p>
        </div>

        <div className="mt-4">
          {/* Price & Deal Delta */}
          <div className="flex items-baseline justify-between gap-2 border-t border-[var(--rule)] pt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tech text-lg font-medium text-[var(--ink)]">
                {formatCurrency(listing.price)}
              </span>
              {listing.priceCutPct > 0 && (
                <span className="font-mono-tech text-[11px] text-[var(--vermilion)]">
                  −{listing.priceCutPct}%
                </span>
              )}
            </div>

            <span
              className={`font-mono-tech text-[11px] font-medium ${
                listing.medianDeltaPct <= -10 ? 'text-[var(--sage)]' : 'text-[var(--ink-soft)]'
              }`}
              title={`$${listing.pricePerSqft}/sqft vs $${listing.zipMedianPricePerSqft}/sqft zip median`}
            >
              {listing.medianDeltaPct > 0 ? '+' : ''}
              {listing.medianDeltaPct}% vs zip
            </span>
          </div>

          {/* Specs & Actions */}
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-mono-tech text-[var(--ink-soft)]">
            <span>
              {listing.beds}bd · {listing.baths}ba · {formatNumber(listing.sqft)}sf · {listing.yearBuilt}
            </span>
            <a
              href={listing.zillowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-0.5 text-[var(--ink)] hover:text-[var(--vermilion)]"
            >
              <span>Zillow</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
