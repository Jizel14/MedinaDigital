# Médina Digital — Brief projet permanent

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Le garder concis et à jour. Il définit le contexte, pas la documentation exhaustive.

## Mission

Médina Digital est une plateforme SaaS + marketplace qui rend les artisans et PME tunisiennes **visibles, vendables et traçables à l'international**, principalement vers les acheteurs européens.

Deux côtés :

- **Côté Tunisie (SaaS)** : dashboard PME en FR/AR, catalogue assisté par IA, QR de traçabilité (TrustTag), gestion commandes.
- **Côté Europe (marketplace)** : vitrine immersive, viewer 3D/AR, demandes sur mesure, matching intelligent, paiement Stripe.

## Statut actuel

Phase post-hackathon. Le jury AIESEC souhaite développer le projet pour de vrai. On passe du prototype au produit. Frontend marketing existe (HTML/CSS/JS), produit réel à construire.

## Stack technique

- **Frontend** : Next.js (App Router), TypeScript, Tailwind
- **Backend** : NestJS (TypeScript), API REST (GraphQL non décidé)
- **DB** : MySQL
- **ORM** : TypeORM (intégration `@nestjs/typeorm`)
- **Auth** : JWT custom NestJS + Passport (access + refresh tokens). Pas de Supabase Auth.
- **Repo** : monorepo pnpm workspaces — `apps/web` (Next.js), `apps/api` (NestJS), `packages/*` (shared types, i18n, etc.)
- **Hosting** : Vercel pour `apps/web`. `apps/api` à héberger séparément (Railway / Fly.io / VPS — à trancher).
- **Paiements** : Stripe (abonnements SaaS + commission marketplace 12%)
- **IA** : OpenAI ou Anthropic API pour génération catalogue, descriptions, traduction
- **3D/AR** : à définir (model-viewer ou Three.js, glTF)
- **Storage assets** : à trancher (S3 / R2 / Bunny). Pas de Supabase Storage.

## Équipe

- **Jizel Ziadi** — produit, tech, UX, exécution digitale
- **Seif Allah Boukhatem** — business dev, partenariats, croissance

## Conventions de code

- TypeScript strict côté front **et** côté API. Pas de `any` sauf justification en commentaire.
- **Frontend (Next.js)** : composants serveur par défaut. `"use client"` uniquement si interactivité (état local, événements, browser API).
- **Backend (NestJS)** : architecture modulaire (`module/controller/service/entity/dto`). Validation des DTO via `class-validator` + `ValidationPipe` global. Pas de logique métier dans les controllers.
- **Bordure web ↔ api** : Next.js parle à NestJS via fetch (avec types partagés depuis `packages/`). Pas de logique métier critique (paiement, multi-tenant) dans les routes Next — tout passe par l'API NestJS.
- **Multi-tenant — règle critique** : pas de RLS DB (MySQL). À la place :
  - JWT contient `tenant_id`. Un `TenantGuard` (NestJS) l'extrait et le pose dans le request scope.
  - Un interceptor TypeORM (subscriber ou repository custom) injecte `tenant_id` dans tous les `find*` / `save` / `update` / `delete`. Aucun service ne passe `tenant_id` en argument manuel.
  - Tests d'isolation obligatoires : pour chaque endpoint qui lit/écrit, un test "le tenant A ne voit pas les données du tenant B".
  - Code review : tout PR qui touche la DB doit prouver que la query reste filtrée. Pas de `repository.query(...)` brut sans filtre tenant.
- i18n : `next-intl`. Locales `fr` (défaut PME), `ar-TN` (PME), `en` (acheteurs Europe). Voir skill `i18n-tunisian`. Côté API, les messages d'erreur retournés au front sont des **codes** (`PRODUCT_NOT_FOUND`), pas des strings traduites — la traduction se fait côté front.
- Pas de secrets dans le code. Tout via `process.env` + `.env.local` (web) et `.env` (api). Documenter dans `.env.example` à la racine de chaque app.

## Conventions produit

- **Vendeur** = PME ou artisan tunisien (compte SaaS)
- **Acheteur** = client européen (compte marketplace, B2C ou B2B)
- **TrustTag** = QR code de traçabilité par produit, conforme Digital Product Passport (DPP) UE
- **GMV** = volume de vente brut sur la marketplace
- Prix PME affichés en TND. Prix marketplace en EUR (conversion + marge gérée par la plateforme).

## Règles non-négociables

1. **Sécurité multi-tenant** : aucune fuite de données entre PME. `TenantGuard` + interceptor TypeORM obligatoires sur toute entité tenant-scoped. Aucun `repository.query` brut sans filtre `tenant_id`. Tests d'isolation requis.
2. **Conformité DPP** : les champs requis par le règlement UE doivent être présents dans le schéma produit dès le début (matériaux, origine, empreinte, instructions fin de vie).
3. **i18n dès le départ** : pas de strings en dur. Tout texte UI passe par les fichiers de traduction. Les erreurs API sont des codes, pas des strings traduites.
4. **Accessibilité** : viser WCAG AA minimum. Les acheteurs européens sont sensibles à ça.
5. **RGPD** : les acheteurs européens sont protégés par le RGPD. Consentement cookies, droit à l'oubli, export données.
6. **JWT & secrets** : `JWT_SECRET` et `JWT_REFRESH_SECRET` distincts, ≥ 32 octets, jamais commités. Refresh tokens stockés hashés en DB avec révocation possible.

