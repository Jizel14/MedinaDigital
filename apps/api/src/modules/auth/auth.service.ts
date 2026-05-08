import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { DataSource, Repository, IsNull } from 'typeorm';
import { ulid } from 'ulid';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Artisan } from '../artisans/artisan.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';
import { SignupDto } from './dto/signup.dto';
import { generateUniqueSlug, slugify } from '../../common/utils/slug';
import type { AuthUser } from '../../common/types/request-with-user';

const PASSWORD_SALT_ROUNDS = 12;

// Refresh tokens are signed JWTs (high entropy). We SHA-256 them for storage.
// Why not bcrypt: bcrypt truncates input to 72 bytes — JWTs share long identical
// prefixes (header + base64 sub claim), so two tokens for the same user collide
// under bcrypt. SHA-256 hashes the full token deterministically.
function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export interface AuthBundle {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: User['role'] };
  profile: Artisan | Tenant | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken) private readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(Artisan) private readonly artisans: Repository<Artisan>,
    @InjectRepository(Tenant) private readonly tenants: Repository<Tenant>,
    @InjectRepository(Region) private readonly regions: Repository<Region>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Signup (transactional) ──────────────────────────────────────────────

  async signup(dto: SignupDto): Promise<AuthBundle> {
    // Pre-check email uniqueness early to give a clean error
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'An account already exists for this email',
      });
    }

    return this.dataSource.transaction(async (manager) => {
      const userId = ulid();
      const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

      let artisan: Artisan | null = null;
      let tenant: Tenant | null = null;

      if (dto.role === 'artisan' && dto.artisan) {
        await this.assertRegionExists(dto.artisan.regionId);
        await this.assertCategoryExists(dto.artisan.primaryCategorySlug);

        const artisanId = ulid();
        const slug = await generateUniqueSlug(slugify(dto.artisan.name), async (s) => {
          const conflict = await manager.getRepository(Artisan).findOne({ where: { slug: s } });
          return conflict === null;
        });

        artisan = await manager.getRepository(Artisan).save({
          id: artisanId,
          slug,
          name: dto.artisan.name,
          nameLocalized: null,
          yearsOfPractice: dto.artisan.yearsOfPractice,
          regionId: dto.artisan.regionId,
          primaryCategorySlug: dto.artisan.primaryCategorySlug,
          // Default story / bio empty for new accounts; user can fill later
          story: { en: '', fr: '', 'ar-TN': '' },
          shortBio: { en: '', fr: '', 'ar-TN': '' },
          portrait: '/images/seed/placeholder.svg',
          workshopPhoto: null,
          isPublic: false, // hidden until profile completed
        });

        await manager.getRepository(User).save({
          id: userId,
          email: dto.email,
          passwordHash,
          role: 'artisan',
          artisanId,
          tenantId: null,
          emailVerifiedAt: null,
        });
      } else if (dto.role === 'pme_owner' && dto.tenant) {
        await this.assertRegionExists(dto.tenant.regionId);
        await this.assertCategoryExists(dto.tenant.primaryCategorySlug);

        const tenantId = ulid();
        const slug = await generateUniqueSlug(slugify(dto.tenant.businessName), async (s) => {
          const conflict = await manager.getRepository(Tenant).findOne({ where: { slug: s } });
          return conflict === null;
        });

        tenant = await manager.getRepository(Tenant).save({
          id: tenantId,
          slug,
          businessName: dto.tenant.businessName,
          businessNameAr: null,
          regionId: dto.tenant.regionId,
          primaryCategorySlug: dto.tenant.primaryCategorySlug,
          yearFounded: dto.tenant.yearFounded ?? null,
          artisanCount: dto.tenant.artisanCount ?? 1,
          patenteNumber: null,
          kycStatus: 'pending',
          preferredLanguage: 'fr',
        });

        await manager.getRepository(User).save({
          id: userId,
          email: dto.email,
          passwordHash,
          role: 'pme_owner',
          artisanId: null,
          tenantId,
          emailVerifiedAt: null,
        });
      } else {
        throw new UnauthorizedException({
          code: 'VALIDATION_FAILED',
          message: 'Unsupported signup combination',
        });
      }

      const tokens = await this.issueTokens(
        {
          id: userId,
          role: dto.role,
          artisanId: artisan?.id ?? null,
          tenantId: tenant?.id ?? null,
        },
        manager.getRepository(RefreshToken),
      );

      return {
        ...tokens,
        user: { id: userId, email: dto.email, role: dto.role },
        profile: artisan ?? tenant,
      };
    });
  }

  // ── Login ────────────────────────────────────────────────────────────────

  async validatePassword(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.users.findOne({ where: { email } });
    if (!user) return null;
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return null;
    return {
      id: user.id,
      role: user.role,
      artisanId: user.artisanId,
      tenantId: user.tenantId,
    };
  }

  async login(authUser: AuthUser): Promise<AuthBundle> {
    const user = await this.users.findOne({ where: { id: authUser.id } });
    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }
    const tokens = await this.issueTokens(authUser, this.refreshTokens);
    const profile = await this.loadProfile(user);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role },
      profile,
    };
  }

  // ── Refresh (rotation) ───────────────────────────────────────────────────

  async refresh(
    userId: string,
    jti: string,
    rawToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const row = await this.refreshTokens.findOne({ where: { id: jti } });
    if (!row || row.userId !== userId || row.revokedAt !== null) {
      throw new UnauthorizedException({
        code: 'REFRESH_REVOKED',
        message: 'Refresh token revoked or unknown',
      });
    }
    if (row.tokenHash !== hashRefreshToken(rawToken)) {
      throw new UnauthorizedException({
        code: 'REFRESH_REVOKED',
        message: 'Refresh token revoked or unknown',
      });
    }
    if (row.expiresAt.getTime() < Date.now()) {
      await this.refreshTokens.update({ id: row.id }, { revokedAt: new Date() });
      throw new UnauthorizedException({
        code: 'REFRESH_EXPIRED',
        message: 'Refresh token expired',
      });
    }

    await this.refreshTokens.update({ id: row.id }, { revokedAt: new Date() });

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({
        code: 'REFRESH_REVOKED',
        message: 'User no longer exists',
      });
    }
    return this.issueTokens(
      {
        id: user.id,
        role: user.role,
        artisanId: user.artisanId,
        tenantId: user.tenantId,
      },
      this.refreshTokens,
    );
  }

  // ── Logout ───────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.refreshTokens.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  // ── Me ───────────────────────────────────────────────────────────────────

  async me(
    userId: string,
  ): Promise<{
    user: { id: string; email: string; role: User['role'] };
    profile: Artisan | Tenant | null;
  }> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    }
    const profile = await this.loadProfile(user);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      profile,
    };
  }

  // ── Internals ────────────────────────────────────────────────────────────

  private async loadProfile(user: User): Promise<Artisan | Tenant | null> {
    if (user.role === 'artisan' && user.artisanId) {
      return this.artisans.findOne({ where: { id: user.artisanId } });
    }
    if (user.role === 'pme_owner' && user.tenantId) {
      return this.tenants.findOne({ where: { id: user.tenantId } });
    }
    return null;
  }

  private async issueTokens(
    payload: AuthUser,
    refreshRepo: Repository<RefreshToken>,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessTtl = this.config.getOrThrow<string>('JWT_ACCESS_TTL');
    const refreshTtl = this.config.getOrThrow<string>('JWT_REFRESH_TTL');

    const accessToken = await this.jwt.signAsync(
      {
        sub: payload.id,
        role: payload.role,
        artisanId: payload.artisanId,
        tenantId: payload.tenantId,
      },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: accessTtl,
      },
    );

    const jti = ulid();
    const refreshToken = await this.jwt.signAsync(
      { sub: payload.id, jti },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      },
    );

    await refreshRepo.save({
      id: jti,
      userId: payload.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + parseTtlMs(refreshTtl)),
      revokedAt: null,
      userAgent: null,
    });

    return { accessToken, refreshToken };
  }

  private async assertRegionExists(regionId: string): Promise<void> {
    const found = await this.regions.findOne({ where: { id: regionId } });
    if (!found) {
      throw new NotFoundException({
        code: 'INVALID_REGION',
        message: `Unknown region: ${regionId}`,
      });
    }
  }

  private async assertCategoryExists(slug: string): Promise<void> {
    const found = await this.categories.findOne({ where: { slug } });
    if (!found) {
      throw new NotFoundException({
        code: 'INVALID_CATEGORY',
        message: `Unknown category: ${slug}`,
      });
    }
  }
}

/** Parses TTLs like "15m", "30d", "12h", "3600s" into milliseconds. */
function parseTtlMs(ttl: string): number {
  const m = ttl.match(/^(\d+)\s*([smhd])$/);
  if (!m) throw new Error(`Invalid TTL: ${ttl}`);
  const n = parseInt(m[1]!, 10);
  switch (m[2]) {
    case 's':
      return n * 1000;
    case 'm':
      return n * 60_000;
    case 'h':
      return n * 3_600_000;
    case 'd':
      return n * 86_400_000;
  }
  throw new Error(`Invalid TTL unit: ${ttl}`);
}
