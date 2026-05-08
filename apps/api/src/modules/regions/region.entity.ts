import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Country } from '../countries/country.entity';

/**
 * Region within a country (e.g. Nabeul governorate in TN). Seed: 24 Tunisian
 * governorates. Slug is unique per country (so 'centre' could exist in TN and
 * MA without collision).
 */
@Entity({ name: 'regions' })
@Unique('uq_regions_country_slug', ['countryCode', 'slug'])
@Index('ix_regions_country', ['countryCode'])
export class Region {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ name: 'country_code', type: 'char', length: 2 })
  countryCode!: string;

  @ManyToOne(() => Country, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'country_code', referencedColumnName: 'code' })
  country?: Country;

  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'json' })
  name!: { en: string; fr: string; 'ar-TN': string };

  @Column({ type: 'json', nullable: true })
  description!: { en: string; fr: string; 'ar-TN': string } | null;

  @Column({ name: 'map_coords', type: 'json', nullable: true })
  mapCoords!: { x: number; y: number } | null;

  @Column({ name: 'known_for', type: 'json', nullable: true })
  knownFor!: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
