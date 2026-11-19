export type CategoryKey = 'exceptional' | 'deal' | 'new';
export type FilterLens = 'all' | CategoryKey | 'saved';
export type SortMode = 'score' | 'newest' | 'discount' | 'price-asc' | 'price-desc';

export interface ScoreBreakdown {
  overall: number;
  rarity: number;
  deal: number;
  freshness: number;
}

export interface PropertyListing {
  id: string;
  zpid: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  region: string;
  price: number;
  previousPrice: number;
  pricePerSqft: number;
  zipMedianPricePerSqft: number;
  medianDeltaPct: number;
  priceCutPct: number;
  beds: number;
  baths: number;
  sqft: number;
  lotAcres: number;
  yearBuilt: number;
  daysOnMarket: number;
  status: string;
  architecturalStyle: string;
  raritySignals: string[];
  editorialNote: string;
  zillowUrl: string;
  images: string[];
  source: string;
  submittedBy?: string;
  scores: ScoreBreakdown;
  categories: CategoryKey[];
  primaryCategory: CategoryKey;
  firstSeenAt: string;
  lastVerifiedAt: string;
  isNewToday?: boolean;
}

export interface ListingsSummary {
  activeCount: number;
  addedToday: number;
  removedToday: number;
  priceDropsToday: number;
  avgMedianDeltaPct: number;
  exceptionalCount: number;
  dealCount: number;
  newToMarketCount: number;
}

export interface ListingsFeed {
  editionNumber: number;
  syncedAt: string;
  provider: string;
  summary: ListingsSummary;
  listings: PropertyListing[];
}

export interface RemovedProperty {
  id: string;
  title: string;
  city: string;
  state: string;
  finalPrice: number;
  daysOnMarket: number;
  reason: string;
  removedAt: string;
  architecturalStyle: string;
}

export interface SyncRunEntry {
  editionNumber: number;
  syncedAt: string;
  provider: string;
  addedCount: number;
  removedCount: number;
  priceDropsCount: number;
  added: Array<{
    id: string;
    title: string;
    city: string;
    state: string;
    price: number;
    score: number;
  }>;
  removed: RemovedProperty[];
  priceDrops: Array<{
    id: string;
    title: string;
    oldPrice: number;
    newPrice: number;
    dropPct: number;
  }>;
}

export interface ChangelogFeed {
  lastSyncedAt: string;
  totalRemovedUnderContract: number;
  runs: SyncRunEntry[];
  removedArchive: RemovedProperty[];
}

export interface FilterState {
  lens: FilterLens;
  region: string;
  maxPrice: number;
  sort: SortMode;
  query: string;
}

