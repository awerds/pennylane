export type CategoryKey = 'exceptional' | 'deal' | 'new';
export type FilterLens = 'all' | 'steals' | CategoryKey | 'saved';
export type SortMode =
  | 'deal-value'
  | 'savings'
  | 'score'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'sqft-desc';
export type StyleGroup = 'all' | 'modern' | 'historic' | 'reuse' | 'desert' | 'coastal';

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
  lat: number;
  lng: number;
  price: number;
  previousPrice: number;
  zestimate: number;
  estimatedSavings: number;
  zestimateDeltaPct: number;
  dealTier: 1 | 2 | 3 | 4 | 5;
  dealLabel: string;
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
  statesCovered: number;
  stealCount: number;
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
  locationQuery: string;
  minPrice: number;
  maxPrice: number;
  minBeds: number;
  minBaths: number;
  minSqft: number;
  minDealTier: number;
  styleGroup: StyleGroup;
  priceCutsOnly: boolean;
  belowMedianOnly: boolean;
  sort: SortMode;
}
