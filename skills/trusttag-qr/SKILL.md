---
name: trusttag-qr
description: Use this skill when working on TrustTag — the product traceability QR system. Triggers on "QR", "traçabilité", "trace", "TrustTag", "Digital Product Passport", "DPP", "ESPR" (EU regulation), or files under `lib/trusttag/`, `app/api/trace/`, `app/t/[id]/`. Use for both generating QRs, designing the trace data schema, and ensuring EU regulatory compliance.
---

# TrustTag — Traçabilité produit & Digital Product Passport

## Contexte réglementaire

L'UE impose le **Digital Product Passport (DPP)** via le règlement ESPR (Ecodesign for Sustainable Products Regulation). Application progressive 2026-2030 selon les catégories. Textile et certains produits artisanaux sont en première vague.

Médina Digital prend de l'avance : **tout produit a un DPP dès le départ**, même si la catégorie n'est pas encore obligatoire. C'est un argument différenciant face à Etsy/Faire.

## Schéma DPP minimal

```ts
type DppData = {
  // Identification
  product_id: string;
  trusttag_id: string; // identifiant unique du QR (ULID)
  gtin?: string; // si EAN/UPC disponible

  // Origine
  country_of_origin: 'TN';
  region: string; // gouvernorat tunisien
  artisan: {
    id: string;
    name: string; // ou nom de l'atelier
    workshop_address?: string; // optionnel, RGPD-friendly
  };

  // Matériaux & composition
  materials: Array<{
    name: string; // ex: "argile rouge de Nabeul"
    percentage: number;
    origin?: string;
    recycled_content?: number;
    certifications?: string[]; // ex: ["GOTS", "OEKO-TEX"]
  }>;

  // Empreinte
  carbon_footprint_kgco2e?: number; // Scope 1+2+3 estimé
  water_usage_liters?: number;
  energy_source?: 'grid' | 'solar' | 'mixed';

  // Durabilité
  expected_lifetime_years?: number;
  care_instructions: { fr: string; ar_tn: string; en: string };
  repair_options?: { fr: string; ar_tn: string; en: string };
  end_of_life: { fr: string; ar_tn: string; en: string }; // recyclage, compostage, retour atelier

  // Chaîne
  production_date: string; // ISO date
  batch_id?: string;
  certifications: string[];

  // Vérification
  verified_at?: string; // timestamp dernière vérification PME
  verified_by?: string; // user_id
};
```

## Génération du QR

- **Format** : QR code v6+ avec correction d'erreur niveau M (équilibre densité/robustesse)
- **Contenu** : URL courte vers `https://medinadigital.tn/t/<trusttag_id>` — **pas** les données brutes dans le QR (elles peuvent évoluer)
- **trusttag_id** : ULID (pas UUID — triable et plus court)
- **Rendu** : SVG pour impression haute qualité, PNG 1024px pour aperçu écran
- **Logo central** : optionnel, max 25% de la zone, le QR doit rester scannable

Génération côté NestJS dans le module `trusttag/` (`apps/api/src/modules/trusttag/`). Stocker le SVG dans le storage assets configuré (S3/R2/Bunny — voir `CLAUDE.md` "Points ouverts"), l'URL dans la table `trusttags` (TypeORM).

## Page publique de trace

Route : `app/t/[trusttag_id]/page.tsx`

Cette page est **publique** (pas d'auth) — n'importe qui scanne le QR et voit :

1. Photo + nom du produit
2. Artisan + région + photo atelier (si autorisé)
3. Matériaux et composition (graphique simple)
4. Date de production + numéro de lot
5. Empreinte carbone (si calculée)
6. Instructions d'entretien et fin de vie
7. Lien "Voir des produits similaires de cet artisan" (cross-sell)
8. Mention "Vérifié par Médina Digital" + date

Localisation : détecter la langue du navigateur, défaut EN pour les acheteurs européens.

## Sécurité

- Le `trusttag_id` est **non-devinable** (ULID est suffisamment large)
- Aucun endpoint ne permet de lister tous les TrustTags d'une PME sans auth
- La PME peut **révoquer** un TrustTag (produit défectueux, rappel) — la page affiche alors un avertissement au lieu des données

## Tier freemium TrustTag

Selon le pitch, TrustTag est aussi un produit autonome :

- **Free** : jusqu'à 50 QR / mois, données de base, branding Médina Digital sur la page
- **Pro (29 TND/mois)** : 500 QR, custom branding, analytics scans
- **Business (59 TND/mois)** : illimité, API, multi-utilisateurs

La logique de quota dans `lib/trusttag/quota.ts`. Vérifier à la création du QR, pas au scan (le scan doit toujours marcher).

## Anti-patterns

- ❌ Mettre les données DPP directement dans le QR (le QR doit pointer, pas contenir)
- ❌ Bloquer l'accès à la page de trace si la PME a un impayé (un acheteur scanne, ça doit marcher)
- ❌ Inventer une empreinte carbone si non calculée — laisser le champ vide ou marquer "estimation en cours"
- ❌ Promettre une certification non vérifiée
