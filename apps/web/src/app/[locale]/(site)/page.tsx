import { setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Locale, Region } from '@medina/shared-types';
import { routing } from '@/i18n/routing';
import {
  getCategories,
  getRegions,
  getFeaturedProducts,
  getAllArtisans,
  getAllProducts,
} from '@/lib/data';
import { HomeHero } from '@/components/home/home-hero';
import { CategoryStrip } from '@/components/home/category-strip';
import { BestSellersDome } from '@/components/home/best-sellers-dome';
import { FeaturedProducts } from '@/components/home/featured-products';
import { RegionsStrip } from '@/components/home/regions-strip';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [categories, regions, featured, artisans, allProducts] = await Promise.all([
    getCategories(),
    getRegions(),
    getFeaturedProducts(6),
    getAllArtisans(),
    getAllProducts(),
  ]);

  const regionsBySlug = regions.reduce<Record<string, Region>>((acc, r) => {
    acc[r.slug] = r;
    return acc;
  }, {});

  return (
    <main>
      <HomeHero
        locale={locale}
        workshops={artisans.length}
        products={allProducts.length}
        regions={regions}
      />
      <CategoryStrip categories={categories} locale={locale} />
      <BestSellersDome products={allProducts} locale={locale} />
      <FeaturedProducts products={featured} regionsBySlug={regionsBySlug} locale={locale} />
      <RegionsStrip regions={regions} locale={locale} />
    </main>
  );
}
