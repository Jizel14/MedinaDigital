import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Artisan } from '../../artisans/artisan.entity';
import { Tenant } from '../../tenants/tenant.entity';

export type UserRole = 'artisan' | 'pme_owner' | 'admin';

/**
 * Authentication account. A user is either:
 *   - an artisan (role='artisan', artisanId set)
 *   - a PME owner (role='pme_owner', tenantId set)
 *   - an admin (role='admin', both null)
 *
 * The CHECK constraint enforcing this is added in the migration (TypeORM
 * doesn't model CHECK well from decorators).
 */
@Entity({ name: 'users' })
@Index('uq_users_email', ['email'], { unique: true })
export class User {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'char', length: 60 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: ['artisan', 'pme_owner', 'admin'] })
  role!: UserRole;

  @Column({ name: 'artisan_id', type: 'char', length: 26, nullable: true })
  artisanId!: string | null;

  @OneToOne(() => Artisan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'artisan_id' })
  artisan?: Artisan | null;

  @Column({ name: 'tenant_id', type: 'char', length: 26, nullable: true })
  tenantId!: string | null;

  @OneToOne(() => Tenant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant | null;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
