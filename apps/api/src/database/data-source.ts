import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { resolve } from 'node:path';

// Load .env from apps/api/ when running TypeORM CLI
loadEnv({ path: resolve(__dirname, '../../.env') });

/**
 * DataSource exported for the TypeORM CLI (migrations, generate, etc.).
 * Mirrors the runtime config but built standalone (no Nest DI).
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? 3306),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE,
  charset: 'utf8mb4',
  timezone: 'Z',
  synchronize: false,
  logging: ['error', 'warn'],
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
