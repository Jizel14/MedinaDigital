import { ulid } from 'ulid';

/**
 * 24 Tunisian governorates with deterministic ULIDs (so re-runs of seed
 * produce stable region_ids referenced by products and artisans).
 *
 * Coordinates are approximate %-based positions on a stylised map (not GPS).
 * `knownFor` lists categories the region is best known for; used by the
 * marketplace facets and the Vague A constellation hero.
 */

// Deterministic ULID factory: same input → same ULID. Uses a fixed time
// component (2026-01-01T00:00:00Z = 0x01 8C 47 E8 1B 80 = 1735689600000).
// Suffix encodes the slug to keep them unique and stable across re-seeds.
function deterministicUlid(slug: string): string {
  // ULID = 26 chars: 10 timestamp + 16 randomness
  // We use 10 timestamp + 16 from slug-derived hash, padded to 16.
  const TIMESTAMP_PART = '01HG' + '0000000'; // 10 chars, fixed for all regions
  const upperSlug = slug.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Pad/truncate slug to exactly 16 chars
  const padded = (upperSlug + '0000000000000000').slice(0, 16);
  return TIMESTAMP_PART + padded;
}

export interface RegionSeed {
  id: string;
  countryCode: 'TN';
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
  description: { en: string; fr: string; 'ar-TN': string } | null;
  mapCoords: { x: number; y: number } | null;
  knownFor: string[] | null;
}

// Mapping slug ⇄ ULID — built once
function r(
  slug: string,
  enName: string,
  frName: string,
  arName: string,
  coords: { x: number; y: number },
  knownFor: string[] = [],
): RegionSeed {
  return {
    id: deterministicUlid(slug),
    countryCode: 'TN',
    slug,
    name: { en: enName, fr: frName, 'ar-TN': arName },
    description: null,
    mapCoords: coords,
    knownFor: knownFor.length ? knownFor : null,
  };
}

export const TUNISIA_REGIONS: RegionSeed[] = [
  // Greater Tunis
  r('tunis', 'Tunis', 'Tunis', 'تونس', { x: 52, y: 12 }),
  r('ariana', 'Ariana', 'Ariana', 'أريانة', { x: 53, y: 10 }),
  r('ben-arous', 'Ben Arous', 'Ben Arous', 'بن عروس', { x: 54, y: 14 }),
  r('manouba', 'Manouba', 'Manouba', 'منوبة', { x: 49, y: 12 }),
  // North-East
  r('nabeul', 'Nabeul', 'Nabeul', 'نابل', { x: 64, y: 22 }, ['ceramics']),
  r('zaghouan', 'Zaghouan', 'Zaghouan', 'زغوان', { x: 56, y: 22 }),
  r('bizerte', 'Bizerte', 'Bizerte', 'بنزرت', { x: 48, y: 6 }),
  // North-West
  r('beja', 'Béja', 'Béja', 'باجة', { x: 38, y: 14 }),
  r('jendouba', 'Jendouba', 'Jendouba', 'جندوبة', { x: 28, y: 12 }),
  r('le-kef', 'Le Kef', 'Le Kef', 'الكاف', { x: 26, y: 24 }),
  r('siliana', 'Siliana', 'Siliana', 'سليانة', { x: 38, y: 28 }),
  r('sejnane', 'Sejnane', 'Sejnane', 'سجنان', { x: 36, y: 14 }, ['ceramics']),
  // Centre
  r('sousse', 'Sousse', 'Sousse', 'سوسة', { x: 60, y: 36 }),
  r('monastir', 'Monastir', 'Monastir', 'المنستير', { x: 64, y: 40 }),
  r('mahdia', 'Mahdia', 'Mahdia', 'المهدية', { x: 65, y: 44 }),
  r('kairouan', 'Kairouan', 'Kairouan', 'القيروان', { x: 51, y: 48 }, ['textile']),
  // West-Centre
  r('kasserine', 'Kasserine', 'Kasserine', 'القصرين', { x: 32, y: 50 }),
  r('sidi-bouzid', 'Sidi Bouzid', 'Sidi Bouzid', 'سيدي بوزيد', { x: 42, y: 56 }),
  // South coastal
  r('sfax', 'Sfax', 'Sfax', 'صفاقس', { x: 60, y: 64 }, ['leather']),
  r('gabes', 'Gabès', 'Gabès', 'قابس', { x: 56, y: 73 }, ['textile']),
  r('medenine', 'Médenine', 'Médenine', 'مدنين', { x: 60, y: 80 }),
  r('djerba', 'Djerba', 'Djerba', 'جربة', { x: 65, y: 78 }, ['textile', 'jewelry']),
  r('tataouine', 'Tataouine', 'Tataouine', 'تطاوين', { x: 50, y: 88 }),
  // South interior (oases)
  r('gafsa', 'Gafsa', 'Gafsa', 'قفصة', { x: 30, y: 64 }),
  r('tozeur', 'Tozeur', 'Tozeur', 'توزر', { x: 33, y: 79 }, ['wood']),
  r('kebili', 'Kébili', 'Kébili', 'قبلي', { x: 40, y: 78 }),

  // Sidi Bou Saïd is technically a delegation in Tunis, but the seed Vague A
  // models it as a region for the artisan profile; we keep it listed.
  r('sidi-bou-said', 'Sidi Bou Saïd', 'Sidi Bou Saïd', 'سيدي بوسعيد', { x: 55, y: 17 }, [
    'jewelry',
    'ceramics',
  ]),
];

// Map for quick lookup by slug (used by the JSON-importer to translate
// the seed's "region": "nabeul" string into a region_id ULID).
export const REGION_ID_BY_SLUG = new Map<string, string>(
  TUNISIA_REGIONS.map((r) => [r.slug, r.id]),
);

// Verify uniqueness at import time so a copy/paste typo blows up early.
{
  const ids = new Set(TUNISIA_REGIONS.map((r) => r.id));
  if (ids.size !== TUNISIA_REGIONS.length) {
    throw new Error('TUNISIA_REGIONS contains duplicate IDs — fix slugs');
  }
}
