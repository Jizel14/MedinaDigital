/**
 * Public data layer entry point.
 *
 * Picks the source at module-load time based on MEDINA_DATA_SOURCE:
 *   - "seed" (default): reads from apps/web/src/data/seed JSON files. The
 *     marketplace boots with no API dependency. Used for static export, dev
 *     without the API running, and Vague A parity.
 *   - "api": fetches against MEDINA_API_URL on every call. Once SaaS-created
 *     products land in the DB they appear in the public marketplace.
 *
 * The two sources expose the same async signatures, so callers don't change.
 *
 * NOTE: a couple of read functions only have seed implementations today
 * (TrustTag, search facets). The api source falls back to seed for those.
 */
import * as seed from './sources/seed';
import * as api from './sources/api';

const SOURCE = (process.env.MEDINA_DATA_SOURCE ?? 'seed') as 'seed' | 'api';

const impl = SOURCE === 'api' ? api : seed;

export const getAllProducts = impl.getAllProducts;
export const getProductBySlug = impl.getProductBySlug;
export const getProductsByArtisan = impl.getProductsByArtisan;
export const getProductsByCategory = impl.getProductsByCategory;
export const getProductsByRegion = impl.getProductsByRegion;
export const getRelatedProducts = impl.getRelatedProducts;
export const getFeaturedProducts = impl.getFeaturedProducts;

export const getAllArtisans = impl.getAllArtisans;
export const getArtisanBySlug = impl.getArtisanBySlug;
export const getArtisanById = impl.getArtisanById;

export const getRegions = impl.getRegions;
export const getRegionBySlug = impl.getRegionBySlug;

export const getCategories = impl.getCategories;
export const getCategoryBySlug = impl.getCategoryBySlug;

// Functions not yet implemented in the api source — always seed.
export const getTrustTagById = seed.getTrustTagById;
export const searchProducts = SOURCE === 'api' ? api.searchProducts : seed.searchProducts;
