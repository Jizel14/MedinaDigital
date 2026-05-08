import { SetMetadata } from '@nestjs/common';
import type { User } from '../../modules/auth/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: User['role'][]) => SetMetadata(ROLES_KEY, roles);
