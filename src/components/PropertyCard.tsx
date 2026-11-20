import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import type { PropertyListing } from '../types';
import {
  dealTierMeta,
  formatCurrency,
  formatNumber,
  formatPriceCompact,
} from '../utils/format';
import { PropertyImage } from './PropertyImage';

interface PropertyCardProps {
  listing: PropertyListing;
  index: number;
  isSaved: boolean;
  motionPaused: boolean;
  featured?: boolean;
  isLcp?: boolean;
  onInspect: (listing: PropertyListing) => void;
  onToggleSave: (id: string) => void;
}

export function PropertyCard({
  listing,
  index,
  isSaved,
  motionPaused,
  featured = false,
  isLcp = false,
  onInspect,
  onToggleSave,
}: PropertyCardProps) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(isLcp);
  const [isInteracting, setIsInteracting] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);

  const images = listing.images.length > 0 ? listing.images : [''];
  const hasMultiplePhotos = images.length > 1;
  const dealMeta = dealTierMeta(listing.dealTier);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(Boolean(entries[0]?.isIntersecting));
      },
      { rootMargin: '120px 0px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasMultiplePhotos || motionPaused || !isVisible || isInteracting) return;

    const cycleMs = 5200 + ((index * 719) % 2800);
    const initialDelayMs = 1500 + ((index * 937) % 3400);

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setPhotoIdx((prev) => (prev + 1) % images.length);
      intervalId = window.setInterval(() => {
        setPhotoIdx((prev) => (prev + 1) % images.length);
      }, cycleMs);
    }, initialDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [hasMultiplePhotos, images.length, index, isInteracting, isVisible, motionPaused]);

  const stepPhoto = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev + delta + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiplePhotos || e.touches.length !== 1) return;
    swipedRef.current = false;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setIsInteracting(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    setIsInteracting(false);
    if (!start || !hasMultiplePhotos || e.changedTouches.length !== 1) return;

    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swipedRef.current = true;
      setPhotoIdx((prev) => (prev + (dx < 0 ? 1 : -1) + images.length) % images.length);
    }
  };

  const pctBelowZest = Math.max(0, -listing.zestimateDeltaPct);
  const isRealtor = listing.zillowUrl.includes('realtor.com');
  const sourceLabel = isRealtor ? 'Realtor.com' : 'Zillow';
  const estLabel = isRealtor ? 'Est.' : 'Zest.';

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsInteracting(false);
        }
      }}
      className={`group flex flex-col rounded-3xl bg-white/90 p-2.5 ring-1 ring-slate-200/80 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-300/80 hover:shadow-[0_18px_40px_-18px_rgba(79,70,229,0.2)] ${
        featured ? 'sm:col-span-2' : ''
      }`}
    >
      {/* Rounded Multi-Layer Crossfade Photo Stage (Swipeable on Touch Devices) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full overflow-hidden rounded-2xl bg-slate-100 touch-pan-y ${
          featured ? 'aspect-[16/10] sm:aspect-[2.25/1]' : 'aspect-[4/3]'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            if (swipedRef.current) {
              swipedRef.current = false;
              return;
            }
            onInspect(listing);
          }}
          className="relative block h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-600"
          aria-label={`View details for ${listing.title} in ${listing.city}, ${listing.state}`}
        >
          {images.map((src, idx) => {
            const active = idx === photoIdx;
            const priority = isLcp && idx === 0 ? 'lcp' : idx === 0 ? 'lazy' : 'low';
            return (
              <div
                key={`${src}-${idx}`}
                aria-hidden={!active}
                className={`pl-slide-layer ${
                  active ? 'pl-slide-layer--active' : 'pl-slide-layer--inactive'
                } ${active && !motionPaused && isVisible && !isInteracting ? 'pl-slide-layer--moving' : ''}`}
              >
                <PropertyImage
                  src={src}
                  alt={idx === 0 ? `${listing.title} in ${listing.city}, ${listing.state}` : ''}
                  priority={priority}
                  className="h-full w-full object-cover"
                />
              </div>
            );
          })}
        </button>

        {/* Subtle bottom scrim */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-t from-slate-950/50 via-slate-950/15 to-transparent"
          aria-hidden="true"
        />

        {/* Top-left High-Contrast Deal Value Badge */}
        <div className="pointer-events-none absolute top-3 left-3 z-[3] flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight shadow-sm backdrop-blur-md tabular-nums ${dealMeta.badgeClass}`}
          >
            {listing.dealTier >= 5 && <Flame className="h-3 w-3 text-amber-200" />}
            <span>{dealMeta.label}</span>
            {pctBelowZest > 0 && <span className="opacity-90">· −{pctBelowZest}%</span>}
          </span>

          {(listing.isNewToday || listing.daysOnMarket === 0) && (
            <span className="rounded-full bg-amber-400/95 px-2.5 py-1 text-[11px] font-bold text-emerald-950 shadow-sm ring-1 ring-yellow-200/70 backdrop-blur-md">
              New
            </span>
          )}
        </div>

        {/* Top-right Save Button (44px hit target on touch devices) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(listing.id);
          }}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${listing.title} from saved` : `Save ${listing.title}`}
          className={`pl-touch-target absolute top-2.5 right-2.5 z-[3] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full backdrop-blur-md transition-all sm:top-3 sm:right-3 sm:h-8 sm:w-8 ${
            isSaved
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/35'
              : 'bg-slate-950/35 text-white hover:scale-105 hover:bg-rose-500'
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
              className="absolute top-1/2 left-2.5 z-[3] flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/92 text-slate-950 opacity-0 shadow-sm backdrop-blur-md transition-all group-hover:opacity-100 hover:scale-105 hover:bg-white focus-visible:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={(e) => stepPhoto(e, 1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-2.5 z-[3] flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/92 text-slate-950 opacity-0 shadow-sm backdrop-blur-md transition-all group-hover:opacity-100 hover:scale-105 hover:bg-white focus-visible:opacity-100"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </button>

            <div className="pointer-events-none absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === photoIdx ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom-left Price Cut tag if reduced */}
        {listing.priceCutPct > 0 && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-[3] rounded-full bg-slate-950/70 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur-md tabular-nums">
            Price Cut −{listing.priceCutPct}%
          </span>
        )}
      </div>

      {/* Info Block: Obvious Price vs. Zestimate + 5-Bar Deal Scale */}
      <div className="px-1.5 pt-3 pb-1">
        {/* Row 1: Asking Price vs Zestimate & Instant Savings */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[17px] font-bold tracking-[-0.025em] text-slate-950 tabular-nums">
              {formatCurrency(listing.price)}
            </span>
            <span
              className="text-[11.5px] font-medium text-slate-400 tabular-nums"
              title={`${isRealtor ? 'Market Estimate' : 'Zestimate'}: ${formatCurrency(listing.zestimate)}`}
            >
              {estLabel} <span className="line-through">{formatPriceCompact(listing.zestimate)}</span>
            </span>
          </div>

          {listing.estimatedSavings > 0 && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/25 tabular-nums">
              Save {formatPriceCompact(listing.estimatedSavings)}
            </span>
          )}
        </div>

        {/* Row 2: Visual 5-Segment Deal Scale Meter + Location */}
        <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-slate-50/90 px-2.5 py-1.5 ring-1 ring-slate-200/60">
          <div
            className="flex items-center gap-2"
            title={`Deal Scale ${listing.dealTier}/5 (${dealMeta.label}): ${pctBelowZest}% below Zestimate`}
          >
            <div className="flex items-end gap-0.5" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((bar) => (
                <span
                  key={bar}
                  className={`w-1.5 rounded-full transition-colors ${
                    bar <= listing.dealTier ? dealMeta.barActive : 'bg-slate-200'
                  }`}
                  style={{ height: `${7 + bar * 2}px` }}
                />
              ))}
            </div>
            <span className={`text-[11px] font-bold tabular-nums ${dealMeta.textClass}`}>
              {listing.dealTier}/5 {dealMeta.label}
            </span>
          </div>

          <span className="truncate text-[11.5px] font-semibold text-indigo-600">
            {listing.city}, {listing.state}
          </span>
        </div>

        {/* Row 3: Architectural Headline */}
        <h3 className="mt-2 text-[13.5px] font-semibold text-slate-900">
          <button
            type="button"
            onClick={() => onInspect(listing)}
            className="block w-full cursor-pointer truncate text-left transition-colors hover:text-indigo-600"
          >
            {listing.title}
          </button>
        </h3>

        {featured && (
          <p className="mt-1 line-clamp-1 text-[12.5px] text-slate-500">
            {listing.editorialNote}
          </p>
        )}

        {/* Row 4: Specs & Live Listing Link */}
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11.5px] text-slate-500 tabular-nums">
          <span>
            {listing.beds} bd · {listing.baths} ba · {formatNumber(listing.sqft)} sf
            {listing.yearBuilt > 0 ? ` · ${listing.yearBuilt}` : ''}
          </span>
          <a
            href={listing.zillowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-slate-600 transition-colors hover:text-indigo-600"
          >
            <span>{sourceLabel}</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
