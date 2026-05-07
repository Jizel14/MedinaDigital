/**
 * Dev-only component QA page. Renders every primitive + brand element +
 * animation variant in the design system at the design tokens. Used to
 * eyeball regressions before shipping a route. Not linked from the public
 * navigation; reach via /[locale]/_dev/components directly.
 */
import { setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Locale } from '@medina/shared-types';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardImage,
  CardMeta,
  CardTitle,
  Container,
  Divider,
  Input,
  Logo,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StarOrnament,
  Tag,
  ZelligePattern,
  ArchOrnament,
  TunisiaMap,
  DividerOrnament,
} from '@medina/ui';
import {
  ProductCard,
  TrustTagBadge,
  PriceDisplay,
  RegionTag,
  ArtisanQuote,
} from '@medina/product-components';
import { routing } from '@/i18n/routing';
import { getFeaturedProducts, getRegionBySlug, getArtisanById } from '@/lib/data';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2
        className="mb-6 italic"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-clay-700)',
        }}
      >
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="w-32 shrink-0 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default async function DevComponentsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Sample data from the seed for the business components preview.
  const featured = await getFeaturedProducts(3);
  const sampleProduct = featured[0];
  const sampleRegion = sampleProduct ? await getRegionBySlug(sampleProduct.region) : null;
  const sampleArtisan = sampleProduct ? await getArtisanById(sampleProduct.artisanId) : null;

  return (
    <main className="min-h-screen py-16">
      <Container size="lg">
        <header className="mb-12">
          <p className="mb-2 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
            Médina Digital · dev
          </p>
          <h1
            className="italic"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-4xl)',
              color: 'var(--color-clay-700)',
              letterSpacing: 'var(--tracking-display)',
            }}
          >
            Design system · {locale}
          </h1>
          <p className="mt-2 max-w-2xl text-[color:var(--color-ink-700)]">
            Every primitive, brand ornament, and animation in one place. Not linked from the public
            navigation.
          </p>
        </header>

        <Section title="Logo">
          <Row label="Lockup">
            <Logo variant="lockup" />
          </Row>
          <Row label="Lockup vertical">
            <Logo variant="lockup-vertical" />
          </Row>
          <Row label="Mark only">
            <Logo variant="mark" />
          </Row>
          <Row label="Wordmark only">
            <Logo variant="wordmark" />
          </Row>
        </Section>

        <Divider />

        <Section title="Brand ornaments">
          <Row label="Star (filled)">
            <StarOrnament size={24} className="text-[color:var(--color-clay-700)]" />
            <StarOrnament size={24} className="text-[color:var(--color-olive-700)]" />
            <StarOrnament size={24} className="text-[color:var(--color-ink-900)]" />
            <StarOrnament size={48} className="text-[color:var(--color-clay-700)]" />
          </Row>
          <Row label="Star (outline)">
            <StarOrnament
              size={24}
              variant="outline"
              className="text-[color:var(--color-clay-700)]"
            />
            <StarOrnament
              size={48}
              variant="outline"
              className="text-[color:var(--color-clay-700)]"
            />
          </Row>
          <Row label="Divider">
            <div className="w-full">
              <DividerOrnament />
            </div>
          </Row>
          <Row label="Zellige tile">
            <div className="text-[color:var(--color-clay-700)]">
              <ZelligePattern size={96} opacity={1} />
            </div>
            <div className="text-[color:var(--color-olive-700)]">
              <ZelligePattern size={96} opacity={0.6} />
            </div>
          </Row>
          <Row label="Arch">
            <div className="text-[color:var(--color-clay-700)]">
              <ArchOrnament size={56} />
            </div>
          </Row>
          <Row label="Tunisia map">
            <div className="text-[color:var(--color-clay-700)] w-64">
              <TunisiaMap width="100%" />
            </div>
          </Row>
        </Section>

        <Divider />

        <Section title="Buttons">
          <Row label="Primary">
            <Button variant="primary" size="sm">
              Discover
            </Button>
            <Button variant="primary" size="md">
              Discover
            </Button>
            <Button variant="primary" size="lg">
              Discover
            </Button>
          </Row>
          <Row label="Secondary">
            <Button variant="secondary" size="md">
              Learn more
            </Button>
            <Button variant="secondary" size="md" disabled>
              Disabled
            </Button>
          </Row>
          <Row label="Ghost">
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Row>
          <Row label="Ornament (auto-star)">
            <Button variant="ornament" size="md">
              Read the story
            </Button>
            <Button variant="ornament" size="lg">
              View region
            </Button>
          </Row>
        </Section>

        <Divider />

        <Section title="Tags & badges">
          <Row label="Tag (clay)">
            <Tag tone="clay">Nabeul</Tag>
            <Tag tone="clay">Sejnane</Tag>
            <Tag tone="clay">Sidi Bou Saïd</Tag>
          </Row>
          <Row label="Tag (olive/ink/muted)">
            <Tag tone="olive">Verified</Tag>
            <Tag tone="ink">Ceramics</Tag>
            <Tag tone="muted">Custom request</Tag>
          </Row>
          <Row label="Badges">
            <Badge tone="verified">
              <StarOrnament size={10} /> Verified
            </Badge>
            <Badge tone="soft">New</Badge>
            <Badge tone="outline">Limited</Badge>
          </Row>
        </Section>

        <Divider />

        <Section title="Inputs & select">
          <Row label="Input underline">
            <div className="w-72">
              <Input placeholder="Search a craft, a region, an artisan…" />
            </div>
          </Row>
          <Row label="Input boxed">
            <div className="w-72">
              <Input variant="boxed" placeholder="Email" />
            </div>
          </Row>
          <Row label="Select">
            <div className="w-72">
              <SelectRoot>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceramics">Ceramics</SelectItem>
                  <SelectItem value="textile">Textile</SelectItem>
                  <SelectItem value="leather">Leather</SelectItem>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="wood">Wood</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>
          </Row>
        </Section>

        <Divider />

        <Section title="Cards">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardImage>
                <div
                  aria-hidden
                  className="aspect-[4/3] w-full"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-clay-500) 0%, var(--color-clay-700) 100%)',
                  }}
                />
              </CardImage>
              <CardBody>
                <CardTitle>Plat à couscous</CardTitle>
                <CardMeta>Nabeul</CardMeta>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-[color:var(--color-clay-700)]">68 €</span>
                  <Tag tone="olive">Verified</Tag>
                </div>
              </CardBody>
            </Card>

            <Card variant="lift">
              <CardImage>
                <div
                  aria-hidden
                  className="aspect-[4/3] w-full"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-olive-500) 0%, var(--color-olive-900) 100%)',
                  }}
                />
              </CardImage>
              <CardBody>
                <CardTitle>Tapis kilim</CardTitle>
                <CardMeta>Kairouan</CardMeta>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-[color:var(--color-clay-700)]">240 €</span>
                  <Tag tone="olive">Verified</Tag>
                </div>
              </CardBody>
            </Card>

            <Card variant="flat">
              <CardImage>
                <Skeleton aspect="4/3" />
              </CardImage>
              <CardBody>
                <CardTitle>Loading…</CardTitle>
                <CardMeta>—</CardMeta>
                <div className="mt-3">
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardBody>
            </Card>
          </div>
        </Section>

        <Divider />

        <Section title="Skeletons">
          <Row label="Aspects">
            <Skeleton className="w-32 h-4" />
            <Skeleton aspect="1/1" className="w-24" />
            <Skeleton aspect="4/3" className="w-40" />
          </Row>
        </Section>

        <Divider />

        <Section title="Typography">
          <div className="space-y-4">
            <h1
              className="italic"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-5xl)',
                color: 'var(--color-clay-700)',
                letterSpacing: 'var(--tracking-display)',
              }}
            >
              Display 5xl · 80px · Cormorant italic
            </h1>
            <h2
              className="italic"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-3xl)',
                color: 'var(--color-ink-900)',
              }}
            >
              Heading 3xl · 40px
            </h2>
            <p style={{ fontSize: 'var(--text-lg)' }}>
              Lead text · 20px · Work Sans · used in hero leads and section ledes.
            </p>
            <p>
              Body text · 16px · Work Sans. Léger, lisible, neutre. Sert pour les descriptions
              produits et les paragraphes de section.
            </p>
            <p className="text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              Eyebrow / label · 12px tracked
            </p>
          </div>
        </Section>

        <Divider />

        <Section title="Palette">
          <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
            {(['clay', 'ink', 'olive'] as const).flatMap((scale) =>
              [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => {
                const cssVar = `--color-${scale}-${step}`;
                return (
                  <div
                    key={`${scale}-${step}`}
                    className="flex flex-col gap-1 text-[10px] [font-family:var(--font-mono)]"
                  >
                    <div
                      className="aspect-square w-full"
                      style={{ background: `var(${cssVar})` }}
                    />
                    <span className="opacity-60">
                      {scale}
                      {step}
                    </span>
                  </div>
                );
              }),
            )}
          </div>
        </Section>

        <Divider />

        <Section title="Business components (from seed)">
          {sampleProduct && sampleRegion && (
            <Row label="PriceDisplay">
              <PriceDisplay priceEur={sampleProduct.priceEur} locale={locale} size="sm" />
              <PriceDisplay priceEur={sampleProduct.priceEur} locale={locale} size="md" />
              <PriceDisplay
                priceEur={sampleProduct.priceEur}
                priceTnd={sampleProduct.priceTnd}
                locale={locale}
                size="lg"
                showBoth
              />
            </Row>
          )}

          {sampleRegion && (
            <Row label="RegionTag">
              <RegionTag region={sampleRegion} locale={locale} />
              <RegionTag region={sampleRegion} locale={locale} withoutStar />
            </Row>
          )}

          {sampleProduct && (
            <Row label="TrustTagBadge">
              <TrustTagBadge trusttagId={sampleProduct.trusttagId} locale={locale} />
              <TrustTagBadge
                trusttagId={sampleProduct.trusttagId}
                locale={locale}
                variant="detailed"
              />
            </Row>
          )}

          <div>
            <p className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
              ProductCard (3 featured)
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {await Promise.all(
                featured.map(async (p) => {
                  const region = await getRegionBySlug(p.region);
                  if (!region) return null;
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      region={region}
                      locale={locale}
                      href={`/${locale}/products/${p.slug}`}
                    />
                  );
                }),
              )}
            </div>
          </div>

          {sampleArtisan && sampleRegion && (
            <div>
              <p className="mb-3 text-xs uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                ArtisanQuote
              </p>
              <ArtisanQuote
                artisan={sampleArtisan}
                region={sampleRegion}
                locale={locale}
                href={`/${locale}/artisans/${sampleArtisan.slug}`}
              />
            </div>
          )}
        </Section>
      </Container>
    </main>
  );
}
