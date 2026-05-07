import { getTranslations } from 'next-intl/server';
import type { Locale, Region } from '@medina/shared-types';
import { Container, GradientBorderButton, ZelligePattern } from '@medina/ui';
import { Link } from '@/i18n/navigation';
import { ZelligeConstellation } from './zellige-constellation';

export interface HomeHeroProps {
  locale: Locale;
  workshops: number;
  products: number;
  regions: Region[];
}

export async function HomeHero({ locale, workshops, products, regions }: HomeHeroProps) {
  const t = await getTranslations({ locale });

  return (
    <section className="relative overflow-hidden">
      {/* Soft zellige pattern background, very faint. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='64' height='64'><path d='M32 16 L34.3 26.4 L42 21.4 L37 29.1 L47.4 31.4 L37 33.7 L42 41.4 L34.3 36.4 L32 46.8 L29.7 36.4 L22 41.4 L27 33.7 L16.6 31.4 L27 29.1 L22 21.4 L29.7 26.4 Z' fill='%238B3A24' opacity='0.045'/></svg>\")",
          backgroundRepeat: 'repeat',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[120%] bg-gradient-to-b from-[color:var(--color-clay-50)] via-[color:var(--color-clay-100)] to-transparent"
      />

      <Container size="lg" className="relative pt-20 pb-20 md:pt-24 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          {/* Left column — copy + CTAs */}
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              <ZelligePattern
                size={20}
                opacity={0.7}
                className="text-[color:var(--color-clay-600)]"
              />
              {t('metadata.tagline')}
            </p>
            <h1
              className="italic"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: 1.05,
                letterSpacing: 'var(--tracking-display)',
                color: 'var(--color-clay-700)',
              }}
            >
              {t('home.heroTitle')}
            </h1>
            <p
              className="mt-6 max-w-2xl text-[color:var(--color-ink-700)]"
              style={{ fontSize: 'var(--text-lg)', lineHeight: 1.55 }}
            >
              {t('home.heroLead', { count: workshops, products })}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <GradientBorderButton asChild tone="primary" size="lg" withOrnament>
                <Link href="/search">{t('common.discover')}</Link>
              </GradientBorderButton>
              <GradientBorderButton asChild tone="light" size="md" withOrnament>
                <Link href="/about">{t('common.learnMore')}</Link>
              </GradientBorderButton>
            </div>
          </div>

          {/* Right column — animated zellige constellation */}
          <div className="relative aspect-[16/10] w-full lg:aspect-square">
            <ZelligeConstellation regions={regions} locale={locale} productCount={products} />
          </div>
        </div>
      </Container>
    </section>
  );
}
