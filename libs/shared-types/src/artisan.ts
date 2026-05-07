import type { Localized } from './locale';
import type { RegionSlug } from './region';
import type { CategorySlug } from './category';

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
