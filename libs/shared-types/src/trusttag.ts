import type { Localized } from './locale.js';
import type { RegionSlug } from './region.js';
import type { ProductMaterial } from './product.js';

export type EnergySource = 'grid' | 'solar' | 'mixed';

export interface TrustTagDpp {
  productId: string;
  trusttagId: string;
  gtin?: string;

  countryOfOrigin: 'TN';
  region: RegionSlug;
  artisan: {
    id: string;
    name: string;
    workshopRegion: string;
  };

  materials: ProductMaterial[];

  carbonFootprintKgCo2e: number | null;
  waterUsageLiters: number | null;
  energySource: EnergySource | null;

  expectedLifetimeYears: number | null;
  careInstructions: Localized<string>;
  repairOptions: Localized<string> | null;
  endOfLife: Localized<string>;

  productionDate: string;
  batchId: string | null;
  certifications: string[];

  verifiedAt: string;
  verifiedBy: 'medina-digital';
}

export type TrustTag = TrustTagDpp;
