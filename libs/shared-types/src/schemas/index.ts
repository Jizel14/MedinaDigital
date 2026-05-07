import { z } from 'zod';
import { LOCALES, type Locale } from '../locale';
import { CATEGORY_SLUGS } from '../category';
import { REGION_SLUGS } from '../region';

const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const localeSchema = z.enum(LOCALES);

export const localizedStringSchema = z.object(
  Object.fromEntries(LOCALES.map((l) => [l, z.string().min(1)])) as Record<Locale, z.ZodString>,
);

export const localizedShortStringSchema = z.object(
  Object.fromEntries(LOCALES.map((l) => [l, z.string().min(1).max(160)])) as Record<
    Locale,
    z.ZodString
  >,
);

export const categorySlugSchema = z.enum(CATEGORY_SLUGS);
export const regionSlugSchema = z.enum(REGION_SLUGS);

export const categorySchema = z.object({
  slug: categorySlugSchema,
  name: localizedStringSchema,
  description: localizedStringSchema,
  iconKey: z.enum(['pottery', 'loom', 'awl', 'gem', 'chisel']),
  heroImage: z.string().min(1),
});

export const regionSchema = z.object({
  slug: regionSlugSchema,
  name: localizedStringSchema,
  description: localizedStringSchema,
  mapCoords: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
  knownFor: z.array(categorySlugSchema).min(1),
});

export const artisanSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(slugRegex),
  name: z.string().min(1),
  nameLocalized: localizedStringSchema.optional(),
  yearsOfPractice: z.number().int().min(0).max(80),
  region: regionSlugSchema,
  primaryCategory: categorySlugSchema,
  story: localizedStringSchema,
  shortBio: localizedStringSchema,
  portrait: z.string().min(1),
  workshopPhoto: z.string().min(1).optional(),
  isPublic: z.boolean(),
});

export const productMaterialSchema = z.object({
  name: localizedStringSchema,
  percentage: z.number().min(0).max(100),
  origin: z.string().optional(),
  recycledContent: z.number().min(0).max(100).optional(),
  certifications: z.array(z.string()).optional(),
});

export const productSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().regex(slugRegex),
    artisanId: z.string().min(1),
    category: categorySlugSchema,
    region: regionSlugSchema,
    title: localizedStringSchema,
    descriptionShort: localizedShortStringSchema,
    descriptionLong: localizedStringSchema,
    story: localizedStringSchema,
    materials: z.array(productMaterialSchema).min(1),
    dimensions: z.object({
      lengthCm: z.number().positive(),
      widthCm: z.number().positive(),
      heightCm: z.number().positive(),
    }),
    weightG: z.number().positive(),
    priceTnd: z.number().positive(),
    priceEur: z.number().positive(),
    photos: z.array(z.string().min(1)).min(3),
    arModelUrl: z.string().optional(),
    trusttagId: z.string().min(1),
    publishedAt: z.string().datetime({ offset: true }).or(z.string().date()),
    customRequest: z.boolean(),
  })
  .refine((p) => Math.abs(p.materials.reduce((s, m) => s + m.percentage, 0) - 100) < 1, {
    message: 'materials percentages must sum to ~100',
    path: ['materials'],
  });

export const trustTagSchema = z.object({
  productId: z.string().min(1),
  trusttagId: z.string().min(1),
  gtin: z.string().optional(),
  countryOfOrigin: z.literal('TN'),
  region: regionSlugSchema,
  artisan: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    workshopRegion: z.string().min(1),
  }),
  materials: z.array(productMaterialSchema).min(1),
  carbonFootprintKgCo2e: z.number().nullable(),
  waterUsageLiters: z.number().nullable(),
  energySource: z.enum(['grid', 'solar', 'mixed']).nullable(),
  expectedLifetimeYears: z.number().int().positive().nullable(),
  careInstructions: localizedStringSchema,
  repairOptions: localizedStringSchema.nullable(),
  endOfLife: localizedStringSchema,
  productionDate: z.string().datetime({ offset: true }).or(z.string().date()),
  batchId: z.string().nullable(),
  certifications: z.array(z.string()),
  verifiedAt: z.string().datetime({ offset: true }).or(z.string().date()),
  verifiedBy: z.literal('medina-digital'),
});

export const seedFileSchemas = {
  categories: z.array(categorySchema),
  regions: z.array(regionSchema),
  artisans: z.array(artisanSchema),
  products: z.array(productSchema),
  trusttags: z.array(trustTagSchema),
};

export type SeedKey = keyof typeof seedFileSchemas;
