import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import type { AuthUser, RequestWithUser } from '../../../common/types/request-with-user';

/**
 * Global JWT guard. Reads `@Public()` metadata to skip authentication when
 * present. Computes the OwnershipContext from req.user and pins it on the
 * request, so controllers can pull it via `@CurrentOwnership()`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  override handleRequest<T = AuthUser>(
    err: unknown,
    user: T,
    _info: unknown,
    context: ExecutionContext,
  ): T {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException();
    }
    // Pin OwnershipContext for downstream usage.
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const u = user as unknown as AuthUser;
    req.ownership = {
      userId: u.id,
      role: u.role,
      artisanId: u.artisanId,
      tenantId: u.tenantId,
      ownedProductFilter:
        u.role === 'artisan' && u.artisanId
          ? { artisanId: u.artisanId }
          : u.role === 'pme_owner' && u.tenantId
            ? { tenantId: u.tenantId }
            : {},
    };
    return user;
  }
}
