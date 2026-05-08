# Spec — Vague B-1 : Backend NestJS + auth + dashboard PME/Artisan

**Date** : 2026-05-08
**Auteur** : Jizel Ziadi (avec Claude)
**Statut** : Approuvé pour implémentation
**Stack** : NestJS 10 · TypeORM · MySQL 8 (XAMPP) · class-validator · @nestjs/swagger · Passport JWT + Refresh · bcrypt
**Repo** : Jizel14/MedinaDigital · branch `main`

---

## 1. Contexte & objectif

Vague A (vitrine marketplace publique) est livrée et déployable. La vitrine lit aujourd'hui un seed JSON statique commité dans `apps/web`. Vague B-1 ajoute la **couche backend** et la **surface SaaS** pour que les artisans et PME puissent s'inscrire, gérer leur profil, et créer leurs propres produits.

Le scope B-1 est volontairement étendu (au-delà du backend strict) pour livrer une boucle complète **schema → auth → profile → dashboard → product CRUD**, démontrable de bout en bout. Les vagues B-2 (KYC complet, onboarding 6 étapes, talents-marketplace) et B-3 (génération IA descriptions, génération QR TrustTag, upload binaire photos via S3/R2) suivront.

Hosting de `apps/api` en production : **décision différée** à B-2/B-3. Pour B-1 tout vit en local (XAMPP MySQL côté dev, MySQL service côté CI).

## 2. Périmètre

### 2.1 Dans le scope

**Backend `apps/api` (nouveau workspace Nx)** :

- NestJS 10 avec TypeScript strict
- TypeORM + MySQL 8, migrations versionnées
- 10 entités : `countries`, `regions` (24 gouvernorats Tunisie), `categories`, `users`, `refresh_tokens`, `artisans`, `tenants`, `pme_artisans` (stub), `products`, `product_materials`, `trusttags` (table créée, peuplée en B-3)
- Auth JWT (access 15min + refresh 30j hashé bcrypt, rotation à chaque /refresh)
- Endpoints : `/auth/*`, `/me/*` (profile self), `/me/products` (CRUD owner-scoped), `/products` `/artisans` `/regions` `/categories` `/trusttags/:id` (lecture publique)
- OpenAPI auto sur `/api/docs` (dev only)
- Tests d'isolation **bloquant CI** : prouvent qu'un user ne voit ni ne modifie les données d'un autre

**Frontend SaaS `apps/web/(saas)`** :

- 3 route groups : `(site)` public (déjà), `(auth)` signup/login (nouveau), `(saas)` authentifié (nouveau)
- Pages : `/signup`, `/login`, `/dashboard`, `/profile`, `/products`, `/products/new`, `/products/[id]/edit`
- Auth via httpOnly cookies posées par routes proxy `/api/auth/*` côté Next
- Forms HTML + useState (validation autoritaire serveur)
- Composants UI réutilisent `@medina/ui` (Button, Card, Input, Select, GradientBorderButton)

**Migration data layer** (fin de B-1) :

- Feature flag `MEDINA_DATA_SOURCE=seed|api` dans `apps/web/.env.local`
- Façade `lib/data.ts` dispatch vers `lib/data/sources/seed.ts` ou `lib/data/sources/api.ts`
- Default : `seed` (le repo continue de marcher sans backend démarré)
- Tous les tests Playwright passent dans les deux modes

### 2.2 Hors scope explicite

- **Pas d'email verification** (B-2)
- **Pas de KYC complet** : juste les colonnes `kycStatus`, `patenteNumber`, `kycDocUrl` créées au schéma. Vérification + workflow en B-2
- **Pas de talents-marketplace** : table `pme_artisans` créée, mais aucun endpoint pour gérer les memberships. Vient en B-3
- **Pas de génération IA** descriptions/story (B-3)
- **Pas de génération TrustTag QR** (B-3)
- **Pas d'upload binaire photos** : on accepte des URLs déjà hébergées (vraie infra S3/R2 en B-3)
- **Pas d'observabilité** (Sentry, Datadog) — ajouté quand on déploie
- **Pas de mailer** transactionnel (Resend/Postmark) — ajouté quand on a l'email verification
- **Pas de hosting prod défini** — on tranche en B-2/B-3

### 2.3 Critères d'acceptation

