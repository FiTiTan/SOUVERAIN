# 🐛 Issue: Wizard Portfolio Inaccessible

**Découvert par:** Tests Playwright automatisés  
**Date:** 2026-02-01  
**Sévérité:** Haute (bloquant)

---

## 📋 Résumé

**Le wizard de création de portfolio est inaccessible** car l'onboarding carousel bloque toute navigation.

---

## 🔍 Reproduction

### Étapes

1. Ouvrir http://localhost:5173
2. Carousel onboarding s'affiche (9 slides)
3. Cliquer "Passer" ou cliquer sur "Portfolio" dans la sidebar
4. **Résultat:** Page ne change pas, onboarding reste affiché
5. **Attendu:** Navigation vers module Portfolio

### Preuves

**Screenshots:**
- `test-portfolio-page.png` - Montre onboarding toujours visible après clic Portfolio
- `test-no-new-button.png` - Confirme que page Portfolio n'est pas chargée

**Vidéo:**
- `video.webm` - Replay complet du comportement

**Tests automatisés:**
- `tests/portfolio-wizard-final.spec.js` - Reproduit le bug à chaque run

---

## 🐛 Problème Détecté

### Boutons Disponibles (après clic "Portfolio")

```
✅ Passer
✅ Commencer
✅ CV Coach
✅ Portfolio
✅ Job Match
✅ LinkedIn
✅ Coffre-Fort
✅ Boutique
```

**Observation:** Boutons "Passer" et "Commencer" encore visibles = **onboarding toujours actif**

### Boutons Manquants

```
❌ Nouveau Portfolio
❌ Créer un Portfolio
❌ Ajouter
❌ + (ou tout autre bouton spécifique au module Portfolio)
```

**Conclusion:** La page Portfolio **ne charge jamais** tant que l'onboarding est affiché.

---

## 🔧 Solutions Possibles

### Option 1: Bouton "Fermer" Explicite

Ajouter un bouton "✕ Fermer" clairement visible sur l'onboarding.

**Avant:**
```
[Slide X/9]  [Passer]  [Précédent] [Suivant]
```

**Après:**
```
[✕]  [Slide X/9]  [Passer]  [Précédent] [Suivant]
```

### Option 2: Cliquer Sidebar → Ferme Onboarding

Quand user clique un module dans la sidebar:
1. Fermer automatiquement l'onboarding
2. Naviguer vers le module
3. Sauvegarder "onboarding_completed" dans localStorage

### Option 3: Bouton "Commencer" Plus Visible

Rendre le bouton "Commencer" plus évident:
- Plus gros
- Couleur accent
- Animation subtle
- Position fixe (toujours visible)

### Option 4: Skip Automatique

Après X secondes (ex: 30s) ou X slides (ex: 3), proposer:
```
[Vous pouvez passer l'introduction]
         [Continuer]  [Passer →]
```

---

## ✅ Validation du Fix

Une fois corrigé, ce test devrait passer:

```javascript
test('Navigation Portfolio accessible après onboarding', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Fermer onboarding (méthode à définir)
  await closeOnboarding(page);
  
  // Naviguer vers Portfolio
  await page.click('button:has-text("Portfolio")');
  await page.waitForTimeout(1000);
  
  // Vérifier bouton "Nouveau" visible
  const newBtn = page.locator('button:has-text("Nouveau")');
  await expect(newBtn).toBeVisible({ timeout: 5000 });
});
```

**Expected:** ✅ Test passe  
**Current:** ❌ Test échoue (bouton jamais visible)

---

## 📊 Impact

**Utilisateurs affectés:** Tous les nouveaux utilisateurs

**Workflows bloqués:**
- ❌ Création de portfolio
- ❌ Import CV
- ❌ Job matching
- ❌ Accès vault (potentiellement)

**Workaround actuel:** 
1. Parcourir TOUS les 9 slides
2. Cliquer "Commencer" sur le dernier
3. PUIS naviguer

**Durée:** ~30-60 secondes (frustrant)

---

## 🎯 Priorité

**Haute** - Bloque l'usage complet de l'application pour nouveaux utilisateurs.

---

## 📝 Notes Techniques

### Tests Playwright Créés

1. `portfolio-wizard.spec.js` - 3 scénarios de test
2. `portfolio-wizard-fixed.spec.js` - Tentative de fix
3. `portfolio-wizard-final.spec.js` - Diagnostic complet
4. `portfolio-wizard-simple.spec.js` - Test minimal

**Tous échouent** au même endroit: impossible d'accéder au bouton "Nouveau Portfolio"

### Logs Tests

```
🎯 PHASE 1: Fermeture onboarding
  ℹ️  Pas d'onboarding (ou déjà fermé) [FAUX - onboarding présent]
  ✅ Navigation maintenant disponible

🎯 PHASE 2: Navigation vers Portfolio
  ✅ Clic sidebar Portfolio (force)
  📸 Screenshot: test-portfolio-page.png

🎯 PHASE 3: Ouverture wizard
  🔍 Boutons disponibles: Passer, Commencer, CV Coach, Portfolio...
  ⚠️  Aucun bouton "Nouveau" trouvé
  
❌ Wizard non accessible
```

### Code Snippet Problématique

Probablement un `z-index` trop élevé sur l'overlay onboarding:

```css
/* Suspect */
.onboarding-overlay {
  z-index: 9999; /* Bloque TOUT */
  position: fixed;
  pointer-events: all; /* Capture tous les clics */
}
```

**Fix suggéré:**

```css
.onboarding-overlay {
  z-index: 100; /* Plus bas */
  position: fixed;
  pointer-events: auto; /* Permet clics en dehors du carousel */
}

.onboarding-overlay-backdrop {
  pointer-events: none; /* Ne bloque pas les clics background */
}
```

---

**Créé automatiquement par:** Playwright E2E Tests  
**Fichiers associés:** `/home/ubuntu/clawd/SOUVERAIN/tests/`