## Fichiers et dossiers clés (monorepo pnpm)

```
apps/
  web/                          # Next.js (App Router)
    app/(saas)/                 # dashboard PME
    app/(marketplace)/          # vitrine acheteurs
    app/t/[trusttag_id]/        # page publique de trace
    components/                 # composants React partagés
    lib/                        # utilitaires front (api client, hooks)
    lib/ai/                     # wrappers IA front (génération assistée)
    messages/                   # i18n (fr.json, ar-TN.json, en.json)
  api/                          # NestJS
    src/modules/                # un dossier par bounded context
      auth/                     # JWT, Passport, refresh tokens
      tenants/                  # PME (création, KYC)
      products/                 # catalogue
      trusttag/                 # QR + DPP
      orders/                   # commandes marketplace
      payments/                 # Stripe
    src/common/                 # guards, interceptors, decorators (TenantGuard, etc.)
    src/database/               # data-source TypeORM, migrations
    test/                       # tests e2e, dont tests d'isolation tenant
packages/
  shared-types/                 # types DTO partagés web ↔ api
  i18n-keys/                    # clés i18n typées (optionnel)
skills/                         # instructions métier pour Claude (lus contextuellement)
.claude/agents/                 # sub-agents spécialisés
.claude/commands/               # slash commands custom
```

## Design system & identité visuelle (apps/web)

**Stack** : shadcn/ui + Tailwind CSS + Framer Motion + SVG custom. `lucide-react` pour les icônes utilitaires, SVG inline pour tout ce qui porte l'identité visuelle.

### Règles non-négociables

