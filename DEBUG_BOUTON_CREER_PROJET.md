# DEBUG - Bouton "Créer un projet" Non Fonctionnel

Date : 21 janvier 2025 - 01h45
Status : 🔍 LOGS DE DEBUG AJOUTÉS

---

## Problème Rapporté

Le bouton "Créer un projet" ne fonctionne pas lorsqu'on clique dessus.

---

## Logs de Debug Ajoutés

J'ai ajouté des logs console détaillés pour identifier le problème. Voici comment les utiliser :

### 1. Ouvrir la Console Développeur

**Dans l'application Electron** :
- Windows/Linux : `Ctrl + Shift + I`
- Mac : `Cmd + Option + I`

Ou dans le code, ajouter dans main.cjs :
```javascript
win.webContents.openDevTools();
```

### 2. Reproduire le Problème

1. Lancer l'application : `npm start`
2. Ouvrir un portfolio (cliquer sur une carte portfolio)
3. Aller dans l'onglet "📁 Projets"
4. Cliquer sur le bouton "Créer un projet"
5. Observer les logs dans la console

### 3. Logs à Surveiller

Quand vous cliquez sur "Créer un projet", vous devriez voir :

```
[PortfolioModule] 🔵 BOUTON CRÉER UN PROJET CLIQUÉ
[PortfolioModule] selectedPortfolioId: portfolio_1234567890
[PortfolioModule] showProjectModal avant: false
[PortfolioModule] ✅ setShowProjectModal(true) appelé
```

Ensuite, le modal devrait se rendre :

```
[PortfolioModule] 🔍 Rendu modal - showProjectModal: true selectedPortfolioId: portfolio_1234567890
[ProjectCreateModal] 🔵 RENDU - isOpen: true portfolioId: portfolio_1234567890 editProject: undefined
```

### 4. Scénarios d'Erreur

#### SCÉNARIO A : Pas de logs du tout
**Symptôme** : Aucun log n'apparaît quand vous cliquez
**Cause** : Le onClick n'est pas déclenché
**Solutions** :
- Le bouton est peut-être masqué par un autre élément (z-index)
- Le cursor n'est peut-être pas 'pointer' (vérifier les styles)
- Un event listener parent intercepte le clic (stopPropagation)

#### SCÉNARIO B : Logs du clic mais pas de portfolio
**Symptôme** :
```
[PortfolioModule] 🔵 BOUTON CRÉER UN PROJET CLIQUÉ
[PortfolioModule] selectedPortfolioId: null
[PortfolioModule] ❌ ERREUR: Pas de portfolio sélectionné!
```
**Cause** : Vous n'avez pas ouvert de portfolio
**Solution** : Cliquer sur une carte portfolio AVANT d'essayer de créer un projet

#### SCÉNARIO C : Logs du clic mais modal ne s'affiche pas
**Symptôme** :
```
[PortfolioModule] ✅ setShowProjectModal(true) appelé
[PortfolioModule] 🔍 Rendu modal - showProjectModal: true selectedPortfolioId: portfolio_123
[PortfolioModule] ❌ PROBLÈME: Modal demandé mais pas de portfolio sélectionné!
```
**Cause** : Race condition ou problème de state React
**Solution** : Vérifier que le portfolio est bien chargé

#### SCÉNARIO D : Modal se rend mais pas visible
**Symptôme** :
```
[ProjectCreateModal] 🔵 RENDU - isOpen: true portfolioId: portfolio_123
```
Mais le modal n'apparaît pas à l'écran.

**Cause** : Problème CSS (z-index, opacity, display)
**Solution** :
- Vérifier que l'overlay a `z-index: 1000`
- Vérifier qu'aucun autre élément ne le cache
- Vérifier `position: fixed` de l'overlay

---

## Modifications Apportées

### PortfolioModule.tsx

1. **Handler handleCreateProject** (ligne ~230)
```typescript
const handleCreateProject = () => {
  console.log('[PortfolioModule] 🔵 BOUTON CRÉER UN PROJET CLIQUÉ');
  console.log('[PortfolioModule] selectedPortfolioId:', selectedPortfolioId);
  console.log('[PortfolioModule] showProjectModal avant:', showProjectModal);

  if (!selectedPortfolioId) {
    console.error('[PortfolioModule] ❌ ERREUR: Pas de portfolio sélectionné!');
    toast.error('Erreur', 'Veuillez d\'abord ouvrir un portfolio');
    return;
  }

  setEditingProject(null);
  setShowProjectModal(true);
  console.log('[PortfolioModule] ✅ setShowProjectModal(true) appelé');
};
```

