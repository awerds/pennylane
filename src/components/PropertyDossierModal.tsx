import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, Check, Copy, MapPin, X } from 'lucide-react';
import type { PropertyListing } from '../types';
import {
  categoryLabel,
  categoryPillClasses,
  formatCurrency,
  formatNumber,
} from '../utils/format';
import {
  attachLightDismissFallback,
  closeDialogWithAnimation,
  supportsTopLayerExit,
} from '../utils/topLayer';
import { PropertyImage } from './PropertyImage';

interface PropertyDossierModalProps {
  listing: PropertyListing | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (id: string) => void;
}

export function PropertyDossierModal({
  listing,
  isSaved,
  onClose,
  onToggleSave,
}: PropertyDossierModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActivePhotoIndex(0);
    setCopied(false);
  }, [listing?.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (listing && !dialog.open) {
      dialog.showModal();
    } else if (!listing && dialog.open) {
      dialog.close();
    }
  }, [listing]);

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

  const handleCopyShareLink = async () => {
    if (!listing) return;
    const url = new URL(window.location.href);
    url.searchParams.set('property', listing.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const images = listing?.images ?? [];

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby={titleId}
      className="modern-modal"
    >
      {listing && (
        <div className="flex flex-col">
          {/* Top accent bar */}
          <div
            className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-600"
            aria-hidden="true"
          />

          {/* Sticky Top Bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              <span className="truncate font-medium text-slate-800">
                {listing.address}, {listing.city}, {listing.state} {listing.zip}
              </span>
            </div>

            <button
              type="button"
              autoFocus
              onClick={handleCloseClick}
              aria-label="Close property details"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-indigo-600 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Smooth Crossfade Gallery Column */}
            <div className="p-6 lg:col-span-7 lg:pr-3">
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-slate-100">
                {images.map((src, idx) => {
                  const active = idx === activePhotoIndex;
                  return (
                    <div
                      key={`${src}-${idx}`}
                      aria-hidden={!active}
                      className={`pl-slide-layer ${
                        active ? 'pl-slide-layer--active' : 'pl-slide-layer--inactive'
                      }`}
                    >
                      <PropertyImage
                        src={src}
                        alt={`${listing.title} — photo ${idx + 1}`}
                        priority="low"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      aria-label={`View photo ${idx + 1}`}
                      aria-current={idx === activePhotoIndex ? 'true' : undefined}
                      className={`h-16 w-24 cursor-pointer overflow-hidden rounded-xl ring-2 transition-all ${
                        idx === activePhotoIndex
                          ? 'ring-indigo-600 opacity-100'
                          : 'ring-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <PropertyImage
                        src={img}
                        alt=""
                        priority="low"
                        width={240}
                        height={160}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Editorial Assessment */}
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/50 p-5 ring-1 ring-indigo-100/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  Why It Made the Cut
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {listing.editorialNote}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {listing.raritySignals.map((sig) => (
                    <span
                      key={sig}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Details & Telemetry Column */}
            <div className="flex flex-col justify-between p-6 pt-0 lg:col-span-5 lg:pt-6">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {listing.categories.map((cat) => (
                    <span
                      key={cat}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${categoryPillClasses(
                        cat
                      )}`}
                    >
                      {categoryLabel(cat)}
                    </span>
                  ))}
                </div>

                <h2
                  id={titleId}
                  className="mt-3 text-2xl font-bold tracking-[-0.025em] text-slate-950 leading-snug"
                >
                  {listing.title}
                </h2>

                <div className="mt-1 text-xs font-medium text-indigo-600/80">
                  {listing.architecturalStyle} · Built {listing.yearBuilt}
                </div>

                {/* Price Block */}
                <div className="mt-5 border-y border-slate-100 py-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-3xl font-bold tracking-[-0.03em] text-slate-950 tabular-nums">
                      {formatCurrency(listing.price)}
                    </span>
                    {listing.priceCutPct > 0 && (
                      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200/70 tabular-nums">
                        −{listing.priceCutPct}% from {formatCurrency(listing.previousPrice)}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs tabular-nums">
                    <span className="text-slate-500">
                      ${listing.pricePerSqft}/sf vs ${listing.zipMedianPricePerSqft}/sf zip median
                    </span>
                    <span
                      className={
                        listing.medianDeltaPct <= 0
                          ? 'font-semibold text-emerald-600'
                          : 'font-medium text-slate-700'
                      }
                    >
                      {listing.medianDeltaPct > 0 ? '+' : ''}
                      {listing.medianDeltaPct}%
                    </span>
                  </div>
                </div>

                {/* Property Specs Grid */}
                <dl className="mt-4 grid grid-cols-2 gap-2.5 text-xs tabular-nums">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[11px] text-slate-500">Layout</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-950">
                      {listing.beds} bd · {listing.baths} ba
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[11px] text-slate-500">Interior</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-950">
                      {formatNumber(listing.sqft)} sqft
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[11px] text-slate-500">Lot Size</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-950">
                      {listing.lotAcres} acres
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[11px] text-slate-500">On Market</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-950">
                      {listing.daysOnMarket === 0 ? 'Listed Today' : `${listing.daysOnMarket} days`}
                    </dd>
                  </div>
                </dl>

                {/* PennyLane Index Breakdown */}
                <div className="mt-4 rounded-2xl border border-slate-200/80 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-950">PennyLane Score</span>
                    <span className="text-base font-bold text-indigo-600 tabular-nums">
                      {listing.scores.overall}
                      <span className="text-xs font-normal text-slate-400"> / 100</span>
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {[
                      { label: 'Architectural Rarity', value: listing.scores.rarity, color: 'bg-amber-500' },
                      { label: 'Deal / Zip Value', value: listing.scores.deal, color: 'bg-emerald-500' },
                      { label: 'Market Freshness', value: listing.scores.freshness, color: 'bg-rose-500' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex justify-between text-[11.5px] tabular-nums">
                          <span className="text-slate-500">{row.label}</span>
                          <span className="font-semibold text-slate-900">{row.value}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${row.color}`}
                            style={{ width: `${Math.min(100, row.value)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={listing.zillowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-rose-500 px-5 py-3 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 transition-opacity hover:opacity-90"
                >
                  <span>View Listing on Zillow</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSave(listing.id)}
                    aria-pressed={isSaved}
                    className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${
                      isSaved
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/40'
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Share'}</span>
                  </button>
                </div>

                <p className="mt-1 text-center text-[11px] text-slate-400">
                  Auto-removed in daily sync once marked Under Contract or Pending.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
