---
description: Generate or regenerate the FR / ar-TN / EN translations for a product, following Médina Digital's bilingual content guidelines. Delegates to the content-bilingual sub-agent.
argument-hint: <product-id>
---

Tu vas traiter les traductions complètes du produit `$1`.

# Étapes

1. **Charger** les données produit existantes (titre, description, story, matériaux, région, etc.)

2. **Identifier la locale source** (généralement FR, parfois AR-TN si la PME a saisi en arabe).

3. **Lire les référentiels** :
   - `skills/i18n-tunisian/SKILL.md`
   - `skills/buyer-storytelling/SKILL.md`
   - `skills/artisan-catalog/SKILL.md`

4. **Déléguer au sub-agent `content-bilingual`** la génération/révision des champs suivants dans les 3 langues (`fr`, `ar-TN`, `en`) :
   - `title`
   - `description_short` (max 160 car)
   - `description_long` (200-400 mots)
   - `artisan_story` (100-200 mots)
   - `care_instructions`
   - `end_of_life`
   - `seo_title` (EN uniquement, max 60 car)
   - `seo_meta` (EN uniquement, max 155 car)

5. **Présenter le diff** avant de sauvegarder : ce qui change vs version actuelle, ce qui est ajouté.

6. **Marquer les passages incertains** avec `[À VALIDER PME]` ou `[REVIEW NATIVE]` selon le cas.

7. **Sauvegarder** dans le format approprié (DB ou fichier de seed) après validation.

# Format de sortie

```yaml
product_id: $1
source_locale: fr
generated_at: <ISO>

title:
  fr: '...'
  ar-TN: '...'
  en: '...'

description_short:
  fr: '...' # 142 car ✓
  ar-TN: '...'
  en: '...' # 138 car ✓

description_long:
  fr: |
    ...
  ar-TN: |
    ...
  en: |
    ...

artisan_story:
  fr: |
    ...
  ar-TN: |
    ...
  en: |
    ...

care_instructions:
  fr: '...'
  ar-TN: '...'
  en: '...'

end_of_life:
  fr: '...'
  ar-TN: '...'
  en: '...'

seo_title:
  en: '...' # 56 car ✓

seo_meta:
  en: '...' # 148 car ✓

flags:
  - "[À VALIDER PME] story mentionne 'grand-père potier' — confirmer avec l'artisan"
```
