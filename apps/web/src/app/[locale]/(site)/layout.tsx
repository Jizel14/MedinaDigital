import type { ReactNode } from 'react';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@medina/shared-types';
import { routing } from '@/i18n/routing';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

/**
 * Layout for the public marketplace pages: home, search, products, artisans,
 * trusttag pages, about. Adds the shared header and footer.
 *
 * The /[locale]/dev/* routes deliberately live outside this group so they
 * skip the header/footer chrome.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader locale={locale} />
      <div className="min-h-[calc(100vh-160px)]">{children}</div>
      <SiteFooter locale={locale} />
    </>
  );
}
