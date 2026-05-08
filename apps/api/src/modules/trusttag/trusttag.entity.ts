import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

export type EnergySource = 'grid' | 'solar' | 'mixed';

/** Denormalized material snapshot stored as JSON in the trusttag row. Mirrors
 *  the JSON seed format and DPP regulation fields, not the live ProductMaterial entity. */
export interface MaterialSnapshot {
  name: { en: string; fr: string; 'ar-TN': string };
  percentage: number;
  origin?: string;
  recycledContent?: number;
  certifications?: string[];
}

/**
 * Digital Product Passport (EU ESPR-compliant) record. Created in B-1 as a
 * placeholder per product (so FKs stay clean) and properly populated/generated
 * with QR in B-3.
 */
@Entity({ name: 'trusttags' })
@Index('uq_trusttags_product', ['productId'], { unique: true })
export class TrustTag {
  @PrimaryColumn({ name: 'trusttag_id', type: 'char', length: 32 })
  trusttagId!: string;

  @Column({ name: 'product_id', type: 'char', length: 26 })
  productId!: string;

  @OneToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @Column({ type: 'varchar', length: 32, nullable: true })
  gtin!: string | null;

  @Column({ name: 'country_of_origin', type: 'char', length: 2 })
  countryOfOrigin!: string;

  @Column({ name: 'region_id', type: 'char', length: 26 })
  regionId!: string;

  @Column({ name: 'artisan_snapshot', type: 'json' })
  artisanSnapshot!: { id: string; name: string; workshopRegion: string };

  @Column({ name: 'materials_snapshot', type: 'json' })
  materialsSnapshot!: MaterialSnapshot[];

  @Column({
    name: 'carbon_footprint_kg_co2e',
    type: 'decimal',
    precision: 10,
    scale: 3,
    nullable: true,
  })
  carbonFootprintKgCo2e!: string | null;

  @Column({ name: 'water_usage_liters', type: 'decimal', precision: 10, scale: 2, nullable: true })
  waterUsageLiters!: string | null;

  @Column({
    name: 'energy_source',
    type: 'enum',
    enum: ['grid', 'solar', 'mixed'],
    nullable: true,
  })
  energySource!: EnergySource | null;

  @Column({ name: 'expected_lifetime_years', type: 'int', nullable: true })
  expectedLifetimeYears!: number | null;

  @Column({ name: 'care_instructions', type: 'json' })
  careInstructions!: { en: string; fr: string; 'ar-TN': string };

  @Column({ name: 'repair_options', type: 'json', nullable: true })
  repairOptions!: { en: string; fr: string; 'ar-TN': string } | null;

  @Column({ name: 'end_of_life', type: 'json' })
  endOfLife!: { en: string; fr: string; 'ar-TN': string };

  @Column({ name: 'production_date', type: 'date' })
  productionDate!: string;

  @Column({ name: 'batch_id', type: 'varchar', length: 64, nullable: true })
  batchId!: string | null;

  @Column({ type: 'json' })
  certifications!: string[];

  @Column({ name: 'verified_at', type: 'timestamp' })
  verifiedAt!: Date;

  @Column({ name: 'verified_by', type: 'varchar', length: 32, default: 'medina-digital' })
  verifiedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
