import type { Localized } from './locale';
import type { CategorySlug } from './category';
import type { RegionSlug } from './region';

export interface ProductDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ProductMaterial {
  name: Localized<string>;
  percentage: number;
  origin?: string;
  recycledContent?: number;
  certifications?: string[];
}

export interface Product {
  id: string;
  slug: string;
  artisanId: string;
  category: CategorySlug;
  region: RegionSlug;

  title: Localized<string>;
  descriptionShort: Localized<string>;
  descriptionLong: Localized<string>;
  story: Localized<string>;

  materials: ProductMaterial[];
  dimensions: ProductDimensions;
  weightG: number;

  priceTnd: number;
  priceEur: number;

  photos: string[];
  arModelUrl?: string;

  trusttagId: string;
  publishedAt: string;
  customRequest: boolean;
}
