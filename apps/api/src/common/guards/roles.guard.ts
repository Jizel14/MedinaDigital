import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestWithUser } from '../types/request-with-user';
import type { User } from '../../modules/auth/entities/user.entity';

/**
 * Reads @Roles(...) metadata and rejects if the request user's role isn't in
 * the allow-list. Composes with the global JwtAuthGuard — meant to be applied
 * at controller or method level via @UseGuards(RolesGuard).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<User['role'][] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowed || allowed.length === 0) return true;
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const role = req.ownership?.role;
    if (!role || !allowed.includes(role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Your role does not permit this action',
      });
    }
    return true;
  }
}