- Un nouveau user signup en tant qu'Artisan ou PME, login, voit son dashboard
- Un Artisan crée un product, le voit dans `/products`, peut l'éditer et le supprimer
- Une PME fait pareil, indépendamment
- Un Artisan ne peut **pas** lire ni modifier le product d'un autre user (404 retourné)
- Tests d'isolation passent (bloquant CI)
- La vitrine publique (`/[locale]`, `/products/[slug]`, etc.) marche dans **les deux modes** seed et api
- Lighthouse sur la vitrine reste ≥ 90/95/95/95 (pas de régression Vague A)
- Aucune erreur TypeScript ni i18n manquante en CI
- Tous les tests Playwright (e2e seed + e2e api + isolation) passent

## 3. Architecture

### 3.1 Stack

- **NestJS 10** App Router-style modular, `@Module/@Controller/@Service/@Entity`
- **TypeORM 0.3.x** + driver `mysql2`
- **MySQL 8** (XAMPP local en dev, service GitHub Actions en CI)
- **Passport** + `passport-jwt` + `passport-local`, deux strategies (access + refresh)
- **bcrypt** cost 12 pour passwords + tokens
- **class-validator** + **class-transformer** pour DTOs
- **@nestjs/swagger** pour OpenAPI
- **@nestjs/config** + **Joi** pour validation env vars au boot
- **ulid** pour les IDs (cohérent avec `@medina/shared-types`)
- **@nestjs/throttler** pour le rate limiting

### 3.2 Approche modules NestJS (Approche 2 : co-located entities)

11 entités au total : `countries`, `regions`, `categories`, `users`, `refresh_tokens`, `artisans`, `tenants`, `pme_artisans` (stub), `products`, `product_materials`, `trusttags` (stub).

```
apps/api/
├── src/
│   ├── main.ts                       # bootstrap : ValidationPipe, Swagger, CORS, Helmet
│   ├── app.module.ts                 # imports tous les feature modules + APP_GUARD JwtAuthGuard
│   ├── config/
│   │   ├── env.validation.ts         # Joi schema (MYSQL_*, JWT_*, PORT)
│   │   └── typeorm.config.ts         # DataSource factory
│   ├── database/
│   │   ├── data-source.ts            # exporté pour TypeORM CLI
│   │   ├── migrations/
│   │   │   └── 1715000000000-init.ts
│   │   └── seeds/
│   │       └── seed-from-json.ts     # script tsx
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/{jwt,jwt-refresh,local}.strategy.ts
│   │   │   ├── guards/{jwt-auth,jwt-refresh,local-auth}.guard.ts
│   │   │   ├── dto/{signup,login,refresh}.dto.ts
│   │   │   └── entities/{user,refresh-token}.entity.ts
│   │   ├── tenants/{tenant.entity,tenants.module,tenants.service,tenants.controller,dto/}
│   │   ├── artisans/{artisan.entity, ..., dto/}
│   │   ├── products/{product.entity, product-material.entity, ..., dto/}
│   │   ├── regions/{region.entity, ..., dto/}      # 24 gouvernorats TN
│   │   ├── categories/{category.entity, ..., dto/} # 5 catégories
│   │   ├── countries/{country.entity, ..., dto/}   # 1 pays initial (TN)
│   │   ├── trusttag/                                # entité créée, controller stub
│   │   └── pme-artisans/                            # entité créée, pas de controller
│   └── common/
│       ├── decorators/{public, current-user, current-ownership}.decorator.ts
│       ├── guards/owns-product.guard.ts
│       ├── interceptors/ownership.interceptor.ts
│       ├── filters/http-exception.filter.ts
│       └── types/request-with-ownership.ts
└── test/
    ├── e2e/{auth,public-api}.e2e-spec.ts
    └── isolation/products-isolation.e2e-spec.ts
```

### 3.3 Frontières et règles d'import

- `apps/api` peut importer **uniquement** `@medina/shared-types`
- `apps/api` ne peut **pas** importer `@medina/ui`, `@medina/product-components`, `@medina/i18n`, ni quoi que ce soit dans `apps/web`
- `apps/web` ne peut **pas** importer `apps/api` directement (uniquement via fetch HTTP runtime)
- ESLint scope tag : `scope:api` → `onlyDependOnLibsWithTags: ['scope:shared']`

```
apps/api ──→ @medina/shared-types
apps/web ──→ apps/api (HTTP fetch, runtime)
apps/web ──→ @medina/{shared-types, i18n, ui, product-components}
```

## 4. Schéma DB

### 4.1 Vue d'ensemble

11 tables. Toutes en utf8mb4 collation utf8mb4_unicode_ci pour bien gérer l'arabe.