2. **Rendu du modal** (ligne ~895)
```typescript
{(() => {
  console.log('[PortfolioModule] 🔍 Rendu modal - showProjectModal:', showProjectModal, 'selectedPortfolioId:', selectedPortfolioId);
  if (showProjectModal && !selectedPortfolioId) {
    console.error('[PortfolioModule] ❌ PROBLÈME: Modal demandé mais pas de portfolio sélectionné!');
  }
  return null;
})()}
{showProjectModal && selectedPortfolioId && (
  <ProjectCreateModal
    isOpen={showProjectModal}
    onClose={() => {
      console.log('[PortfolioModule] 🔵 Fermeture modal projet');
      setShowProjectModal(false);
      setEditingProject(null);
    }}
    onSave={handleSaveProject}
    editProject={editingProject}
    portfolioId={selectedPortfolioId}
  />
)}
```

### ProjectCreateModal.tsx

1. **Log au mount** (ligne ~33)
```typescript
console.log('[ProjectCreateModal] 🔵 RENDU - isOpen:', isOpen, 'portfolioId:', portfolioId, 'editProject:', editProject?.id);
```

---

## Comment Utiliser Ce Debug

### Étape 1 : Activer la Console

Dans `main.cjs`, après la création de la fenêtre :

```javascript
function createWindow() {
  const win = new BrowserWindow({
    // ... config
  });

  // AJOUTER CETTE LIGNE POUR DEBUG
  win.webContents.openDevTools();

  // ...
}
```

### Étape 2 : Reproduire et Observer

1. Lancer : `npm start`
2. Console devrait s'ouvrir automatiquement
3. Aller dans l'onglet "Console"
4. Filtrer les logs avec : `[PortfolioModule]` ou `[ProjectCreateModal]`
5. Cliquer sur "Créer un projet"
6. **Copier TOUS les logs** et les envoyer

### Étape 3 : Analyse des Logs

Envoie-moi exactement ce que tu vois dans la console, et je pourrai identifier le problème précis.

---

## Tests de Validation

Une fois le problème identifié et corrigé, tester :

| Test | Résultat Attendu |
|------|------------------|
| Ouvrir portfolio | Vue détail s'affiche |
| Aller onglet Projets | Bouton "Créer un projet" visible |
| Cliquer bouton | Modal apparaît immédiatement |
| Remplir titre | Titre accepté |
| Cliquer Sauvegarder | Projet créé et modal se ferme |
| Vérifier liste | Nouveau projet affiché |

---

## Informations Système

Pour m'aider à diagnostiquer, envoie-moi :

1. **Logs console** complets
2. **Navigateur Electron** : Version affichée dans DevTools
3. **OS** : Windows / Mac / Linux + version
4. **Comportement** exact :
   - Le bouton change de couleur au hover ?
   - Le cursor devient 'pointer' ?
   - Un toast d'erreur apparaît ?
   - Rien ne se passe du tout ?

---

## Workaround Temporaire

Si le problème persiste, voici un workaround temporaire :

1. Ouvrir `src/components/portfolio/ProjectCreateModal.tsx`
2. Remplacer la condition du modal par :

```typescript
{/* WORKAROUND: Forcer l'affichage du modal */}
{showProjectModal && (
  <ProjectCreateModal
    isOpen={showProjectModal}
    onClose={() => {
      setShowProjectModal(false);
      setEditingProject(null);
    }}
    onSave={handleSaveProject}
    editProject={editingProject}
    portfolioId={selectedPortfolioId || 'temp_portfolio_id'}
  />
)}
```

⚠️ **ATTENTION** : Ce workaround peut causer des erreurs si aucun portfolio n'est sélectionné.

---

## Contact Debug

Une fois que tu as les logs console, envoie-moi :
1. Screenshot de la console avec les logs
2. Screenshot de l'interface au moment du clic
3. Description exacte du comportement observé

Je pourrai alors te donner un fix précis.

---

**Prochaine Étape** : Ouvre la console DevTools et clique sur le bouton pour voir les logs.
