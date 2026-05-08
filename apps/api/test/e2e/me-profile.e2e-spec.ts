import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

const ARIANA = '01HG0000000ARIANA000000000';
const NABEUL = '01HG0000000NABEUL000000000';

describe('Me profile e2e (artisan + pme_owner)', () => {
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
    await ds.query("DELETE FROM users WHERE email LIKE '%@me-e2e.test'");
    await ds.query("DELETE FROM artisans WHERE slug LIKE 'me-e2e-%'");
    await ds.query("DELETE FROM tenants WHERE slug LIKE 'me-e2e-%'");
    await app.close();
  });

  let artisanAccess = '';
  let pmeAccess = '';

  it('signup an artisan + a pme_owner', async () => {
    const a = await request(server)
      .post('/api/auth/signup')
      .send({
        email: 'a@me-e2e.test',
        password: 'Pass123!Pass',
        role: 'artisan',
        artisan: {
          name: 'Me E2E Artisan',
          regionId: ARIANA,
          primaryCategorySlug: 'ceramics',
          yearsOfPractice: 3,
        },
      })
      .expect(201);
    artisanAccess = a.body.accessToken;

    const p = await request(server)
      .post('/api/auth/signup')
      .send({
        email: 'p@me-e2e.test',
        password: 'Pass123!Pass',
        role: 'pme_owner',
        tenant: {
          businessName: 'Me E2E PME',
          regionId: ARIANA,
          primaryCategorySlug: 'ceramics',
          yearFounded: 2018,
          artisanCount: 4,
        },
      })
      .expect(201);
    pmeAccess = p.body.accessToken;
  });

  it('GET /api/me/artisan as artisan → 200', async () => {
    const res = await request(server)
      .get('/api/me/artisan')
      .set('Authorization', `Bearer ${artisanAccess}`)
      .expect(200);
    expect(res.body.name).toBe('Me E2E Artisan');
    expect(res.body.regionId).toBe(ARIANA);
  });

  it('GET /api/me/artisan as pme_owner → 403 FORBIDDEN', async () => {
    const res = await request(server)
      .get('/api/me/artisan')
      .set('Authorization', `Bearer ${pmeAccess}`)
      .expect(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('PATCH /api/me/artisan updates story + isPublic', async () => {
    const res = await request(server)
      .patch('/api/me/artisan')
      .set('Authorization', `Bearer ${artisanAccess}`)
      .send({
        story: { en: 'My story', fr: 'Mon histoire', 'ar-TN': 'حكايتي' },
        isPublic: true,
        regionId: NABEUL,
      })
      .expect(200);
    expect(res.body.story.en).toBe('My story');
    expect(res.body.isPublic).toBe(true);
    expect(res.body.regionId).toBe(NABEUL);
  });

  it('PATCH /api/me/artisan with bad regionId → 404 INVALID_REGION', async () => {
    const res = await request(server)
      .patch('/api/me/artisan')
      .set('Authorization', `Bearer ${artisanAccess}`)
      .send({ regionId: '01HG0000000NOPE0000000000Z' })
      .expect(404);
    expect(res.body.code).toBe('INVALID_REGION');
  });

  it('GET /api/me/tenant as pme_owner → 200', async () => {
    const res = await request(server)
      .get('/api/me/tenant')
      .set('Authorization', `Bearer ${pmeAccess}`)
      .expect(200);
    expect(res.body.businessName).toBe('Me E2E PME');
  });

  it('GET /api/me/tenant as artisan → 403 FORBIDDEN', async () => {
    await request(server)
      .get('/api/me/tenant')
      .set('Authorization', `Bearer ${artisanAccess}`)
      .expect(403);
  });

  it('PATCH /api/me/tenant updates artisanCount + preferredLanguage', async () => {
    const res = await request(server)
      .patch('/api/me/tenant')
      .set('Authorization', `Bearer ${pmeAccess}`)
      .send({ artisanCount: 12, preferredLanguage: 'ar-TN' })
      .expect(200);
    expect(res.body.artisanCount).toBe(12);
    expect(res.body.preferredLanguage).toBe('ar-TN');
  });

  it('GET /api/me/artisan without bearer → 401', async () => {
    await request(server).get('/api/me/artisan').expect(401);
  });
});
