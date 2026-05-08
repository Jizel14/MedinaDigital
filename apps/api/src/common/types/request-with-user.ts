import { Request } from 'express';
import type { UserRole } from '../../modules/auth/entities/user.entity';

/** Minimal user payload attached to req by JwtStrategy. */
export interface AuthUser {
  id: string;
  role: UserRole;
  artisanId: string | null;
  tenantId: string | null;
}

/** Ownership context computed from AuthUser, attached to req for convenience. */
export interface OwnershipContext {
  userId: string;
  role: UserRole;
  artisanId: string | null;
  tenantId: string | null;
  /** Filter usable with TypeORM repo.find() to scope products to current owner. */
  ownedProductFilter: { artisanId?: string; tenantId?: string };
}

export interface RequestWithUser extends Request {
  user: AuthUser;
  ownership: OwnershipContext;
}
