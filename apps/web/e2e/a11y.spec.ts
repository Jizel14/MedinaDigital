import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility baseline: WCAG AA on the 3 most important public surfaces.
 * Disable the 'color-contrast' check on tags rendered over varying backgrounds
 * (motif overlays) where axe gets false positives — re-enable once we lock the
 * contrast manually. Anything else is a fail.
 */
const PAGES_TO_AUDIT = [
  { name: 'home', path: '/en' },
  { name: 'search', path: '/en/search' },
  { name: 'product', path: '/en/products/plat-couscous-nabeul-khaled-1' },
  { name: 'trusttag', path: '/en/t/TT01HNA1A0N5T6V8X0Z2B4D6F8GH' },
  { name: 'about', path: '/en/about' },
];

for (const { name, path } of PAGES_TO_AUDIT) {
  test(`a11y · ${name}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
