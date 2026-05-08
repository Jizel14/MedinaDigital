# Vague B-1 — Plan d'implémentation (light)

> Format léger : 8 phases ordonnées, pas de TDD bite-sized. Référence exhaustive : `docs/superpowers/specs/2026-05-08-vague-b1-backend-design.md`. Chaque phase = un commit. À la fin de chaque phase je montre l'état (HTTP probe, screenshot, ou test passing) et tu valides.

**Goal** : Livrer le backend NestJS + le SaaS frontend (signup/login/profile/dashboard/products CRUD) + migration data layer apps/web. Vitrine publique continue de marcher pendant tout B-1.

**Architecture** : NestJS 10 + TypeORM + MySQL 8 (XAMPP local). Auth JWT access+refresh httpOnly cookies via routes proxy Next. Ownership filtering explicite par service + OwnsProductGuard. Migration data layer feature-flagged à la fin.

**Tech** : NestJS, TypeORM, MySQL, bcrypt, Passport, class-validator, @nestjs/swagger, Joi, ulid, react/Next.js (déjà en place côté web).

**Validation** : à la fin de chaque phase je commit + montre l'état (curl HTTP / Playwright check). Tu valides ou corriges. Pas de question entre étapes sauf blocage technique réel.

---

## Phase 1 — Scaffold `apps/api` + connexion XAMPP

**Files** :

