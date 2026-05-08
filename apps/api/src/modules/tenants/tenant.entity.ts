import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';

export type KycStatus = 'pending' | 'verified' | 'rejected';
export type PreferredLanguage = 'fr' | 'ar-TN';

/**
 * PME (small business) profile. Created at signup with role='pme_owner'. Always
 * has an owner (the user who signed up). KYC fields exist but the workflow is
 * implemented in B-2 — we only collect the patenteNumber here.
 */
@Entity({ name: 'tenants' })
@Index('uq_tenants_slug', ['slug'], { unique: true })
@Index('ix_tenants_region', ['regionId'])
export class Tenant {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 96 })
  slug!: string;

  @Column({ name: 'business_name', type: 'varchar', length: 128 })
  businessName!: string;

  @Column({ name: 'business_name_ar', type: 'varchar', length: 128, nullable: true })
  businessNameAr!: string | null;

  @Column({ name: 'region_id', type: 'char', length: 26 })
  regionId!: string;

  @ManyToOne(() => Region, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'region_id' })
  region?: Region;

  @Column({ name: 'primary_category_slug', type: 'varchar', length: 32 })
  primaryCategorySlug!: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'primary_category_slug', referencedColumnName: 'slug' })
  primaryCategory?: Category;

  @Column({ name: 'year_founded', type: 'int', nullable: true })
  yearFounded!: number | null;

  @Column({ name: 'artisan_count', type: 'int', default: 1 })
  artisanCount!: number;

  @Column({ name: 'patente_number', type: 'varchar', length: 64, nullable: true })
  patenteNumber!: string | null;

  @Column({
    name: 'kyc_status',
    type: 'enum',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  kycStatus!: KycStatus;

  @Column({
    name: 'preferred_language',
    type: 'enum',
    enum: ['fr', 'ar-TN'],
    default: 'fr',
  })
  preferredLanguage!: PreferredLanguage;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
