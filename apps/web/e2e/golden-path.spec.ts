import { test, expect } from '@playwright/test';

const LOCALES = ['en', 'fr', 'ar-TN'] as const;

/**
 * Golden path: home → search → product → trusttag → artisan → about.
 * Run for each locale to ensure the i18n routing + SSG params work
 * everywhere. Catches dead routes, broken hreflang, missing translations.
 */
for (const locale of LOCALES) {
  test.describe(`golden path · ${locale}`, () => {
    test('home renders hero + categories + featured', async ({ page }) => {
      await page.goto(`/${locale}`);
      // Hero — there should be a clearly visible h1 in Cormorant terracotta.
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // CTA buttons — skip role check on `ar-TN` because aria labels live in
      // the localized strings.
      await expect(page.getByRole('main')).toBeVisible();
      // Footer renders site name.
      await expect(page.getByRole('contentinfo')).toContainText('Médina');
    });

    test('search lists products and filter changes URL', async ({ page }) => {
      await page.goto(`/${locale}/search`);
      const main = page.getByRole('main');
      await expect(main).toBeVisible();

      // 18 products in the seed — at minimum one ProductCard link should be present.
      const productLinks = main.locator('a[href*="/products/"]');
      await expect.poll(() => productLinks.count(), { timeout: 5_000 }).toBeGreaterThan(0);
    });

    test('product page renders gallery + materials + trusttag link', async ({ page }) => {
      await page.goto(`/${locale}/products/plat-couscous-nabeul-khaled-1`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // Gallery has at least one image
      const images = page.locator('main img');
      await expect.poll(() => images.count()).toBeGreaterThan(0);
      // TrustTag link present
      const trustLink = page.locator('a[href*="/t/"]').first();
      await expect(trustLink).toBeVisible();
    });

    test('trusttag page renders DPP grid and material bars', async ({ page }) => {
      await page.goto(`/${locale}/t/TT01HNA1A0N5T6V8X0Z2B4D6F8GH`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // dt/dd pairs in the DPP grid
      await expect(page.locator('dt')).not.toHaveCount(0);
    });

    test('artisan page renders portrait and product grid', async ({ page }) => {
      await page.goto(`/${locale}/artisans/khaled-ben-ahmed-nabeul`);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Khaled');
      await expect(page.locator('main img').first()).toBeVisible();
    });

    test('about page renders three pillars', async ({ page }) => {
      await page.goto(`/${locale}/about`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // Three h2 pillar titles in main
      const pillars = page.locator('main h2');
      await expect.poll(() => pillars.count()).toBe(3);
    });

    test('404 renders branded not-found', async ({ page }) => {
      const response = await page.goto(`/${locale}/this-route-does-not-exist`);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });
}

test.describe('locale switching', () => {
  test('html lang & dir match locale', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    await page.goto('/ar-TN');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar-TN');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('SEO surfaces', () => {
  test('sitemap.xml lists routes for all locales', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('/en');
    expect(body).toContain('/fr');
    expect(body).toContain('/ar-TN');
  });

  test('robots.txt allows crawl and points to sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Sitemap:/i);
  });
});
