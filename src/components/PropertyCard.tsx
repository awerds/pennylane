import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PropertyListing } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';
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

  const images = listing.images.length > 0 ? listing.images : [''];
  const hasMultiplePhotos = images.length > 1;

  // Track viewport visibility so only on-screen cards auto-transition (zero offscreen work)
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

  // Organic staggered auto-crossfade across visible cards (pauses on hover/focus or global Pause Motion)
  useEffect(() => {
    if (!hasMultiplePhotos || motionPaused || !isVisible || isInteracting) return;

    // Stagger interval (5.0s–7.8s) and initial offset so cards crossfade organically instead of in unison
    const cycleMs = 5000 + ((index * 719) % 2800);
    const initialDelayMs = 1400 + ((index * 937) % 3400);

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

  const signalBadge =
    listing.isNewToday || listing.daysOnMarket === 0
      ? { label: 'New Today', tone: 'bg-rose-500/95 text-white shadow-rose-500/30' }
      : listing.priceCutPct >= 10
      ? { label: `−${listing.priceCutPct}% Cut`, tone: 'bg-indigo-600/95 text-white shadow-indigo-600/30' }
      : listing.medianDeltaPct <= -20
      ? { label: `${Math.abs(listing.medianDeltaPct)}% Below Zip`, tone: 'bg-emerald-600/95 text-white shadow-emerald-600/30' }
      : { label: 'Rare Find', tone: 'bg-amber-500/95 text-white shadow-amber-500/30' };

  const scoreTone =
    listing.scores.overall >= 88
      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white'
      : listing.scores.overall >= 80
      ? 'bg-indigo-600/90 text-white'
      : 'bg-slate-900/75 text-white';

  const stepPhoto = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev + delta + images.length) % images.length);
  };

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
      className={`group flex flex-col rounded-3xl bg-white/85 p-2.5 ring-1 ring-slate-200/75 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-300/80 hover:shadow-[0_18px_40px_-18px_rgba(79,70,229,0.22)] ${
        featured ? 'sm:col-span-2' : ''
      }`}
    >
      {/* Rounded Multi-Layer Crossfade Photo Stage */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-slate-100 ${
          featured ? 'aspect-[16/10] sm:aspect-[2.15/1]' : 'aspect-[4/3]'
        }`}
      >
        <button
          type="button"
          onClick={() => onInspect(listing)}
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
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent"
          aria-hidden="true"
        />

        {/* Top-left Vibrant Signal Pill */}
        <div className="pointer-events-none absolute top-3 left-3 z-[3] flex items-center gap-1.5">
          {featured && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-indigo-700 shadow-sm backdrop-blur-md">
              Featured Find
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight shadow-sm backdrop-blur-md tabular-nums ${signalBadge.tone}`}
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
          className={`absolute top-3 right-3 z-[3] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full backdrop-blur-md transition-all ${
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

        {/* Bottom-right Score Pill */}
        <span
          className={`pointer-events-none absolute right-3 bottom-3 z-[3] rounded-full px-2 py-0.5 text-[10.5px] font-bold shadow-sm backdrop-blur-md tabular-nums ${scoreTone}`}
        >
          {listing.scores.overall}
        </span>
      </div>

      {/* Crisp Typography Metadata Below Photo */}
      <div className="px-1.5 pt-3 pb-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[16.5px] font-bold tracking-[-0.02em] text-slate-950 tabular-nums">
              {formatCurrency(listing.price)}
            </span>
            {listing.medianDeltaPct <= -10 && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20 tabular-nums">
                {listing.medianDeltaPct}% zip
              </span>
            )}
          </div>

          <span className="truncate text-[12px] font-medium text-indigo-600/85">
            {listing.city}, {listing.state}
          </span>
        </div>

        <h3 className="mt-0.5 text-[14px] font-semibold text-slate-900">
          <button
            type="button"
            onClick={() => onInspect(listing)}
            className="block w-full cursor-pointer truncate text-left transition-colors hover:text-indigo-600"
          >
            {listing.title}
          </button>
        </h3>

        {featured && (
          <p className="mt-1 line-clamp-1 text-[13px] text-slate-500">
            {listing.editorialNote}
          </p>
        )}

        <div className="mt-1.5 flex items-center justify-between gap-2 text-[12px] text-slate-500 tabular-nums">
          <span>
            {listing.beds} bd · {listing.baths} ba · {formatNumber(listing.sqft)} sf · {listing.yearBuilt}
          </span>
          <a
            href={listing.zillowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-slate-600 transition-colors hover:text-indigo-600"
          >
            <span>Zillow</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
