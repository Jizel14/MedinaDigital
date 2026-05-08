import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Artisan } from '../artisans/artisan.entity';

/**
 * Membership table linking artisans (freelance) to tenants (PME). An artisan
 * can be linked to multiple PMEs and freely come/go (endedAt timestamp).
 *
 * Created in B-1 with FKs in place but **no controller/endpoints**: the
 * talents-marketplace feature (invite/accept/leave) lands in B-3.
 */
@Entity({ name: 'pme_artisans' })
@Index('ix_pme_artisans_tenant_active', ['tenantId', 'endedAt'])
export class PmeArtisan {
  @PrimaryColumn({ name: 'tenant_id', type: 'char', length: 26 })
  tenantId!: string;

  @PrimaryColumn({ name: 'artisan_id', type: 'char', length: 26 })
  artisanId!: string;

  @PrimaryColumn({ name: 'started_at', type: 'timestamp' })
  startedAt!: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;

  @ManyToOne(() => Artisan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artisan_id' })
  artisan?: Artisan;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt!: Date | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  role!: string | null;
}
