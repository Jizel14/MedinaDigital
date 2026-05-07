---
description: Pre-deployment checklist for Médina Digital. Runs typecheck, lint, i18n validation, security checks (multi-tenant safety, no exposed secrets), and surface any DPP/RGPD red flags before shipping. Use before every Vercel deploy to production.
---

Tu vas exécuter le check pré-déploiement pour Médina Digital.

# Étapes (dans l'ordre)

## 1. Sanity checks code (monorepo : web + api)

```bash
pnpm -r typecheck
pnpm -r lint
```

Si l'un échoue, **stopper ici** et reporter les erreurs. Ne pas continuer.

## 2. Tests

```bash
pnpm -r test
```

Si tests présents et certains échouent, stopper. **Spécial multi-tenant** : vérifier que les tests d'isolation tenant (apps/api) sont passés (`pnpm --filter api test:tenant-isolation` si ce script existe).

## 3. Validation i18n

Vérifier :

- `messages/fr.json`, `messages/ar-TN.json`, `messages/en.json` ont les **mêmes clés**
- Aucune valeur vide ou égale à la clé (ex: `"products.title": "products.title"`)
- Aucune clé suspecte type `[À VALIDER]` non résolue

Si script `pnpm i18n:check` existe, l'exécuter.

## 4. Audit secrets

Grep le repo pour s'assurer qu'aucun secret n'est commité :

- Pattern `sk_live_` (Stripe)
- Pattern `sk-` suivi de 40+ chars (OpenAI)
- Pattern `eyJ` long (JWT)
- `OPENAI_API_KEY=...` ou autre `=` suivi de valeur dans des fichiers non-`.env.example`

Vérifier que `.env`, `.env.local`, `.env.production` sont bien dans `.gitignore`.

## 5. Audit multi-tenant

Pour chaque controller/service NestJS modifié dans le diff git :

- Le controller utilise-t-il `@UseGuards(TenantGuard)` (ou équivalent global) ?
- Le service ne reçoit-il pas `tenant_id` en argument depuis le client (doit venir du request scope / interceptor) ?
- Aucun `repository.query(...)` brut ou `createQueryBuilder` sans filtre `tenant_id` explicite ?
- Si une nouvelle entité TypeORM tenant-scoped est ajoutée : a-t-elle bien une colonne `tenantId` indexée et le subscriber/repository custom couvre-t-il ses opérations ?
- Test d'isolation présent (`tenant A ne voit pas tenant B`) pour les nouveaux endpoints qui lisent/écrivent ?

Si l'un de ces points n'est pas couvert dans le diff, **flagger en bloquant**.

## 6. Audit RGPD / DPP rapide

- Aucun nouveau champ "personal data" sans base légale documentée
- Aucun nouvel envoi de données personnelles vers un service tiers non documenté
- Pas de cookie tracker non listé dans la CMP

## 7. Build

```bash
pnpm -r build
```

Si l'un des builds échoue (web ou api), stopper.

Vérifier aussi que `apps/api` n'a **pas** `synchronize: true` activé en config prod TypeORM. Si oui, **bloquant**.

## 8. Verify env vars

Lister les env vars utilisées dans le code (`process.env.X`) et vérifier qu'elles sont :

- Documentées dans `.env.example`
- Configurées dans Vercel (l'utilisateur doit confirmer manuellement)

# Format du rapport

```markdown
# Ship check — <date> <heure>

## ✅ Passed

- typecheck
- lint
- tests (X passed)
- i18n keys aligned
- build success

## ⚠️ Warnings

- ...

## ❌ Blockers

- ...

## Manual confirms required

- [ ] Env vars `STRIPE_SECRET_KEY`, `OPENAI_API_KEY` (ou `ANTHROPIC_API_KEY`), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL` (MySQL) set en prod (Vercel pour web, hosting api pour NestJS) ?
- [ ] Stripe webhook endpoint configuré et signature secret en place ?
- [ ] Migrations TypeORM récentes appliquées en prod (`pnpm --filter api migration:run`) ?
- [ ] `synchronize: false` confirmé sur la config prod TypeORM ?

## Verdict

✅ Ready to ship / ❌ Do not ship
```

Si verdict est ❌, donner la commande exacte ou le fichier exact à corriger.
