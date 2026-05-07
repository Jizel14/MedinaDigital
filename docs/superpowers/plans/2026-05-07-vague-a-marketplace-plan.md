# Vague A Marketplace — Plan d'implémentation (light)

> Format léger : 8 phases ordonnées, pas de snippets ni TDD complet (la majorité des fichiers sont du config + UI statique). Référence exhaustive : `docs/superpowers/specs/2026-05-07-vague-a-marketplace-design.md`.

**Goal** : Livrer la vitrine marketplace publique (6 routes × 3 locales, RTL, design system identitaire, hero piece zellige animée).

**Architecture** : Monorepo Nx + pnpm. `apps/web` (Next.js 15 App Router SSG). 4 libs : `@medina/ui` (primitives + brand + animations), `@medina/product-components` (métier), `@medina/shared-types` (DTOs + Zod), `@medina/i18n` (next-intl + messages).

**Tech** : Next.js 15, TS strict, Tailwind v4, shadcn/ui (personnalisé), Framer Motion, next-intl, Playwright.

**Validation** : à la fin de chaque phase je commit + te montre l'état (URL dev server / screenshot / checklist). Tu valides ou tu corriges. Pas de question entre étapes sauf blocage technique réel.

---

## Phase 1 — Fondations monorepo (Nx + pnpm)

- Init `nx@latest` (preset `none`) à la racine `medina-digital/`, ajout pnpm-workspace existant
- Config `tsconfig.base.json` avec paths `@medina/*`
- ESLint + Prettier + `@nx/enforce-module-boundaries`
- `.gitignore` (inclut `.nx/`, `.next/`, `node_modules/`, `.superpowers/`)
- Husky + lint-staged
- Init git si pas fait, commit initial

**Done quand** : `pnpm install` passe, `nx graph` ouvre vide, ESLint marche.

---

## Phase 2 — Libs partagées (vide → typed)

- `libs/shared-types/` : types `Locale`, `Localized`, `Category`, `Region`, `Artisan`, `Product`, `TrustTag`, `ProductMaterial` + schémas Zod miroirs + script `validate:seed`
- `libs/i18n/` : config `next-intl` (locales en/fr/ar-TN, defaultLocale en, pathnames), `messages/{en,fr,ar-TN}.json` (clés metadata + nav + common, ~30 clés pour démarrer)
- Build de chaque lib via `nx build`

**Done quand** : import `@medina/shared-types` et `@medina/i18n` typecheck OK depuis un fichier dummy.

---

## Phase 3 — App Next.js bootstrap + Tailwind v4 + tokens

- `apps/web/` scaffoldé via `create-next-app@latest` (App Router, TS, Tailwind, sans `src/`-toggle ajusté ensuite vers `src/app/`)
- Migrate Tailwind config en CSS-first (`@theme` block dans `globals.css`)
- Tokens couleur (clay/ink/olive), typo (`--font-display`, `--font-body`), spacing, radius, shadows, durations, easing custom (cf spec §4.2)
- Polices Cormorant + Work Sans + Amiri + Tajawal self-hostées sous `public/fonts/` + `@font-face` + `next/font/local`
- `next.config.mjs` avec plugin `next-intl`, `transpilePackages: ['@medina/ui', '@medina/product-components', '@medina/i18n']`
- Middleware `next-intl` pour routing `/[locale]/...`
- Layouts `app/layout.tsx` (HTML racine vide) + `app/[locale]/layout.tsx` (lang + dir + NextIntlClientProvider + fonts)

**Done quand** : `pnpm --filter web dev` lance, `http://localhost:3000` redirige vers `/en`, page d'accueil minimaliste affiche un h1 dans Cormorant italic terracotta.

---

## Phase 4 — Design system : primitives + brand + animations (`@medina/ui`)

- 10 primitives (Button, Card, Tag, Badge, Input, Select, Divider, Skeleton, Container, VisuallyHidden) avec `cva` variants typés
- Logo placeholder (Cormorant wordmark + 4 variants)
- 5 ornements SVG : StarOrnament, ZelligePattern, DividerOrnament, ArchOrnament, TunisiaMap
- Variants Framer Motion (fadeUp, stagger, cardLift, starSpin) + hook `useReducedMotion`
- Une page Storybook-like `/[locale]/_dev/components` (dev-only) qui affiche tous les composants pour QA visuelle rapide