```
countries (TN, … future)
  └── regions (24 gouvernorats × country)
        └── artisans / tenants / products / users (regionId FK)

users (auth)
  └── refresh_tokens (rotation)
  └── artisans (UNIQUE FK userId, NULL si seed-imported)
  └── tenants (UNIQUE FK ownerUserId)

artisans <──N:N──> tenants  via pme_artisans (memberships, stub B-1)

products
  ├── artisanId (NULLABLE)  ─┐
  ├── tenantId (NULLABLE)    ├─ CHECK (artisanId IS NOT NULL OR tenantId IS NOT NULL)
  ├── categorySlug FK
  ├── regionId FK
  └── 1:N → product_materials
  └── 1:1 → trusttags (peuplé B-3)
```

### 4.2 Détail tables (champs principaux)

**`countries`** : `code` (PK, ISO 3166-1 alpha-2 'TN'), `name jsonb`, `isActive bool`. Seed: `TN`.

**`regions`** : `id ulid PK`, `countryCode FK`, `slug` (UNIQUE par country), `name jsonb`, `description jsonb`, `mapCoords jsonb`, `knownFor text[]`. Seed : 24 gouvernorats Tunisie.

**`categories`** : `slug PK ('ceramics'|...)`, `name jsonb`, `description jsonb`, `iconKey enum`, `heroImage varchar`. Seed : 5 catégories.

**`users`** : `id ulid PK`, `email UNIQUE`, `passwordHash bcrypt`, `role enum('artisan','pme_owner','admin')`, `artisanId FK NULL`, `tenantId FK NULL`, `emailVerifiedAt NULL`, `createdAt`, `updatedAt`. CHECK : exactly one of (artisanId, tenantId) non null si role ≠ admin.

**`refresh_tokens`** : `id ulid PK`, `userId FK`, `tokenHash bcrypt`, `expiresAt`, `revokedAt NULL`, `userAgent NULL`, `createdAt`. Index `(userId, revokedAt)`.

**`artisans`** : `id ulid PK`, `userId FK NULL UNIQUE`, `slug UNIQUE`, `name`, `nameLocalized jsonb NULL`, `yearsOfPractice int`, `regionId FK`, `primaryCategorySlug FK`, `story jsonb`, `shortBio jsonb`, `portrait varchar`, `workshopPhoto NULL`, `isPublic bool DEFAULT true`.

**`tenants`** (= PME) : `id ulid PK`, `ownerUserId FK UNIQUE`, `slug UNIQUE`, `businessName`, `businessNameAr NULL`, `regionId FK`, `primaryCategorySlug FK`, `yearFounded int NULL`, `artisanCount int DEFAULT 1`, `patenteNumber NULL`, `kycStatus enum('pending','verified','rejected') DEFAULT 'pending'`, `preferredLanguage enum('fr','ar-TN')`.

**`pme_artisans`** (membership N↔N, stub B-1) : `tenantId FK`, `artisanId FK`, `startedAt`, `endedAt NULL`, `role NULL`. PK composite.

**`products`** : `id ulid PK`, `slug UNIQUE`, `artisanId FK NULL`, `tenantId FK NULL`, `categorySlug FK`, `regionId FK`, `title jsonb`, `descriptionShort jsonb`, `descriptionLong jsonb`, `story jsonb`, `dimensions jsonb`, `weightG int`, `priceTnd decimal(10,2)`, `priceEur decimal(10,2)`, `photos jsonb (text[])`, `arModelUrl NULL`, `publishedAt`, `customRequest bool`. CHECK `artisanId IS NOT NULL OR tenantId IS NOT NULL`.

**`product_materials`** : `id ulid PK`, `productId FK ON DELETE CASCADE`, `name jsonb`, `percentage decimal(5,2)`, `origin NULL`, `recycledContent NULL`, `certifications jsonb NULL`, `ordinal int`.

**`trusttags`** : structure complète (cf `@medina/shared-types/TrustTagDpp`). FK `productId UNIQUE`. Peuplée en B-3.

### 4.3 Index principaux

`users.email` (UNIQUE), `users.artisanId`, `users.tenantId`, `refresh_tokens(userId, revokedAt)`, `artisans(regionId, slug)`, `tenants.slug`, `products.slug` (UNIQUE), `products.artisanId`, `products.tenantId`, `products.categorySlug`, `products.publishedAt`, `pme_artisans(tenantId, endedAt)`.

### 4.4 Migrations & seed

