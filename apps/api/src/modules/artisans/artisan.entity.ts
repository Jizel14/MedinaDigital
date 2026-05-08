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

/**
 * Artisan profile. Can exist without a User (seed-imported, profile shown but
 * no auth account) — userId is nullable. When an artisan signs up, a User row
 * is inserted and `users.artisanId` points here.
 *
 * isPublic gates listing in the public marketplace. Defaults to true so seed
 * data is visible immediately.
 */
@Entity({ name: 'artisans' })
@Index('uq_artisans_slug', ['slug'], { unique: true })
@Index('ix_artisans_region', ['regionId'])
export class Artisan {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 96 })
  slug!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ name: 'name_localized', type: 'json', nullable: true })
  nameLocalized!: { en: string; fr: string; 'ar-TN': string } | null;

  @Column({ name: 'years_of_practice', type: 'int' })
  yearsOfPractice!: number;

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

  @Column({ type: 'json' })
  story!: { en: string; fr: string; 'ar-TN': string };

  @Column({ name: 'short_bio', type: 'json' })
  shortBio!: { en: string; fr: string; 'ar-TN': string };

  @Column({ type: 'varchar', length: 255 })
  portrait!: string;

  @Column({ name: 'workshop_photo', type: 'varchar', length: 255, nullable: true })
  workshopPhoto!: string | null;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
