import type { Localized } from './locale';

export const CATEGORY_SLUGS = ['ceramics', 'textile', 'leather', 'jewelry', 'wood'] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type CategoryIconKey = 'pottery' | 'loom' | 'awl' | 'gem' | 'chisel';

export interface Category {
  slug: CategorySlug;
  name: Localized<string>;
  description: Localized<string>;
  iconKey: CategoryIconKey;
  heroImage: string;
}
