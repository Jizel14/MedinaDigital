/**
 * API-backed data source. Reads the public NestJS endpoints and shapes results
 * to the @medina/shared-types contract used by the public site.
 *
 * The API uses regionId (ULID) + primaryCategorySlug, but shared-types Product/
 * Artisan expose `region` / `primaryCategory` slugs. We translate via a
 * regions-by-id map fetched lazily and cached for the process lifetime.
 *
 * Today: delegates to the seed for any operation not yet exposed by the API
 * (TrustTag fetch, getRelatedProducts/getFeaturedProducts ranking, search
 * facets). As the API grows, those fall-throughs go away.
 */
import type {
  Artisan,
  Category,
  CategorySlug,
  Product,
  Region,
  RegionSlug,
  SearchFilters,
} from '@medina/shared-types';
import { apiUrl } from '@/lib/auth/config';
import * as seed from './seed';

interface ApiProduct {
  id: string;
  slug: string;
  artisanId: string | null;
  tenantId: string | null;
  categorySlug: string;
  regionId: string;
  title: { en: string; fr: string; 'ar-TN': string };
  descriptionShort: { en: string; fr: string; 'ar-TN': string };
  descriptionLong: { en: string; fr: string; 'ar-TN': string };
  story: { en: string; fr: string; 'ar-TN': string };
  dimensions: { lengthCm: number; widthCm: number; heightCm: number };
  weightG: number;
  priceTnd: string;
  priceEur: string;
  photos: string[];
  arModelUrl: string | null;
  trusttagId: string;
  publishedAt: string;
  customRequest: boolean;
  materials: Array<{
    name: { en: string; fr: string; 'ar-TN': string };
    percentage: string;
    origin: string | null;
    recycledContent: number | null;
    certifications: string[] | null;
  }>;
}

interface ApiArtisan {
  id: string;
  slug: string;
  name: string;
  nameLocalized: { en: string; fr: string; 'ar-TN': string } | null;
  yearsOfPractice: number;
  regionId: string;
  primaryCategorySlug: string;
  story: { en: string; fr: string; 'ar-TN': string };
  shortBio: { en: string; fr: string; 'ar-TN': string };
  portrait: string;
  workshopPhoto: string | null;
  isPublic: boolean;
}

interface ApiRegion {
  id: string;
  slug: string;
  countryCode: string;
  name: { en: string; fr: string; 'ar-TN': string };
  description: { en: string; fr: string; 'ar-TN': string } | null;
  mapCoords: { x: number; y: number } | null;
  knownFor: string[] | null;
}

interface ApiCategory {
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
  description: { en: string; fr: string; 'ar-TN': string };
  iconKey: string;
  heroImage: string;
}

let regionByIdCache: Map<string, ApiRegion> | null = null;

async function loadRegions(): Promise<Map<string, ApiRegion>> {
  if (regionByIdCache) return regionByIdCache;
  const res = await fetch(`${apiUrl()}/api/regions`, { cache: 'no-store' });
  const list = (await res.json()) as ApiRegion[];
  regionByIdCache = new Map(list.map((r) => [r.id, r]));
  return regionByIdCache;
}

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${apiUrl()}${path}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function shapeProduct(p: ApiProduct, regions: Map<string, ApiRegion>): Promise<Product> {
  const region = regions.get(p.regionId);
  return {
    id: p.id,
    slug: p.slug,
    artisanId: p.artisanId ?? '',
    category: p.categorySlug as CategorySlug,
    region: (region?.slug ?? 'tunis') as RegionSlug,
    title: p.title,
    descriptionShort: p.descriptionShort,
    descriptionLong: p.descriptionLong,
    story: p.story,
    dimensions: p.dimensions,
    weightG: p.weightG,
    priceTnd: Number(p.priceTnd),
    priceEur: Number(p.priceEur),
    photos: p.photos,
    arModelUrl: p.arModelUrl ?? undefined,
    trusttagId: p.trusttagId,
    publishedAt: p.publishedAt,
    customRequest: p.customRequest,
    materials: p.materials.map((m) => ({
      name: m.name,
      percentage: Number(m.percentage),
      origin: m.origin ?? undefined,
      recycledContent: m.recycledContent ?? undefined,
      certifications: m.certifications ?? undefined,
    })),
  };
}

function shapeArtisan(a: ApiArtisan, regions: Map<string, ApiRegion>): Artisan {
  const region = regions.get(a.regionId);
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    nameLocalized: a.nameLocalized ?? undefined,
    yearsOfPractice: a.yearsOfPractice,
    region: (region?.slug ?? 'tunis') as RegionSlug,
    primaryCategory: a.primaryCategorySlug as CategorySlug,
    story: a.story,
    shortBio: a.shortBio,
    portrait: a.portrait,
    workshopPhoto: a.workshopPhoto ?? undefined,
    isPublic: a.isPublic,
  };
}