- **`1715000000000-init.ts`** : crée toutes les tables + index + FK + CHECK
- **`db:seed`** : script `tsx` qui lit `apps/web/src/data/seed/*.json`, insère :
  - 24 gouvernorats Tunisie (les 8 du seed Vague A correspondent à des entrées avec produits, les 16 autres existent mais sans produit)
  - 5 catégories
  - 6 users avec password commun fictif `medina-pilot-2026!` (à invalider au premier signup réel ; documenter dans le README de l'admin process)
  - 6 artisans : **les ULIDs du JSON seed sont préservés** (même `id` côté JSON et MySQL) pour que les FK déjà câblées dans `products.artisanId` matchent
  - 18 products (mêmes ULIDs que le JSON), 18 trusttags placeholder (un par product, peuplés en B-3), materials associés
  - **Pas de tenants/PME** initialement (créés via signup)

## 5. Auth flow

### 5.1 JWT payloads

```ts
// access (15min, JWT_SECRET)
{ sub: userId, role, artisanId?, tenantId?, iat, exp }

// refresh (30j, JWT_REFRESH_SECRET)
{ sub: userId, jti: ulid, iat, exp }
```

### 5.2 Endpoints `/auth`

| Route                | Public                  | DTO                                                                 | Réponse                                        |
| -------------------- | ----------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| `POST /auth/signup`  | ✅                      | `SignupDto` (email, password ≥8, role, artisan?{...}, tenant?{...}) | `{ accessToken, refreshToken, user, profile }` |
| `POST /auth/login`   | ✅                      | `{ email, password }`                                               | `{ accessToken, refreshToken, user, profile }` |
| `POST /auth/refresh` | ✅ (valide JWT refresh) | `{ refreshToken }`                                                  | `{ accessToken, refreshToken }` (rotation)     |
| `POST /auth/logout`  | JWT                     | —                                                                   | 204 (revoke tous les refresh tokens user)      |
| `GET /auth/me`       | JWT                     | —                                                                   | `{ user, profile }`                            |

### 5.3 Signup transactionnel

Une transaction unique :

1. Vérifie email unique → 409 `EMAIL_TAKEN`
2. Hash password bcrypt cost 12
3. Selon role :
   - `artisan` → INSERT artisan (slug auto), INSERT user, lien `users.artisanId`
   - `pme_owner` → INSERT tenant (slug auto), INSERT user, lien `users.tenantId`
4. Génère access + refresh JWT
5. Hash refresh, INSERT `refresh_tokens`
6. Retourne tokens + profile

### 5.4 Refresh rotation (OWASP)

À chaque `/auth/refresh` :

- Si refresh fourni introuvable ou révoqué → 401 `REFRESH_REVOKED`
- Sinon revoke l'ancien (`revokedAt = NOW()`)
- Génère nouveau access + nouveau refresh
- Retourne tokens

### 5.5 Frontend — httpOnly cookies

Tokens **jamais en localStorage**. Routes proxy Next sous `apps/web/src/app/api/auth/*/route.ts` :

- `POST /api/auth/signup` → forward au NestJS, lit la réponse, **set httpOnly cookies** `medina_access_token` (sameSite=lax, max-age=15min), `medina_refresh_token` (sameSite=strict, max-age=30j), retourne `{ user, profile }` au client
- `POST /api/auth/login` → idem
- `POST /api/auth/refresh` → utilise le cookie refresh, met à jour les cookies
- `POST /api/auth/logout` → revoke + clear cookies

Le client browser **ne touche jamais** l'API NestJS directement. Tout passe via Next (proxy).

### 5.6 Sécurité

- bcrypt cost 12
- JWT HS256, secrets ≥ 32 bytes (généré, .env.example documente la commande pour générer)
- CORS NestJS configuré pour origin `apps/web` only
- Rate limiting : 5 signup/login par minute par IP, 30 refresh par minute
- Messages d'erreur génériques (pas de leak d'existence email)
- En B-1 : pas d'email verification (B-2), pas de password reset (B-2), pas de 2FA

## 6. Ownership & isolation

### 6.1 OwnershipContext

Posé sur `req` après JwtAuthGuard :

```ts
type OwnershipContext = {
  userId: string;
  role: 'artisan' | 'pme_owner' | 'admin';
  artisanId: string | null;
  tenantId: string | null;
  ownedProductFilter: { artisanId?: string; tenantId?: string };
};
```

### 6.2 Stratégie

- **`JwtAuthGuard` global** (`APP_GUARD` dans app.module). Toute route auth par défaut.
- **`@Public()`** pour bypass (vitrine publique, signup, login, refresh).
- **Filtrage explicite par service** pour les lectures owner-scoped (`/me/products`, `/me/artisan`, …)
- **`OwnsProductGuard`** sur les mutations products (`PATCH/DELETE /me/products/:id`) : charge le product, vérifie owner match, sinon 404 (pas 403, OWASP).

