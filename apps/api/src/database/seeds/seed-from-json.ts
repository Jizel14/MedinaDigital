/**
 * Seed MySQL from the Vague A JSON files committed under apps/web/src/data/seed/.
 *
 * Idempotent: deletes everything in the right order then inserts. Safe to re-run
 * after schema changes or seed JSON updates.
 *
 * Run:    pnpm --filter @medina/api db:seed
 * Env:    reads apps/api/.env (MYSQL_*)
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { ulid } from 'ulid';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { Country } from '../../modules/countries/country.entity';
import { Region } from '../../modules/regions/region.entity';
import { Category } from '../../modules/categories/category.entity';
import { Artisan } from '../../modules/artisans/artisan.entity';
import { User } from '../../modules/auth/entities/user.entity';
import { Product } from '../../modules/products/product.entity';
import { ProductMaterial } from '../../modules/products/product-material.entity';
import { TrustTag } from '../../modules/trusttag/trusttag.entity';
import { TUNISIA_REGIONS, REGION_ID_BY_SLUG } from './regions-seed';

loadEnv({ path: resolve(__dirname, '../../../.env') });

const REPO_ROOT = resolve(__dirname, '../../../../../');
const SEED_DIR = resolve(REPO_ROOT, 'apps/web/src/data/seed');

interface JsonProduct {
  id: string;
  slug: string;
  artisanId: string;
  category: string;
  region: string;
  title: { en: string; fr: string; 'ar-TN': string };
  descriptionShort: { en: string; fr: string; 'ar-TN': string };
  descriptionLong: { en: string; fr: string; 'ar-TN': string };
  story: { en: string; fr: string; 'ar-TN': string };
  materials: Array<{
    name: { en: string; fr: string; 'ar-TN': string };
    percentage: number;
    origin?: string;
    recycledContent?: number;
    certifications?: string[];
  }>;
  dimensions: { lengthCm: number; widthCm: number; heightCm: number };
  weightG: number;
  priceTnd: number;
  priceEur: number;
  photos: string[];
  trusttagId: string;
  publishedAt: string;
  customRequest: boolean;
}

interface JsonArtisan {
  id: string;
  slug: string;
  name: string;
  yearsOfPractice: number;
  region: string;
  primaryCategory: string;
  story: { en: string; fr: string; 'ar-TN': string };
  shortBio: { en: string; fr: string; 'ar-TN': string };
  portrait: string;
  workshopPhoto?: string;
  isPublic: boolean;
}

interface JsonCategory {
  slug: string;
  name: { en: string; fr: string; 'ar-TN': string };
  description: { en: string; fr: string; 'ar-TN': string };
  iconKey: 'pottery' | 'loom' | 'awl' | 'gem' | 'chisel';
  heroImage: string;
}

interface JsonTrustTag {
  productId: string;
  trusttagId: string;
  countryOfOrigin: 'TN';
  region: string;
  artisan: { id: string; name: string; workshopRegion: string };
  materials: JsonProduct['materials'];
  carbonFootprintKgCo2e: number | null;
  waterUsageLiters: number | null;
  energySource: 'grid' | 'solar' | 'mixed' | null;
  expectedLifetimeYears: number | null;
  careInstructions: { en: string; fr: string; 'ar-TN': string };
  repairOptions: { en: string; fr: string; 'ar-TN': string } | null;
  endOfLife: { en: string; fr: string; 'ar-TN': string };
  productionDate: string;
  batchId: string | null;
  certifications: string[];
  verifiedAt: string;
  verifiedBy: 'medina-digital';
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(SEED_DIR, file), 'utf8')) as T;
}

async function main(): Promise<void> {
  console.log('🌿 Seeding Médina Digital MySQL from JSON...\n');
  await AppDataSource.initialize();

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // ── Wipe (in FK-safe order) ──
    console.log('  Wiping existing data...');
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryRunner.query('TRUNCATE TABLE `trusttags`');
    await queryRunner.query('TRUNCATE TABLE `product_materials`');
    await queryRunner.query('TRUNCATE TABLE `products`');
    await queryRunner.query('TRUNCATE TABLE `pme_artisans`');
    await queryRunner.query('TRUNCATE TABLE `refresh_tokens`');
    await queryRunner.query('TRUNCATE TABLE `users`');
    await queryRunner.query('TRUNCATE TABLE `tenants`');
    await queryRunner.query('TRUNCATE TABLE `artisans`');
    await queryRunner.query('TRUNCATE TABLE `categories`');
    await queryRunner.query('TRUNCATE TABLE `regions`');
    await queryRunner.query('TRUNCATE TABLE `countries`');
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

    // ── Country (TN only) ──
    console.log('  Inserting countries (1)...');
    await queryRunner.manager.getRepository(Country).save([
      {
        code: 'TN',
        name: { en: 'Tunisia', fr: 'Tunisie', 'ar-TN': 'تونس' },
        isActive: true,
      },
    ]);

    // ── Regions (24 governorates) ──
    console.log(`  Inserting regions (${TUNISIA_REGIONS.length})...`);
    await queryRunner.manager.getRepository(Region).save(
      TUNISIA_REGIONS.map((r) => ({
        id: r.id,
        countryCode: r.countryCode,
        slug: r.slug,
        name: r.name,
        description: r.description,
        mapCoords: r.mapCoords,
        knownFor: r.knownFor,
      })),
    );

    // ── Categories ──
    const categories = readJson<JsonCategory[]>('categories.json');
    console.log(`  Inserting categories (${categories.length})...`);
    await queryRunner.manager.getRepository(Category).save(
      categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        iconKey: c.iconKey,
        heroImage: c.heroImage,
      })),
    );

    // ── Artisans + Users (one user per seed artisan) ──
    const artisans = readJson<JsonArtisan[]>('artisans.json');
    console.log(`  Inserting artisans (${artisans.length}) + matching users...`);

    // Common pilot password — meant to be invalidated at first real use.
    // Documented in apps/api/README.md (admin process).
    const pilotPassword = 'medina-pilot-2026!';
    const pilotHash = await bcrypt.hash(pilotPassword, 12);

    const artisanRows = artisans.map((a) => {
      const regionId = REGION_ID_BY_SLUG.get(a.region);
      if (!regionId) {
        throw new Error(`Artisan ${a.slug}: unknown region '${a.region}'`);
      }
      return {
        id: a.id, // preserve ULID from JSON
        slug: a.slug,
        name: a.name,
        nameLocalized: null,
        yearsOfPractice: a.yearsOfPractice,
        regionId,
        primaryCategorySlug: a.primaryCategory,
        story: a.story,
        shortBio: a.shortBio,
        portrait: a.portrait,
        workshopPhoto: a.workshopPhoto ?? null,
        isPublic: a.isPublic,
      };
    });
    await queryRunner.manager.getRepository(Artisan).save(artisanRows);

    const userRows = artisans.map((a) => ({
      id: ulid(),
      email: `${a.slug}@pilot.medina.digital`,
      passwordHash: pilotHash,
      role: 'artisan' as const,
      artisanId: a.id,
      tenantId: null,
      emailVerifiedAt: null,
    }));
    await queryRunner.manager.getRepository(User).save(userRows);

    // ── Products + Materials + TrustTags ──
    const products = readJson<JsonProduct[]>('products.json');
    const trusttags = readJson<JsonTrustTag[]>('trusttags.json');
    console.log(`  Inserting products (${products.length})...`);

    const productRows = products.map((p) => {
      const regionId = REGION_ID_BY_SLUG.get(p.region);
      if (!regionId) throw new Error(`Product ${p.slug}: unknown region '${p.region}'`);
      return {
        id: p.id,
        slug: p.slug,
        artisanId: p.artisanId,
        tenantId: null,
        categorySlug: p.category,
        regionId,
        title: p.title,
        descriptionShort: p.descriptionShort,
        descriptionLong: p.descriptionLong,
        story: p.story,
        dimensions: p.dimensions,
        weightG: p.weightG,
        priceTnd: String(p.priceTnd),
        priceEur: String(p.priceEur),
        photos: p.photos,
        arModelUrl: null,
        trusttagId: p.trusttagId,
        publishedAt: new Date(p.publishedAt),
        customRequest: p.customRequest,
      };
    });
    await queryRunner.manager.getRepository(Product).save(productRows);

    const materialRows = products.flatMap((p) =>
      p.materials.map((m, i) => ({
        id: ulid(),
        productId: p.id,
        name: m.name,
        percentage: String(m.percentage),
        origin: m.origin ?? null,
        recycledContent: m.recycledContent ?? null,
        certifications: m.certifications ?? null,
        ordinal: i,
      })),
    );
    console.log(`  Inserting product materials (${materialRows.length})...`);
    await queryRunner.manager.getRepository(ProductMaterial).save(materialRows);

    console.log(`  Inserting trusttags (${trusttags.length})...`);
    const trustTagRows = trusttags.map((t) => {
      const regionId = REGION_ID_BY_SLUG.get(t.region);
      if (!regionId) throw new Error(`TrustTag ${t.trusttagId}: unknown region '${t.region}'`);
      return {
        trusttagId: t.trusttagId,
        productId: t.productId,
        gtin: null,
        countryOfOrigin: t.countryOfOrigin,
        regionId,
        artisanSnapshot: t.artisan,
        materialsSnapshot: t.materials,
        carbonFootprintKgCo2e:
          t.carbonFootprintKgCo2e != null ? String(t.carbonFootprintKgCo2e) : null,
        waterUsageLiters: t.waterUsageLiters != null ? String(t.waterUsageLiters) : null,
        energySource: t.energySource,
        expectedLifetimeYears: t.expectedLifetimeYears,
        careInstructions: t.careInstructions,
        repairOptions: t.repairOptions,
        endOfLife: t.endOfLife,
        productionDate: t.productionDate,
        batchId: t.batchId,
        certifications: t.certifications,
        verifiedAt: new Date(t.verifiedAt),
        verifiedBy: t.verifiedBy,
      };
    });
    await queryRunner.manager.getRepository(TrustTag).save(trustTagRows);

    await queryRunner.commitTransaction();

    console.log('\n✅ Seed complete.');
    console.log(`   ${TUNISIA_REGIONS.length} regions, ${categories.length} categories,`);
    console.log(
      `   ${artisans.length} artisans + ${userRows.length} users (password: ${pilotPassword}),`,
    );
    console.log(`   ${products.length} products, ${materialRows.length} materials,`);
    console.log(`   ${trusttags.length} trusttags.`);
    console.log('\n   Pilot login: <slug>@pilot.medina.digital / ' + pilotPassword);
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

main().catch((e: unknown) => {
  console.error('\n❌ Seed failed:', e);
  process.exit(1);
});
