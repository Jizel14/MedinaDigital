import type { Localized } from './locale.js';
import type { RegionSlug } from './region.js';
import type { CategorySlug } from './category.js';

export interface Artisan {
  id: string;
  slug: string;
  name: string;
  nameLocalized?: Localized<string>;
  yearsOfPractice: number;
  region: RegionSlug;
  primaryCategory: CategorySlug;
  story: Localized<string>;
  shortBio: Localized<string>;
  portrait: string;
  workshopPhoto?: string;
  isPublic: boolean;
}
