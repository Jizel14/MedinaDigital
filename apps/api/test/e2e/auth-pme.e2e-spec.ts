import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

const ARIANA_REGION_ID = '01HG0000000ARIANA000000000';

describe('Auth e2e (pme_owner)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    const ds = app.get(DataSource);
    await ds.query('DELETE FROM refresh_tokens');
    await ds.query("DELETE FROM users WHERE email LIKE '%@e2e.test'");
    await ds.query("DELETE FROM tenants WHERE slug LIKE 'e2e-%'");
    await app.close();
  });

  const pmePayload = {
    email: 'pme@e2e.test',
    password: 'TestPass123!',
    role: 'pme_owner' as const,
    tenant: {
      businessName: 'E2E Coopérative Tunis',
      regionId: ARIANA_REGION_ID,
      primaryCategorySlug: 'ceramics',
      yearFounded: 2020,
      artisanCount: 8,
    },
  };

  it('POST /api/auth/signup pme_owner → 201 + tenant profile', async () => {
    const res = await request(server).post('/api/auth/signup').send(pmePayload).expect(201);
    expect(res.body.user).toMatchObject({ email: pmePayload.email, role: 'pme_owner' });
    expect(res.body.profile).toMatchObject({
      slug: 'e2e-cooperative-tunis',
      businessName: 'E2E Coopérative Tunis',
      regionId: ARIANA_REGION_ID,
      primaryCategorySlug: 'ceramics',
      yearFounded: 2020,
      artisanCount: 8,
      kycStatus: 'pending',
    });
  });

  it('GET /api/auth/me on pme_owner → returns tenant profile (not artisan)', async () => {
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: pmePayload.email, password: pmePayload.password })
      .expect(200);
    const me = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);
    expect(me.body.user.role).toBe('pme_owner');
    expect(me.body.profile.businessName).toBe('E2E Coopérative Tunis');
    expect(me.body.profile.kycStatus).toBe('pending');
  });

  it('POST /api/auth/signup pme_owner with unknown category → 404 INVALID_CATEGORY', async () => {
    const res = await request(server)
      .post('/api/auth/signup')
      .send({
        ...pmePayload,
        email: 'badcat@e2e.test',
        tenant: { ...pmePayload.tenant, primaryCategorySlug: 'nonsense' },
      })
      .expect(404);
    expect(res.body.code).toBe('INVALID_CATEGORY');
  });
});
