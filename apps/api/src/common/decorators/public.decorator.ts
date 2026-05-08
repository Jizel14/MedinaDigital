import { SetMetadata } from '@nestjs/common';

/** Marker key read by JwtAuthGuard to bypass authentication on a route. */
export const IS_PUBLIC_KEY = 'isPublic';

/** Use on a controller or route to opt out of the global JwtAuthGuard. */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
