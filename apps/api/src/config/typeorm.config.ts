import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * TypeORM factory used by AppModule.forRootAsync. Reads validated env via
 * ConfigService. Synchronize is **always** false — schema changes go through
 * migrations only (cf. CLAUDE.md règle: jamais synchronize:true).
 */
export function buildTypeOrmOptions(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: config.getOrThrow<string>('MYSQL_HOST'),
    port: config.getOrThrow<number>('MYSQL_PORT'),
    username: config.getOrThrow<string>('MYSQL_USER'),
    password: config.get<string>('MYSQL_PASSWORD', ''),
    database: config.getOrThrow<string>('MYSQL_DATABASE'),
    charset: 'utf8mb4',
    timezone: 'Z',
    synchronize: false,
    logging: config.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsRun: false,
  };
}
