import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import type { PropertyListing } from '../types';
import { getStateName } from '../utils/format';

interface LocationSuggestion {
  id: string;
  type: 'city' | 'state' | 'zip' | 'region';
  label: string;
  sublabel: string;
  queryValue: string;
  count: number;
}

interface LocationSearchProps {
  value: string;
  listings: PropertyListing[];
  onChange: (value: string) => void;
}

export function LocationSearch({ value, listings, onChange }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Build deduplicated location index from active listings
  const index = useMemo<LocationSuggestion[]>(() => {
    const cityMap = new Map<string, LocationSuggestion>();
    const stateMap = new Map<string, LocationSuggestion>();
    const regionMap = new Map<string, LocationSuggestion>();

    for (const item of listings) {
      const cityKey = `${item.city}|${item.state}`;
      const existingCity = cityMap.get(cityKey);
      if (existingCity) {
        existingCity.count += 1;
      } else {
        cityMap.set(cityKey, {
          id: `city-${item.city}-${item.state}`,
          type: 'city',
          label: `${item.city}, ${item.state}`,
          sublabel: `ZIP ${item.zip} · ${getStateName(item.state)}`,
          queryValue: `${item.city}, ${item.state}`,
          count: 1,
        });
      }

      const existingState = stateMap.get(item.state);
      if (existingState) {
        existingState.count += 1;
      } else {
        const full = getStateName(item.state);
        stateMap.set(item.state, {
          id: `state-${item.state}`,
          type: 'state',
          label: full,
          sublabel: `State · ${item.state}`,
          queryValue: full,
          count: 1,
        });
      }

      const existingRegion = regionMap.get(item.region);
      if (existingRegion) {
        existingRegion.count += 1;
      } else {
        regionMap.set(item.region, {
          id: `region-${item.region}`,
          type: 'region',
          label: item.region,
          sublabel: 'US Region',
          queryValue: item.region,
          count: 1,
        });
      }
    }

    return [
      ...Array.from(stateMap.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
      ...Array.from(cityMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
      ...Array.from(regionMap.values()).sort((a, b) => b.count - a.count),
    ];
  }, [listings]);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) {
      // Show top popular states & regions when empty and focused
      const topStates = index.filter((s) => s.type === 'state').slice(0, 4);
      const topCities = index.filter((s) => s.type === 'city').slice(0, 4);
      return [...topStates, ...topCities];
    }

    return index
      .filter((s) => {
        const hay = `${s.label} ${s.sublabel} ${s.queryValue}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [index, value]);

  // Close dropdown on outside pointerdown
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const handleSelect = (item: LocationSuggestion) => {
    onChange(item.queryValue);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(suggestions.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="group flex h-10 items-center rounded-full border border-zinc-200/90 bg-zinc-100/80 px-3.5 transition-all hover:border-zinc-300 hover:bg-zinc-100 focus-within:border-zinc-950 focus-within:bg-white focus-within:shadow-sm">
        <Search
          className="h-4 w-4 shrink-0 text-zinc-400 transition-colors group-focus-within:text-zinc-950"
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 && suggestions[activeIndex] ? suggestions[activeIndex].id : undefined
          }
          aria-label="Search by city, state, or ZIP code"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search city, state, or ZIP code..."
          className="w-full bg-transparent px-2.5 text-[13.5px] text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
        />

        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear location search"
            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-200/90 text-zinc-600 transition-colors hover:bg-zinc-950 hover:text-white"
          >
            <X className="h-3 w-3" strokeWidth={2.25} />
          </button>
        )}
      </div>

      {/* Floating Glass Autocomplete Popover */}
      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Matching locations"
          className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 p-1.5 shadow-[0_16px_48px_-12px_rgba(9,9,11,0.18)] backdrop-blur-xl"
        >
          <li className="px-3 pt-1.5 pb-1 text-[11px] font-medium text-zinc-400">
            {value.trim() ? 'Matching locations' : 'Popular markets'}
          </li>
          {suggestions.map((item, idx) => {
            const active = idx === activeIndex;
            return (
              <li
                key={item.id}
                id={item.id}
                role="option"
                aria-selected={active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  active ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.85} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-zinc-950">
                      {item.label}
                    </div>
                    <div className="truncate text-[11px] text-zinc-500">{item.sublabel}</div>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 tabular-nums">
                  {item.count} {item.count === 1 ? 'home' : 'homes'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
