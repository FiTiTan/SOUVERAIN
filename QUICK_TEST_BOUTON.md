# 🔍 Test Rapide - Bouton "Créer un projet"

## 📋 Checklist de Test

Suis ces étapes **EXACTEMENT** dans l'ordre :

### ✅ Étape 1 : Ouvrir la Console
```bash
# Dans l'app Electron :
Ctrl + Shift + I (Windows/Linux)
Cmd + Option + I (Mac)
```

### ✅ Étape 2 : Lancer l'Application
```bash
npm start
```

### ✅ Étape 3 : Ouvrir un Portfolio
- [ ] Voir la liste des portfolios
- [ ] **CLIQUER sur une carte portfolio** (très important !)
- [ ] Vérifier que la vue détail s'affiche

### ✅ Étape 4 : Aller dans l'Onglet Projets
- [ ] Voir les onglets "📎 Assets" et "📁 Projets"
- [ ] **CLIQUER sur l'onglet "📁 Projets"**
- [ ] Vérifier que le sous-titre apparaît : "Regroupez vos fichiers en réalisations professionnelles..."

### ✅ Étape 5 : Cliquer sur "Créer un projet"
- [ ] Bouton visible en haut à droite ?
- [ ] Bouton devient moins opaque au hover ?
- [ ] Cursor devient 'pointer' ?
- [ ] **CLIQUER sur le bouton**

### ✅ Étape 6 : Observer la Console

Tu DOIS voir ces logs :
```
[PortfolioModule] 🔵 BOUTON CRÉER UN PROJET CLIQUÉ
[PortfolioModule] selectedPortfolioId: portfolio_xxxxx
[PortfolioModule] showProjectModal avant: false
[PortfolioModule] ✅ setShowProjectModal(true) appelé
[PortfolioModule] 🔍 Rendu modal - showProjectModal: true selectedPortfolioId: portfolio_xxxxx
[ProjectCreateModal] 🔵 RENDU - isOpen: true portfolioId: portfolio_xxxxx
```

### ✅ Étape 7 : Vérifier le Modal
- [ ] Modal apparaît avec overlay gris ?
- [ ] Titre "Créer un nouveau projet" visible ?
- [ ] Champ "Titre" visible et éditable ?
- [ ] Bouton "Sauvegarder" visible ?

---

## 🚨 Problèmes Courants

### Problème 1 : "Veuillez d'abord ouvrir un portfolio"
**Cause** : Tu n'as pas cliqué sur une carte portfolio
**Solution** : Retour à l'Étape 3

### Problème 2 : Bouton grisé ou invisible
**Cause** : Tu n'es pas dans l'onglet "Projets"
**Solution** : Retour à l'Étape 4

### Problème 3 : Aucun log dans la console
**Cause** : Console DevTools pas ouverte OU onClick pas déclenché
**Solution** :
1. Vérifie que la console est ouverte
2. Vérifie que tu cliques bien sur le BOUTON et pas à côté

### Problème 4 : Logs OK mais pas de modal
**Cause** : Problème CSS (z-index, position)
**Solution** : Envoie-moi les logs, je vais investiguer

---

## 📤 Envoi des Résultats

**Si ça ne fonctionne toujours pas**, envoie-moi :

1. **Screenshot de la console** avec TOUS les logs visibles
2. **Screenshot de l'interface** au moment où tu cliques
3. **Copie-colle** des logs de la console
4. **Description** de ce qui se passe exactement :
   - Le bouton change au hover ?
   - Un toast apparaît ?
   - Le modal apparaît partiellement ?
   - Rien du tout ?

---

## ✅ Résultat Attendu

Si tout fonctionne correctement :

1. Logs complets dans console ✅
2. Modal apparaît immédiatement ✅
3. Champs éditables ✅
4. Sauvegarder → Projet créé ✅
5. Modal se ferme ✅
6. Projet apparaît dans la liste ✅

---

## 🛠️ Workaround d'Urgence

Si vraiment rien ne fonctionne, essaie ce workaround temporaire :

1. Ouvre `src/components/portfolio/PortfolioModule.tsx`
2. Cherche ligne ~895 : `{showProjectModal && selectedPortfolioId && (`
3. Remplace par : `{showProjectModal && (`
4. Sauvegarde
5. Redémarre l'app

⚠️ **ATTENTION** : Ce workaround peut causer des bugs si pas de portfolio sélectionné.

---

**Durée du test** : 2-3 minutes maximum

**Si ça marche** : Le bug n'était pas reproductible (faux positif)

**Si ça ne marche pas** : Envoie-moi les logs et je fix immédiatement
