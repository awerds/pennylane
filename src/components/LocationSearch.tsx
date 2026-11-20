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
  variant?: 'light' | 'glass-blue';
  onChange: (value: string) => void;
}

export function LocationSearch({
  value,
  listings,
  variant = 'light',
  onChange,
}: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

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
      ...Array.from(stateMap.values()).sort(
        (a, b) => b.count - a.count || a.label.localeCompare(b.label)
      ),
      ...Array.from(cityMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
      ...Array.from(regionMap.values()).sort((a, b) => b.count - a.count),
    ];
  }, [listings]);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) {
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

  const isBlueGlass = variant === 'glass-blue';

  return (
    <div ref={wrapperRef} className="relative w-full min-w-0 max-w-xl">
      <div
        className={`group flex min-h-[44px] items-center rounded-full border px-3.5 transition-all md:min-h-[40px] md:h-10 ${
          isBlueGlass
            ? 'border-white/25 bg-white/14 backdrop-blur-md hover:border-white/40 hover:bg-white/20 focus-within:border-white focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-950/25'
            : 'border-slate-200/90 bg-slate-100/75 hover:border-blue-300/80 hover:bg-white focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15'
        }`}
      >
        <Search
          className={`h-4 w-4 shrink-0 transition-colors ${
            isBlueGlass
              ? 'text-sky-100/85 group-focus-within:text-blue-700'
              : 'text-slate-400 group-focus-within:text-blue-600'
          }`}
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
          placeholder="Search city, state, or ZIP..."
          className={`w-full bg-transparent px-2.5 text-base focus:outline-none md:text-[13.5px] ${
            isBlueGlass
              ? 'text-white placeholder:text-sky-100/75 group-focus-within:text-slate-950 group-focus-within:placeholder:text-slate-400'
              : 'text-slate-950 placeholder:text-slate-400'
          }`}
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
            className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
              isBlueGlass
                ? 'bg-white/25 text-white hover:bg-white hover:text-blue-950 group-focus-within:bg-slate-200 group-focus-within:text-slate-700'
                : 'bg-slate-200/90 text-slate-600 hover:bg-slate-950 hover:text-white'
            }`}
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
          className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 text-slate-950 shadow-[0_16px_48px_-12px_rgba(12,45,87,0.28)] backdrop-blur-xl"
        >
          <li className="px-3 pt-1.5 pb-1 text-[11px] font-medium text-slate-400">
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
                  active ? 'bg-blue-50 text-blue-950' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.85} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-slate-950">
                      {item.label}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">{item.sublabel}</div>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 tabular-nums">
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
