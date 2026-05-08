import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';
import { Artisan } from '../artisans/artisan.entity';
import { Tenant } from '../tenants/tenant.entity';
import { ProductMaterial } from './product-material.entity';

export interface ProductDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

/**
 * A product owned by either an artisan, a tenant (PME), or both. The CHECK
 * constraint (artisanId IS NOT NULL OR tenantId IS NOT NULL) is added in the
 * migration. trusttagId is a placeholder ULID in B-1; the real QR + DPP record
 * is generated in B-3.
 */
@Entity({ name: 'products' })
@Index('uq_products_slug', ['slug'], { unique: true })
@Index('ix_products_artisan', ['artisanId'])
@Index('ix_products_tenant', ['tenantId'])
@Index('ix_products_category', ['categorySlug'])
@Index('ix_products_published_at', ['publishedAt'])
export class Product {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 128 })
  slug!: string;

  @Column({ name: 'artisan_id', type: 'char', length: 26, nullable: true })
  artisanId!: string | null;

  @ManyToOne(() => Artisan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'artisan_id' })
  artisan?: Artisan | null;

  @Column({ name: 'tenant_id', type: 'char', length: 26, nullable: true })
  tenantId!: string | null;

  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant | null;

  @Column({ name: 'category_slug', type: 'varchar', length: 32 })
  categorySlug!: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_slug', referencedColumnName: 'slug' })
  category?: Category;

  @Column({ name: 'region_id', type: 'char', length: 26 })
  regionId!: string;

  @ManyToOne(() => Region, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'region_id' })
  region?: Region;

  @Column({ type: 'json' })
  title!: { en: string; fr: string; 'ar-TN': string };

  @Column({ name: 'description_short', type: 'json' })
  descriptionShort!: { en: string; fr: string; 'ar-TN': string };

  @Column({ name: 'description_long', type: 'json' })
  descriptionLong!: { en: string; fr: string; 'ar-TN': string };

  @Column({ type: 'json' })
  story!: { en: string; fr: string; 'ar-TN': string };

  @Column({ type: 'json' })
  dimensions!: ProductDimensions;

  @Column({ name: 'weight_g', type: 'int' })
  weightG!: number;

  @Column({ name: 'price_tnd', type: 'decimal', precision: 10, scale: 2 })
  priceTnd!: string;

  @Column({ name: 'price_eur', type: 'decimal', precision: 10, scale: 2 })
  priceEur!: string;

  @Column({ type: 'json' })
  photos!: string[];

  @Column({ name: 'ar_model_url', type: 'varchar', length: 255, nullable: true })
  arModelUrl!: string | null;

  @Column({ name: 'trusttag_id', type: 'char', length: 32 })
  trusttagId!: string;

  @Column({ name: 'published_at', type: 'timestamp' })
  publishedAt!: Date;

  @Column({ name: 'custom_request', type: 'boolean', default: false })
  customRequest!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ProductMaterial, (m) => m.product, { cascade: true })
  materials?: ProductMaterial[];
}
