import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Locale } from '@medina/shared-types';
import { Container, Divider, StarOrnament, ZelligePattern } from '@medina/ui';
import { routing } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: t('about') };
}

const COPY: Record<
  Locale,
  { headline: string; lede: string; pillars: { title: string; body: string }[] }
> = {
  en: {
    headline: 'Bridges, not borders.',
    lede: 'Médina Digital connects Tunisian workshops with European buyers, with traceability built in from day one. We do not own a kiln. We do not weave. What we do is verify, translate, and carry the work.',
    pillars: [
      {
        title: 'Verified at source',
        body: 'Every artisan is visited. Every product carries a digital passport — materials, region, footprint, end-of-life. No marketing claim ships unverified.',
      },
      {
        title: 'Built for Europe, made in Tunisia',
        body: 'Our buyers are in Paris, Brussels, Berlin. The objects ship from Nabeul, Sejnane, Kairouan. We translate, we package, we hand over.',
      },
      {
        title: 'Fair, then fast',
        body: 'Workshops keep the bigger share. We take a flat marketplace cut. No discount wars, no race to the bottom — handcraft is priced like handcraft.',
      },
    ],
  },
  fr: {
    headline: 'Des ponts, pas des frontières.',
    lede: 'Médina Digital relie les ateliers tunisiens aux acheteurs européens, traçabilité incluse dès le premier jour. Nous ne possédons pas de four. Nous ne tissons pas. Ce que nous faisons : vérifier, traduire, porter le travail.',
    pillars: [
      {
        title: 'Vérifié à la source',
        body: 'Chaque artisan est visité. Chaque produit porte un passeport numérique — matériaux, région, empreinte, fin de vie. Aucun argument marketing ne part sans vérification.',
      },
      {
        title: "Pensé pour l'Europe, fait en Tunisie",
        body: 'Nos acheteurs sont à Paris, Bruxelles, Berlin. Les objets partent de Nabeul, Sejnane, Kairouan. On traduit, on emballe, on transmet.',
      },
      {
        title: 'Juste, puis rapide',
        body: "Les ateliers gardent la plus grosse part. On prend une commission marketplace fixe. Pas de guerre des promos, pas de nivellement par le bas — l'artisanat se paie au prix de l'artisanat.",
      },
    ],
  },
  'ar-TN': {
    headline: '[À VALIDER PME] جسور، موش حدود.',
    lede: '[À VALIDER PME] Médina Digital تربط الورشات التونسية مع الحرفاء الأوروبيين، مع التتبع من النهار الأول. ما عندناش فرن. ما ننسجوش. الي نعملوه: نأكدوا، نترجموا، و نوصّلوا الخدمة.',
    pillars: [
      {
        title: '[À VALIDER PME] محقق من المصدر',
        body: '[À VALIDER PME] كل صناع نزروه. كل منتوج معاه باسبور رقمي — المواد، الجهة، البصمة، آخر الحياة.',
      },
      {
        title: '[À VALIDER PME] مفكّر للأوروبيين، معمول في تونس',
        body: '[À VALIDER PME] الحرفاء في باريس و بروكسيل و برلين. المنتوج يطلع من نابل و سجنان و القيروان.',
      },
      {
        title: '[À VALIDER PME] عادل قبل ما يكون فيسع',
        body: '[À VALIDER PME] الورشة تاخذ الجزء الأكبر. نا ناخذو نسبة marketplace ثابتة.',
      },
    ],
  },
};

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const copy = COPY[locale];
  const t = await getTranslations({ locale });

  return (
    <main>
      <Container size="md" className="py-20 md:py-28">
        <p className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          <ZelligePattern size={20} opacity={0.7} className="text-[color:var(--color-clay-600)]" />
          {t('nav.about')}
        </p>
        <h1
          className="italic"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(2.25rem, 5vw, 4rem)',
            lineHeight: 1.05,
            letterSpacing: 'var(--tracking-display)',
            color: 'var(--color-clay-700)',
          }}
        >
          {copy.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-700)]">
          {copy.lede}
        </p>

        <Divider className="my-16" />

        <div className="grid gap-12 md:grid-cols-3">
          {copy.pillars.map((p) => (
            <article key={p.title}>
              <StarOrnament size={18} className="text-[color:var(--color-clay-700)] mb-3" />
              <h2
                className="mb-3 italic"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-ink-900)',
                }}
              >
                {p.title}
              </h2>
              <p className="text-sm leading-relaxed text-[color:var(--color-ink-700)]">{p.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );
}
