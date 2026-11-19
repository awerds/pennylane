import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, Check, Copy, MapPin, X } from 'lucide-react';
import type { PropertyListing } from '../types';
import {
  categoryBadgeClasses,
  categoryLabel,
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
  const activePhoto = images[activePhotoIndex] || images[0] || '';

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby={titleId}
      className="editorial-modal"
    >
      {listing && (
        <div className="flex flex-col">
          {/* Top bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--rule)] bg-[var(--paper-raised)] px-6 py-4">
            <div className="flex flex-wrap items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              <span>Dossier #{listing.zpid}</span>
              <span className="text-[var(--rule)]">/</span>
              <span className="inline-flex items-center gap-1 text-[var(--ink)]">
                <MapPin className="h-3 w-3" />
                {listing.address}, {listing.city}, {listing.state} {listing.zip}
              </span>
            </div>

            <button
              type="button"
              autoFocus
              onClick={handleCloseClick}
              aria-label="Close property dossier"
              className="inline-flex cursor-pointer items-center justify-center border border-[var(--rule)] bg-[var(--paper)] p-1.5 text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Gallery Column */}
            <div className="border-b border-[var(--rule)] bg-[var(--paper-inset)] lg:col-span-7 lg:border-r lg:border-b-0">
              <div className="aspect-[16/11] w-full overflow-hidden">
                <PropertyImage
                  src={activePhoto}
                  alt={`${listing.title} — photo ${activePhotoIndex + 1}`}
                  priority="low"
                  className="h-full w-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 border-t border-[var(--rule)] bg-[var(--paper)] p-3">
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      aria-label={`View photo ${idx + 1}`}
                      aria-current={idx === activePhotoIndex ? 'true' : undefined}
                      className={`h-16 w-24 cursor-pointer overflow-hidden border transition-opacity ${
                        idx === activePhotoIndex
                          ? 'border-[var(--ink)] opacity-100'
                          : 'border-[var(--rule)] opacity-60 hover:opacity-100'
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
              <div className="border-t border-[var(--rule)] bg-[var(--paper-raised)] p-6">
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                  Why It Made the Cut
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
                  {listing.editorialNote}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {listing.raritySignals.map((sig) => (
                    <span
                      key={sig}
                      className="border border-[var(--rule)] bg-[var(--paper)] px-2.5 py-1 text-xs text-[var(--ink)]"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Telemetry & Action Column */}
            <div className="flex flex-col justify-between p-6 lg:col-span-5">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {listing.categories.map((cat) => (
                    <span
                      key={cat}
                      className={`px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-wider ${categoryBadgeClasses(
                        cat
                      )}`}
                    >
                      {categoryLabel(cat)}
                    </span>
                  ))}
                </div>

                <h2
                  id={titleId}
                  className="mt-3 font-serif-editorial text-3xl leading-[1.08] text-[var(--ink)]"
                >
                  {listing.title}
                </h2>

                <div className="mt-1 font-mono-tech text-xs text-[var(--ink-soft)]">
                  {listing.architecturalStyle} · Built {listing.yearBuilt}
                </div>

                {/* Price Block */}
                <div className="mt-5 border-y border-[var(--rule)] py-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono-tech text-3xl font-medium text-[var(--ink)]">
                      {formatCurrency(listing.price)}
                    </span>
                    {listing.priceCutPct > 0 && (
                      <span className="font-mono-tech text-xs text-[var(--vermilion)]">
                        Cut {listing.priceCutPct}% from {formatCurrency(listing.previousPrice)}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between font-mono-tech text-xs">
                    <span className="text-[var(--ink-soft)]">
                      ${listing.pricePerSqft}/sqft vs ${listing.zipMedianPricePerSqft}/sqft zip median
                    </span>
                    <span
                      className={
                        listing.medianDeltaPct <= 0
                          ? 'font-medium text-[var(--sage)]'
                          : 'text-[var(--ink)]'
                      }
                    >
                      {listing.medianDeltaPct > 0 ? '+' : ''}
                      {listing.medianDeltaPct}%
                    </span>
                  </div>
                </div>

                {/* Property Specs Grid */}
                <dl className="mt-4 grid grid-cols-2 gap-3 font-mono-tech text-xs">
                  <div className="border border-[var(--rule)] bg-[var(--paper)] p-3">
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                      Layout
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--ink)]">
                      {listing.beds} bd · {listing.baths} ba
                    </dd>
                  </div>
                  <div className="border border-[var(--rule)] bg-[var(--paper)] p-3">
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                      Interior
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--ink)]">
                      {formatNumber(listing.sqft)} sqft
                    </dd>
                  </div>
                  <div className="border border-[var(--rule)] bg-[var(--paper)] p-3">
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                      Lot Size
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--ink)]">{listing.lotAcres} acres</dd>
                  </div>
                  <div className="border border-[var(--rule)] bg-[var(--paper)] p-3">
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                      Market Tenure
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--ink)]">
                      {listing.daysOnMarket === 0 ? 'Listed Today' : `${listing.daysOnMarket} days`}
                    </dd>
                  </div>
                </dl>

                {/* PennyLane Index Breakdown */}
                <div className="mt-5 border border-[var(--rule)] bg-[var(--paper)] p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                      PennyLane Score
                    </span>
                    <span className="font-mono-tech text-lg font-medium text-[var(--ink)]">
                      {listing.scores.overall} / 100
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 text-xs">
                    {[
                      { label: 'Architectural Rarity', value: listing.scores.rarity, color: 'bg-[var(--ochre)]' },
                      { label: 'Deal / Median Value', value: listing.scores.deal, color: 'bg-[var(--sage)]' },
                      { label: 'Market Freshness', value: listing.scores.freshness, color: 'bg-[var(--vermilion)]' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex justify-between font-mono-tech text-[11px]">
                          <span className="text-[var(--ink-soft)]">{row.label}</span>
                          <span className="text-[var(--ink)]">{row.value}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-[var(--rule)]">
                          <div
                            className={`h-full ${row.color}`}
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
                  className="inline-flex items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-xs font-medium tracking-wide text-[var(--paper)] transition-colors hover:bg-[#2a2926]"
                >
                  <span>View Listing on Zillow</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSave(listing.id)}
                    aria-pressed={isSaved}
                    className={`inline-flex cursor-pointer items-center justify-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors ${
                      isSaved
                        ? 'border-[var(--vermilion)] bg-[var(--vermilion-soft)] text-[var(--vermilion)]'
                        : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)]'
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                    <span>{isSaved ? 'Saved' : 'Save Find'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-xs font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-[var(--sage)]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied Link' : 'Share Link'}</span>
                  </button>
                </div>

                <p className="mt-1 text-center font-mono-tech text-[10px] text-[var(--ink-soft)]">
                  Auto-removed during daily sync once status changes to Under Contract or Pending.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

