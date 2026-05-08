import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * One row per active refresh token (after rotation, the old one's `revokedAt`
 * is set, the new one is inserted). Token is stored hashed (bcrypt) — we never
 * store the raw JWT. JTI inside the JWT acts as a fingerprint we can index on.
 */
@Entity({ name: 'refresh_tokens' })
@Index('ix_refresh_tokens_user_revoked', ['userId', 'revokedAt'])
export class RefreshToken {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ name: 'user_id', type: 'char', length: 26 })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'token_hash', type: 'char', length: 64 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt!: Date | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