// ── Products ───────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const [list, regions] = await Promise.all([get<ApiProduct[]>('/api/products'), loadRegions()]);
  if (!list) return [];
  return Promise.all(list.map((p) => shapeProduct(p, regions)));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [p, regions] = await Promise.all([
    get<ApiProduct>(`/api/products/${encodeURIComponent(slug)}`),
    loadRegions(),
  ]);
  if (!p) return null;
  return shapeProduct(p, regions);
}

export async function getProductsByArtisan(artisanId: string): Promise<Product[]> {
  // No direct endpoint by id — fetch all and filter. Acceptable for now (small N).
  const all = await getAllProducts();
  return all.filter((p) => p.artisanId === artisanId);
}

export async function getProductsByCategory(slug: CategorySlug): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === slug);
}

export async function getProductsByRegion(slug: RegionSlug): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.region === slug);
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const all = await getAllProducts();
  const target = all.find((p) => p.id === productId);
  if (!target) return [];
  const sameArtisan = all.filter((p) => p.artisanId === target.artisanId && p.id !== target.id);
  const sameCategory = all.filter(
    (p) => p.category === target.category && p.artisanId !== target.artisanId,
  );
  return [...sameArtisan, ...sameCategory].slice(0, limit);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const all = await getAllProducts();
  return [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
}

// ── Artisans ───────────────────────────────────────────────────────────────

export async function getAllArtisans(): Promise<Artisan[]> {
  // No public list endpoint yet — fall back to seed for the marketplace listing.
  // (B-3 will add /api/artisans for the full marketplace.)
  return seed.getAllArtisans();
}

export async function getArtisanBySlug(slug: string): Promise<Artisan | null> {
  const [a, regions] = await Promise.all([
    get<ApiArtisan>(`/api/artisans/${encodeURIComponent(slug)}`),
    loadRegions(),
  ]);
  if (!a) return null;
  return shapeArtisan(a, regions);
}

export async function getArtisanById(id: string): Promise<Artisan | null> {
  // No GET-by-id endpoint — list all + filter (small N).
  const all = await getAllArtisans();
  return all.find((a) => a.id === id) ?? null;
}

// ── Regions ────────────────────────────────────────────────────────────────

export async function getRegions(): Promise<Region[]> {
  const list = await get<ApiRegion[]>('/api/regions');
  if (!list) return [];
  return list.map((r) => ({
    slug: r.slug as RegionSlug,
    name: r.name,
    description: r.description ?? { en: '', fr: '', 'ar-TN': '' },
    mapCoords: r.mapCoords ?? { x: 0, y: 0 },
    knownFor: (r.knownFor ?? []) as CategorySlug[],
  }));
}

export async function getRegionBySlug(slug: RegionSlug): Promise<Region | null> {
  const all = await getRegions();
  return all.find((r) => r.slug === slug) ?? null;
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const list = await get<ApiCategory[]>('/api/categories');
  if (!list) return [];
  return list.map((c) => ({
    slug: c.slug as CategorySlug,
    name: c.name,
    description: c.description,
    iconKey: c.iconKey as Category['iconKey'],
    heroImage: c.heroImage,
  }));
}

export async function getCategoryBySlug(slug: CategorySlug): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

// ── Search ─────────────────────────────────────────────────────────────────

export async function searchProducts(filters: SearchFilters): Promise<Product[]> {
  // No /api/products?search yet — load all + filter client-side.
  let results = await getAllProducts();

  if (filters.category) results = results.filter((p) => p.category === filters.category);
  if (filters.region) results = results.filter((p) => p.region === filters.region);
  if (filters.priceMin != null) results = results.filter((p) => p.priceEur >= filters.priceMin!);
  if (filters.priceMax != null) results = results.filter((p) => p.priceEur <= filters.priceMax!);
  if (filters.material) {
    const q = filters.material.toLowerCase();
    results = results.filter((p) =>
      p.materials.some((m) => Object.values(m.name).some((n) => n.toLowerCase().includes(q))),
    );
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter((p) =>
      Object.values(p.title).some((t) => t.toLowerCase().includes(q)),
    );
  }
  switch (filters.sort) {
    case 'price-asc':
      results = [...results].sort((a, b) => a.priceEur - b.priceEur);
      break;
    case 'price-desc':
      results = [...results].sort((a, b) => b.priceEur - a.priceEur);
      break;
    case 'newest':
    default:
      results = [...results].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
  return results;
}
