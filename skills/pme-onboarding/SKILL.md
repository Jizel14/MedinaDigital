---
name: pme-onboarding
description: Use this skill when building or modifying the PME onboarding flow — registration, KYC, first product setup, dashboard tour, subscription. Triggers on "onboarding", "inscription PME", "signup", "KYC", "PME pilote", or files under `app/(saas)/onboarding/`, `app/api/onboarding/`, `lib/onboarding/`. The 10 PME pilotes (M1-M3 roadmap) ont besoin d'un parcours simple, en arabe ou français, avec assistance humaine intégrée.
---

# Onboarding PME tunisienne

## Principe directeur

Une PME tunisienne typique (artisan de Nabeul, atelier textile à Sfax) **n'est pas** un utilisateur SaaS expérimenté. Le parcours doit :

- Marcher sur mobile en priorité (la plupart utilisent le téléphone, pas un laptop)
- Permettre de pauser et reprendre (pas tout d'une traite)
- Être disponible en arabe tunisien et français (voir skill `i18n-tunisian`)
- Avoir un humain joignable (Seif ou Jizel) en cas de blocage — afficher un bouton WhatsApp

## Étapes du parcours (target : < 15 min)

### Étape 1 — Compte

- Email + mot de passe, OU connexion via numéro WhatsApp + OTP
- Validation email/SMS
- Pas de demande d'infos business à ce stade

### Étape 2 — Profil business

- Nom de l'atelier / entreprise
- Région (gouvernorat) — dropdown
- Catégorie principale (céramique, textile, cuir, etc.) — dropdown
- Année de création — optionnel
- Nombre d'artisans dans l'atelier — slider 1 à 50+

### Étape 3 — KYC léger (différé possible)

- Patente / matricule fiscal tunisien
- CIN du gérant (upload photo)
- Justificatif d'activité (photo de l'atelier ou facture récente)

⚠️ Ne **pas** bloquer l'étape suivante sur KYC. Marquer le compte "en vérification" et permettre de continuer. Le KYC bloque seulement le **payout** (réception des paiements marketplace), pas l'utilisation du dashboard.

### Étape 4 — Premier produit (le moment de vérité)

- Upload de 1 à 3 photos depuis la galerie ou la caméra
- Titre court (la PME tape, ou parle — utiliser Web Speech API si possible)
- Prix en TND
- Bouton "Génère le reste avec l'IA" → appelle `lib/ai/catalog.ts` pour produire description FR/EN/AR-TN, story de l'artisan, suggestion de catégorie, etc.
- La PME relit, édite, valide
- Le TrustTag est généré automatiquement à la validation

### Étape 5 — Plan

- Démarrer en **Starter gratuit** (à confirmer — alternative : 14 jours d'essai sur Pro)
- Présenter Pro et Business mais ne pas forcer le paiement maintenant
- Stripe Customer créé immédiatement (pas la souscription)

### Étape 6 — Tour du dashboard

- 4 cartes courtes : "Vos produits", "Vos commandes", "Vos analytics", "Demandes acheteurs"
- Skip possible
- Garder un bouton "Refaire le tour" dans le menu

## Données collectées (table `pme_profiles`)

```ts
{
  id: string,                    // = tenant_id
  user_id: string,               // owner
  business_name: string,
  business_name_ar?: string,
  region: string,
  category: string,
  year_founded?: number,
  artisan_count: number,
  patente_number?: string,
  patente_doc_url?: string,
  cin_doc_url?: string,
  activity_proof_url?: string,
  kyc_status: "pending" | "verified" | "rejected",
  kyc_verified_at?: string,
  onboarding_completed_at?: string,
  onboarding_step: number,       // pour reprendre où la PME s'est arrêtée
  whatsapp_number?: string,
  preferred_language: "fr" | "ar-TN",
  created_at: string,
}
```

## Checklist PME pilote (les 10 premières)

Pour chaque PME pilote, créer un dossier `pilots/<pme-slug>/` avec :

- `profile.md` — qui ils sont, leur produit, leur point de douleur principal
- `products-batch.csv` — leurs 10-20 premiers produits (saisi avec eux IRL)
- `photos/` — leurs photos haute résolution
- `notes.md` — feedbacks reçus, blocages, idées

Le slash command `/new-pme <slug>` scaffolde ce dossier automatiquement.

## Anti-patterns

- ❌ Demander la TVA, le RIB, ou des infos comptables avant que la PME ait vu de la valeur
- ❌ Email de "bienvenue" en français formel à un artisan qui ne lit que l'arabe
- ❌ Forcer la souscription payante avant le premier produit publié
- ❌ Bloquer le compte si le KYC met 48h (très courant en Tunisie)
- ❌ Demander de "compléter votre profil à 100%" — ça ressemble à LinkedIn et personne ne le fait
