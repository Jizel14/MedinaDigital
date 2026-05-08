/**
 * Multi-tenant isolation tests. CRITICAL: a PR that breaks any of these is a
 * security regression — failing this suite must block merge.
 *
 * Scenario: two artisans (A, B), one PME owner (P). Each creates a product.
 * Each must be unable to read, modify, or delete products owned by the others.
 */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

const ARIANA = '01HG0000000ARIANA000000000';

interface Account {
  email: string;
  password: string;
  accessToken: string;
  productId: string;
}

describe('Cross-owner product isolation', () => {
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
    await ds.query('DELETE FROM product_materials');
    await ds.query("DELETE FROM products WHERE slug LIKE 'iso-%'");
    await ds.query('DELETE FROM refresh_tokens');
    await ds.query("DELETE FROM users WHERE email LIKE '%@iso.test'");
    await ds.query("DELETE FROM artisans WHERE slug LIKE 'iso-%'");
    await ds.query("DELETE FROM tenants WHERE slug LIKE 'iso-%'");
    await app.close();
  });

  const A: Account = {
    email: 'a@iso.test',
    password: 'Pass123!Pass',
    accessToken: '',
    productId: '',
  };
  const B: Account = {
    email: 'b@iso.test',
    password: 'Pass123!Pass',
    accessToken: '',
    productId: '',
  };
  const P: Account = {
    email: 'p@iso.test',
    password: 'Pass123!Pass',
    accessToken: '',
    productId: '',
  };

  const productPayload = (slug: string) => ({
    slug,
    categorySlug: 'ceramics',
    regionId: ARIANA,
    title: { en: slug, fr: slug, 'ar-TN': slug },
    descriptionShort: { en: 'x', fr: 'x', 'ar-TN': 'x' },
    descriptionLong: { en: 'x', fr: 'x', 'ar-TN': 'x' },
    dimensions: { lengthCm: 10, widthCm: 10, heightCm: 10 },
    weightG: 500,
    priceTnd: 100,
    priceEur: 30,
    photos: ['/images/seed/placeholder.svg'],
    materials: [{ name: { en: 'Clay', fr: 'Argile', 'ar-TN': 'طين' }, percentage: 100 }],
  });

  it('three accounts sign up and each creates a product', async () => {
    const ra = await request(server)
      .post('/api/auth/signup')
      .send({
        email: A.email,
        password: A.password,
        role: 'artisan',
        artisan: {
          name: 'Iso A',
          regionId: ARIANA,
          primaryCategorySlug: 'ceramics',
          yearsOfPractice: 1,
        },
      })
      .expect(201);
    A.accessToken = ra.body.accessToken;

    const rb = await request(server)
      .post('/api/auth/signup')
      .send({
        email: B.email,
        password: B.password,
        role: 'artisan',
        artisan: {
          name: 'Iso B',
          regionId: ARIANA,
          primaryCategorySlug: 'ceramics',
          yearsOfPractice: 1,
        },
      })
      .expect(201);
    B.accessToken = rb.body.accessToken;

    const rp = await request(server)
      .post('/api/auth/signup')
      .send({
        email: P.email,
        password: P.password,
        role: 'pme_owner',
        tenant: {
          businessName: 'Iso PME',
          regionId: ARIANA,
          primaryCategorySlug: 'ceramics',
          yearFounded: 2020,
          artisanCount: 3,
        },
      })
      .expect(201);
    P.accessToken = rp.body.accessToken;

    const pa = await request(server)
      .post('/api/me/products')
      .set('Authorization', `Bearer ${A.accessToken}`)
      .send(productPayload('iso-a-product'))
      .expect(201);
    A.productId = pa.body.id;

    const pb = await request(server)
      .post('/api/me/products')
      .set('Authorization', `Bearer ${B.accessToken}`)
      .send(productPayload('iso-b-product'))
      .expect(201);
    B.productId = pb.body.id;

    const pp = await request(server)
      .post('/api/me/products')
      .set('Authorization', `Bearer ${P.accessToken}`)
      .send(productPayload('iso-p-product'))
      .expect(201);
    P.productId = pp.body.id;
  });

  it('GET /api/me/products returns ONLY each owner’s own products', async () => {
    const resA = await request(server)
      .get('/api/me/products')
      .set('Authorization', `Bearer ${A.accessToken}`)
      .expect(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].id).toBe(A.productId);

    const resB = await request(server)
      .get('/api/me/products')
      .set('Authorization', `Bearer ${B.accessToken}`)
      .expect(200);
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].id).toBe(B.productId);

    const resP = await request(server)
      .get('/api/me/products')
      .set('Authorization', `Bearer ${P.accessToken}`)
      .expect(200);
    expect(resP.body).toHaveLength(1);
    expect(resP.body[0].id).toBe(P.productId);
  });

  it('GET /api/me/products/:id (B trying A’s id) → 404 NOT_FOUND', async () => {
    const res = await request(server)
      .get(`/api/me/products/${A.productId}`)
      .set('Authorization', `Bearer ${B.accessToken}`)
      .expect(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('PATCH /api/me/products/:id (B trying A’s id) → 404, target unchanged', async () => {
    await request(server)
      .patch(`/api/me/products/${A.productId}`)
      .set('Authorization', `Bearer ${B.accessToken}`)
      .send({ priceTnd: 9999 })
      .expect(404);

    const stillSame = await request(server)
      .get(`/api/me/products/${A.productId}`)
      .set('Authorization', `Bearer ${A.accessToken}`)
      .expect(200);
    expect(stillSame.body.priceTnd).not.toBe('9999.00');
  });

  it('DELETE /api/me/products/:id (P trying A’s id) → 404, target survives', async () => {
    await request(server)
      .delete(`/api/me/products/${A.productId}`)
      .set('Authorization', `Bearer ${P.accessToken}`)
      .expect(404);

    await request(server)
      .get(`/api/me/products/${A.productId}`)
      .set('Authorization', `Bearer ${A.accessToken}`)
      .expect(200);
  });

  it('artisan A cannot use the tenant profile endpoint', async () => {
    await request(server)
      .get('/api/me/tenant')
      .set('Authorization', `Bearer ${A.accessToken}`)
      .expect(403);
  });

  it('pme_owner P cannot use the artisan profile endpoint', async () => {
    await request(server)
      .get('/api/me/artisan')
      .set('Authorization', `Bearer ${P.accessToken}`)
      .expect(403);
  });
});
