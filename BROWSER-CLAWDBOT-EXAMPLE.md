# 🌐 Automation avec l'outil Browser Clawdbot

## ✅ Ce qui vient de fonctionner (Playwright headless)

```bash
node test-automation-example.js
```

**Résultat:**
- ✅ Page chargée sur localhost:5173
- ✅ Structure capturée (H1, boutons, etc.)
- ✅ Thème CALM-UI vérifié (background: rgb(248, 250, 252))
- ✅ Screenshot créé (44KB)
- ✅ Aucune erreur console

---

## 🤖 Utilisation directe depuis Telegram (outil browser)

**Note:** L'outil `browser` de Clawdbot nécessite un environnement GUI (pas headless). Sur VPS, utilise Playwright comme montré ci-dessus.

### Si tu étais sur un Desktop (macOS/Windows/Linux GUI)

**Conversation Telegram:**

> Toi: "Ouvre SOUVERAIN en local et capture la page"

```javascript
// Moi (Claude):
browser.open("http://localhost:5173")
```

**Résultat:** Le browser s'ouvre automatiquement.

> Toi: "Montre-moi la structure"

```javascript
browser.snapshot({ refs: "aria" })
```

**Sortie:**
```
heading "Bienvenue sur SOUVERAIN" level=1 [e1]
heading "Votre carrière. Vos règles." level=2 [e2]
button "Aller au slide 1" [e3]
button "Aller au slide 2" [e4]
```

> Toi: "Clique sur le slide 2"

```javascript
browser.act({ 
  kind: "click", 
  targetId: "...", // ID du tab
  ref: "e4" 
})
```

> Toi: "Screenshot"

```javascript
browser.screenshot()
```

**Résultat:** Image PNG envoyée directement dans le chat Telegram.

---

## 🎯 Workflows interactifs possibles

### 1. Debug visuel en direct
```
Toi: "Ouvre SOUVERAIN et montre moi le module Portfolio"
→ Je navigue, screenshot, montre l'état actuel
```

### 2. Test d'un formulaire
```
Toi: "Teste le formulaire de création de portfolio"
→ Je remplis, submit, vérifie le résultat
```

### 3. Vérification responsive
```
Toi: "Montre comment ça rend sur mobile"
→ Je resize le viewport, screenshot
```

### 4. Audit thème dark
```
Toi: "Active le dark mode et vérifie que toutes les couleurs sont correctes"
→ Je toggle, snapshot, compare avec theme tokens
```

---

## 📊 Comparaison des approches

| Aspect | Playwright Script | Browser Clawdbot |
|--------|------------------|------------------|
| **Environnement** | Headless (VPS OK) | GUI requis |
| **Usage** | Script autonome | Interactif via chat |
| **Output** | Console + fichiers | Retour dans Telegram |
| **CI/CD** | ✅ Parfait | ❌ Non adapté |
| **Debug** | Logs terminal | ✅ Visuel temps réel |
| **Setup** | npm install | Déjà intégré |

---

## 🚀 Recommandation pour SOUVERAIN

### Sur VPS (production/tests auto)
→ **Playwright headless** (`test-automation-example.js`)

### Sur Desktop local (dev/debug)
→ **Browser Clawdbot** (commandes depuis Telegram)

### CI/CD GitHub Actions
→ **Playwright headless** + skill `souverain` pour audits

---

## 📝 Prochaines étapes

1. **Étendre les tests:** Ajoute d'autres workflows (vault, CV, job-matching)
2. **Intégration CI:** Configure GitHub Actions pour tests auto
3. **Visual regression:** Compare screenshots entre versions
4. **Performance:** Mesure le temps de chargement initial

---

**Fichiers associés:**
- `test-automation-example.js` → Script d'automation
- `screenshot-test.png` → Capture de la page
- `AUTOMATION-GUIDE.md` → Guide complet
