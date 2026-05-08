import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';

interface RefreshJwtPayload {
  sub: string;
  jti: string;
}

interface RefreshContext {
  userId: string;
  jti: string;
  rawToken: string;
}

/**
 * Validates the refresh token signature + expiry only. The DB lookup (token
 * hash + revoked check) happens in AuthService.refresh(); this strategy just
 * extracts the token from the body and decodes it.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: RefreshJwtPayload): RefreshContext {
    const rawToken = (req.body as { refreshToken?: string })?.refreshToken ?? '';
    return { userId: payload.sub, jti: payload.jti, rawToken };
  }
}
