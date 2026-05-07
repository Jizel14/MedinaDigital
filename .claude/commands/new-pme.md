---
description: Scaffold a new pilot PME folder with profile, products batch template, photos directory, and notes. Use when onboarding one of the 10 pilot PMEs.
argument-hint: <pme-slug>
---

Tu vas scaffolder un nouveau dossier PME pilote pour Médina Digital.

Le slug PME fourni : `$1`

Étapes :

1. Créer le dossier `pilots/$1/` à la racine du repo
2. Créer `pilots/$1/profile.md` avec ce template :

```markdown
# PME pilote : $1

## Identité

- Nom complet de l'atelier/entreprise :
- Région (gouvernorat) :
- Catégorie principale :
- Année de création :
- Nombre d'artisans :
- Site web actuel (si existant) :
- Contact principal : (nom, rôle, WhatsApp, email)

## Histoire

[Résumé en 2-3 paragraphes : qui ils sont, depuis quand, ce qui les rend spécifiques, leur clientèle actuelle]

## Point de douleur principal

[Quel problème les a fait dire oui à Médina Digital]

## Produits phares

[Liste rapide des 3-5 produits qu'on va mettre en avant]

## Blocages identifiés

- [ ] Photos de qualité ?
- [ ] Description des produits prête ?
- [ ] Prix cohérents fixés ?
- [ ] Capable de gérer une commande internationale (emballage, expédition) ?
- [ ] Patente / KYC ok ?
- [ ] Compte bancaire pour réception paiements ?

## Plan d'onboarding

- [ ] Visite atelier (date)
- [ ] Photos pro (date, qui)
- [ ] Saisie 10 premiers produits (date)
- [ ] Validation contenu FR/AR/EN (date)
- [ ] Génération TrustTags (date)
- [ ] Mise en ligne marketplace (date)

## Statut

- Date premier contact :
- Date signature :
- Date go-live :
- Statut actuel : prospect | onboarding | actif | pause | churn

## Notes

[Tout ce qui ne rentre nulle part ailleurs]
```

3. Créer `pilots/$1/products-batch.csv` avec en-têtes :

```csv
title_fr,title_ar_tn,title_en,category,materials,origin_region,price_tnd,price_eur,weight_g,length_cm,width_cm,height_cm,description_fr,story_fr,photos_count
```

4. Créer `pilots/$1/photos/.gitkeep` (dossier vide pour les photos)

5. Créer `pilots/$1/notes.md` avec :

```markdown
# Notes — $1

## Feedbacks reçus

[Datez chaque feedback]

## Idées produit issues de cette PME

[Ce qu'on apprend pour Médina Digital en général]

## Blocages rencontrés

[Pour ne pas les répéter avec la prochaine PME]
```

Une fois fait, afficher l'arborescence créée et rappeler les prochaines étapes (visite atelier, photos, saisie produits).
