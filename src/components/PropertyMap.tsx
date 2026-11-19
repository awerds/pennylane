import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowUpRight, Compass, LocateFixed, X } from 'lucide-react';
import type { MapBounds, PropertyListing } from '../types';
import {
  categoryBadgeClasses,
  categoryLabel,
  formatCurrency,
  formatNumber,
  formatPriceCompact,
} from '../utils/format';
import { PropertyImage } from './PropertyImage';

interface PropertyMapProps {
  /** All listings matching non-map filters (so markers outside zoomed area can still be navigated to or shown subtly) */
  allMatchingListings: PropertyListing[];
  /** Listings currently visible after map bounds filtering */
  visibleListings: PropertyListing[];
  hoveredId: string | null;
  filterByMap: boolean;
  hasActiveBounds: boolean;
  activeRegion: string;
  heightClassName?: string;
  onBoundsChange: (bounds: MapBounds) => void;
  onToggleFilterByMap: (enabled: boolean) => void;
  onResetBounds: () => void;
  onSelectRegion: (region: string) => void;
  onHoverListing: (id: string | null) => void;
  onInspectListing: (listing: PropertyListing) => void;
}

const US_CENTER: [number, number] = [39.2, -96.5];
const US_ZOOM = 4;

const REGION_VIEWPORTS: Record<string, { center: [number, number]; zoom: number }> = {
  All: { center: US_CENTER, zoom: US_ZOOM },
  Northeast: { center: [42.1, -73.8], zoom: 6 },
  West: { center: [40.5, -115.5], zoom: 5 },
  Southwest: { center: [33.5, -106.5], zoom: 6 },
  Midwest: { center: [42.0, -87.5], zoom: 6 },
  South: { center: [33.2, -83.5], zoom: 5 },
};

const QUICK_REGIONS = ['All', 'Northeast', 'West', 'Southwest', 'Midwest', 'South'] as const;

