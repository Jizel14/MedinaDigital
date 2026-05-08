/**
 * Global e2e setup: rebuild medina_test from scratch, run migrations,
 * seed only the lookup data needed by auth tests (regions, categories).
 *
 * Runs once per `jest --config jest-e2e.json` invocation.
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { DataSource } from 'typeorm';
import { TUNISIA_REGIONS } from '../src/database/seeds/regions-seed';
import { Country } from '../src/modules/countries/country.entity';
import { Region } from '../src/modules/regions/region.entity';
import { Category } from '../src/modules/categories/category.entity';

loadEnv({ path: resolve(__dirname, '..', '.env.test') });

const apiRoot = resolve(__dirname, '..');
// Local Windows dev defaults to XAMPP; CI / Linux use the mysql client from PATH.
// Override via MYSQL_CLIENT_PATH if your install is somewhere else.
const xamppMysql =
  process.env.MYSQL_CLIENT_PATH ??
  (process.platform === 'win32' ? 'C:\\xampp\\mysql\\bin\\mysql.exe' : 'mysql');

export default async function globalSetup(): Promise<void> {
  const dbName = process.env.MYSQL_DATABASE ?? 'medina_test';
  const host = process.env.MYSQL_HOST ?? '127.0.0.1';
  const port = process.env.MYSQL_PORT ?? '3306';
  const user = process.env.MYSQL_USER ?? 'root';
  const password = process.env.MYSQL_PASSWORD ?? '';
  const passwordArg = password ? `-p${password}` : '';

  // 1) Drop + recreate the test database
  const dropSql = `DROP DATABASE IF EXISTS \`${dbName}\`; CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
  execSync(`"${xamppMysql}" -h ${host} -P ${port} -u ${user} ${passwordArg} -e "${dropSql}"`, {
    stdio: 'inherit',
  });

  // 2) Run TypeORM migrations against medina_test (env vars are already set)
  execSync('pnpm db:migrate', { cwd: apiRoot, stdio: 'inherit', env: process.env });

  // 3) Seed minimal lookup data: TN country + 27 regions + a couple of categories.
  const ds = new DataSource({
    type: 'mysql',
    host,
    port: Number(port),
    username: user,
    password,
    database: dbName,
    charset: 'utf8mb4',
    timezone: 'Z',
    synchronize: false,
    entities: [Country, Region, Category],
  });
  await ds.initialize();
  try {
    await ds.getRepository(Country).save({
      code: 'TN',
      name: { en: 'Tunisia', fr: 'Tunisie', 'ar-TN': 'تونس' },
      isActive: true,
    } as Country);
    for (const r of TUNISIA_REGIONS) {
      await ds.getRepository(Region).save({
        id: r.id,
        countryCode: 'TN',
        slug: r.slug,
        name: r.name,
        description: null,
        mapCoords: r.mapCoords,
        knownFor: null,
      } as Region);
    }
    await ds.getRepository(Category).save([
      {
        slug: 'ceramics',
        name: { en: 'Ceramics', fr: 'Céramique', 'ar-TN': 'الخزف' },
        description: { en: '', fr: '', 'ar-TN': '' },
        iconKey: 'pottery',
        heroImage: '/x.webp',
      },
      {
        slug: 'jewelry',
        name: { en: 'Jewelry', fr: 'Bijoux', 'ar-TN': 'المجوهرات' },
        description: { en: '', fr: '', 'ar-TN': '' },
        iconKey: 'gem',
        heroImage: '/y.webp',
      },
    ] as Category[]);
  } finally {
    await ds.destroy();
  }
}
