---
description: Audit a product's TrustTag traceability chain — verify DPP fields, QR generation, public trace page, and EU regulatory compliance. Use before publishing or as a periodic spot-check.
argument-hint: <product-id>
---

Tu vas auditer la chaîne de traçabilité TrustTag pour le produit `$1`.

Référentiel : `skills/trusttag-qr/SKILL.md`

# Étapes

1. **Charger les données produit** depuis la DB ou le fichier de seed correspondant.

2. **Vérifier la complétude DPP** selon le schéma `DppData` :
   - Identification (product_id, trusttag_id, gtin si applicable)
   - Origine (country, région, artisan)
   - Matériaux (somme % ≈ 100, certifications si claim)
   - Empreinte (carbone, eau, énergie — flagger si absent)
   - Durabilité (lifetime, care, repair, end_of_life en 3 langues)
   - Chaîne (date production, batch)
   - Vérification (verified_at, verified_by)

3. **Vérifier le QR code** :
   - `trusttag_id` est un ULID valide
   - SVG du QR existe dans le storage assets configuré (S3/R2/Bunny)
   - URL pointe bien vers `/t/<trusttag_id>` et pas vers les données brutes
   - QR scannable (correction d'erreur niveau M)

4. **Vérifier la page publique de trace** (`/t/<trusttag_id>`) :
   - Accessible sans auth
   - Détecte la langue navigateur (default EN)
   - Affiche tous les champs DPP requis
   - Lien cross-sell vers d'autres produits du même artisan
   - Mention "Vérifié par Médina Digital" + date

5. **Vérifier la sécurité** :
   - Aucune donnée sensible PME exposée publiquement (adresse atelier optionnelle)
   - Endpoint de listing protégé par auth
   - Logique de révocation testable

6. **Vérifier le quota TrustTag** (si la PME est sur tier free/pro) :
   - Vérification au moment de la création du QR, pas du scan
   - Compteur correct

# Format du rapport

```markdown
# Audit TrustTag : <product-id>

**Date audit** : <ISO date>
**Statut global** : ✅ Conforme / ⚠️ Corrections / ❌ Bloqué

## A. Données DPP

[checklist détaillée par section]

## B. QR code

[checklist]

## C. Page publique

[checklist]

## D. Sécurité

[checklist]

## E. Quota

[checklist]

## Bloquants

- ...

## Recommandations

- ...

## Conformité ESPR/DPP

[Si la catégorie produit est en première vague DPP : niveau de readiness]
```

Si l'audit révèle un bloquant critique (ex: trace page leak données autres PME), le marquer en rouge et recommander un patch immédiat.
