/**
 * Validate seed JSON files against Zod schemas.
 * Run via: pnpm validate:seed
 *
 * Reads from apps/web/src/data/seed/*.json. If a file is missing, the script
 * skips it with a warning rather than failing — seed files arrive in Phase 5.
 */
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { seedFileSchemas, type SeedKey } from '../schemas/index';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../../..');
const SEED_DIR = resolve(REPO_ROOT, 'apps/web/src/data/seed');

const SEED_FILES: Record<SeedKey, string> = {
  categories: 'categories.json',
  regions: 'regions.json',
  artisans: 'artisans.json',
  products: 'products.json',
  trusttags: 'trusttags.json',
};

async function readJsonOrNull(path: string): Promise<unknown> {
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}

async function main(): Promise<void> {
  let hasError = false;
  let totalChecked = 0;

  for (const key of Object.keys(SEED_FILES) as SeedKey[]) {
    const fileName = SEED_FILES[key];
    const filePath = resolve(SEED_DIR, fileName);
    const data = await readJsonOrNull(filePath);

    if (data === null) {
      console.warn(`⚠️  ${fileName} — not found, skipped (seed files arrive in Phase 5)`);
      continue;
    }

    const schema = seedFileSchemas[key];
    const result = schema.safeParse(data);
    if (result.success) {
      const arrLen = Array.isArray(result.data) ? result.data.length : 1;
      console.log(`✅ ${fileName} — ${arrLen} entries valid`);
      totalChecked += arrLen;
    } else {
      hasError = true;
      console.error(`❌ ${fileName} — validation failed:`);
      for (const issue of (result.error as z.ZodError).issues) {
        console.error(`   • ${issue.path.join('.')}: ${issue.message}`);
      }
    }
  }

  if (hasError) {
    console.error('\n❌ Seed validation failed.');
    process.exit(1);
  }
  console.log(`\n✅ Seed validation passed (${totalChecked} entries total).`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
