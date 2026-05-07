import type { Localized } from './locale.js';
import type { CategorySlug } from './category.js';

export const REGION_SLUGS = [
  'nabeul',
  'sejnane',
  'kairouan',
  'sfax',
  'sidi-bou-said',
  'djerba',
  'tozeur',
  'gabes',
] as const;
export type RegionSlug = (typeof REGION_SLUGS)[number];

export interface Region {
  slug: RegionSlug;
  name: Localized<string>;
  description: Localized<string>;
  /** Coordinates on the stylised Tunisia SVG map (% of viewport, 0-100). */
  mapCoords: { x: number; y: number };
  knownFor: CategorySlug[];
}
