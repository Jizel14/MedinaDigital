/**
 * Drop + migrate + seed in one shot. Dev-only (NEVER run in prod).
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

loadEnv({ path: resolve(__dirname, '../../../.env') });

const apiRoot = resolve(__dirname, '../../..');

function run(cmd: string): void {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: apiRoot, stdio: 'inherit' });
}

console.log('🔥 Resetting database (dev only)...\n');

// We can't easily reverse all migrations + drop the migrations table from
// here, so the simplest reliable path is to drop and recreate the schema.
const dbName = process.env.MYSQL_DATABASE ?? 'medina_dev';
const mysqlHost = process.env.MYSQL_HOST ?? '127.0.0.1';
const mysqlPort = process.env.MYSQL_PORT ?? '3306';
const mysqlUser = process.env.MYSQL_USER ?? 'root';
const mysqlPassword = process.env.MYSQL_PASSWORD ?? '';
const passwordArg = mysqlPassword ? `-p${mysqlPassword}` : '';

const xamppMysql = 'C:\\xampp\\mysql\\bin\\mysql.exe';
const sql = `DROP DATABASE IF EXISTS \`${dbName}\`; CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;

run(`"${xamppMysql}" -h ${mysqlHost} -P ${mysqlPort} -u ${mysqlUser} ${passwordArg} -e "${sql}"`);
run('pnpm db:migrate');
run('pnpm db:seed');

console.log('\n✅ Reset complete.');
