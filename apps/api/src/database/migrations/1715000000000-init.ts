import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema. Mirrors the entities. CHECK constraints (users role/profile,
 * products owner-at-least-one) are added at the end since TypeORM @Check
 * decorators don't work on MySQL versions < 8.0.16.
 */
export class Init1715000000000 implements MigrationInterface {
  name = 'Init1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── countries ──
    await queryRunner.query(`
      CREATE TABLE \`countries\` (
        \`code\` CHAR(2) NOT NULL,
        \`name\` JSON NOT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (\`code\`)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── regions ──
    await queryRunner.query(`
      CREATE TABLE \`regions\` (
        \`id\` CHAR(26) NOT NULL,
        \`country_code\` CHAR(2) NOT NULL,
        \`slug\` VARCHAR(64) NOT NULL,
        \`name\` JSON NOT NULL,
        \`description\` JSON NULL,
        \`map_coords\` JSON NULL,
        \`known_for\` JSON NULL,
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_regions_country_slug\` (\`country_code\`, \`slug\`),
        KEY \`ix_regions_country\` (\`country_code\`),
        CONSTRAINT \`fk_regions_country\` FOREIGN KEY (\`country_code\`) REFERENCES \`countries\` (\`code\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── categories ──
    await queryRunner.query(`
      CREATE TABLE \`categories\` (
        \`slug\` VARCHAR(32) NOT NULL,
        \`name\` JSON NOT NULL,
        \`description\` JSON NOT NULL,
        \`icon_key\` VARCHAR(16) NOT NULL,
        \`hero_image\` VARCHAR(255) NOT NULL,
        PRIMARY KEY (\`slug\`)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── artisans ──
    await queryRunner.query(`
      CREATE TABLE \`artisans\` (
        \`id\` CHAR(26) NOT NULL,
        \`slug\` VARCHAR(96) NOT NULL,
        \`name\` VARCHAR(128) NOT NULL,
        \`name_localized\` JSON NULL,
        \`years_of_practice\` INT NOT NULL,
        \`region_id\` CHAR(26) NOT NULL,
        \`primary_category_slug\` VARCHAR(32) NOT NULL,
        \`story\` JSON NOT NULL,
        \`short_bio\` JSON NOT NULL,
        \`portrait\` VARCHAR(255) NOT NULL,
        \`workshop_photo\` VARCHAR(255) NULL,
        \`is_public\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_artisans_slug\` (\`slug\`),
        KEY \`ix_artisans_region\` (\`region_id\`),
        CONSTRAINT \`fk_artisans_region\` FOREIGN KEY (\`region_id\`) REFERENCES \`regions\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_artisans_category\` FOREIGN KEY (\`primary_category_slug\`) REFERENCES \`categories\` (\`slug\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── tenants ──
    await queryRunner.query(`
      CREATE TABLE \`tenants\` (
        \`id\` CHAR(26) NOT NULL,
        \`slug\` VARCHAR(96) NOT NULL,
        \`business_name\` VARCHAR(128) NOT NULL,
        \`business_name_ar\` VARCHAR(128) NULL,
        \`region_id\` CHAR(26) NOT NULL,
        \`primary_category_slug\` VARCHAR(32) NOT NULL,
        \`year_founded\` INT NULL,
        \`artisan_count\` INT NOT NULL DEFAULT 1,
        \`patente_number\` VARCHAR(64) NULL,
        \`kyc_status\` ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
        \`preferred_language\` ENUM('fr','ar-TN') NOT NULL DEFAULT 'fr',
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_tenants_slug\` (\`slug\`),
        KEY \`ix_tenants_region\` (\`region_id\`),
        CONSTRAINT \`fk_tenants_region\` FOREIGN KEY (\`region_id\`) REFERENCES \`regions\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_tenants_category\` FOREIGN KEY (\`primary_category_slug\`) REFERENCES \`categories\` (\`slug\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── users ──
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` CHAR(26) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`password_hash\` CHAR(60) NOT NULL,
        \`role\` ENUM('artisan','pme_owner','admin') NOT NULL,
        \`artisan_id\` CHAR(26) NULL,
        \`tenant_id\` CHAR(26) NULL,
        \`email_verified_at\` TIMESTAMP NULL,
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_users_email\` (\`email\`),
        UNIQUE KEY \`uq_users_artisan\` (\`artisan_id\`),
        UNIQUE KEY \`uq_users_tenant\` (\`tenant_id\`),
        CONSTRAINT \`fk_users_artisan\` FOREIGN KEY (\`artisan_id\`) REFERENCES \`artisans\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_users_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`chk_users_role_profile\` CHECK (
          (\`role\` = 'admin' AND \`artisan_id\` IS NULL AND \`tenant_id\` IS NULL)
          OR (\`role\` = 'artisan' AND \`artisan_id\` IS NOT NULL AND \`tenant_id\` IS NULL)
          OR (\`role\` = 'pme_owner' AND \`tenant_id\` IS NOT NULL AND \`artisan_id\` IS NULL)
        )
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── refresh_tokens ──
    await queryRunner.query(`
      CREATE TABLE \`refresh_tokens\` (
        \`id\` CHAR(26) NOT NULL,
        \`user_id\` CHAR(26) NOT NULL,
        \`token_hash\` CHAR(64) NOT NULL,
        \`expires_at\` TIMESTAMP NOT NULL,
        \`revoked_at\` TIMESTAMP NULL,
        \`user_agent\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`ix_refresh_tokens_user_revoked\` (\`user_id\`, \`revoked_at\`),
        CONSTRAINT \`fk_refresh_tokens_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── pme_artisans (junction) ──
    await queryRunner.query(`
      CREATE TABLE \`pme_artisans\` (
        \`tenant_id\` CHAR(26) NOT NULL,
        \`artisan_id\` CHAR(26) NOT NULL,
        \`started_at\` TIMESTAMP NOT NULL,
        \`ended_at\` TIMESTAMP NULL,
        \`role\` VARCHAR(32) NULL,
        PRIMARY KEY (\`tenant_id\`, \`artisan_id\`, \`started_at\`),
        KEY \`ix_pme_artisans_tenant_active\` (\`tenant_id\`, \`ended_at\`),
        CONSTRAINT \`fk_pme_artisans_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_pme_artisans_artisan\` FOREIGN KEY (\`artisan_id\`) REFERENCES \`artisans\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── products ──
    await queryRunner.query(`
      CREATE TABLE \`products\` (
        \`id\` CHAR(26) NOT NULL,
        \`slug\` VARCHAR(128) NOT NULL,
        \`artisan_id\` CHAR(26) NULL,
        \`tenant_id\` CHAR(26) NULL,
        \`category_slug\` VARCHAR(32) NOT NULL,
        \`region_id\` CHAR(26) NOT NULL,
        \`title\` JSON NOT NULL,
        \`description_short\` JSON NOT NULL,
        \`description_long\` JSON NOT NULL,
        \`story\` JSON NOT NULL,
        \`dimensions\` JSON NOT NULL,
        \`weight_g\` INT NOT NULL,
        \`price_tnd\` DECIMAL(10,2) NOT NULL,
        \`price_eur\` DECIMAL(10,2) NOT NULL,
        \`photos\` JSON NOT NULL,
        \`ar_model_url\` VARCHAR(255) NULL,
        \`trusttag_id\` CHAR(32) NOT NULL,
        \`published_at\` TIMESTAMP NOT NULL,
        \`custom_request\` TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_products_slug\` (\`slug\`),
        KEY \`ix_products_artisan\` (\`artisan_id\`),
        KEY \`ix_products_tenant\` (\`tenant_id\`),
        KEY \`ix_products_category\` (\`category_slug\`),
        KEY \`ix_products_published_at\` (\`published_at\`),
        CONSTRAINT \`fk_products_artisan\` FOREIGN KEY (\`artisan_id\`) REFERENCES \`artisans\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_products_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_products_category\` FOREIGN KEY (\`category_slug\`) REFERENCES \`categories\` (\`slug\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_products_region\` FOREIGN KEY (\`region_id\`) REFERENCES \`regions\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`chk_products_owner\` CHECK (\`artisan_id\` IS NOT NULL OR \`tenant_id\` IS NOT NULL)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── product_materials ──
    await queryRunner.query(`
      CREATE TABLE \`product_materials\` (
        \`id\` CHAR(26) NOT NULL,
        \`product_id\` CHAR(26) NOT NULL,
        \`name\` JSON NOT NULL,
        \`percentage\` DECIMAL(5,2) NOT NULL,
        \`origin\` VARCHAR(96) NULL,
        \`recycled_content\` INT NULL,
        \`certifications\` JSON NULL,
        \`ordinal\` INT NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`ix_product_materials_product\` (\`product_id\`),
        CONSTRAINT \`fk_product_materials_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── trusttags ──
    await queryRunner.query(`
      CREATE TABLE \`trusttags\` (
        \`trusttag_id\` CHAR(32) NOT NULL,
        \`product_id\` CHAR(26) NOT NULL,
        \`gtin\` VARCHAR(32) NULL,
        \`country_of_origin\` CHAR(2) NOT NULL,
        \`region_id\` CHAR(26) NOT NULL,
        \`artisan_snapshot\` JSON NOT NULL,
        \`materials_snapshot\` JSON NOT NULL,
        \`carbon_footprint_kg_co2e\` DECIMAL(10,3) NULL,
        \`water_usage_liters\` DECIMAL(10,2) NULL,
        \`energy_source\` ENUM('grid','solar','mixed') NULL,
        \`expected_lifetime_years\` INT NULL,
        \`care_instructions\` JSON NOT NULL,
        \`repair_options\` JSON NULL,
        \`end_of_life\` JSON NOT NULL,
        \`production_date\` DATE NOT NULL,
        \`batch_id\` VARCHAR(64) NULL,
        \`certifications\` JSON NOT NULL,
        \`verified_at\` TIMESTAMP NOT NULL,
        \`verified_by\` VARCHAR(32) NOT NULL DEFAULT 'medina-digital',
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`trusttag_id\`),
        UNIQUE KEY \`uq_trusttags_product\` (\`product_id\`),
        CONSTRAINT \`fk_trusttags_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order to respect FKs
    await queryRunner.query('DROP TABLE IF EXISTS `trusttags`');
    await queryRunner.query('DROP TABLE IF EXISTS `product_materials`');
    await queryRunner.query('DROP TABLE IF EXISTS `products`');
    await queryRunner.query('DROP TABLE IF EXISTS `pme_artisans`');
    await queryRunner.query('DROP TABLE IF EXISTS `refresh_tokens`');
    await queryRunner.query('DROP TABLE IF EXISTS `users`');
    await queryRunner.query('DROP TABLE IF EXISTS `tenants`');
    await queryRunner.query('DROP TABLE IF EXISTS `artisans`');
    await queryRunner.query('DROP TABLE IF EXISTS `categories`');
    await queryRunner.query('DROP TABLE IF EXISTS `regions`');
    await queryRunner.query('DROP TABLE IF EXISTS `countries`');
  }
}
