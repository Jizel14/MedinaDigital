import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

const ARIANA = '01HG0000000ARIANA000000000';

describe('Products e2e (owner CRUD + public read)', () => {
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
    await ds.query("DELETE FROM products WHERE slug LIKE 'p-e2e-%'");
    await ds.query('DELETE FROM refresh_tokens');
    await ds.query("DELETE FROM users WHERE email LIKE '%@p-e2e.test'");
    await ds.query("DELETE FROM artisans WHERE slug LIKE 'p-e2e-%'");
    await ds.query("DELETE FROM tenants WHERE slug LIKE 'p-e2e-%'");
    await app.close();
  });

  let access = '';
  let productId = '';
  let productSlug = '';

  it('signup an artisan for product tests', async () => {
    const r = await request(server)
      .post('/api/auth/signup')
      .send({
        email: 'a@p-e2e.test',
        password: 'Pass123!Pass',
        role: 'artisan',
        artisan: {
          name: 'P E2E Artisan',
          regionId: ARIANA,
          primaryCategorySlug: 'ceramics',
          yearsOfPractice: 4,
        },
      })
      .expect(201);
    access = r.body.accessToken;
  });

  const baseProduct = {
    slug: 'p-e2e-vase-bleu',
    categorySlug: 'ceramics',
    regionId: ARIANA,
    title: { en: 'Blue Vase', fr: 'Vase bleu', 'ar-TN': 'زهرية زرقاء' },
    descriptionShort: { en: 'A vase', fr: 'Un vase', 'ar-TN': 'زهرية' },
    descriptionLong: { en: 'Hand-thrown.', fr: 'Tournée à la main.', 'ar-TN': 'بالإيد' },
    dimensions: { lengthCm: 12, widthCm: 12, heightCm: 25 },
    weightG: 800,
    priceTnd: 180,
    priceEur: 55,
    photos: ['/images/seed/placeholder.svg'],
    materials: [
      { name: { en: 'Clay', fr: 'Argile', 'ar-TN': 'طين' }, percentage: 90, origin: 'Nabeul' },
      { name: { en: 'Glaze', fr: 'Émail', 'ar-TN': 'دهان' }, percentage: 10 },
    ],
  };

  it('POST /api/me/products creates product → 201 with materials', async () => {
    const res = await request(server)
      .post('/api/me/products')
      .set('Authorization', `Bearer ${access}`)
      .send(baseProduct)
      .expect(201);
    expect(res.body.slug).toBe('p-e2e-vase-bleu');
    expect(res.body.artisanId).toBeTruthy();
    expect(res.body.tenantId).toBeNull();
    expect(res.body.materials).toHaveLength(2);
    productId = res.body.id;
    productSlug = res.body.slug;
  });

  it('POST /api/me/products materials sum != 100 → 409 MATERIALS_SUM_INVALID', async () => {
    const res = await request(server)
      .post('/api/me/products')
      .set('Authorization', `Bearer ${access}`)
      .send({
        ...baseProduct,
        slug: 'p-e2e-bad',
        materials: [
          { name: { en: 'Clay', fr: 'Argile', 'ar-TN': 'طين' }, percentage: 60 },
          { name: { en: 'Glaze', fr: 'Émail', 'ar-TN': 'دهان' }, percentage: 30 },
        ],
      })
      .expect(409);
    expect(res.body.code).toBe('MATERIALS_SUM_INVALID');
  });

  it('POST /api/me/products duplicate slug → 409 SLUG_TAKEN', async () => {
    const res = await request(server)
      .post('/api/me/products')
      .set('Authorization', `Bearer ${access}`)
      .send(baseProduct)
      .expect(409);
    expect(res.body.code).toBe('SLUG_TAKEN');
  });

  it('GET /api/me/products lists own products', async () => {
    const res = await request(server)
      .get('/api/me/products')
      .set('Authorization', `Bearer ${access}`)
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].slug).toBe(productSlug);
  });

  it('GET /api/me/products/:id returns the product', async () => {
    const res = await request(server)
      .get(`/api/me/products/${productId}`)
      .set('Authorization', `Bearer ${access}`)
      .expect(200);
    expect(res.body.id).toBe(productId);
  });

  it('PATCH /api/me/products/:id updates price + materials', async () => {
    const res = await request(server)
      .patch(`/api/me/products/${productId}`)
      .set('Authorization', `Bearer ${access}`)
      .send({
        priceTnd: 220,
        materials: [{ name: { en: 'Clay', fr: 'Argile', 'ar-TN': 'طين' }, percentage: 100 }],
      })
      .expect(200);
    expect(res.body.priceTnd).toBe('220.00');
    expect(res.body.materials).toHaveLength(1);
  });

  it('GET /api/products (public) lists the created product', async () => {
    const res = await request(server).get('/api/products').expect(200);
    const slugs = res.body.map((p: { slug: string }) => p.slug);
    expect(slugs).toContain(productSlug);
  });

  it('GET /api/products/:slug (public) returns the product', async () => {
    const res = await request(server).get(`/api/products/${productSlug}`).expect(200);
    expect(res.body.id).toBe(productId);
  });

  it('GET /api/artisans/:slug/products (public) lists the artisan products', async () => {
    const res = await request(server).get('/api/artisans/p-e2e-artisan/products').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(productId);
  });

  it('GET /api/artisans/:slug not public yet → 404 (isPublic=false from signup)', async () => {
    await request(server).get('/api/artisans/p-e2e-artisan').expect(404);
  });

  it('After PATCH /api/me/artisan { isPublic: true }, GET /api/artisans/:slug → 200', async () => {
    await request(server)
      .patch('/api/me/artisan')
      .set('Authorization', `Bearer ${access}`)
      .send({ isPublic: true })
      .expect(200);
    const res = await request(server).get('/api/artisans/p-e2e-artisan').expect(200);
    expect(res.body.isPublic).toBe(true);
  });

  it('DELETE /api/me/products/:id → 204; subsequent GET → 404', async () => {
    await request(server)
      .delete(`/api/me/products/${productId}`)
      .set('Authorization', `Bearer ${access}`)
      .expect(204);
    await request(server)
      .get(`/api/me/products/${productId}`)
      .set('Authorization', `Bearer ${access}`)
      .expect(404);
  });
});