1. **Tout est composant.** Aucun `<button>`, `<div class="card">`, `<input>` brut éparpillé dans les pages. Chaque primitive (Button, Card, Input, Badge, Modal, Tabs, etc.) vit dans `apps/web/components/ui/` et est importée. Si un composant n'existe pas, on le crée — on ne re-stylise pas inline.
2. **Variants par `class-variance-authority` (cva).** Un composant a des variants typés (`<Button variant="primary" size="lg">`), pas des classes Tailwind copiées-collées. Un changement de design = un seul endroit à modifier.
3. **Tokens, pas valeurs en dur.** Les couleurs, espacements, rayons, typographies passent par les CSS variables Tailwind (theme tokens). Pas de `text-[#E84B2A]` ou `p-[17px]` en dur — sauf justification explicite en commentaire.
4. **Animations = SVG + Framer Motion.** Pour tout élément animé qui porte l'identité (logo, hero, illustrations artisans, transitions de page, micro-interactions), on utilise des **SVG inline animés** (Framer Motion sur `motion.svg` / `motion.path`). Pas de GIF, pas de Lottie sauf si vraiment nécessaire (justifier). SVG = léger, scalable, accessible, RTL-friendly.
5. **Pas d'images bitmap pour l'UI.** PNG/JPEG **uniquement** pour les photos de produits artisans et les portraits. Tout le reste (icônes, illustrations, motifs, dividers, ornements) = SVG.
6. **Identité visuelle Médina (l'empreinte du site).** Le site doit être reconnaissable au premier regard, pas un énième "Tailwind generic". On s'appuie sur le patrimoine visuel tunisien sans tomber dans l'orientalisme :
   - **Motifs** : géométrie inspirée du carrelage de Nabeul, des moucharabiehs, du tissage berbère — abstraite, pas folklorique
   - **Palette** : à définir (à confirmer avec brand-guidelines custom Médina, voir Points ouverts)
   - **Typographie** : titres avec personnalité (serif ou display custom), corps lisible bilingue (latin + arabe). Police arabe choisie pour bien rendre en darija (pas une police MSA décorative)
   - **Ornements SVG signature** : un set d'éléments graphiques réutilisables (étoile à 8 branches, courbes de calligraphie stylisées, motifs zellige) qui apparaissent comme une signature
   - **Photographie** : style direct, mains au travail, lumière naturelle — voir skill `buyer-storytelling`

### Structure assets

```
apps/web/
  public/
    fonts/                # polices auto-hébergées (latin + arabe), formats woff2
    images/
      products/           # photos produits PME (CDN/storage à terme, pas dans public/ en prod)
      artisans/           # portraits, ateliers
      og/                 # open graph par page/locale
    favicon/              # set complet (16/32/180/512 + manifest)
  src/
    assets/
      svg/
        icons/            # icônes UI custom (compléments à lucide)
        illustrations/    # illustrations narratives (page d'accueil, vide, erreurs)
        ornaments/        # ornements signature Médina (motifs, dividers, accents)
        logos/            # logo Médina + variations (full, mark, mono, RTL si pertinent)
    components/
      ui/                 # primitives shadcn (button, card, input, badge, etc.)
      brand/              # composants identitaires (Logo, Ornament, BrandPattern)
      product/            # composants métier produit (ProductCard, TrustTagBadge, etc.)
      pme/                # composants métier dashboard PME
      marketplace/        # composants métier vitrine
      layout/             # Header, Footer, Sidebar, Container
```

### Quand ajouter un nouveau composant

- 2+ usages similaires dans des pages différentes → extraction en composant `ui/` ou `brand/` selon nature
- Logique métier produit/PME/marketplace → `components/<domain>/`
- Tout composant exposé doit avoir : variants typés (cva), props documentées, exemple d'usage en commentaire JSDoc 1 ligne max, support RTL si applicable

### Référentiels Claude pour le design

- Skill **frontend-design** (officiel Anthropic) — règles anti-AI-slop, qualité visuelle, polish
- Skill **brand-guidelines** (officiel Anthropic) — référence de structure (à adapter en `medina-brand` custom)
- Skill **artisan-catalog** + **buyer-storytelling** — vocabulaire visuel et tonal pour les pages produits

## Comment travailler avec moi (Claude)

- Avant d'écrire du code dans un domaine métier (catalogue, traçabilité, onboarding PME), **lis le SKILL.md correspondant** dans `skills/`.
- Avant de toucher au design ou de créer un composant frontend, **invoque le skill `frontend-design`** (officiel) pour appliquer les principes anti-AI-slop, et respecte les règles "Design system" ci-dessus.
- Pour les tâches transversales (review, contenu bilingue, conformité, pitch), **invoque le sub-agent** approprié dans `.claude/agents/`.
- Les slash commands dans `.claude/commands/` automatisent les workflows répétitifs.
- Si une convention de ce fichier devient fausse ou obsolète, **propose la mise à jour** au lieu de la contourner silencieusement.

## Décisions actées (2026-05-07)

- DB : **MySQL** (pas Supabase/Postgres)
- Backend : **NestJS** (TypeORM)
- Auth : **JWT custom NestJS + Passport** (pas Supabase Auth, pas NextAuth, pas Clerk)
- Repo : **monorepo pnpm** (`apps/web`, `apps/api`, `packages/*`)
- Multi-tenant : **TenantGuard + interceptor TypeORM** (pas de RLS DB)
- Design system : **shadcn/ui + Tailwind + Framer Motion + SVG**, tout est composant, animations en SVG inline
- Workspace nettoyé : proto Figma Make archivé dans `archive/hackathon-proto/` (référence pour reprendre composants shadcn et tokens)

## Skills officiels Anthropic installés

Installés dans `skills/` (projet) **et** `~/.claude/skills/` (user-level). Coexistent avec les 5 skills custom du projet.

| Skill                | Usage attendu sur Médina Digital                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **frontend-design**  | À invoquer pour **toute création de composant ou page** (web app, dashboard, marketplace, landing). Force des choix de design distinctifs, anti-"AI slop". Compose avec les règles "Design system" de ce CLAUDE.md.               |
| **brand-guidelines** | Sert de **référence de structure** pour créer un futur skill custom `medina-brand` (palette, typographie, motifs zellige, ornements signature). Le contenu actuel est la marque Anthropic — ne pas l'appliquer tel quel à Médina. |
| **webapp-testing**   | Pour les tests Playwright du frontend `apps/web` : flux onboarding PME, parcours acheteur marketplace, scan TrustTag, vérifs RTL `ar-TN`. À utiliser dans `apps/web` ou un dossier `e2e/` dédié.                                  |
| **skill-creator**    | Pour créer/itérer les skills custom de ce repo (`artisan-catalog`, `pme-onboarding`, etc.) et écrire le futur `medina-brand`. À utiliser dès qu'on identifie un pattern récurrent à formaliser.                                   |

## Points ouverts à trancher

- [ ] Hébergement de `apps/api` : Railway / Fly.io / Render / VPS ?
- [ ] Hébergement DB MySQL : managé (PlanetScale-style, RDS, Aiven) ou self-hosted ?
- [ ] Stratégie 3D : model-viewer (simple) vs Three.js custom (riche) ?
- [ ] Provider IA principal : OpenAI ou Anthropic ?
- [ ] Storage assets produit (photos haute résolution) : S3 / Cloudflare R2 / Bunny ?
- [ ] Process KYC pour les PME (vérification patente / matricule fiscal tunisien)
- [ ] API : REST seul ou ajout GraphQL pour le dashboard PME ?
- [ ] **Identité visuelle Médina** : palette définitive, typographies (latin + arabe), set d'ornements SVG signature → à formaliser dans un skill custom `medina-brand` (utiliser `skill-creator` + `brand-guidelines` comme référence structurelle)
