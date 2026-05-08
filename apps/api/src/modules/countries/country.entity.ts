import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import type { Region } from '../regions/region.entity';

/**
 * ISO 3166-1 alpha-2 country (e.g. 'TN'). Seed only contains 'TN' in B-1;
 * the table exists so adding 'MA', 'DZ', etc. is a data change, not a schema change.
 */
@Entity({ name: 'countries' })
export class Country {
  @PrimaryColumn({ type: 'char', length: 2 })
  code!: string;

  @Column({ type: 'json' })
  name!: { en: string; fr: string; 'ar-TN': string };

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Inverse side, no FK column on Country
  @OneToMany('Region', (region: Region) => region.country)
  regions?: Region[];
}
