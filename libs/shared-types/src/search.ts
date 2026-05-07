import type { CategorySlug } from './category.js';
import type { RegionSlug } from './region.js';

export type SortKey = 'newest' | 'price-asc' | 'price-desc';

export interface SearchFilters {
  category?: CategorySlug;
  region?: RegionSlug;
  material?: string;
  priceMin?: number;
  priceMax?: number;
  verifiedOnly?: boolean;
  sort?: SortKey;
  q?: string;
}
