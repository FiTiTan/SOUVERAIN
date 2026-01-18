# 🚀 Guide Rapide : Portfolio Builder V2

## Démarrage rapide

### 1️⃣ Import depuis GitHub

**Ce dont vous avez besoin** :
- Un compte GitHub
- Un Personal Access Token (gratuit)

**Étapes** :

1. **Créer un token GitHub** :
   - Aller sur https://github.com/settings/tokens/new
   - Donner un nom : "Souverain Portfolio"
   - Cocher scope : `repo`
   - Cliquer "Generate token"
   - **Copier le token** (commence par `ghp_`)

2. **Dans Souverain** :
   - Ouvrir le module Portfolio
   - Cliquer "+ Ajouter un projet"
   - Choisir "🐙 Depuis GitHub"
   - Coller votre token
   - Cliquer "Se connecter"

3. **Sélectionner vos projets** :
   - Cocher les repos à importer (max 3 en version Free)
   - Cliquer "Analyser avec l'IA →"
   - Attendre 30-60 secondes par projet

4. **Résultat** :
   - Pitch généré automatiquement
   - Technologies détectées
   - Challenge et Solution rédigés
   - Liens GitHub ajoutés

---

### 2️⃣ Import depuis un dossier local

**Ce dont vous avez besoin** :
- Un dossier de projet sur votre PC
- Idéalement un fichier README.md

**Étapes** :

1. **Préparer votre projet** :
   - Vérifier présence README.md (optionnel mais recommandé)
   - Images/screenshots dans le dossier (détection auto)

2. **Dans Souverain** :
   - Cliquer "+ Ajouter un projet"
   - Choisir "📁 Depuis un dossier local"
   - Sélectionner votre dossier
   - **C'est tout !** L'analyse démarre automatiquement

3. **Résultat** :
   - Technologies détectées par extensions de fichiers
   - README analysé par l'IA
   - Présentation professionnelle générée

---

### 3️⃣ Éditer un projet

**Ouvrir l'éditeur** :
- Cliquer sur un projet → "✏️ Éditer"

**5 sections modifiables** :

#### 📝 Le Pitch (1-2 phrases)
```
Exemple : "Portfolio Builder — Génération automatique
de portfolios professionnels via IA pour développeurs."
```
- Bouton "✨ Régénérer" : l'IA propose une nouvelle version

#### 🔧 La Stack (liste technologies)
```
Exemples : React, TypeScript, Node.js, PostgreSQL
```
- Ajouter/retirer des technologies
- Bouton "Régénérer" : détection auto depuis README

#### 🎯 Le Challenge (2-3 phrases)
```
Exemple : "Les développeurs passent 5+ heures à rédiger
manuellement leurs portfolios. Aucun outil n'exploite
l'IA pour automatiser ce processus."
```

#### ✅ La Solution (3-4 phrases)
```
Exemple : "J'ai développé un scraper GitHub couplé à
Groq AI pour générer automatiquement les 5 sections
obligatoires d'un projet. Architecture Electron + React."
```

#### 🔗 Les Outputs (liens)
```
Exemples :
- Code source → https://github.com/user/repo
- Démo live → https://demo.example.com
```

**Sauvegarder** : Bouton "Sauvegarder" en bas à droite

---

### 4️⃣ Mode Ghost (Anonymisation)

**Pourquoi utiliser Ghost Mode ?**
- Masquer noms d'entreprises pour postuler chez concurrents
- Protéger identité clients (NDA)
- Cacher écoles prestigieuses (éviter biais recrutement)

**Activer Ghost Mode** :

1. **Ouvrir éditeur projet** → Section "🕶️ Mode Ghost"
2. **Cliquer "🔍 Détecter les entités sensibles"**
   - Attendre 10-15 secondes
3. **Vérifier les remplacements proposés** :
   ```
   Apple Inc. → Client tech majeur
   John Doe → Chef de projet
   Stanford → École d'ingénieurs
   ```
4. **Éditer manuellement** si besoin
5. **Activer toggle** (passe au vert)
6. **Sauvegarder**

