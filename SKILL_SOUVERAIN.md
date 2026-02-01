# Skill SOUVERAIN - Intégration Clawdbot

**Date d'installation** : 2026-02-01  
**Path** : `/home/ubuntu/.npm-global/lib/node_modules/clawdbot/skills/souverain`

## 📦 Qu'est-ce qu'un skill ?

Un **skill** est un module qui étend les capacités de Clawdbot en fournissant :
- Workflows spécialisés
- Documentation architecture
- Scripts et outils
- Bonnes pratiques

## 🎯 Skill SOUVERAIN

Le skill SOUVERAIN fournit :

### 1. SKILL.md (6.7 KB)
Guide principal pour travailler sur SOUVERAIN :
- Commandes de développement
- Conventions de code (Design System CALM-UI)
- Debugging procedures
- Exemples rapides

### 2. scripts/test-drag-drop.js (11.5 KB)
Test Playwright E2E complet du workflow drag & drop :
- Navigation Portfolio Hub
- Wizard 7 étapes
- Génération GROQ
- Drag & drop images (Hero, About, Projects)
- Export HTML
- 14 screenshots générés

### 3. references/

**architecture.md** (10.4 KB) :
- Structure projet complète
- Flux de données (Portfolio Hub, IPC)
- Design System (CALM-UI)
- Database schema
- Services IA (GROQ, BERT)
- Templates system
- Performance metrics

**workflow-drag-drop.md** (8 KB) :
- Documentation complète feature drag & drop
- Composants créés
- Modifications templates
- Intégration PortfolioHub
- Tests et debugging

## 🚀 Usage

Le skill se déclenche automatiquement quand Clawdbot détecte :
- Travail sur SOUVERAIN
- Debug features
- Questions architecture
- Tests Playwright

### Exemples de triggers

```
Aide-moi à débugger le drag & drop images
→ Charge SKILL.md + workflow-drag-drop.md

Explique l'architecture de SOUVERAIN
→ Charge architecture.md

Lance le test Playwright drag & drop
→ Exécute scripts/test-drag-drop.js
```

## 📝 Test Playwright inclus

**Fichier** : `scripts/test-drag-drop.js`  
**Source** : `tests/portfolio-drag-drop-images.spec.js`

### Lancer le test

```bash
# Depuis le skill
cd /home/ubuntu/.npm-global/lib/node_modules/clawdbot/skills/souverain
npx playwright test scripts/test-drag-drop.js --headed

# Depuis SOUVERAIN (équivalent)
cd /home/ubuntu/clawd/SOUVERAIN
npx playwright test tests/portfolio-drag-drop-images.spec.js --headed
```

### Ce que teste le script

1. **Phase 1** : Navigation Portfolio Hub
2. **Phase 2** : Wizard 7 étapes (auto-rempli)
3. **Phase 3** : Génération portfolio (attente 5s)
4. **Phase 4** : Preview Éditable
   - Import 3 images test (générées en canvas)
   - Drag & drop sur Hero
   - Drag & drop sur About
5. **Phase 5** : Export final

### Screenshots générés

```
test-results/
├── drag-drop-01-start.png
├── drag-drop-02-step1.png
├── drag-drop-03-step2.png
├── drag-drop-04-step3.png
├── drag-drop-05-step4.png
├── drag-drop-06-step5.png
├── drag-drop-07-step6.png
├── drag-drop-08-step7.png
├── drag-drop-09-generating.png
├── drag-drop-10-editable-preview.png
├── drag-drop-11-library.png
├── drag-drop-12-hero-dropped.png
├── drag-drop-13-about-dropped.png
└── drag-drop-14-final.png
```

## 🔧 Maintenance du skill

### Mettre à jour le skill

Si l'architecture de SOUVERAIN change :

```bash
# 1. Modifier les fichiers dans /tmp/souverain-skill/
vim /tmp/souverain-skill/SKILL.md
vim /tmp/souverain-skill/references/architecture.md

# 2. Copier vers Clawdbot
cp -r /tmp/souverain-skill/* /home/ubuntu/.npm-global/lib/node_modules/clawdbot/skills/souverain/
```

### Ajouter un nouveau test

```bash
# 1. Créer le test dans SOUVERAIN
cd SOUVERAIN
vim tests/mon-nouveau-test.spec.js

# 2. Copier vers skill
cp tests/mon-nouveau-test.spec.js /home/ubuntu/.npm-global/lib/node_modules/clawdbot/skills/souverain/scripts/

# 3. Documenter dans SKILL.md
vim /home/ubuntu/.npm-global/lib/node_modules/clawdbot/skills/souverain/SKILL.md
```

## 📚 Références skill

**Création skill** : Utilise le skill `skill-creator` pour créer/modifier des skills  
**Documentation** : `/home/ubuntu/.npm-global/lib/node_modules/clawdbot/skills/skill-creator/SKILL.md`

### Structure standard d'un skill

```
skill-name/
├── SKILL.md (required)          # Guide principal
│   ├── YAML frontmatter (name, description)
│   └── Markdown instructions
├── scripts/ (optional)          # Code exécutable
├── references/ (optional)       # Documentation détaillée
└── assets/ (optional)           # Fichiers templates/ressources
```

## 🎯 Avantages

1. **Contexte permanent** : L'IA a toujours accès à la doc SOUVERAIN
2. **Tests inclus** : Playwright tests prêts à exécuter
3. **Onboarding rapide** : Nouveau dev = charge le skill
4. **Cohérence** : Conventions de code documentées
5. **Debugging** : Checklists et procédures

## ✅ Checklist post-installation

- [x] Skill installé dans Clawdbot
- [x] SKILL.md créé (guide principal)
- [x] Test Playwright inclus
- [x] References (architecture + workflow)
- [x] Test dans SOUVERAIN synchronisé
- [x] Documentation SKILL_SOUVERAIN.md

## 🔗 Liens

- **Skill path** : `/home/ubuntu/.npm-global/lib/node_modules/clawdbot/skills/souverain`
- **SOUVERAIN repo** : `/home/ubuntu/clawd/SOUVERAIN`
- **Test source** : `tests/portfolio-drag-drop-images.spec.js`

---

**Auteur** : Claude (Assistant IA)  
**Dernière mise à jour** : 2026-02-01