Pas d'interceptor TypeORM générique parce que `products` a 2 colonnes ownership possibles (`artisanId` OU `tenantId`). Filtrage explicite plus correct.

### 6.3 Décorateurs

```ts
@CurrentUser()       // → req.user (UserPayload)
@CurrentOwnership()  // → req.ownership (OwnershipContext)
@Public()            // bypass JwtAuthGuard global
```

### 6.4 Erreurs

- Tentative d'accès à un product d'autrui → **404 NOT_FOUND** (pas 403, ne pas leak existence)
- Tentative `GET /me/artisan` quand role = pme_owner → **404 NOT_FOUND**

### 6.5 PME ↔ Artisan memberships

Table `pme_artisans` créée mais **pas d'endpoint** en B-1. Les products des artisans liés à une PME restent **invisibles** à la PME en B-1 (logique de visibilité étendue arrive en B-3 avec la talents-marketplace).

## 7. Endpoints API (référence complète)

### 7.1 Routes publiques (vitrine, `@Public()`)

| Méthode | Path                         | Notes                                                                                                   |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| GET     | `/api/products`              | query: `?category=&region=&priceMin=&priceMax=&sort=newest\|price-asc\|price-desc&q=&limit=20&offset=0` |
| GET     | `/api/products/:slug`        | 404 si pas trouvé                                                                                       |
| GET     | `/api/artisans`              | query: `?region=&category=&limit=&offset=`                                                              |
| GET     | `/api/artisans/:slug`        | inclut `products: Product[]`                                                                            |
| GET     | `/api/regions`               | query: `?country=TN`                                                                                    |
| GET     | `/api/categories`            | —                                                                                                       |
| GET     | `/api/trusttags/:trusttagId` | inclut product, region, artisan                                                                         |

### 7.2 Auth

| Méthode | Path                | Auth               |
| ------- | ------------------- | ------------------ |
| POST    | `/api/auth/signup`  | Public             |
| POST    | `/api/auth/login`   | Public             |
| POST    | `/api/auth/refresh` | Valide JWT refresh |
| POST    | `/api/auth/logout`  | JWT                |
| GET     | `/api/auth/me`      | JWT                |

### 7.3 Profile self

| Méthode | Path              | Auth | Owner check                             |
| ------- | ----------------- | ---- | --------------------------------------- |
| GET     | `/api/me/artisan` | JWT  | role=artisan                            |
| PATCH   | `/api/me/artisan` | JWT  | role=artisan, partial UpdateArtisanDto  |
| GET     | `/api/me/tenant`  | JWT  | role=pme_owner                          |
| PATCH   | `/api/me/tenant`  | JWT  | role=pme_owner, partial UpdateTenantDto |

Champs **non éditables** via PATCH : `id`, `slug`, `userId`/`ownerUserId`, `createdAt`, `kycStatus` (workflow B-2).

### 7.4 Products owner-scoped

| Méthode | Path                   | Owner check               |
| ------- | ---------------------- | ------------------------- |
| GET     | `/api/me/products`     | filter par ownership      |
| POST    | `/api/me/products`     | sets owner from ownership |
| GET     | `/api/me/products/:id` | OwnsProductGuard          |
| PATCH   | `/api/me/products/:id` | OwnsProductGuard          |
| DELETE  | `/api/me/products/:id` | OwnsProductGuard          |

### 7.5 `CreateProductDto`

```ts
{
  title: { en, fr, 'ar-TN' },
  descriptionShort: { en, fr, 'ar-TN' },     // ≤ 160 chars / locale
  descriptionLong: { en, fr, 'ar-TN' },
  story: { en, fr, 'ar-TN' },
  categorySlug: 'ceramics' | 'textile' | 'leather' | 'jewelry' | 'wood',
  regionId: string,
  dimensions: { lengthCm, widthCm, heightCm },
  weightG: number,
  priceTnd: number,
  priceEur: number,
  materials: Array<{ name: Localized, percentage, origin?, recycledContent?, certifications? }>,
  // optional
  photos?: string[],     // URLs déjà hébergées (B-1) ou paths /images/seed/...
  arModelUrl?: string,
  customRequest?: boolean,  // default false
}
```

Auto-générés au create : `id` (ulid), `slug` (depuis `title.fr`, append `-2`/`-3` si conflit), `artisanId` ou `tenantId` (depuis ownership), `trusttagId` (placeholder ulid pour préserver FK, vrai QR généré en B-3), `publishedAt = NOW()`.

### 7.6 Codes erreurs

Format unifié :