**Done quand** : la page `/en/_dev/components` rend les 10 primitives + 5 ornements + 4 variants Logo dans la palette terre cuite. Hover et reduced-motion testés.

---

## Phase 5 — Composants métier + seed JSON

- `libs/product-components/` : ProductCard, TrustTagBadge, PriceDisplay, RegionTag, ArtisanQuote
- `apps/web/src/data/seed/` : `categories.json` (5), `regions.json` (8), `artisans.json` (6), `products.json` (18), trusttags inclus dans products
- Photos seed : récupération Unsplash (~30 photos webp 1600×1200 + 800×600), placement sous `public/images/seed/{products,artisans,categories}/`
- Validation Zod au boot dev : si seed corrompu, build échoue
- `apps/web/src/lib/data.ts` façade async (toutes les fonctions promised)

**Done quand** : `pnpm validate:seed` passe vert, `data.getAllProducts()` renvoie 18 produits typés, ProductCard rendu test affiche un produit.

---

## Phase 6 — 6 routes + SEO + layout site

- `app/[locale]/layout.tsx` complet avec SiteHeader (logo, nav catégories, LocaleSwitcher) + SiteFooter
- `app/[locale]/page.tsx` (Home) : hero zellige constellation + categories showcase + featured products + regions strip
- `app/[locale]/search/page.tsx` : SearchFilters latéraux + ResultsGrid + filtrage client (URL state)
- `app/[locale]/products/[slug]/page.tsx` : galerie + meta + story + materials + TrustTag CTA + cross-sell
- `app/[locale]/artisans/[slug]/page.tsx` : portrait + story + ses produits
- `app/[locale]/t/[trusttagId]/page.tsx` : page DPP publique
- `app/[locale]/about/page.tsx` (MDX)
- `not-found.tsx`, `error.tsx`
- `app/sitemap.ts`, `app/robots.ts`, JSON-LD sur fiches produit, OG images, hreflang

**Done quand** : 6 routes navigables × 3 locales, RTL fonctionnel, sitemap.xml liste ~144 entrées, Lighthouse manuel sur home ≥ 90/95/95/95.

---

## Phase 7 — Hero piece : ZelligeConstellation animée

- Composant `<ZelligeConstellation />` dans `apps/web/src/components/home/`
- SVG inline 1600×900, 8 étoiles aux `region.mapCoords`, lignes pointillées entre étoiles
- Animation 4 phases (fade fond → path-drawing → étoiles scale+rotate stagger → pulse infini)
- Hover étoile → tooltip région
- Mobile : aspect carré, étoiles rapprochées
- `prefers-reduced-motion` → fallback fade simple
- Performance : <8 KB gzipped, will-change retiré post-mount

**Done quand** : sur la home, mount visible, smooth, scroll non-bloqué, marche sur mobile, accessible reduced-motion.

---

## Phase 8 — Tests + qualité + CI

- Playwright e2e golden path (home → search → produit → trusttag) × 3 locales × 2 viewports
- Visual regression `toHaveScreenshot` sur 5 routes clé
- `axe-core/playwright` a11y check sur chaque page
- Lighthouse CI budget config
- GitHub Actions : typecheck + lint + i18n check + validate:seed + tests + lighthouse + build
- `pnpm i18n:check` script (parse 3 messages.json, fail si clé manquante)
- Pre-commit Husky + lint-staged

**Done quand** : CI verte sur PR, screenshots de ref committés, Lighthouse budget pass.

---

## Notes d'exécution

- **Commits fréquents** : à la fin de chaque phase, `git add -A && git commit -m "feat(<scope>): <phase>"`
- **Branche unique** `main` pour Vague A (pas de feature branches, repo greenfield)
- **Pas de tests TDD stricts** sur les composants UI (rendu visuel difficile à tester pertinemment) — tests ciblent : data layer, e2e flows, a11y, visual regression
- **Si je rencontre un vrai blocage technique** (lib qui marche pas, conflit deps, etc.), je m'arrête et te demande
- **Hors blocage** : je commits + montre l'état + valide la phase + enchaîne
