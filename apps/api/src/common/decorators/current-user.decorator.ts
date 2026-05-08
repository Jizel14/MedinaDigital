import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser, RequestWithUser } from '../types/request-with-user';

/** Returns the AuthUser placed on the request by JwtStrategy. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user;
  },
);
