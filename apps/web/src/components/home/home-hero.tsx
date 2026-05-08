import { getTranslations } from 'next-intl/server';
import type { Locale, Region } from '@medina/shared-types';
import { Container, GradientBorderButton, ZelligePattern } from '@medina/ui';
import { Link } from '@/i18n/navigation';
import { ZelligeConstellation } from './zellige-constellation';
import { HeroVideoBackground } from './hero-video-background';

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
      {/* Looped Remotion-rendered MP4 background (palette gradients + zellige
          stars + editorial taglines). The component pins itself to inset-0 -z-10
          and adds a clay-100 lightening overlay so the foreground text and
          buttons stay readable. */}
      <HeroVideoBackground />

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
