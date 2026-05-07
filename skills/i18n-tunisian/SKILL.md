---
name: i18n-tunisian
description: Use this skill any time content is written, translated, or localized for Médina Digital across French, Tunisian Arabic (ar-TN), and English. Triggers on "translation", "i18n", "arabe tunisien", "Tunisian Arabic", "darija", "RTL", "next-intl", or files under `messages/`, `lib/i18n/`. Especially important: this is NOT the same as Modern Standard Arabic (MSA). Tunisian Arabic has specific vocabulary, mixed Latin/Arabic numerals usage, and code-switching with French.
---

# Localisation FR / AR-TN / EN

## Locales supportées

- **`fr`** : français — locale principale du dashboard PME, secondaire marketplace
- **`ar-TN`** : arabe tunisien — locale principale dashboard PME (alternative au FR)
- **`en`** : anglais (UK) — locale principale marketplace acheteurs

## Règle d'or sur l'arabe tunisien

**N'utilise PAS de l'arabe standard moderne (MSA / fusha) pour les interfaces destinées aux PME tunisiennes.** Le MSA est lu, peu utilisé à l'oral, et perçu comme distant ou bureaucratique.

L'arabe tunisien (darija tunisienne) :

- Mélange arabe classique, berbère, français, italien, turc
- Utilise souvent l'alphabet arabe **et** l'alphabet latin (arabizi : "ya3tik essa7a")
- Code-switche fréquemment avec le français ("partagé el produit")
- A une grammaire simplifiée vs MSA (pas de cas, conjugaison réduite)

## Choix d'écriture pour Médina Digital

- **Interfaces officielles (boutons, navigation, emails système)** : arabe tunisien en **alphabet arabe**, pas en arabizi. Plus inclusif (les seniors lisent l'arabe, pas forcément l'arabizi).
- **Notifications informelles, support WhatsApp** : peut tolérer un peu de code-switching FR.
- **Documentation légale (CGU, RGPD)** : MSA acceptable car juridique. Idéalement double version MSA + tunisien simplifié.

## Exemples concrets

| Anglais     | MSA (à éviter dans l'UI) | Tunisien (à utiliser)     |
| ----------- | ------------------------ | ------------------------- |
| Add product | إضافة منتج               | زيد منتج                  |
| Save        | حفظ                      | احفظ ✅ (commun aux deux) |
| Welcome     | مرحباً بك                | أهلا بيك                  |
| Your orders | طلباتك                   | الكوماندات متاعك          |
| Sign in     | تسجيل الدخول             | ادخل                      |
| Shop        | متجر                     | حانوت                     |

> Si tu n'es pas sûr d'une formulation, **demande à la PME pilote** plutôt que de deviner. Un mauvais arabe tunisien donne l'impression d'un produit étranger.

## Stack technique

- **Lib** : `next-intl` (App Router compatible)
- **Fichiers** : `messages/fr.json`, `messages/ar-TN.json`, `messages/en.json`
- **Routing** : `/[locale]/...` — locale dans l'URL
- **Détection** : header `Accept-Language` au premier visit, puis cookie `NEXT_LOCALE`

## RTL (right-to-left)

Quand `locale === 'ar-TN'` :

- `<html dir="rtl" lang="ar-TN">`
- Tailwind : utiliser les classes logiques (`ms-` au lieu de `ml-`, `pe-` au lieu de `pr-`)
- Icônes directionnelles (flèches retour, chevrons) doivent flipper — utiliser `rtl:rotate-180`
- Les chiffres restent en chiffres latins (1, 2, 3) — pas en chiffres arabo-indiens (١, ٢, ٣) — c'est l'usage moderne en Tunisie
- Dates : format `DD/MM/YYYY` même en arabe (usage tunisien)
- Devises : "120 TND" ou "120 د.ت" — préférer "TND" pour cohérence backend, "د.ت" pour affichage user

## Structure des clés i18n

Hiérarchique, par feature, jamais par UI element :

```json
{
  "onboarding": {
    "step1": {
      "title": "Créez votre compte",
      "submit": "Continuer"
    }
  },
  "products": {
    "create": {
      "title": "Nouveau produit",
      "fields": {
        "name": "Nom du produit",
        "price": "Prix"
      }
    }
  }
}
```

❌ Pas de clés UI : `"button.blue.large"`, `"header.text"`, `"page1.heading"`.
✅ Clés métier : `"onboarding.step1.title"`, `"products.create.title"`.

## Workflow de traduction

1. Source = FR (par défaut équipe écrit en FR)
2. Pour chaque ajout : ajouter d'abord la clé FR, puis la clé EN (équipe peut), puis la clé AR-TN (validée avec une PME pilote ou un native speaker)
3. **Ne jamais publier** une string AR-TN générée par IA sans review humaine
4. Tracker les clés non-traduites avec un script CI : `pnpm i18n:check` doit échouer si une clé manque dans une locale

## Anti-patterns

- ❌ Mettre du MSA dans l'UI PME : ils ne l'utilisent pas à l'oral, ça crée distance
- ❌ Traduire mot-à-mot du FR vers l'AR : la structure de phrase change
- ❌ Mélanger alphabet latin et arabe dans une même phrase d'interface (réservé au support informel)
- ❌ Utiliser des chiffres arabo-indiens (٠١٢٣) — non standard en Tunisie moderne
- ❌ Oublier le RTL sur un nouveau composant — toujours tester en `ar-TN` avant de merger
