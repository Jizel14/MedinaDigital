'use client';

import { useRouter } from '@/i18n/navigation';
import type { Locale, Product } from '@medina/shared-types';
import { useTranslations } from 'next-intl';
import { Container, StarOrnament } from '@medina/ui';
import DomeGallery from './DomeGallery';

export interface BestSellersDomeProps {
  products: Product[];
  locale: Locale;
}

/**
 * Hero-scale 3D rotating dome of "best-sellers". Renders DomeGallery (vendored
 * from React Bits) with the products' photos. Click on an enlarged tile
 * navigates to the product page.
 *
 * Visual identity additions over the vanilla DomeGallery:
 * - kept colour (no grayscale) so the photos read as artisan craft
 * - warm radial halo behind the sphere (clay-300 → transparent) signals
 *   the "best-sellers" status without a literal banner
 * - top-3 medallion ribbon above the dome listing the standout pieces
 *
 * Most-selled selection: until we have order data, we proxy by
 * `priceEur` descending — high-tier pieces are the showcase. Once an API
 * returns sales counts the input list just changes; this component stays.
 */
export function BestSellersDome({ products, locale }: BestSellersDomeProps) {
  const t = useTranslations();
  const router = useRouter();

  // Top by EUR price as a stand-in for "most-selled" until we have real data.
  const ranked = [...products].sort((a, b) => b.priceEur - a.priceEur);
  const top3 = ranked.slice(0, 3);

  // The dome looks best when we have ~10-30 distinct tiles; it'll repeat them
  // across the sphere if we have fewer than the segment count. Pass them all.
  const images = ranked.map((p) => ({
    src: p.photos[0] ?? '/images/seed/placeholder.svg',
    alt: p.title[locale],
    href: `/${locale}/products/${p.slug}`,
  }));

  const handleOpen = (info: { src: string; alt: string; href?: string }) => {
    if (info.href) router.push(info.href);
  };

  return (
    <section
      aria-labelledby="best-sellers-heading"
      className="relative overflow-hidden bg-[color:var(--color-clay-50)]"
    >
      {/* Warm radial halo signalling "best-sellers" without a banner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 55%, oklch(from var(--color-clay-300) l c h / 0.55), transparent 70%)',
        }}
      />

      <Container size="lg" className="py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              <StarOrnament size={11} className="text-[color:var(--color-clay-700)]" />
              {locale === 'fr'
                ? 'Les pièces les plus convoitées'
                : locale === 'ar-TN'
                  ? 'القطع الأكثر طلب'
                  : 'Most coveted pieces'}
            </p>
            <h2
              id="best-sellers-heading"
              className="italic"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-3xl)',
                color: 'var(--color-ink-900)',
              }}
            >
              {t('home.featuredTitle')}
            </h2>
          </div>

          {/* Top 3 medallion ribbon */}
          <ol className="hidden items-center gap-4 md:flex">
            {top3.map((p, i) => (
              <li
                key={p.id}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]"
              >
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    background:
                      i === 0
                        ? 'var(--color-clay-700)'
                        : i === 1
                          ? 'var(--color-clay-500)'
                          : 'var(--color-olive-700)',
                    color: 'var(--color-clay-100)',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                >
                  {i + 1}
                </span>
                <span className="max-w-[10ch] truncate normal-case [font-family:var(--font-display)] not-italic font-medium text-[color:var(--color-ink-900)] tracking-normal text-sm">
                  {p.title[locale]}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* DomeGallery sits in a fixed-aspect frame so it doesn't push the page */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-transparent">
          <DomeGallery
            images={images}
            grayscale={false}
            fit={0.7}
            minRadius={500}
            segments={28}
            maxVerticalRotationDeg={4}
            dragDampening={2}
            imageBorderRadius="14px"
            openedImageBorderRadius="20px"
            openedImageWidth="280px"
            openedImageHeight="380px"
            onImageOpen={handleOpen}
          />
        </div>
      </Container>
    </section>
  );
}
