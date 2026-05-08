import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { OwnershipContext, RequestWithUser } from '../types/request-with-user';

/** Returns the OwnershipContext placed on the request by JwtAuthGuard. */
export const CurrentOwnership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): OwnershipContext => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.ownership;
  },
);