export function PropertyMap({
  allMatchingListings,
  visibleListings,
  hoveredId,
  filterByMap,
  hasActiveBounds,
  activeRegion,
  heightClassName = 'h-[520px] lg:h-[calc(100dvh-215px)] lg:min-h-[540px]',
  onBoundsChange,
  onToggleFilterByMap,
  onResetBounds,
  onSelectRegion,
  onHoverListing,
  onInspectListing,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const programmaticMoveRef = useRef(false);
  const filterByMapRef = useRef(filterByMap);
  const onBoundsChangeRef = useRef(onBoundsChange);

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  filterByMapRef.current = filterByMap;
  onBoundsChangeRef.current = onBoundsChange;

  const selectedPin = useMemo(
    () => allMatchingListings.find((l) => l.id === selectedPinId) ?? null,
    [allMatchingListings, selectedPinId]
  );

  // Clear preview card if its listing is filtered out
  useEffect(() => {
    if (selectedPinId && !allMatchingListings.some((l) => l.id === selectedPinId)) {
      setSelectedPinId(null);
    }
  }, [allMatchingListings, selectedPinId]);

  // Initialize Leaflet map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: US_CENTER,
      zoom: US_ZOOM,
      minZoom: 3,
      maxZoom: 15,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapRef.current = map;

    const emitBounds = () => {
      if (programmaticMoveRef.current) {
        programmaticMoveRef.current = false;
        return;
      }
      if (!filterByMapRef.current) return;
      const b = map.getBounds();
      onBoundsChangeRef.current({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    };

    map.on('moveend', emitBounds);
    map.on('click', () => setSelectedPinId(null));

    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      markerMapRef.current.clear();
    };
  }, []);

  // Re-emit bounds immediately if user turns "Filter as I move map" ON while zoomed
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !filterByMap) return;
    if (map.getZoom() > US_ZOOM) {
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    }
  }, [filterByMap, onBoundsChange]);

  // Render price-pill markers whenever matching listings change
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    for (const item of allMatchingListings) {
      if (typeof item.lat !== 'number' || typeof item.lng !== 'number') continue;

      const dotColor =
        item.primaryCategory === 'new'
          ? '#c6462b'
          : item.primaryCategory === 'deal'
          ? '#245942'
          : '#8c5f18';

      const icon = L.divIcon({
        className: 'pl-map-marker-wrapper',
        html: `<div class="pl-price-pin" data-id="${item.id}"><span class="pl-pin-dot" style="background:${dotColor}"></span><span>${formatPriceCompact(
          item.price
        )}</span></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([item.lat, item.lng], { icon, riseOnHover: true });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedPinId(item.id);
      });
      marker.on('mouseover', () => onHoverListing(item.id));
      marker.on('mouseout', () => onHoverListing(null));

      marker.addTo(layer);
      markerMapRef.current.set(item.id, marker);
    }
  }, [allMatchingListings, onHoverListing]);

  // Sync active/hovered styling on pins without rebuilding markers
  useEffect(() => {
    for (const [id, marker] of markerMapRef.current.entries()) {
      const el = marker.getElement();
      if (!el) continue;
      const pin = el.querySelector('.pl-price-pin');
      if (!pin) continue;
      const isHighlighted = id === hoveredId || id === selectedPinId;
      pin.classList.toggle('pl-price-pin--active', isHighlighted);
      marker.setZIndexOffset(isHighlighted ? 900 : 0);
    }
  }, [hoveredId, selectedPinId]);

  const handleRegionJump = (region: string) => {
    const map = mapRef.current;
    onSelectRegion(region);
    onResetBounds();
    setSelectedPinId(null);
    if (!map) return;
    const vp = REGION_VIEWPORTS[region] || REGION_VIEWPORTS.All;
    programmaticMoveRef.current = true;
    map.flyTo(vp.center, vp.zoom, { duration: 0.65 });
  };

  const handleResetView = () => {
    const map = mapRef.current;
    onResetBounds();
    if (!map) return;
    const vp = REGION_VIEWPORTS[activeRegion] || REGION_VIEWPORTS.All;
    programmaticMoveRef.current = true;
    map.flyTo(vp.center, vp.zoom, { duration: 0.55 });
  };

  return (
    <div className="flex flex-col border border-[var(--rule)] bg-[var(--paper-raised)]">
      {/* Map Header Control Rail */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--rule)] bg-[var(--paper)] px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
            <Compass className="h-3.5 w-3.5 text-[var(--vermilion)]" />
            Atlas Filter
          </span>
          {QUICK_REGIONS.map((region) => {
            const active = activeRegion === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => handleRegionJump(region)}
                className={`cursor-pointer border px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                    : 'border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
                }`}
              >
                {region === 'All' ? 'All US' : region}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="pl-check-label inline-flex cursor-pointer items-center gap-1.5 font-mono-tech text-[11px] text-[var(--ink)] select-none">
            <input
              type="checkbox"
              checked={filterByMap}
              onChange={(e) => onToggleFilterByMap(e.target.checked)}
              className="pl-native-check h-3.5 w-3.5 cursor-pointer"
            />
            <span>Filter as I move map</span>
          </label>

          {hasActiveBounds && (
            <button
              type="button"
              onClick={handleResetView}
              className="inline-flex cursor-pointer items-center gap-1 border border-[var(--vermilion)] bg-[var(--vermilion-soft)] px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-wider text-[var(--vermilion)] transition-colors hover:bg-[var(--vermilion)] hover:text-white"
            >
              <LocateFixed className="h-3 w-3" />
              <span>Reset Map Area</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas */}
      <div className={`relative w-full overflow-hidden bg-[#eae5d9] ${heightClassName}`}>
        <div ref={containerRef} className="h-full w-full" aria-label="Interactive US property map filter" />

        {/* Top-left live count badge */}
        <div className="pointer-events-none absolute top-3 left-3 z-[400] flex items-center gap-2 border border-[var(--rule)] bg-[var(--paper-raised)]/95 px-2.5 py-1 font-mono-tech text-[11px] text-[var(--ink)] shadow-sm backdrop-blur-xs">
          <span>
            <strong>{visibleListings.length}</strong>{' '}
            {visibleListings.length === 1 ? 'home' : 'homes'} {hasActiveBounds ? 'in map area' : 'plotted'}
          </span>
          <span className="text-[var(--rule)]">·</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--ink-soft)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#8c5f18]" /> Rare
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#245942]" /> Deal
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#c6462b]" /> New
          </span>
        </div>

        {/* Selected Pin Floating Editorial Preview Card */}
        {selectedPin && (
          <div className="absolute right-3 bottom-3 left-3 z-[450] max-w-sm border border-[var(--ink)] bg-[var(--paper-raised)] shadow-xl sm:right-auto">
            <div className="flex">
              <div className="h-28 w-28 shrink-0 overflow-hidden bg-[var(--paper-inset)]">
                <PropertyImage
                  src={selectedPin.images[0]}
                  alt={selectedPin.title}
                  priority="low"
                  width={240}
                  height={240}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate font-mono-tech text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                      {selectedPin.city}, {selectedPin.state}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPinId(null)}
                      aria-label="Dismiss map preview"
                      className="cursor-pointer text-[var(--ink-soft)] hover:text-[var(--ink)]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h4 className="mt-0.5 line-clamp-1 font-serif-editorial text-lg leading-tight text-[var(--ink)]">
                    {selectedPin.title}
                  </h4>

                  <div className="mt-1 flex items-center gap-2 font-mono-tech text-xs">
                    <strong className="font-medium text-[var(--ink)]">
                      {formatCurrency(selectedPin.price)}
                    </strong>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] uppercase ${categoryBadgeClasses(
                        selectedPin.primaryCategory
                      )}`}
                    >
                      {categoryLabel(selectedPin.primaryCategory)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-mono-tech">
                  <span className="text-[var(--ink-soft)]">
                    {selectedPin.beds}bd · {selectedPin.baths}ba · {formatNumber(selectedPin.sqft)}sf
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onInspectListing(selectedPin)}
                      className="cursor-pointer font-medium text-[var(--ink)] underline underline-offset-2 hover:text-[var(--vermilion)]"
                    >
                      Dossier
                    </button>
                    <a
                      href={selectedPin.zillowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[var(--ink-soft)] hover:text-[var(--ink)]"
                      aria-label="Open on Zillow"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
