/**
 * Single entry point to read product / artisan / region / category / trusttag
 * data. Today reads from JSON seed; will swap to fetch() against the NestJS
 * API in a future Vague without changing any caller.
 *
 * All functions are async even when the underlying read is synchronous —
 * this preserves the API surface across the data layer migration.
 */
import type {
  Product,
  Artisan,
  Region,
  Category,
  TrustTag,
  CategorySlug,
  RegionSlug,
  SearchFilters,
} from '@medina/shared-types';

import productsSeed from '@/data/seed/products.json';
import artisansSeed from '@/data/seed/artisans.json';
import regionsSeed from '@/data/seed/regions.json';
import categoriesSeed from '@/data/seed/categories.json';
import trusttagsSeed from '@/data/seed/trusttags.json';

const PLACEHOLDER = '/images/seed/placeholder.svg';

/**
 * Phase 5 ships before real photos. Aliases every non-svg seed image path to
 * a single SVG placeholder. When real photos land at the paths referenced
 * inside products.json/artisans.json/categories.json, drop the alias.
 */
function resolveImage(path: string | undefined): string {
  if (!path) return PLACEHOLDER;
  if (path.startsWith('/images/seed/') && !path.endsWith('.svg')) return PLACEHOLDER;
  return path;
}

const products = (productsSeed as Product[]).map((p) => ({
  ...p,
  photos: p.photos.map(resolveImage),
}));

const artisans = (artisansSeed as Artisan[]).map((a) => ({
  ...a,
  portrait: resolveImage(a.portrait),
  workshopPhoto: a.workshopPhoto ? resolveImage(a.workshopPhoto) : undefined,
}));

const regions = regionsSeed as Region[];

const categories = (categoriesSeed as Category[]).map((c) => ({
  ...c,
  heroImage: resolveImage(c.heroImage),
}));

const trusttags = trusttagsSeed as TrustTag[];

// ── Products ───────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByArtisan(artisanId: string): Promise<Product[]> {
  return products.filter((p) => p.artisanId === artisanId);
}

export async function getProductsByCategory(slug: CategorySlug): Promise<Product[]> {
  return products.filter((p) => p.category === slug);
}

export async function getProductsByRegion(slug: RegionSlug): Promise<Product[]> {
  return products.filter((p) => p.region === slug);
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const target = products.find((p) => p.id === productId);
  if (!target) return [];
  // Same artisan first, then same category, exclude self.
  const sameArtisan = products.filter(
    (p) => p.artisanId === target.artisanId && p.id !== target.id,
  );
  const sameCategory = products.filter(
    (p) => p.category === target.category && p.artisanId !== target.artisanId,
  );
  return [...sameArtisan, ...sameCategory].slice(0, limit);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  // Most recent published first.
  return [...products].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
}

// ── Artisans ───────────────────────────────────────────────────────────────

export async function getAllArtisans(): Promise<Artisan[]> {
  return artisans.filter((a) => a.isPublic);
}

export async function getArtisanBySlug(slug: string): Promise<Artisan | null> {
  return artisans.find((a) => a.slug === slug) ?? null;
}

export async function getArtisanById(id: string): Promise<Artisan | null> {
  return artisans.find((a) => a.id === id) ?? null;
}

// ── Regions ────────────────────────────────────────────────────────────────

export async function getRegions(): Promise<Region[]> {
  return regions;
}

export async function getRegionBySlug(slug: RegionSlug): Promise<Region | null> {
  return regions.find((r) => r.slug === slug) ?? null;
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategoryBySlug(slug: CategorySlug): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

// ── TrustTags ──────────────────────────────────────────────────────────────

export async function getTrustTagById(id: string): Promise<TrustTag | null> {
  return trusttags.find((t) => t.trusttagId === id) ?? null;
}

// ── Search ─────────────────────────────────────────────────────────────────

export async function searchProducts(filters: SearchFilters): Promise<Product[]> {
  let results = products;

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

  // Sort
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
