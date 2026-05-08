import { Column, Entity, PrimaryColumn } from 'typeorm';

export type CategoryIconKey = 'pottery' | 'loom' | 'awl' | 'gem' | 'chisel';

/**
 * Fixed taxonomy. Seed: 5 categories (ceramics, textile, leather, jewelry, wood).
 * Slug is the PK so FKs from products/artisans are clean strings.
 */
@Entity({ name: 'categories' })
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  slug!: string;

  @Column({ type: 'json' })
  name!: { en: string; fr: string; 'ar-TN': string };

  @Column({ type: 'json' })
  description!: { en: string; fr: string; 'ar-TN': string };

  @Column({ name: 'icon_key', type: 'varchar', length: 16 })
  iconKey!: CategoryIconKey;

  @Column({ name: 'hero_image', type: 'varchar', length: 255 })
  heroImage!: string;
}