```json
{
  "statusCode": 400,
  "code": "MATERIALS_SUM_INVALID",
  "message": "Materials must sum to ~100",
  "details": [{ "field": "materials", "issue": "sum=92" }]
}
```

Codes principaux : `VALIDATION_FAILED` (400), `INVALID_CREDENTIALS` (401), `EMAIL_TAKEN` (409), `WEAK_PASSWORD` (400), `REFRESH_REVOKED` (401), `INVALID_REGION` (400), `INVALID_CATEGORY` (400), `NOT_FOUND` (404, used aussi pour ownership leaks), `MATERIALS_SUM_INVALID` (400), `SLUG_CONFLICT` (409), `RATE_LIMITED` (429).

### 7.7 Pagination

Toutes les listes :

```json
{ "items": [...], "total": 42, "limit": 20, "offset": 0 }
```

Defaults : `limit=20`, max 100.

### 7.8 OpenAPI

`/api/docs` (dev only) — `@nestjs/swagger` lit DTOs et controllers. Permet d'explorer l'API sans lire le code.

## 8. Frontend SaaS

### 8.1 Structure

```
apps/web/src/
  app/
    [locale]/
      (site)/                       # déjà
      (auth)/                       # NEW — public auth pages
        layout.tsx                  # logo Médina centré, fond doux
        signup/page.tsx
        login/page.tsx
      (saas)/                       # NEW — authenticated
        layout.tsx                  # requireAuth() → SaasHeader/Footer
        dashboard/page.tsx
        profile/page.tsx
        products/
          page.tsx
          new/page.tsx
          [id]/edit/page.tsx
      dev/                          # déjà
    api/
      auth/{signup,login,refresh,logout,me}/route.ts   # proxy + cookies
      proxy/[...path]/route.ts                         # proxy générique authentifié
  components/
    saas/
      saas-header.tsx
      saas-footer.tsx
      auth/{signup-form,login-form,logout-button}.tsx
      profile/{artisan-form,tenant-form}.tsx
      dashboard/{stats-card,quick-actions}.tsx
      products/{product-form,product-list-item,materials-editor,photo-picker}.tsx
  lib/
    api/{client,auth,products,profile}.ts
    auth/{get-session,require-auth,require-role}.server.ts
```

### 8.2 Pages — UX

- **`/[locale]/signup`** : form unique avec toggle radio Artisan/PME → champs conditionnels → submit → cookies posées → redirect `/dashboard`
- **`/[locale]/login`** : email + password, redirect `?redirect=` ou `/dashboard`
- **`/[locale]/dashboard`** (RSC) : "Hello {name}", 3 stats cards, 4 quick actions, liste 5 derniers products
- **`/[locale]/profile`** (RSC + Client form) : `<ArtisanForm>` ou `<TenantForm>` selon role, partial PATCH
- **`/[locale]/products`** (RSC) : liste products owned, ProductCard simplifié + edit, CTA "+ New product"
- **`/[locale]/products/new`** (Client) : single-page form (4 sections — basics, specs, materials, photos)
- **`/[locale]/products/[id]/edit`** (Client) : same form pré-rempli, PATCH

### 8.3 API client Next.js

- `lib/api/client.ts` → `apiFetch(path)` wrapper, hits `/api/proxy/${path}`, `credentials: 'include'`
- `/api/proxy/[...path]/route.ts` → lit cookie access, refresh auto si expiré, forward avec `Authorization: Bearer`, retourne réponse
- Le client browser ne touche jamais NestJS directement

### 8.4 Composants UI à ajouter

Réutilise au max `@medina/ui`. À ajouter :

- `<Textarea>` (cva variants underline + boxed)
- `<Label>` standard
- `<FormError>` red text small

Pas de Modal, Tabs, DataTable en B-1.

### 8.5 i18n

Nouvelles clés dans `libs/i18n/messages/{en,fr,ar-TN}.json` (~25 clés) sous namespaces `auth.*`, `saas.*`, `form.*`. Strings ar-TN incertaines flaggées `[À VALIDER PME]`.

### 8.6 Validation

Form HTML native + `useState` simple. Pas de `react-hook-form` ni `zod` côté client en B-1. Validation autoritaire **côté serveur** (class-validator).

### 8.7 Protection routes

- `(auth)/layout.tsx` : pas de protection (signup/login publics)
- `(saas)/layout.tsx` : `await requireAuth()` redirect `/login` si pas de session
- `(site)/...` : pas de protection (déjà)

## 9. Migration data layer

### 9.1 Feature flag

```env
# apps/web/.env.local
MEDINA_DATA_SOURCE=seed   # default
# ou
MEDINA_DATA_SOURCE=api
MEDINA_API_URL=http://localhost:4000
```

