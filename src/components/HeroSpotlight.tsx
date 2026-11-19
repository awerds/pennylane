import { ArrowUpRight, Bookmark, Sparkles } from 'lucide-react';
import type { PropertyListing } from '../types';
import {
  categoryBadgeClasses,
  categoryLabel,
  formatCurrency,
  formatNumber,
} from '../utils/format';
import { PropertyImage } from './PropertyImage';

interface HeroSpotlightProps {
  listing: PropertyListing;
  isSaved: boolean;
  onInspect: (listing: PropertyListing) => void;
  onToggleSave: (id: string) => void;
}

export function HeroSpotlight({
  listing,
  isSaved,
  onInspect,
  onToggleSave,
}: HeroSpotlightProps) {
  return (
    <section
      aria-label="Lead find of the edition"
      className="mx-auto max-w-[1380px] px-5 pt-8 pb-6 sm:px-8 sm:pt-10"
    >
      <div className="grid grid-cols-1 border border-[var(--rule)] bg-[var(--paper-raised)] lg:grid-cols-12">
        {/* Asymmetric large architectural plate (LCP image) */}
        <div className="relative overflow-hidden bg-[var(--paper-inset)] lg:col-span-7">
          <button
            type="button"
            onClick={() => onInspect(listing)}
            className="group block h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ink)]"
            aria-label={`Inspect dossier for ${listing.title}`}
          >
            <div className="aspect-[16/10] w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[450px]">
              <PropertyImage
                src={listing.images[0]}
                alt={`${listing.title} in ${listing.city}, ${listing.state}`}
                priority="lcp"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              />
            </div>
          </button>

          <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[var(--ink)] px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[var(--paper)]">
              <Sparkles className="h-3 w-3 text-[#e8b86d]" />
              Lead Find
            </span>
            {listing.daysOnMarket <= 2 && (
              <span className="bg-[var(--vermilion)] px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-white">
                {listing.daysOnMarket === 0 ? 'Listed Today' : `${listing.daysOnMarket}d on Market`}
              </span>
            )}
          </div>

          <div className="pointer-events-none absolute right-4 bottom-4 bg-[var(--paper-raised)]/95 px-3 py-1.5 font-mono-tech text-[11px] text-[var(--ink)] backdrop-blur-xs">
            PL Index <strong className="text-sm">{listing.scores.overall}</strong>/100
          </div>
        </div>

        {/* Structured architectural dossier column */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 lg:border-l lg:border-[var(--rule)]">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                {listing.city}, {listing.state} · {listing.yearBuilt}
              </span>
              <span
                className={`px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-wider ${categoryBadgeClasses(
                  listing.primaryCategory
                )}`}
              >
                {categoryLabel(listing.primaryCategory)}
              </span>
            </div>

            <h2 className="mt-3 font-serif-editorial text-3xl leading-[1.06] tracking-[-0.015em] text-[var(--ink)] sm:text-4xl">
              <button
                type="button"
                onClick={() => onInspect(listing)}
                className="cursor-pointer text-left transition-colors hover:text-[var(--vermilion)]"
              >
                {listing.title}
              </button>
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
              {listing.editorialNote}
            </p>

            {/* Key price & market delta block */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[var(--rule)] py-4">
              <div>
                <div className="font-mono-tech text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                  Asking Price
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono-tech text-2xl font-medium tracking-tight text-[var(--ink)]">
                    {formatCurrency(listing.price)}
                  </span>
                  {listing.priceCutPct > 0 && (
                    <span className="font-mono-tech text-xs text-[var(--vermilion)]">
                      −{listing.priceCutPct}%
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="font-mono-tech text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                  vs. Zip Median $/SqFt
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={`font-mono-tech text-2xl font-medium tracking-tight ${
                      listing.medianDeltaPct <= 0 ? 'text-[var(--sage)]' : 'text-[var(--ink)]'
                    }`}
                  >
                    {listing.medianDeltaPct > 0 ? '+' : ''}
                    {listing.medianDeltaPct}%
                  </span>
                  <span className="font-mono-tech text-xs text-[var(--ink-soft)]">
                    (${listing.pricePerSqft} vs ${listing.zipMedianPricePerSqft})
                  </span>
                </div>
              </div>
            </div>

            {/* Specs & architectural signals */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono-tech text-xs text-[var(--ink)]">
              <span>{listing.beds} bd</span>
              <span className="text-[var(--rule)]">·</span>
              <span>{listing.baths} ba</span>
              <span className="text-[var(--rule)]">·</span>
              <span>{formatNumber(listing.sqft)} sqft</span>
              <span className="text-[var(--rule)]">·</span>
              <span>{listing.lotAcres} acres</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {listing.raritySignals.slice(0, 3).map((signal) => (
                <span
                  key={signal}
                  className="border border-[var(--rule)] bg-[var(--paper)] px-2 py-0.5 text-[11px] text-[var(--ink-soft)]"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onInspect(listing)}
              className="flex-1 cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 text-xs font-medium tracking-wide text-[var(--paper)] transition-colors hover:bg-[#2a2926]"
            >
              Read Property Dossier
            </button>
            <a
              href={listing.zillowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-[var(--rule)] bg-[var(--paper)] px-3.5 py-2.5 text-xs font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
            >
              <span>Zillow</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onToggleSave(listing.id)}
              aria-pressed={isSaved}
              aria-label={isSaved ? 'Remove from saved watchlist' : 'Save to watchlist'}
              className={`inline-flex cursor-pointer items-center justify-center border p-2.5 transition-colors ${
                isSaved
                  ? 'border-[var(--vermilion)] bg-[var(--vermilion-soft)] text-[var(--vermilion)]'
                  : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