- `apps/api/package.json` (deps : `@nestjs/*`, `typeorm`, `mysql2`, `bcrypt`, `passport`, `passport-jwt`, `passport-local`, `class-validator`, `class-transformer`, `@nestjs/swagger`, `@nestjs/config`, `joi`, `ulid`, `helmet`)
- `apps/api/project.json` (Nx tags `scope:api`)
- `apps/api/tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`
- `apps/api/.env.example` (MYSQL_HOST/PORT/USER/PASSWORD/DB, JWT_SECRET, JWT_REFRESH_SECRET, PORT, FRONTEND_ORIGIN)
- `apps/api/src/main.ts` (bootstrap : Helmet, ValidationPipe global, CORS depuis FRONTEND_ORIGIN, Swagger /api/docs en dev, port depuis env)
- `apps/api/src/app.module.ts` (vide pour l'instant : ConfigModule + TypeOrmModule.forRootAsync)
- `apps/api/src/config/env.validation.ts` (Joi schema)
- `apps/api/src/config/typeorm.config.ts` (DataSource factory)
- `apps/api/src/database/data-source.ts` (DataSource exporté pour la CLI TypeORM)
- `eslint.config.mjs` racine : ajouter `scope:api` → `onlyDependOnLibsWithTags: ['scope:shared']`

**Done quand** :

- `pnpm install` propre
- `pnpm --filter @medina/api start:dev` boot, se connecte à MySQL XAMPP (port 3306, root sans password), affiche "Application is running on: http://localhost:4000"
- `curl http://localhost:4000/api/docs` retourne du HTML Swagger (vide)
- ESLint module-boundaries vert

---

## Phase 2 — Migration init + entités + seed

**Files** :

- `apps/api/src/modules/countries/country.entity.ts` (+ module + service + controller stub `GET /api/countries`)
- `apps/api/src/modules/regions/region.entity.ts` (+ module + service + controller `GET /api/regions?country=`)
- `apps/api/src/modules/categories/category.entity.ts` (+ module + service + controller `GET /api/categories`)
- `apps/api/src/modules/auth/entities/user.entity.ts`
- `apps/api/src/modules/auth/entities/refresh-token.entity.ts`
- `apps/api/src/modules/artisans/artisan.entity.ts`
- `apps/api/src/modules/tenants/tenant.entity.ts`
- `apps/api/src/modules/pme-artisans/pme-artisan.entity.ts` (sans controller, juste entity + module)
- `apps/api/src/modules/products/product.entity.ts`
- `apps/api/src/modules/products/product-material.entity.ts`
- `apps/api/src/modules/trusttag/trusttag.entity.ts` (sans controller)
- `apps/api/src/database/migrations/1715000000000-init.ts` (généré via `typeorm migration:generate` puis revu manuellement pour les CHECK constraints et index composites)
- `apps/api/src/database/seeds/seed-from-json.ts` (script tsx, lit `apps/web/src/data/seed/*.json`, insère 24 régions + 5 catégories + 6 users/artisans + 18 products + materials + 18 placeholder trusttags ; **préserve les ULIDs du JSON**)
- `apps/api/src/database/seeds/regions-seed.ts` (les 24 gouvernorats Tunisie en dur, indépendamment du JSON Vague A)

**Scripts package.json** : `db:migrate`, `db:revert`, `db:generate`, `db:seed`, `db:reset` (revert all + migrate + seed).

**Done quand** :

- `pnpm db:migrate` crée 11 tables sans erreur
- `pnpm db:seed` insère 24 régions, 5 catégories, 6 users (password bcrypt'd), 6 artisans, 18 products, 18 trusttags
- Sanity check : `mysql -u root medina_dev -e "SELECT COUNT(*) FROM products"` retourne 18
- `curl http://localhost:4000/api/regions?country=TN` retourne 24 entrées (controller minimal)

---

## Phase 3 — Auth module (signup, login, refresh, logout, me)

**Files** :

- `apps/api/src/modules/auth/auth.module.ts` (TypeOrmModule pour User+RefreshToken, JwtModule, PassportModule)
- `apps/api/src/modules/auth/auth.controller.ts` (POST /signup, /login, /refresh, /logout, GET /me)
- `apps/api/src/modules/auth/auth.service.ts` (logique signup transactionnel + login + refresh rotation + logout revoke + me)
- `apps/api/src/modules/auth/strategies/jwt.strategy.ts` (access token, JWT_SECRET)
- `apps/api/src/modules/auth/strategies/jwt-refresh.strategy.ts` (refresh token, JWT_REFRESH_SECRET, lit le body refreshToken)
- `apps/api/src/modules/auth/strategies/local.strategy.ts` (email + password pour login)
- `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` (lit `@Public()` métadonnée)
- `apps/api/src/modules/auth/guards/jwt-refresh.guard.ts`
- `apps/api/src/modules/auth/guards/local-auth.guard.ts`
- `apps/api/src/modules/auth/dto/signup.dto.ts` (email, password, role, artisan?, tenant? — class-validator avec branches conditionnelles)
- `apps/api/src/modules/auth/dto/login.dto.ts`
- `apps/api/src/modules/auth/dto/refresh.dto.ts`
- `apps/api/src/common/decorators/public.decorator.ts`
- `apps/api/src/common/decorators/current-user.decorator.ts`
- `apps/api/src/common/decorators/current-ownership.decorator.ts`
- `apps/api/src/common/types/request-with-user.ts`
- `apps/api/src/common/filters/http-exception.filter.ts` (format erreur unifié `{ statusCode, code, message, details }`)
- `apps/api/src/app.module.ts` : `APP_GUARD` JwtAuthGuard global, `APP_FILTER` HttpExceptionFilter global, ThrottlerModule (5 signup/min, 30 refresh/min)
- `apps/api/test/e2e/auth.e2e-spec.ts` (boot DB test, scénario complet 9 steps : signup artisan → 201, signup même email → 409, login bon → 200, login wrong → 401, me avec → 200, me sans → 401, refresh → 200 + ancien révoqué, vieux refresh → 401, logout → 204, refresh post-logout → 401)
- `apps/api/test/e2e/auth-pme.e2e-spec.ts` (variant pour signup pme_owner)

**Done quand** :

- Tous les e2e auth passent en local et en CI
- `curl POST /api/auth/signup` avec un payload artisan retourne `{ accessToken, refreshToken, user, profile }`, le user existe en DB, l'artisan associé aussi
- `GET /api/auth/me` avec le bearer token retourne le user + profile
- Rate limit déclenché si > 5 signup/min depuis la même IP

---

## Phase 4 — Profile self (`/me/artisan`, `/me/tenant`)

**Files** :

- `apps/api/src/modules/artisans/artisans.module.ts`
- `apps/api/src/modules/artisans/artisans.service.ts` (`findByUserId`, `updatePartial`)
- `apps/api/src/modules/artisans/artisans.controller.ts`
  - `GET /api/me/artisan` (JWT, `@CurrentUser`, return artisan ou 404 si role≠artisan)
  - `PATCH /api/me/artisan` (JWT, `UpdateArtisanDto` partial, valide regionId existe, primaryCategorySlug existe)
- `apps/api/src/modules/artisans/dto/update-artisan.dto.ts`
- `apps/api/src/modules/tenants/tenants.module.ts`
- `apps/api/src/modules/tenants/tenants.service.ts`
- `apps/api/src/modules/tenants/tenants.controller.ts` (`GET/PATCH /api/me/tenant`)
- `apps/api/src/modules/tenants/dto/update-tenant.dto.ts`
- `apps/api/test/e2e/profile.e2e-spec.ts` (signup artisan → GET /me/artisan ok, PATCH update name → persist, GET /me/tenant en tant qu'artisan → 404)

**Done quand** :

- `GET /api/me/artisan` retourne l'artisan complet pour un user role=artisan
- `PATCH /api/me/artisan` avec `{ name: 'New' }` persiste, retourne l'artisan mis à jour
- Champs non-éditables (id, slug, userId, createdAt) ignorés silencieusement (pas d'erreur, juste pas appliqué) — class-validator `whitelist: true` strip les unknowns
- Idem pour `/me/tenant` côté pme_owner
- Cross-role : artisan tape `/me/tenant` → 404 NOT_FOUND

---

## Phase 5 — Products CRUD owner-scoped + endpoints publics

**Files** :

- `apps/api/src/modules/products/products.module.ts`
- `apps/api/src/modules/products/products.service.ts` (`listPublic(filters)`, `findPublicBySlug`, `listOwned(ownership)`, `findOwned(id, ownership)`, `create(dto, ownership)`, `update(id, dto, ownership)`, `delete(id, ownership)`)
- `apps/api/src/modules/products/products.controller.ts`
  - Public : `GET /api/products`, `GET /api/products/:slug`
  - Authentifié `/me/products/*` : list owned, create, get one, patch, delete
- `apps/api/src/modules/products/dto/create-product.dto.ts` (incluant `MaterialsSumTo100` custom validator)
- `apps/api/src/modules/products/dto/update-product.dto.ts` (PartialType)
- `apps/api/src/modules/products/dto/list-products-query.dto.ts` (category, region, priceMin, priceMax, sort, q, limit, offset)
- `apps/api/src/modules/products/validators/materials-sum-to-100.validator.ts`
- `apps/api/src/modules/products/utils/slug.ts` (generateUniqueSlug)
- `apps/api/src/common/guards/owns-product.guard.ts`
- `apps/api/src/modules/artisans/artisans.controller.ts` : ajouter `GET /api/artisans` et `GET /api/artisans/:slug` (publics, incluent products)
- `apps/api/src/modules/trusttag/trusttag.module.ts` + service + controller : `GET /api/trusttags/:trusttagId` public (lit le placeholder trusttag du seed, jointure product/region/artisan)
- `apps/api/test/e2e/products-public.e2e-spec.ts` (GET /api/products?category=ceramics → filtre OK ; GET /api/products/<slug> → product ; 404 si slug inconnu)
- `apps/api/test/e2e/products-owned.e2e-spec.ts` (signup artisan → POST /me/products → 201 + product ; GET /me/products → liste ; PATCH → update ; DELETE → 204)
- `apps/api/test/isolation/products-isolation.e2e-spec.ts` **BLOQUANT** : 2 users (artisan + pme_owner), chacun crée 1 product. Vérifie : ne voient que leurs propres products en GET /me/products, 404 sur GET/PATCH/DELETE des products de l'autre

**Done quand** :

- `curl http://localhost:4000/api/products` retourne 18 products avec pagination
- Un signup artisan + POST /me/products → produit créé avec `artisanId = mon ID`
- Un signup pme_owner + POST /me/products → produit créé avec `tenantId = mon tenant ID`
- Tous les tests d'isolation passent (4 user A → 404 sur 4 routes mutation user B)
- Lighthouse local sur la vitrine reste 100% identique (rien n'a changé côté apps/web)

---

## Phase 6 — Frontend SaaS : `(auth)` + `(saas)` skeleton + signup/login

**Files apps/web** :

- `apps/web/src/app/[locale]/(auth)/layout.tsx` (logo Médina centré, fond doux, pas de header/footer site)
- `apps/web/src/app/[locale]/(auth)/signup/page.tsx` (Server Component shell + `<SignupForm>` Client)
- `apps/web/src/app/[locale]/(auth)/login/page.tsx` (idem)
- `apps/web/src/components/saas/auth/signup-form.tsx` (toggle radio Artisan/PME, champs conditionnels, useState minimal)
- `apps/web/src/components/saas/auth/login-form.tsx`
- `apps/web/src/components/saas/auth/logout-button.tsx`
- `apps/web/src/app/api/auth/signup/route.ts` (POST → forward au NestJS, parse réponse, set httpOnly cookies `medina_access_token` (15min) + `medina_refresh_token` (30j, sameSite=strict), retourne `{ user, profile }` au client)
- `apps/web/src/app/api/auth/login/route.ts`
- `apps/web/src/app/api/auth/refresh/route.ts` (lit cookie refresh, forward, met à jour les 2 cookies)
- `apps/web/src/app/api/auth/logout/route.ts` (forward logout, clear cookies)
- `apps/web/src/app/api/auth/me/route.ts` (GET, forward avec cookie, retourne user+profile)
- `apps/web/src/app/api/proxy/[...path]/route.ts` (proxy générique : lit access cookie, forward `Authorization: Bearer`, refresh auto si 401)
- `apps/web/src/lib/api/client.ts` (`apiFetch<T>(path, init?)` qui hits `/api/proxy${path}`)
- `apps/web/src/lib/api/auth.ts` (`signup`, `login`, `logout`, helpers côté client)
- `apps/web/src/lib/auth/get-session.server.ts` (RSC : lit cookie, fetch /auth/me via proxy serveur, retourne `{ user, profile } | null`)
- `apps/web/src/lib/auth/require-auth.server.ts` (redirect /login si pas de session)
- `libs/ui/src/primitives/textarea.tsx` (cva variants underline + boxed)
- `libs/ui/src/primitives/label.tsx`
- `libs/ui/src/primitives/form-error.tsx`
- `libs/ui/src/primitives/index.ts` : exports
- `libs/i18n/messages/{en,fr,ar-TN}.json` : ajouter ~10 clés `auth.*` (signup, login, logout, asArtisan, asPme, emailTaken, passwordMin, weakPassword, invalidCredentials, signupCta, loginCta, alreadyHaveAccount, noAccount)

**Done quand** :

- `/en/signup` rend le form, toggle Artisan/PME affiche/cache les champs corrects
- Submit avec un nouvel email + role=artisan → cookies posées, redirect `/dashboard` (placeholder pour Phase 7)
- Submit avec email pris → toast/inline error "An account already exists for this email"
- `/en/login` accepte les bons credentials → cookies + redirect
- Cookies vérifiés en DevTools : `medina_access_token` httpOnly, sameSite=lax ; refresh sameSite=strict
- Visite `/en/dashboard` sans login → redirect `/login?redirect=/dashboard`

---

## Phase 7 — Dashboard + profile + products CRUD frontend

**Files apps/web** :

- `apps/web/src/app/[locale]/(saas)/layout.tsx` (`requireAuth()` + `<SaasHeader>` + `<SaasFooter>`)
- `apps/web/src/components/saas/saas-header.tsx` (logo, breadcrumb, user menu : avatar, "View public site", "Sign out", LocaleSwitcher dans le menu)
- `apps/web/src/components/saas/saas-footer.tsx` (compact)
- `apps/web/src/app/[locale]/(saas)/dashboard/page.tsx` (RSC : `getSession()`, render header "Hello {name}", 3 stats cards, 4 quick actions, liste 5 derniers products)
- `apps/web/src/components/saas/dashboard/stats-card.tsx`
- `apps/web/src/components/saas/dashboard/quick-actions.tsx`
- `apps/web/src/app/[locale]/(saas)/profile/page.tsx` (RSC + branchement Client form selon role)
- `apps/web/src/components/saas/profile/artisan-form.tsx` (PATCH /me/artisan)
- `apps/web/src/components/saas/profile/tenant-form.tsx` (PATCH /me/tenant)
- `apps/web/src/app/[locale]/(saas)/products/page.tsx` (RSC liste owned products)
- `apps/web/src/app/[locale]/(saas)/products/new/page.tsx` (Client `<ProductForm mode="create">`)
- `apps/web/src/app/[locale]/(saas)/products/[id]/edit/page.tsx` (RSC fetch + Client `<ProductForm mode="edit" initial={...}>`)
- `apps/web/src/components/saas/products/product-form.tsx` (le gros : 4 sections — basics title/descriptions/category/region ; specs dimensions/weight/prices ; materials editor avec sum hint ; photos picker)
- `apps/web/src/components/saas/products/materials-editor.tsx` (array field)
- `apps/web/src/components/saas/products/photo-picker.tsx` (B-1 : paste URLs ou choix dans liste de placeholders SVG existants `/images/seed/products/*.svg`)
- `apps/web/src/components/saas/products/product-list-item.tsx`
- `apps/web/src/lib/api/products.ts` (listOwned, get, create, update, delete)
- `apps/web/src/lib/api/profile.ts` (getMe, updateArtisan, updateTenant)
- `libs/i18n/messages/{en,fr,ar-TN}.json` : ajouter ~15 clés `saas.*` + `form.*`

**Done quand** :

- Login → `/dashboard` rend "Hello Khaled", 3 stats, 4 quick actions, liste produits récents
- `/profile` rend le form Artisan ou Tenant selon role, save persiste
- `/products` liste les products owned avec lien edit
- `/products/new` form 4 sections, submit crée le product, redirect vers `/products/[id]/edit`
- `/products/[id]/edit` pré-rempli, save persiste
- Materials editor : la somme s'affiche live ("Σ 92%, must equal 100"), block submit si invalide

---

## Phase 8 — Migration data layer + tests E2E api + CI

**Files** :

- `apps/web/src/lib/data/sources/seed.ts` (déplace l'actuel `lib/data.ts` ici, aucune modif fonctionnelle)
- `apps/web/src/lib/data/sources/api.ts` (NEW : 13 fonctions `fetch()` typées vers `/api/products`, `/api/artisans/:slug`, etc., avec `next: { revalidate: 60 }`)
- `apps/web/src/lib/data/sources/shared.ts` (`resolveImage`, `resolveProductPhoto` extraits, partagé entre seed et api)
- `apps/web/src/lib/data.ts` (réécrit en dispatcher : import { source as api } || { source as seed } selon `process.env.MEDINA_DATA_SOURCE`)
- `apps/web/.env.local.example` : documenter `MEDINA_DATA_SOURCE`, `MEDINA_API_URL`
- `apps/web/e2e/saas.spec.ts` (Playwright : signup → dashboard → create product → liste, login/logout, edit product)
- `apps/web/playwright.config.ts` : 2 projects `seed` (port 3000, MEDINA_DATA_SOURCE=seed) et `api` (port 3001, MEDINA_DATA_SOURCE=api, requires apps/api running)
- `.github/workflows/ci.yml` : ajouter jobs `build-api`, `test-api` (services mysql:8, db:migrate, db:seed, unit + e2e + isolation), `e2e-api` (boot api + web, Playwright SaaS)
- `package.json` racine : scripts `test:api`, `test:api:e2e`, `db:migrate`, `db:seed`, `db:reset`. Étendre `ship` avec `pnpm test:api && pnpm test:api:e2e`
- `apps/api/README.md` (XAMPP setup, migrations, seed, dev server, /api/docs, lien spec)
- `README.md` racine : ajouter section "Backend (apps/api)" avec setup XAMPP

**Done quand** :

- `MEDINA_DATA_SOURCE=seed pnpm dev` : vitrine identique à aujourd'hui (mode défaut)
- `MEDINA_DATA_SOURCE=api MEDINA_API_URL=http://localhost:4000 pnpm dev` (avec apps/api running) : vitrine identique mais lit depuis MySQL
- Tous les Playwright en mode seed passent (compatibilité Vague A)
- Tous les Playwright en mode api passent (B-1 end-to-end)
- CI verte sur les 6 jobs (quality, build, e2e-seed, build-api, test-api, e2e-api)
- README mis à jour : Seif peut cloner le repo, suivre le README, lancer signup côté SaaS en moins de 30 minutes

---

## Notes d'exécution

- **Commits fréquents** : à la fin de chaque phase, `git add -A && git commit -m "feat(<scope>): phase <N> — <title>"` (préfixes : `feat(api)`, `feat(web)`, `feat`, `chore`, `fix`, `test`)
- **Identité git** : déjà configurée (`jizel14 / jizel.ziadi@esprit.tn`)
- **Branche** : on travaille sur `main`. Repo greenfield, push direct sur origin après chaque phase si tu veux (sinon en bloc à la fin)
- **TDD partiel** : tests e2e auth/profile/products/isolation **avant** ou **après** le code, selon ce qui est plus rapide. Pas de TDD strict bite-sized. Mais **les tests d'isolation sont écrits AVEC le code** (Phase 5), pas après — c'est trop critique pour reporter
- **Pas de tests unitaires côté frontend** (composants UI testés visuellement et via e2e)
- **Si je rencontre un blocage technique** (lib qui marche pas, conflit deps, pattern qui échoue) je m'arrête et te demande
- **Hors blocage** : je commits + montre l'état + valide la phase + enchaîne
- **Cache Next.js** : je nuke `node_modules/.cache/next-medina` à chaque fois que je touche le tree d'auth/route group (déjà eu des Invariant errors en Vague A)

---

## Mapping phases ↔ sections du spec

| Phase | Sections spec couvertes                                                                           |
| ----- | ------------------------------------------------------------------------------------------------- |
| 1     | §3.1 Stack, §3.2 Approche modules (scaffold uniquement), §3.3 Frontières                          |
| 2     | §4 Schéma DB complet (entités, migrations, seed)                                                  |
| 3     | §5 Auth flow (signup, login, refresh, logout, me)                                                 |
| 4     | §7.3 Profile self (artisan + tenant)                                                              |
| 5     | §6 Ownership, §7.1/7.4/7.5 Products CRUD + endpoints publics, §7.6 Codes erreurs, §7.7 Pagination |
| 6     | §5.5 Cookies front, §8.1-8.4 Frontend SaaS (auth pages + proxy)                                   |
| 7     | §8.2 Pages dashboard/profile/products, §8.5 i18n SaaS                                             |
| 8     | §9 Migration data layer, §10 Tests + CI                                                           |

Toutes les sections du spec sont couvertes.