### 9.2 Dispatcher

`apps/web/src/lib/data.ts` re-exporte depuis `lib/data/sources/seed.ts` ou `lib/data/sources/api.ts` selon le flag.

### 9.3 `sources/seed.ts`

Code actuel de `data.ts` déplacé tel quel. Aucune modif fonctionnelle.

### 9.4 `sources/api.ts`

Implémente les 13 fonctions de la façade en `fetch()` typé contre `apps/api`. Cache ISR `next: { revalidate: 60 }`. Types depuis `@medina/shared-types` (mêmes shapes des deux côtés).

### 9.5 Mapping photos

`resolveImage()` et `resolveProductPhoto()` extraits dans `lib/data/sources/shared.ts`. Utilisés par les deux sources.

### 9.6 Ordre dans le plan

Migration **dernière phase** B-1. Pendant les phases auth/dashboard/products, la vitrine continue mode `seed` (zéro risque). Final phase : créer `sources/api.ts`, swap default, tester `MEDINA_DATA_SOURCE=api`, commit.

### 9.7 Risques / fallback

- API down → switch flag back à `seed`, vitrine continue (seed JSON dans le repo)
- Drift seed/MySQL → impossible si `db:seed` lit le JSON. Re-run après chaque modif

## 10. Tests + qualité + CI

### 10.1 Tests `apps/api`

**Unitaires** (Jest) : services purs, validators custom (materials sum, descriptionShort length). Coverage cible 60% sur services et validators.

**E2E auth** : `test/e2e/auth.e2e-spec.ts` — boot DB MySQL test, scénario complet signup → login → refresh rotation → logout → me.

**E2E public** : `test/e2e/public-api.e2e-spec.ts` — GET /products, /artisans, /trusttags, /regions sans auth.

**Isolation tenants** (BLOQUANT CI) : `test/isolation/products-isolation.e2e-spec.ts`. 2 users, chacun crée un product. Vérifie : ne voient que leurs propres products en GET, 404 sur GET/PATCH/DELETE des products de l'autre.

### 10.2 Tests `apps/web`

**Existants** : tous les Playwright actuels (golden path, a11y) continuent en mode `seed`. Aucune modif.

**Nouveaux SaaS** : `apps/web/e2e/saas.spec.ts` :

- Signup → dashboard → "Hello {name}"
- Logout → /login
- Login → /dashboard
- Create product → form complet → liste affiche le product
- Edit product → modif persiste

Ces tests boot apps/api + db:seed + apps/web `MEDINA_DATA_SOURCE=api` ensemble.

### 10.3 CI workflow

Jobs ajoutés à `.github/workflows/ci.yml` :

```yaml
quality       # déjà
build         # déjà (build web)
e2e-seed      # déjà (Playwright mode seed)
build-api     # NEW (build apps/api)
test-api      # NEW (services: mysql:8, db:migrate, db:seed, unit + e2e + isolation)
e2e-api       # NEW (boot api + web ensemble, Playwright SaaS spec)
```

Job `test-api` :

```yaml
services:
  mysql:
    image: mysql:8
    env: { MYSQL_ROOT_PASSWORD: test, MYSQL_DATABASE: medina_test }
    ports: ['3306:3306']
    options: --health-cmd='mysqladmin ping' --health-interval=10s
```

CI total : ~10-15min sur ubuntu-latest. Acceptable.

### 10.4 Lint + scope tags

`eslint.config.mjs` étendu :

```js
{ sourceTag: 'scope:api', onlyDependOnLibsWithTags: ['scope:shared'] }
```

`apps/api` ne peut pas importer `@medina/{ui,product-components,i18n}`.

### 10.5 Pre-commit

Hook actuel (`lint-staged` → format + ESLint) couvre `apps/api/**`. Aucun changement.

### 10.6 Scripts racine

```json
{
  "test:api": "pnpm --filter @medina/api test",
  "test:api:e2e": "pnpm --filter @medina/api test:e2e",
  "db:migrate": "pnpm --filter @medina/api db:migrate",
  "db:seed": "pnpm --filter @medina/api db:seed",
  "db:reset": "pnpm --filter @medina/api db:reset",
  "ship": "<existant> + pnpm test:api && pnpm test:api:e2e"
}
```

### 10.7 Observabilité

**Pas de Sentry/Datadog en B-1**. Logging NestJS Logger built-in (level info en dev, error en prod). Métriques custom : aucune. Tracing distribué : aucun. Suffisant pour pré-prod.

### 10.8 Documentation

