# Setup Claude Code pour Médina Digital

Ce package contient la configuration Claude Code recommandée pour structurer le développement de Médina Digital, post-hackathon, en transition vers un produit réel.

## Contenu

```
medina-digital/
├── CLAUDE.md                         # Brief projet permanent (lu à chaque session)
├── .claude/
│   ├── settings.json                 # Permissions et config Claude Code
│   ├── agents/                       # Sub-agents spécialisés
│   │   ├── product-engineer.md       # Ingénieur Next.js / NestJS / TypeORM / MySQL / Stripe
│   │   ├── content-bilingual.md      # Rédacteur FR/AR-TN/EN
│   │   ├── marketplace-curator.md    # QA fiches produit
│   │   ├── trace-compliance.md       # DPP / RGPD / KYC
│   │   └── jury-liaison.md           # Comms jury / investisseurs
│   └── commands/                     # Slash commands
│       ├── new-pme.md                # /new-pme <slug>
│       ├── audit-trace.md            # /audit-trace <product-id>
│       ├── translate-product.md      # /translate-product <product-id>
│       └── ship-check.md             # /ship-check
└── skills/                           # Instructions métier (auto-déclenchées)
    ├── artisan-catalog/SKILL.md      # Génération fiches produit
    ├── trusttag-qr/SKILL.md          # Traçabilité et DPP UE
    ├── pme-onboarding/SKILL.md       # Parcours d'inscription PME
    ├── buyer-storytelling/SKILL.md   # Contenu acheteurs européens
    └── i18n-tunisian/SKILL.md        # Règles trilingues FR/AR-TN/EN
```

## Installation

### 1. Copier dans ton repo

Depuis la racine de ton projet `medina-digital/` (le repo Next.js) :

```bash
# Copie le contenu du package
cp -r path/to/this-package/CLAUDE.md ./
cp -r path/to/this-package/.claude ./
cp -r path/to/this-package/skills ./

# Vérifier
ls -la
ls -la .claude/
ls skills/
```

### 2. Adapter à ton contexte

Édite ces fichiers avec les vraies valeurs de ton projet :

- **`CLAUDE.md`** : la section "Stack technique", "Décisions actées" et "Points ouverts à trancher"
- **`.claude/settings.json`** : ajuster les permissions si tu utilises pnpm/yarn/bun, ajouter les MCP servers quand prêt

### 3. Vérifier dans Claude Code

Lance Claude Code dans le repo :

```bash
cd medina-digital
claude
```

Puis teste :

```
/agents     # liste les sub-agents disponibles
/help       # liste les slash commands custom (new-pme, audit-trace, etc.)
```

Si les agents apparaissent dans `/agents`, c'est good.

### 4. Connecter les MCP servers (quand prêt)

Stripe et Vercel sont les plus utiles pour ce projet (DB MySQL + NestJS sont gérés en CLI / TypeORM, pas via MCP). Voir https://docs.claude.com/en/docs/claude-code/mcp pour la doc officielle.

Édite `.claude/settings.json` et ajoute la section `mcpServers` avec les bonnes commandes et variables d'environnement (les secrets restent dans `.env`, jamais dans `settings.json`).

## Comment utiliser au quotidien

### Développement de feature

1. Tu décris la feature à Claude Code
2. Claude lit automatiquement `CLAUDE.md` (toujours) et le `SKILL.md` pertinent (selon le sujet)
3. Pour du code, Claude délègue (ou tu invoques) le sub-agent `product-engineer`
4. Pour du contenu UI, déléguer à `content-bilingual`
5. Avant de merger, lancer `/ship-check`

### Onboarding d'une PME pilote

1. `/new-pme nabeul-ceramics-khaled` → scaffolde le dossier
2. Tu remplis `pilots/nabeul-ceramics-khaled/profile.md`
3. Tu fais saisir les premiers produits (CSV ou via le dashboard)
4. Pour chaque produit : `/translate-product <id>` → génère les 3 langues
5. Avant publication : invoquer `marketplace-curator` pour review
6. Après publication : `/audit-trace <id>` pour vérifier la chaîne DPP

### Communication jury / investisseurs

1. Avant chaque réunion : invoquer `jury-liaison` avec le contexte (qui, quand, pourquoi)
2. Update mensuel : invoquer `jury-liaison` pour produire le format standard
3. Refresh du pitch : invoquer `jury-liaison` qui lit le `pitch.js` actuel et propose les updates

## Évolution du package

Ces fichiers ne sont pas figés. À mesure que tu apprends sur le projet :

- **Mets à jour `CLAUDE.md`** — surtout la section "Conventions" et "Points ouverts"
- **Affine les skills** — un nouveau pattern récurrent ? Ajoute-le dans le skill correspondant
- **Crée de nouveaux agents** quand un rôle apparaît (ex: `partner-relations`, `seo-strategist`)
- **Crée de nouveaux slash commands** pour automatiser ce que tu fais 3+ fois

## Ordre de priorité d'application

Si tu veux y aller progressivement :

1. **Installer `CLAUDE.md` + `settings.json`** — gain immédiat, contexte permanent
2. **Activer les skills `artisan-catalog`, `i18n-tunisian`, `pme-onboarding`** — les plus utilisés au quotidien
3. **Activer les sub-agents `product-engineer` et `content-bilingual`** — couvrent 80% des tâches
4. **Ajouter les slash commands** — quand tu vois que tu refais souvent les mêmes manipulations
5. **Activer `trace-compliance` et `jury-liaison`** — au moment où tu en as besoin (avant un audit, avant un meeting)

Bon dev. 🌿