**Résultat** :
- Texte original modifié dans pitch/challenge/solution
- Mappings sauvegardés (réversible)
- Badge "🕶️ Ghost Mode actif" sur le projet

---

### 5️⃣ Choisir un template d'affichage

**Ouvrir vue projet** → Selector templates en haut

#### 🖥️ Template Developer
- Style **dark** (#1a1a1a background)
- Accent **vert néon** (#00ff9f)
- Font **monospace** (Fira Code)
- Parfait pour : développeurs, projets open source

#### ✨ Template Minimal
- Style **clean** (fond clair/sombre adaptatif)
- Typographie **élégante** (letterspacing négatif)
- Layout **centré** (max 800px)
- Parfait pour : designers, consultants, présentations clients

**Switch instantané** entre templates (pas de rechargement)

---

## 🔒 Limite Free : 3 projets maximum

**Que se passe-t-il en Free ?**
- Maximum **3 projets** tous portfolios confondus
- Import bloqué si limite atteinte
- Message : "Limite Free atteinte (3 projets max)"

**Contournement** :
- Supprimer anciens projets pour libérer espace
- Passer en Premium (TODO: upgrade flow)

---

## 🐛 Problèmes courants

### "Token GitHub invalide"
✅ **Solution** :
- Vérifier scope `repo` coché
- Régénérer token si expiré
- Ne pas inclure espaces lors du copier-coller

### "Aucune entité détectée" (Ghost Mode)
✅ **Solution** :
- Ajouter plus de contexte (noms complets, entreprises)
- Minimum 100 caractères requis
- Utiliser remplacements manuels

### "Erreur analyse IA"
✅ **Solution** :
- Vérifier connexion internet
- README trop long ? (max 2000 chars parsés)
- Réessayer dans 5 minutes (possible timeout Groq)

### Projet importé mais sections vides
✅ **Solution** :
- Repo sans README → ajouter README.md
- Cliquer "Régénérer" sur chaque section
- Éditer manuellement si besoin

---

## 💡 Astuces Pro

### 🎯 Optimiser la détection IA
**Pour GitHub** :
- README structuré avec sections claires
- Mention explicite des technologies (# Built with React, Node.js)
- Screenshots dans le repo (détection visuelle future)

**Pour Local** :
- README.md obligatoire pour contexte
- Extensions de fichiers claires (.js, .ts, .py)
- Éviter dossiers génériques (node_modules, build)

### ✍️ Rédiger un bon Pitch
**Formule gagnante** :
```
[Nom projet] — [Valeur ajoutée] pour [cible utilisateurs]
```

**Exemples** :
- ✅ "TaskMaster — App de gestion de tâches collaborative pour équipes distantes"
- ❌ "TaskMaster — Une super app de todo list" (trop vague)

### 🔧 Maximiser la Stack
**Ajouter manuellement** :
- Outils/services cloud (AWS, Vercel, Railway)
- Méthodologies (Scrum, TDD, CI/CD)
- Librairies clés (Redux, Prisma, Jest)

### 🔗 Outputs percutants
**Au-delà de GitHub** :
- Démo live hébergée (Vercel, Netlify)
- Article blog technique (Medium, Dev.to)
- Case study PDF (Google Drive public)
- Vidéo démo (YouTube, Loom)

---

## 📞 Support

**Logs utiles pour debug** :
1. DevTools Electron (F12) → Onglet Console
2. Terminal npm start → Logs main process
3. DB SQLite : `sqlite3 souverain_vault.db`
   ```sql
   SELECT * FROM portfolio_projects WHERE title = 'Mon Projet';
   ```

**Où trouver les fichiers** :
- Base de données : `%APPDATA%\souverain\souverain_vault.db` (Windows)
- Logs : Terminal où `npm start` a été lancé

---

## 🎓 Vidéos tutoriels (TODO)

- [ ] Import GitHub pas à pas
- [ ] Création token GitHub
- [ ] Éditer les 5 sections
- [ ] Ghost Mode en action
- [ ] Comparaison templates

---

**Besoin d'aide ?** Consultez `IMPLEMENTATION_T006_V2.md` pour documentation technique complète.
