import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser } from '../../../common/types/request-with-user';
import type { UserRole } from '../entities/user.entity';

interface AccessJwtPayload {
  sub: string;
  role: UserRole;
  artisanId: string | null;
  tenantId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Returned object is attached to req.user. */
  validate(payload: AccessJwtPayload): AuthUser {
    return {
      id: payload.sub,
      role: payload.role,
      artisanId: payload.artisanId,
      tenantId: payload.tenantId,
    };
  }
}