`apps/api/README.md` : XAMPP setup, créer DB, migrations, seed, dev server, Swagger /api/docs, lien spec.

## 11. Décisions actées (récap)

| Sujet                 | Décision                                                                           |
| --------------------- | ---------------------------------------------------------------------------------- |
| Scope B-1             | Backend NestJS + auth + profile + dashboard + products CRUD + migration data layer |
| API style             | REST + class-validator + @nestjs/swagger                                           |
| ORM                   | TypeORM 0.3.x + driver mysql2                                                      |
| DB dev                | MySQL 8 via XAMPP local                                                            |
| DB CI                 | Service `mysql:8` GitHub Actions                                                   |
| DB prod               | À trancher (B-2/B-3)                                                               |
| Hosting api prod      | À trancher (B-2/B-3)                                                               |
| Auth                  | JWT access 15min + refresh 30j hashé bcrypt + rotation OWASP                       |
| Auth storage front    | httpOnly cookies via routes proxy Next                                             |
| Email verification    | Hors scope B-1 (B-2)                                                               |
| Password reset        | Hors scope B-1 (B-2)                                                               |
| Régions seed          | 24 gouvernorats Tunisie + table `countries` pour scaling                           |
| User model            | role enum 'artisan'/'pme_owner'/'admin', exclusivité via CHECK                     |
| Artisan ↔ PME         | `pme_artisans` N↔N table créée, **pas d'endpoint** B-1                             |
| Product owner         | `artisanId` ET/OU `tenantId` (CHECK at-least-one)                                  |
| Ownership enforcement | Filtrage explicite services + OwnsProductGuard sur mutations                       |
| Erreur ownership leak | 404 NOT_FOUND (OWASP, pas 403)                                                     |
| Photos products       | URLs déjà hébergées en B-1, upload binaire B-3                                     |
| TrustTag              | Table créée, peuplée et générée en B-3                                             |
| Migration vitrine     | Feature flag `MEDINA_DATA_SOURCE=seed\|api`, défaut `seed`, swap fin de B-1        |
| Tests d'isolation     | Bloquant CI                                                                        |
| Coverage cible        | 60% services + validators                                                          |
| Observabilité         | Console logs only en B-1                                                           |

## 12. Hors scope explicite (pour Vagues B-2/B-3 ou plus tard)

**Vague B-2** :

- Email verification, password reset, mailer transactionnel
- KYC complet (workflow vérification, upload documents, statuses)
- Onboarding 6 étapes (skill `pme-onboarding`)
- Support WhatsApp number signup OTP
- Décision hosting api production (Railway / VPS / Fly.io)

**Vague B-3** :

- Génération IA descriptions/story (OpenAI ou Anthropic)
- Génération QR TrustTag + DPP runtime
- Upload binaire photos (S3/R2/Bunny + URL signées)
- Talents-marketplace : endpoints invitation/acceptation `pme_artisans`
- Dashboard étendu : analytics, commandes (Vague C en réalité)

**Hors B entièrement** :

- Stripe paiements/abonnements (Vague C)
- Front-office acheteur logiqued'achat (Vague C)
- Modèle 3D / AR products
- Mode sombre

## 13. Risques connus

1. **MySQL 8 sur XAMPP avec config par défaut** : root sans password, port 3306 partagé avec d'autres apps. `.env.local` documenté pour override.
2. **Cookies cross-domain en prod** : si apps/web et apps/api sont sur des sous-domaines différents (`medinadigital.tn` et `api.medinadigital.tn`), les cookies sameSite=strict refresh ne traversent pas. À résoudre quand on tranche le hosting (B-2).
3. **Seed JSON drift** : si on modifie `apps/web/src/data/seed/*.json` mais oublie `pnpm db:seed`, MySQL et JSON divergent. Pre-commit hook + CI check pourraient flagger, ajout en B-2 si besoin.
4. **Test isolation oubli** : si un dev ajoute une route mutation sans OwnsProductGuard, l'isolation test ne couvrira que les routes existantes. Mitigation : code review + ESLint rule custom (post-B-1).
5. **Photos URLs externes** (en B-1 on accepte n'importe quelle URL) : risque XSS si on injecte directement. Mitigation : validation URL + Next Image avec `remotePatterns` whitelist.

## 14. Prochaine étape

Invocation du skill `writing-plans` pour produire un plan d'implémentation step-by-step découpé en phases (~8 phases anticipées : api scaffold → migrations + seed → auth → profile → products CRUD → frontend SaaS → migration data layer → tests + CI). Chaque phase commitée séparément, démontrable individuellement.
