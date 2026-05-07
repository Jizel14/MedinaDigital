---
name: artisan-catalog
description: Use this skill when generating, editing, or reviewing artisan product listings for Médina Digital — fiches produits, descriptions, multilingual content, photo briefs. Triggers on terms like "fiche produit", "catalogue", "product listing", "artisan listing", or when working with files under `app/(marketplace)/products/` or `lib/ai/catalog.ts`. Do NOT use for inventory/stock logic — that's separate.
---

# Génération de fiches produits artisans

## Objectif

Produire des fiches produits qui convertissent à l'export européen tout en respectant l'authenticité de l'artisanat tunisien.

## Champs obligatoires (schéma produit)

Tout produit doit avoir, au minimum :

```ts
{
  id: string,
  tenant_id: string,        // PME propriétaire
  slug: string,             // URL-safe, généré depuis title.fr
  title: { fr: string, ar_tn: string, en: string },
  description: { fr: string, ar_tn: string, en: string },
  story: { fr: string, ar_tn: string, en: string }, // courte histoire de l'artisan/objet
  category: string,         // taxonomy fixe: ceramique, cuir, textile, bois, metal, verre, bijoux
  materials: string[],      // requis pour DPP
  origin_region: string,    // ex: "Nabeul", "Sejnane", "Sidi Bou Said"
  artisan_id: string,       // lien vers le profil artisan
  price_eur: number,        // prix marketplace
  price_tnd: number,        // prix de référence local
  weight_g: number,
  dimensions_cm: { l: number, w: number, h: number },
  photos: string[],         // URLs assets storage (S3/R2/Bunny — voir CLAUDE.md), min 3
  ar_model_url?: string,    // glTF si disponible
  trusttag_id: string,      // lien vers le QR de traçabilité
  dpp_data: DppData,        // voir skill trusttag-qr
  custom_request: boolean   // accepte les demandes sur mesure
}
```

## Style des descriptions

**Description courte** (max 160 caractères) — utilisée en preview, méta SEO :

- Verbe d'action, matière, lieu, sensation
- Exemple : "Plat à couscous en céramique de Nabeul, peint à la main, motifs berbères traditionnels."

**Description longue** (200-400 mots) — page produit :

- Paragraphe 1 : ce que c'est, dimensions, usage
- Paragraphe 2 : matériaux, technique, durée de fabrication
- Paragraphe 3 : entretien et durabilité (important pour DPP)
- Pas de superlatifs vides ("incroyable", "magnifique"). Faits concrets.

**Story de l'artisan** (100-200 mots) — encart émotionnel :

- Prénom + métier + années d'expérience
- Détail sensoriel (l'odeur de l'atelier, le geste appris du grand-père)
- Pourquoi cet objet précisément
- Pas de pathos. Acheteur européen sensible mais pas dupe.

## Traduction FR ↔ AR-TN ↔ EN

- **FR** = locale source par défaut (la PME écrit en FR, on traduit le reste)
- **AR-TN** = arabe tunisien, pas l'arabe standard moderne robotique. Voir skill `i18n-tunisian`.
- **EN** = anglais britannique pour le marché UE (couleur = colour, etc.)

Si la PME fournit l'AR en premier, traduire AR → FR → EN.

## Génération assistée par IA

Wrapper dans `lib/ai/catalog.ts`. Ne jamais appeler l'IA directement depuis un composant.

```ts
generateProductDescription({
  title, materials, region, artisan_name, price_eur, photos
}) → { fr, ar_tn, en }
```

Toujours :

- Limiter la sortie en tokens (max 800 par langue)
- Logger la requête + le résultat dans `ai_generations` (audit + facturation IA)
- Permettre à la PME d'éditer manuellement avant publication
- Ne jamais publier directement la sortie IA sans review

## Photos

Brief automatique généré quand une PME crée un produit sans photos suffisantes :

- Minimum 3 photos : produit seul fond neutre, détail/texture, contexte d'usage
- Format carré 2000×2000 minimum, JPEG qualité 85+
- Si possible : 1 photo de l'artisan au travail (renforce la story)

## Anti-patterns

- ❌ Décrire un objet avec des termes orientalistes ("exotique", "mystérieux", "oriental")
- ❌ Utiliser le mot "ethnique" — préférer la région précise
- ❌ Promettre une fabrication "100% main" si l'atelier utilise des outils mécaniques
- ❌ Inventer une histoire d'artisan que la PME n'a pas validée
- ❌ Mettre le prix EUR sans documenter le taux et la marge appliqués

## Quand invoquer le sub-agent

Pour la rédaction multilingue de qualité, déléguer à l'agent `content-bilingual`. Ce skill décrit le **schéma et la structure** ; l'agent gère le **ton et les traductions**.
