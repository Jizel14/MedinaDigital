import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';

/**
 * Materials composing a product (ceramic 90% + glaze 10%, etc.). Sum across a
 * product's materials must be ~100; enforced by validator on create/update,
 * not at DB level (sum would require a deferred constraint).
 */
@Entity({ name: 'product_materials' })
@Index('ix_product_materials_product', ['productId'])
export class ProductMaterial {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ name: 'product_id', type: 'char', length: 26 })
  productId!: string;

  @ManyToOne(() => Product, (p) => p.materials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @Column({ type: 'json' })
  name!: { en: string; fr: string; 'ar-TN': string };

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage!: string;

  @Column({ type: 'varchar', length: 96, nullable: true })
  origin!: string | null;

  @Column({ name: 'recycled_content', type: 'int', nullable: true })
  recycledContent!: number | null;

  @Column({ type: 'json', nullable: true })
  certifications!: string[] | null;

  @Column({ type: 'int', default: 0 })
  ordinal!: number;
}
