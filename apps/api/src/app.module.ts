import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './config/env.validation';
import { buildTypeOrmOptions } from './config/typeorm.config';
import { CountriesModule } from './modules/countries/countries.module';
import { RegionsModule } from './modules/regions/regions.module';
import { CategoriesModule } from './modules/categories/categories.module';

/**
 * Root module. Phase 2: ConfigModule + TypeOrmModule + 3 read-only taxonomy
 * modules (countries / regions / categories). Auth, profile, products
 * added in phases 3-5.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    CountriesModule,
    RegionsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
