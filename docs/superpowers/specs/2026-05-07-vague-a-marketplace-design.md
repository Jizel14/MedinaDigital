# Spec — Vague A : Vitrine marketplace Médina Digital

**Date** : 2026-05-07
**Auteur** : Jizel Ziadi (avec Claude)
**Statut** : Approuvé pour implémentation
**Stack** : Next.js 15 · TypeScript · Tailwind v4 · shadcn/ui · Framer Motion · next-intl · Nx + pnpm

---

## 1. Contexte & objectif

Médina Digital construit un SaaS multi-tenant + marketplace pour rendre les artisans tunisiens visibles et vendables vers les acheteurs européens, avec traçabilité DPP (Digital Product Passport UE).

Cette **Vague A** livre la **vitrine acheteur publique** — pas d'authentification, pas de panier, pas de paiement. L'objectif est de produire un site **visuellement abouti** qui incarne l'identité Médina, support tangible pour acheteurs européens et démos jury/investisseurs. Les vagues B (dashboard PME) et C (commandes/paiements) suivront avec leur propre cycle de spec.

Le contenu provient d'un seed JSON statique (18 produits, 6 artisans, 8 régions, 5 catégories), validé par schémas Zod, prêt à être remplacé par l'API NestJS sans refactor des composants.

## 2. Périmètre

### 2.1 Dans le scope (6 routes)

| Route                       | Rendu             | Description                                                                           |
| --------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `/[locale]`                 | SSG               | Home — categories showcase, hero "constellation zellige", produits du moment, régions |
| `/[locale]/search`          | SSG + filtres URL | Catalogue avec filtres latéraux (catégorie, région, matériau, prix, vérifié DPP, tri) |
| `/[locale]/products/[slug]` | SSG               | Fiche produit : galerie, story artisan, materials, lien TrustTag, cross-sell          |
| `/[locale]/artisans/[slug]` | SSG               | Fiche artisan : portrait, atelier, région, ses produits                               |
| `/[locale]/t/[trusttagId]`  | SSG               | Page TrustTag publique : DPP complet, matériaux, empreinte, entretien, fin de vie     |
| `/[locale]/about`           | SSG (MDX)         | Notre engagement, équipe, conformité DPP                                              |

Locales : `en` (défaut), `fr`, `ar-TN` — RTL inclus dès le départ.

### 2.2 Hors scope explicite

- Authentification PME ou acheteur
- Panier, checkout, paiement Stripe
- Upload de produits, dashboard PME (→ Vague B)
- Backend NestJS et MySQL (→ Vagues B/C)
- Modèles 3D / AR (à trancher dans CLAUDE.md)
- Mode sombre
- Compte acheteur, wishlist, avis
- Recherche full-text serveur (filtrage côté client suffit pour ~18 produits)

### 2.3 Critères d'acceptation

- 6 routes navigables, contenu cohérent en 3 locales avec RTL fonctionnel
- Lighthouse Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95 sur chaque route × 3 locales
- Test e2e Playwright passant sur le golden path (home → search → produit → trusttag) en EN, FR, AR-TN
- Aucune erreur TypeScript, ESLint, ni clé i18n manquante en CI
- Sitemap auto-généré listant toutes les routes × 3 locales (ordre de grandeur : ~6 routes statiques + 18 produits + 6 artisans + 18 trusttags = ~48 chemins × 3 locales ≈ 144 entrées)
- Visual regression : screenshots de référence générés et stables

## 3. Architecture

### 3.1 Stack runtime

- **Next.js 15** App Router, Server Components par défaut, RSC streaming
- **TypeScript 5.x strict**, `noUncheckedIndexedAccess: true`
- **Tailwind CSS v4** (config CSS-first via `@theme`)
- **shadcn/ui** style "new-york" comme point de départ — chaque primitive copiée est personnalisée (radius asymétrique, ornement zellige, typo Cormorant)
- **Framer Motion** pour les animations
- **next-intl** pour l'i18n trilingue + RTL
- **Nx 21+** pour l'orchestration monorepo

### 3.2 Approche monorepo (Approche 1 — Nx standard)

```
medina-digital/
├── nx.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── apps/
│   └── web/                           # Next.js 15 App Router
│       ├── src/app/[locale]/...       # routes
│       ├── src/components/            # composants couplés à apps/web
│       ├── src/lib/                   # data layer façade
│       ├── src/data/seed/             # JSON statiques validés Zod
│       ├── public/{fonts,favicon,og,images/seed}/
│       └── e2e/                       # Playwright
├── libs/
│   ├── ui/                            # @medina/ui — primitives + brand + animations
│   ├── product-components/            # @medina/product-components — composants métier
│   ├── shared-types/                  # @medina/shared-types — DTOs + Zod
│   └── i18n/                          # @medina/i18n — config + messages
└── docs/superpowers/specs/
```

