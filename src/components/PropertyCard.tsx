import { useState } from 'react';
import { ArrowUpRight, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PropertyListing } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';
import { PropertyImage } from './PropertyImage';

interface PropertyCardProps {
  listing: PropertyListing;
  isSaved: boolean;
  featured?: boolean;
  isLcp?: boolean;
  onInspect: (listing: PropertyListing) => void;
  onToggleSave: (id: string) => void;
}

export function PropertyCard({
  listing,
  isSaved,
  featured = false,
  isLcp = false,
  onInspect,
  onToggleSave,
}: PropertyCardProps) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const images = listing.images.length > 0 ? listing.images : [''];
  const hasMultiplePhotos = images.length > 1;

  // Pick a single high-signal badge so images stay clean and uncluttered
  const signalBadge = listing.isNewToday || listing.daysOnMarket === 0
    ? { label: 'New Today', tone: 'bg-rose-600/90 text-white' }
    : listing.priceCutPct >= 10
    ? { label: `−${listing.priceCutPct}% Price Cut`, tone: 'bg-zinc-950/80 text-white' }
    : listing.medianDeltaPct <= -20
    ? { label: `${Math.abs(listing.medianDeltaPct)}% Below Zip`, tone: 'bg-emerald-700/90 text-white' }
    : { label: `PL ${listing.scores.overall}`, tone: 'bg-zinc-950/75 text-white' };

  const stepPhoto = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev + delta + images.length) % images.length);
  };

  return (
    <article
      className={`group flex flex-col ${featured ? 'sm:col-span-2' : ''}`}
    >
      {/* Rounded Full-Bleed Image Stage */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-zinc-100 ${
          featured ? 'aspect-[16/10] sm:aspect-[2.15/1]' : 'aspect-[4/3]'
        }`}
      >
        <button
          type="button"
          onClick={() => onInspect(listing)}
          className="block h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-950"
          aria-label={`View details for ${listing.title} in ${listing.city}, ${listing.state}`}
        >
          <PropertyImage
            src={images[photoIdx]}
            alt={`${listing.title} in ${listing.city}, ${listing.state}`}
            priority={isLcp ? 'lcp' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        </button>

        {/* Subtle bottom scrim for carousel dots & score */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
          aria-hidden="true"
        />

        {/* Top-left Single Signal Pill */}
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5">
          {featured && (
            <span className="rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-zinc-950 shadow-xs backdrop-blur-md">
              Featured Find
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight shadow-xs backdrop-blur-md tabular-nums ${signalBadge.tone}`}
          >
            {signalBadge.label}
          </span>
        </div>

        {/* Top-right Save Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(listing.id);
          }}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${listing.title} from saved` : `Save ${listing.title}`}
          className={`absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-black/35 text-white hover:scale-105 hover:bg-black/60'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" fill={isSaved ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Hover Mini-Carousel Controls */}
        {hasMultiplePhotos && (
          <>
            <button
              type="button"
              onClick={(e) => stepPhoto(e, -1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-2.5 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-zinc-950 opacity-0 shadow-sm backdrop-blur-md transition-all group-hover:opacity-100 hover:scale-105 hover:bg-white focus-visible:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={(e) => stepPhoto(e, 1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-zinc-950 opacity-0 shadow-sm backdrop-blur-md transition-all group-hover:opacity-100 hover:scale-105 hover:bg-white focus-visible:opacity-100"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </button>

            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === photoIdx ? 'w-3.5 bg-white' : 'w-1.5 bg-white/55'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom-right Subtle Score Pill */}
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/50 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur-md tabular-nums">
          {listing.scores.overall}
        </span>
      </div>

      {/* Crisp Typography Metadata Below Photo */}
      <div className="pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[16px] font-semibold tracking-[-0.02em] text-zinc-950 tabular-nums">
              {formatCurrency(listing.price)}
            </span>
            {listing.medianDeltaPct <= -10 && (
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 tabular-nums">
                {listing.medianDeltaPct}% zip
              </span>
            )}
          </div>

          <span className="truncate text-[12px] font-medium text-zinc-500">
            {listing.city}, {listing.state}
          </span>
        </div>

        <h3 className="mt-0.5 text-[14px] font-medium text-zinc-900">
          <button
            type="button"
            onClick={() => onInspect(listing)}
            className="block w-full cursor-pointer truncate text-left transition-colors hover:text-zinc-600"
          >
            {listing.title}
          </button>
        </h3>

        {featured && (
          <p className="mt-1 line-clamp-1 text-[13px] text-zinc-500">
            {listing.editorialNote}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between gap-2 text-[12px] text-zinc-500 tabular-nums">
          <span>
            {listing.beds} bd · {listing.baths} ba · {formatNumber(listing.sqft)} sf · {listing.yearBuilt}
          </span>
          <a
            href={listing.zillowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-0.5 font-medium text-zinc-500 transition-colors hover:text-zinc-950"
          >
            <span>Zillow</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
