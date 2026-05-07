# Médina Digital

SaaS + marketplace pour artisans tunisiens, vers les acheteurs européens. Traçabilité produit (DPP UE) intégrée.

> Vague A en cours · vitrine marketplace publique (6 routes × 3 locales). Vagues B (dashboard PME) et C (commandes/paiements) suivront.

## Stack

| Couche            | Choix                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Frontend          | Next.js 15 App Router · TypeScript strict · Tailwind v4 · Framer Motion                     |
| Design system     | shadcn/ui (personnalisé) · CSS variables tokens · SVG signature (étoile zellige 8 branches) |
| i18n              | next-intl · `en` (défaut), `fr`, `ar-TN` (RTL)                                              |
| Backend (Vague B) | NestJS + TypeORM + MySQL                                                                    |
| Auth (Vague B)    | JWT custom + Passport                                                                       |
| Monorepo          | Nx + pnpm workspaces                                                                        |
| Hosting           | Vercel (web) + à trancher (api)                                                             |

## Démarrer

```bash
pnpm install
pnpm dev
# → http://localhost:3000/en
```

Routes principales :

- `/[locale]` — home (hero zellige animé + catégories + featured)
- `/[locale]/search` — catalogue avec filtres URL
- `/[locale]/products/[slug]` — fiche produit
- `/[locale]/artisans/[slug]` — fiche artisan
- `/[locale]/t/[trusttagId]` — passeport DPP publique
- `/[locale]/about` — éditorial
- `/[locale]/dev/components` — page QA design system (dev seul)

## Scripts utiles

```bash
pnpm dev            # Next.js dev server
pnpm build          # build toutes les apps
pnpm typecheck      # tsc strict sur tout le monorepo
pnpm lint           # eslint sur tout le monorepo
pnpm format:check   # vérification Prettier (read-only)
pnpm format         # auto-format
pnpm validate:seed  # valide les JSON seed contre les schémas Zod
pnpm i18n:check     # vérifie parité des clés EN/FR/AR-TN
pnpm test:e2e       # Playwright e2e (golden path × 3 locales + a11y axe)
pnpm ship           # ship-check : tous les checks avant deploy
pnpm graph          # ouvre le graph Nx du monorepo
```

## Structure

```
apps/
  web/                          # Next.js 15
    src/app/[locale]/(site)/    # routes publiques marketplace
    src/app/[locale]/dev/       # pages dev (QA design system)
    src/components/             # composants couplés à apps/web
    src/data/seed/              # 5 cat. + 8 régions + 6 artisans + 18 produits + 18 trusttags
    src/lib/data.ts             # façade data layer (async, swap-ready API NestJS)
    e2e/                        # Playwright + axe
libs/
  ui/                           # @medina/ui — primitives + brand + animations
  product-components/           # @medina/product-components — composants métier
  shared-types/                 # @medina/shared-types — DTOs + schémas Zod
  i18n/                         # @medina/i18n — config next-intl + messages
docs/
  superpowers/specs/            # specs design (vague-a-marketplace-design.md)
  superpowers/plans/            # plans d'implémentation
skills/                         # skills Claude (custom + officiels Anthropic)
.claude/                        # config Claude Code (agents + commands)
```

## Identité visuelle

- **Palette** terre cuite : terracotta `#8B3A24` · sable `#E8C8A0` · crème `#F5EFE6` · encre `#2B2622` · olivier `#3A6B5A`
- **Typographie** : Cormorant Garamond italique (titres latin) + Work Sans (corps) / Amiri + Tajawal (arabe)
- **Ornement signature** : étoile à 8 branches du zellige tunisien
- **Asymétrie contrôlée** : Cards radius `4 4 32 4` (top-left, top-right, bottom-right, bottom-left)

Toutes les règles design sont dans [CLAUDE.md](./CLAUDE.md).

## Décisions actées

Voir [CLAUDE.md → Décisions actées](./CLAUDE.md#décisions-actées-2026-05-07).

## Conformité

- **DPP UE** : tout produit a un passeport numérique avec matériaux, empreinte carbone/eau, durée de vie, instructions de fin de vie
- **WCAG AA** : audité via `@axe-core/playwright` sur les 5 routes critiques
- **i18n strict** : aucune string en dur, parité des clés vérifiée en CI
- **SEO** : sitemap auto-généré (~144 entrées), hreflang, JSON-LD prévu Vague C

## Tests

```bash
# Premier run (download des browsers)
pnpm --filter @medina/web exec playwright install chromium

# Lancer les tests
pnpm test:e2e
```

Couverture : golden path (home → search → produit → trusttag → artisan → about) × 3 locales × 2 viewports + a11y axe sur 5 pages clés + sitemap + robots.

## CI

GitHub Actions sur push/PR vers `main` :

1. **quality** : format + validate-seed + i18n-check + typecheck + lint
2. **build** : `next build`
3. **e2e** : Playwright (golden path + a11y)

Voir [.github/workflows/ci.yml](./.github/workflows/ci.yml).

## Skills Claude

Le repo embarque le brief produit et les conventions dans [CLAUDE.md](./CLAUDE.md), 5 skills custom dans `skills/` (artisan-catalog, trusttag-qr, pme-onboarding, buyer-storytelling, i18n-tunisian) et 4 skills officiels Anthropic (frontend-design, brand-guidelines, webapp-testing, skill-creator).