### 3.3 Frontières et règles d'import

- `apps/web` peut importer de toutes les `libs/`
- `libs/product-components` peut importer de `libs/ui`, `libs/shared-types`, `libs/i18n`
- `libs/ui` ne peut importer que des dépendances externes (garantit réutilisabilité)
- Cycles inter-libs interdits, contraintes Nx ESLint actives (`@nx/enforce-module-boundaries`)

```
apps/web ──→ libs/product-components ──→ libs/ui
   │              │
   ├──────────────┴────────→ libs/shared-types
   └──────────────────────→ libs/i18n
```

### 3.4 Data flow

Toute lecture de données passe par la façade `apps/web/src/lib/data.ts`. Les fonctions sont **toutes async** (même si lecture synchrone aujourd'hui) pour migration sans casse vers `fetch()` API NestJS.

```ts
getAllProducts(): Promise<Product[]>
getProductBySlug(slug: string): Promise<Product | null>
getProductsByArtisan(artisanId: string): Promise<Product[]>
getProductsByCategory(slug: CategorySlug): Promise<Product[]>
getRelatedProducts(productId: string, limit?: number): Promise<Product[]>
getArtisanBySlug(slug: string): Promise<Artisan | null>
getAllArtisans(): Promise<Artisan[]>
getTrustTagById(id: string): Promise<TrustTag | null>
getCategories(): Promise<Category[]>
getRegions(): Promise<Region[]>
searchProducts(filters: SearchFilters): Promise<Product[]>
```

### 3.5 Pages SSG

`generateStaticParams` × 3 locales pour chaque route dynamique. `generateMetadata` typé pour SEO + OpenGraph + `<link rel="alternate" hreflang>`. JSON-LD Schema.org `Product` / `Person` / `Organization` injecté.

## 4. Design system

### 4.1 Identité

- **Direction visuelle** : éditorial chaleureux. Espace, hiérarchie typo + tons terre/sable + ornements zellige discrets
- **Palette signature** : Terre cuite (terracotta `#8B3A24`, sable `#E8C8A0`, crème `#F5EFE6`, encre `#2B2622`, olivier `#3A6B5A`)
- **Typographie** : Cormorant Garamond italique (titres latins), Work Sans (corps latin), Amiri (titres arabes), Tajawal (corps arabe). Toutes self-hostées en woff2
- **Ornement signature** : étoile à 8 branches du zellige tunisien, présente partout (boutons, dividers, badges, hero piece)
- **Asymétrie contrôlée** : Cards avec radius `4 4 32 4` — la signature visuelle qui empêche le rendu "AI generic"

### 4.2 Tokens (Tailwind v4 `@theme`)

Couleurs : échelles `clay-50..900`, `ink-50..950`, `olive-100..900` + tokens sémantiques (`--color-bg`, `--color-fg`, `--color-primary`, etc.)

Typographie : `--font-display` (Cormorant + fallback Amiri), `--font-body` (Work Sans + fallback Tajawal), échelle modulaire ratio 1.25 de `text-xs` (12px) à `text-5xl` (80px hero), tracking custom (`--tracking-display: -0.02em`, `--tracking-label: 0.08em`)

Spacing : échelle 0.5 → 32 (px → 128px). Radius : `none/xs/sm/md/lg/xl` (`xl=32px` utilisé en bottom-right des Cards). Shadows douces (`--shadow-soft/card/lift`).

Animation : `--duration-fast` 200ms, `--duration-base` 400ms, `--duration-slow` 800ms, `--duration-hero` 1600ms. Easing custom `--ease-medina: cubic-bezier(0.32, 0.08, 0.24, 1)`.

### 4.3 Composants

**Primitives `libs/ui/src/primitives/`** (10) :
Button (4 variants × 3 sizes via `cva`), Card (asymétrique par défaut), Tag, Badge, Input, Select (Radix sous-jacent), Divider (option étoile centrée), Skeleton, Container, VisuallyHidden.

**Brand `libs/ui/src/brand/`** : 1 Logo + 5 ornements SVG inline.

- `<Logo />` (4 variants : lockup, mark, wordmark, lockup-vertical — placeholder Cormorant pour Vague A, vrai logo plus tard)
- 5 ornements : `<StarOrnament />` (étoile 8 branches, animée), `<ZelligePattern />` (tile 64×64 répétable), `<DividerOrnament />`, `<ArchOrnament />` (moucharabieh stylisée), `<TunisiaMap />` (carte stylisée pour hero piece + page régions).

**Métier `libs/product-components/`** (5) :
`<ProductCard />`, `<TrustTagBadge />`, `<PriceDisplay />` (TND ↔ EUR Intl.NumberFormat), `<RegionTag />`, `<ArtisanQuote />`.

### 4.4 Accessibilité & responsive

- WCAG AA minimum. Ratios contraste vérifiés (clay-700 sur clay-100 = 7.2:1 ✓)
- Focus visible custom (outline clay-700 2px offset 2)
- `prefers-reduced-motion` respecté partout
- Mobile-first, breakpoints Tailwind défaut. Header burger sous `md`
- RTL : classes logiques Tailwind (`ms-*`, `pe-*`, `start-*`, `end-*`). Icônes directionnelles `rtl:rotate-180`. Chiffres latins (1, 2, 3), pas indo-arabes

## 5. Modèle de données seed

### 5.1 Volume

| Entité     | Quantité                                                                  |
| ---------- | ------------------------------------------------------------------------- |
| Catégories | 5 (`ceramics`, `textile`, `leather`, `jewelry`, `wood`)                   |
| Régions    | 8 (Nabeul, Sejnane, Kairouan, Sfax, Sidi Bou Saïd, Djerba, Tozeur, Gabès) |
| Artisans   | 6                                                                         |
| Produits   | 18 (3 par artisan en moyenne)                                             |
| TrustTags  | 18 (1 par produit)                                                        |

### 5.2 Types `libs/shared-types/`

Types principaux (résumé — détail complet dans `libs/shared-types/src/`) :

```ts
export type Locale = 'en' | 'fr' | 'ar-TN';
export type Localized<T = string> = Record<Locale, T>;

export interface Product {
  id: string; // ULID
  slug: string; // URL-safe, immutable une fois publié
  artisanId: string;
  category: CategorySlug;
  region: RegionSlug;
  title: Localized<string>;
  descriptionShort: Localized<string>; // ≤ 160 char
  descriptionLong: Localized<string>; // 200-400 mots
  story: Localized<string>; // 100-200 mots, spécifique au produit
  materials: ProductMaterial[];
  dimensions: { lengthCm; widthCm; heightCm };
  weightG: number;
  priceTnd: number;
  priceEur: number;
  photos: string[];
  trusttagId: string;
  publishedAt: string;
  customRequest: boolean;
}

export interface Artisan {
  id;
  slug;
  name;
  nameLocalized?;
  yearsOfPractice;
  region: RegionSlug;
  primaryCategory: CategorySlug;
  story: Localized<string>;
  shortBio: Localized<string>;
  portrait: string;
  workshopPhoto?: string;
  isPublic: boolean;
}

export interface TrustTag {
  // = TrustTagDpp, conforme schéma DPP UE
  productId;
  trusttagId;
  gtin?;
  countryOfOrigin: 'TN';
  region;
  artisan: { id; name; workshopRegion };
  materials: ProductMaterial[];
  carbonFootprintKgCo2e: number | null;
  waterUsageLiters: number | null;
  energySource: 'grid' | 'solar' | 'mixed' | null;
  expectedLifetimeYears: number | null;
  careInstructions: Localized<string>;
  repairOptions: Localized<string> | null;
  endOfLife: Localized<string>;
  productionDate;
  batchId: string | null;
  certifications: string[];
  verifiedAt: string;
  verifiedBy: 'medina-digital';
}
```

### 5.3 Validation Zod

Chaque type a un schéma Zod miroir dans `libs/shared-types/src/schemas/`. Validation au boot dev + script `pnpm validate:seed` exécuté en pre-commit hook et avant chaque build CI. Règles fortes :

- `localizedString` : 3 locales toutes non-vides
- `slug` : kebab-case `^[a-z0-9]+(-[a-z0-9]+)*$`
- `descriptionShort` : ≤ 160 char par locale
- Somme `materials.percentage` ≈ 100 (tolérance ±1)
- ULIDs valides

### 5.4 Photos seed

Source : Unsplash (license permissive, mention dans `ATTRIBUTIONS.md`). Mots-clés "tunisian pottery", "kilim weaving", "leather workshop", "moroccan tiles". Format webp 1600×1200 + 800×600, responsive `<picture>`, blur placeholder Next.js Image. Pas d'images générées par IA. Naming kebab-case par slug : `products/<slug>-1.webp`.

### 5.5 Génération seed

Script Nx `nx run shared-types:gen-seed` lit YAML simplifié (édité par Seif sans coder), valide Zod, génère JSONs trilingues. Locales manquantes → `[À TRADUIRE]` flaggé, complétion via sub-agent `content-bilingual`.

## 6. i18n & RTL

- **Lib** : `next-intl`
- **Routing** : `/[locale]/...`, défaut `en`
- **Détection** : middleware `next-intl` → `Accept-Language` au premier visit, puis cookie `NEXT_LOCALE`
- **Messages** : `libs/i18n/messages/{en,fr,ar-TN}.json`, clés métier hiérarchiques (jamais par UI element)
- **RTL** : `<html dir="rtl" lang="ar-TN">` quand locale = `ar-TN`. Classes Tailwind v4 logiques. Icônes directionnelles `rtl:rotate-180`. Chiffres latins
- **Polices arabes self-hostées** : Amiri + Tajawal woff2, `font-display: swap`
- **CI guard** : `pnpm i18n:check` fail si clé manque dans une locale
- **Workflow trad** : source FR → EN puis AR-TN. Strings AR-TN générées par IA flaggées `[À VALIDER PME]` (skill `i18n-tunisian`)
- **`<LocaleSwitcher />`** : header, 3 abréviations EN · FR · AR séparées par `·`, active soulignée terracotta

## 7. Animations & ornements SVG

### 7.1 Principes

1. `prefers-reduced-motion` respecté partout (fallback : opacity simple ou aucune anim)
2. GPU-friendly uniquement : `transform`, `opacity`. Jamais `width/height/top/left`
3. Durations standards (tokens) : fast 200ms, base 400ms, slow 800ms, hero 1600ms
4. Easing custom `--ease-medina: cubic-bezier(0.32, 0.08, 0.24, 1)`
5. Variants Framer Motion réutilisables dans `libs/ui/src/animations/variants.ts`

### 7.2 Inventaire (10 animations)

| #   | Animation                         | Où                                     | Durée                     | Trigger            |
| --- | --------------------------------- | -------------------------------------- | ------------------------- | ------------------ |
| 1   | ZelligeConstellation (hero piece) | Home                                   | 2000ms intro + idle pulse | Mount + scroll     |
| 2   | Logo write-on                     | Header                                 | 800ms                     | First mount only   |
| 3   | StarOrnament rotation             | Buttons `variant="ornament"`, dividers | 500ms                     | Hover + idle       |
| 4   | Card lift                         | ProductCard, ArtisanCard               | 300ms                     | Hover              |
| 5   | Image zoom-in subtle              | Photos produit                         | 600ms                     | Hover (parent)     |
| 6   | Page transition                   | Toutes routes                          | 400ms fade-up             | Navigation         |
| 7   | Section reveal                    | Sections home                          | 600ms stagger             | Scroll into view   |
| 8   | Filter chip toggle                | `/search`                              | 200ms                     | Click              |
| 9   | Skeleton shimmer                  | Loading states                         | 1500ms loop               | Pendant chargement |
| 10  | Locale switch                     | Header                                 | 250ms cross-fade          | Click              |

### 7.3 Hero piece — `<ZelligeConstellation />`

Constellation de 8 étoiles zellige sur la home, reliées par lignes pointillées dessinant une carte stylisée de la Tunisie. Chaque étoile = une région artisanale. Survol → région illuminée + tooltip ("Nabeul · Céramique · 4 ateliers").

**Phases mount** :

1. 0–400ms : fade-in fond gradient clay-50 → clay-100
2. 400–1200ms : path-drawing lignes pointillées (`pathLength` 0→1, stagger 80ms)
3. 800–1800ms : étoiles apparaissent (scale 0→1 + rotate 0→22.5°, stagger 100ms, easeMedina)
4. 1800ms+ : pulse léger sur étoiles (1 → 1.05 → 1, 600ms, infinite avec délai aléatoire)

**Implémentation** : un seul SVG inline viewBox 1600×900. Coordonnées étoiles = `region.mapCoords` (seed). `<motion.path>` pour lignes, `<StarOrnament>` réutilisé. Mobile : aspect carré, étoiles rapprochées. `prefers-reduced-motion` → fade simple synchronisé. Pèse < 8 KB gzipped.

### 7.4 Ornements SVG (5)

`<StarOrnament />`, `<ZelligePattern />`, `<DividerOrnament />`, `<ArchOrnament />`, `<TunisiaMap />`. Tous inline, couleurs en `currentColor` ou tokens CSS, donc un même SVG marche en clay/ink/olive selon contexte.

## 8. Tests & qualité

- **Typecheck** strict CI : `nx run-many -t typecheck`
- **Lint** : ESLint + `@nx/enforce-module-boundaries`
- **Format** : Prettier
- **i18n check** : script `pnpm i18n:check` — fail si clé manquante
- **Seed validation** : Zod au boot dev + `pnpm validate:seed` (pre-commit + pre-build)
- **E2E** Playwright (skill `webapp-testing`) : golden path home → search → produit → trusttag × 3 locales × 2 viewports
- **Visual regression** : `toHaveScreenshot` sur 5 routes clé × 3 locales × 2 viewports
- **A11y** : `axe-core/playwright` sur chaque page testée — fail bloquant
- **Lighthouse CI** budget : Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- **Pre-commit** : Husky + lint-staged → format + lint + i18n check + seed validation
- **CI GitHub Actions** : typecheck + lint + tests + lighthouse + visual regression sur PR

## 9. SEO & performance

- Sitemap auto-généré (`app/sitemap.ts`) listant toutes les routes × 3 locales
- `robots.txt` autorise tout pour Vague A
- `<link rel="alternate" hreflang>` sur chaque page
- Canonical URL = locale courante (pas de défaut)
- JSON-LD `Product` + `Person` + `Organization` sur fiches produit
- Open Graph par locale (image OG dédiée par catégorie sous `public/og/`)
- Toutes pages SSG → TTFB minimal (Vercel CDN)
- Polices self-hostées + `font-display: swap` → pas de FOIT
- Images Next.js avec blur placeholder + WebP + tailles responsives
- Pas de JavaScript côté client pour les pages produits / artisan / about (RSC pur sauf composants animés ciblés)

## 10. Hors scope explicite & risques connus

### Hors scope (confirmé)

- Auth, panier, checkout, paiements (Vagues B/C)
- Backend NestJS / MySQL (Vague B)
- Dashboard PME, KYC, onboarding (Vague B)
- Modèles 3D / AR (à trancher)
- Mode sombre, wishlist, avis, recherche full-text serveur

### Risques

1. **Filtrage côté client sur `/search`** : OK pour ~18 produits, deviendra problématique à 1000+. Acceptable car on bascule sur API NestJS avant ce volume
2. **Logo placeholder** : Vague A utilise un wordmark Cormorant simple. Le vrai logo demande un travail de design dédié. Composant `<Logo />` en place, swap du SVG quand prêt
3. **Photos seed Unsplash** : pas authentiquement tunisiennes. Acceptable pour seed/démo, à remplacer par les photos réelles des PME pilotes une fois Vague B démarrée
4. **Strings AR-TN générées par IA** : flaggées `[À VALIDER PME]`, à valider avec une PME pilote ou native speaker avant publication marketing
5. **Constellation zellige hero piece** : ~1 jour de dev dédié. Impact visuel justifie l'investissement, mais à mesurer Lighthouse pour ne pas dégrader Performance

## 11. Décisions actées (récap rapide)

| Sujet              | Décision                                                              |
| ------------------ | --------------------------------------------------------------------- |
| Scope MVP          | Vague A — vitrine 6 routes, pas d'auth                                |
| Direction visuelle | Éditorial chaleureux mixte                                            |
| Palette            | Terre cuite (terracotta + sable + olivier)                            |
| Typographie        | Cormorant Garamond + Work Sans + Amiri + Tajawal                      |
| Style composants   | Editorial Free — étoile zellige + asymétrie                           |
| Navigation         | E-shop avec catégories produit                                        |
| Animation          | Riche avec hero-piece zellige constellation                           |
| Monorepo           | Nx + pnpm, libs séparées (ui, product-components, shared-types, i18n) |
| i18n               | EN + FR + AR-TN dès maintenant, RTL inclus                            |
| Data               | Seed JSON statique, types contractualisés `@medina/shared-types`      |
| Logo               | Placeholder Cormorant pour Vague A, vrai logo plus tard               |

## 12. Prochaine étape

Invocation du skill `writing-plans` pour produire un plan d'implémentation step-by-step, avec checkpoints de review et critères de done par étape.
