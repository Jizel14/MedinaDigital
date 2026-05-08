import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

const ARIANA_REGION_ID = '01HG0000000ARIANA000000000';

describe('Auth e2e (artisan)', () => {
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
    await ds.query("DELETE FROM artisans WHERE slug LIKE 'e2e-%'");
    await app.close();
  });

  const artisanPayload = {
    email: 'artisan@e2e.test',
    password: 'TestPass123!',
    role: 'artisan' as const,
    artisan: {
      name: 'E2E Test Potier',
      regionId: ARIANA_REGION_ID,
      primaryCategorySlug: 'ceramics',
      yearsOfPractice: 5,
    },
  };

  let accessToken = '';
  let refreshToken = '';
  let userId = '';
  let artisanId = '';

  it('POST /api/auth/signup → 201 with tokens + profile (slug = e2e-test-potier)', async () => {
    const res = await request(server).post('/api/auth/signup').send(artisanPayload).expect(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.user).toMatchObject({ email: artisanPayload.email, role: 'artisan' });
    expect(res.body.profile).toMatchObject({
      slug: 'e2e-test-potier',
      name: 'E2E Test Potier',
      regionId: ARIANA_REGION_ID,
      primaryCategorySlug: 'ceramics',
      isPublic: false,
    });
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
    userId = res.body.user.id;
    artisanId = res.body.profile.id;
  });

  it('POST /api/auth/signup duplicate email → 409 EMAIL_TAKEN', async () => {
    const res = await request(server).post('/api/auth/signup').send(artisanPayload).expect(409);
    expect(res.body.code).toBe('EMAIL_TAKEN');
  });

  it('POST /api/auth/signup unknown region → 404 INVALID_REGION', async () => {
    const res = await request(server)
      .post('/api/auth/signup')
      .send({
        ...artisanPayload,
        email: 'noregion@e2e.test',
        artisan: { ...artisanPayload.artisan, regionId: '01HG0000000NOPE0000000000Z' },
      })
      .expect(404);
    expect(res.body.code).toBe('INVALID_REGION');
  });

  it('POST /api/auth/signup missing nested artisan → 400', async () => {
    await request(server)
      .post('/api/auth/signup')
      .send({ email: 'bad@e2e.test', password: 'TestPass123!', role: 'artisan' })
      .expect(400);
  });

  it('GET /api/auth/me without bearer → 401', async () => {
    await request(server).get('/api/auth/me').expect(401);
  });

  it('GET /api/auth/me with bearer → 200 + user + profile', async () => {
    const res = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.user.id).toBe(userId);
    expect(res.body.profile.id).toBe(artisanId);
  });

  it('POST /api/auth/login wrong password → 401 INVALID_CREDENTIALS', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ email: artisanPayload.email, password: 'WrongPass!' })
      .expect(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/auth/login good password → 200 + new tokens', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ email: artisanPayload.email, password: artisanPayload.password })
      .expect(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    refreshToken = res.body.refreshToken;
    accessToken = res.body.accessToken;
  });

  it('POST /api/auth/refresh rotates: old refresh → 401 after rotation', async () => {
    const oldRefresh = refreshToken;
    const rot = await request(server)
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefresh })
      .expect(200);
    expect(rot.body.refreshToken).toBeTruthy();
    expect(rot.body.refreshToken).not.toBe(oldRefresh);
    refreshToken = rot.body.refreshToken;
    accessToken = rot.body.accessToken;

    // Reusing the old refresh must fail.
    const reuse = await request(server)
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefresh })
      .expect(401);
    expect(reuse.body.code).toBe('REFRESH_REVOKED');
  });

  it('POST /api/auth/logout → 204; subsequent refresh → 401', async () => {
    await request(server)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
    const after = await request(server)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(401);
    expect(after.body.code).toBe('REFRESH_REVOKED');
  });
});
