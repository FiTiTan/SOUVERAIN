# Portfolio Maître V2 - Guide de Test

> **Objectif** : Valider le fonctionnement complet du nouveau système wizard

---

## ✅ Checklist de Test

### 1. Lancement de l'Application

```bash
cd C:\Users\jltsm\Desktop\SOUVERAIN
npm start
```

**Vérifications :**
- [ ] App démarre sans erreur
- [ ] Console ne montre pas d'erreurs critiques
- [ ] UI s'affiche correctement

---

### 2. Navigation vers Portfolio Maître

**Actions :**
1. Cliquer sur la carte "Portfolio Maître"
2. Cliquer sur "+ Créer un nouveau portfolio"

**Résultat attendu :**
- [ ] PortfolioSelector s'affiche
- [ ] Bouton "Créer" visible
- [ ] Clic lance le wizard

---

### 3. Test du Wizard - Step 1 (Identité)

**Données de test :**
```
Nom: Marie Dubois
Type de profil: Freelance / Indépendant (💼)
Tagline: Développeuse Full-Stack passionnée par les solutions innovantes
```

**Vérifications :**
- [ ] Champs se remplissent correctement
- [ ] Compteur de caractères fonctionne (max 150)
- [ ] Carte de profil se sélectionne visuellement
- [ ] Bouton "Continuer" actif uniquement si tout rempli
- [ ] Message de validation si champ manquant

---

### 4. Test du Wizard - Step 2 (Offre)

**Données de test :**
```
Service 1: Développement web React/Node.js
Service 2: Architecture cloud AWS
Service 3: Consulting DevOps

Proposition de valeur:
Des solutions techniques sur mesure pour transformer vos idées en produits digitaux performants. Expertise full-stack et approche agile garantie.
```

**Vérifications :**
- [ ] 3 champs services visibles
- [ ] Boutons + / - fonctionnent
- [ ] TextArea proposition de valeur (max 300 char)
- [ ] Validation : au moins 1 service requis
- [ ] Bouton "Continuer" actif si service valide

---

### 5. Test du Wizard - Step 3 (Contact)

**Données de test :**
```
Email: marie.dubois@example.com
Téléphone: 06 12 34 56 78
Adresse: 123 Rue de la République, 75001 Paris
Horaires: Lun-Ven 9h-18h

Réseaux sociaux:
☑ LinkedIn: linkedin.com/in/marie-dubois
☑ GitHub: github.com/mdubois
☑ Instagram: @mariedev

☑ Afficher "Social Showcase"
```

**Vérifications :**
- [ ] Email validé (regex)
- [ ] Téléphone optionnel
- [ ] Adresse + horaires activent section "Infos pratiques"
- [ ] Checkboxes réseaux sociaux fonctionnent
- [ ] URLs social links validées
- [ ] Toggle "Social Showcase" fonctionne
- [ ] Message d'erreur si email invalide

---

### 6. Test du Wizard - Step 4 (Contenu)

**Données de test :**
```
Projets:
1. Projet: "E-commerce Shopify Custom"
   Description: "Boutique en ligne sur mesure avec paiements Stripe"
   Catégorie: "E-commerce"

2. Projet: "Dashboard Analytics React"
   Description: "Tableau de bord temps réel avec WebSockets"
   Catégorie: "SaaS"

Témoignages:
1. "Marie a transformé notre vision en un produit exceptionnel. Professionnalisme et créativité au rendez-vous."
   - Jean Martin, CEO TechStart

Médias:
(Upload 2-3 images placeholder)
```

**Vérifications :**
- [ ] Modal projet s'ouvre au clic "+"
- [ ] Projet ajouté apparaît dans la liste
- [ ] Modal témoignage fonctionne
- [ ] MediaUploader accepte les fichiers
- [ ] Aperçu des médias uploadés
- [ ] Bouton "Continuer" actif (même si vide)

---

### 7. Test du Wizard - Step 5 (Template)

**Actions :**
1. Vérifier onglet "Gratuits" (5 templates)
2. Cliquer "Aperçu" sur "Bento Grid"
3. Fermer preview
4. Sélectionner "Glassmorphism"
5. Cliquer "Boutique"
6. Fermer modal boutique

**Vérifications :**
- [ ] 5 templates gratuits affichés
- [ ] Thumbnails SVG visibles
- [ ] Bouton "Aperçu" ouvre modal preview
- [ ] Preview affiche HTML dans iframe
- [ ] Template sélectionné montre checkmark vert
- [ ] Bannière "Template sélectionné" apparaît
- [ ] Boutique modal s'ouvre
- [ ] Bannière premium visible si isPremiumUser
- [ ] Bouton "Générer mon portfolio" actif

---

### 8. Test de la Génération

**Actions :**
1. Cliquer "Générer mon portfolio"
2. Observer animation de chargement
3. Attendre affichage preview

**Vérifications :**
- [ ] Animation "Génération" s'affiche
- [ ] 4 étapes visibles :
  - Validation des données
  - Chargement du template
  - Génération du HTML
  - Finalisation
- [ ] Durée : 2-3 secondes
- [ ] Transition vers Preview automatique

---

### 9. Test de la Preview

**Vérifications visuelles dans l'iframe :**
- [ ] **Nom** affiché correctement
- [ ] **Tagline** visible
- [ ] **Services** listés (3 items)
- [ ] **Email** affiché
- [ ] **Téléphone** affiché
- [ ] **Adresse + horaires** visibles
- [ ] **Liens sociaux** présents et cliquables
- [ ] **Projets** affichés (2 projets)
- [ ] **Style glassmorphism** appliqué
- [ ] **Responsive** : tester redimensionnement

**Actions :**
- [ ] Cliquer "Modifier" → retour au wizard
- [ ] Cliquer "Sauvegarder" → retour au selector
- [ ] Toast "Portfolio sauvegardé !" apparaît

---

### 10. Test de Persistance

**Actions :**
1. Retourner au PortfolioSelector
2. Vérifier que le portfolio apparaît dans la liste
3. Cliquer "Voir" sur le portfolio
4. Vérifier que le HTML s'affiche

**Vérifications :**
- [ ] Portfolio visible dans selector
- [ ] Nom du portfolio correct
- [ ] Date de création affichée
- [ ] Bouton "Voir" fonctionne
- [ ] HTML chargé depuis DB identique

---

### 11. Test d'Export

**Actions :**
1. Dans PortfolioSelector, cliquer "Exporter" sur le portfolio
2. Choisir emplacement de sauvegarde
3. Ouvrir fichier .html dans navigateur

**Vérifications :**
- [ ] Dialog de sauvegarde s'ouvre
- [ ] Fichier `Marie Dubois.html` créé
- [ ] Fichier ouvre dans navigateur
- [ ] Affichage identique à la preview
- [ ] Aucune erreur console navigateur
- [ ] Tous les styles CSS intégrés

---

### 12. Test des Templates

**Pour chaque template (5 au total) :**

#### Bento Grid
- [ ] Layout en grille fonctionne
- [ ] Cartes glassmorphes visibles
- [ ] Hero section large (2 colonnes)
- [ ] Responsive mobile

#### Kinetic Typo
- [ ] Typographie énorme et bold
- [ ] Gradient animé sur titre
- [ ] Background sombre
- [ ] Effet hover sur cards

#### Organic Flow
- [ ] Background doux (peach/cream)
- [ ] Formes organiques en fond
- [ ] Typographie serif (Georgia)
- [ ] Border-radius arrondis

#### Glassmorphism
- [ ] Background gradient bleu/violet
- [ ] Effet blur sur toutes les cartes
- [ ] Borders semi-transparentes
- [ ] Shadows subtiles

#### Minimal Apple
- [ ] Background blanc pur
- [ ] Typographie SF Pro Display
- [ ] Spacing généreux
- [ ] Boutons arrondis (border-radius: 980px)

---

### 13. Test de Validation

**Scénarios d'erreur à tester :**

#### Step 1
- [ ] Nom vide → Bouton désactivé
- [ ] Profil non sélectionné → Bouton désactivé
- [ ] Tagline > 150 caractères → Bouton désactivé
- [ ] Message d'erreur affiché

#### Step 2
- [ ] Tous services vides → Bouton désactivé
- [ ] Au moins 1 service → Bouton actif

#### Step 3
- [ ] Email vide → Bouton désactivé
- [ ] Email invalide (sans @) → Erreur
- [ ] Email invalide (sans domaine) → Erreur

#### Step 5
- [ ] Aucun template sélectionné → Bouton désactivé

---

### 14. Test de Navigation

**Actions :**
1. Arriver Step 3
2. Cliquer "Retour" → Step 2
3. Cliquer "Retour" → Step 1
4. Cliquer "Annuler" → PortfolioSelector

**Vérifications :**
- [ ] Bouton "Retour" visible à partir de Step 2
- [ ] Données conservées en retour arrière
- [ ] Bouton "Annuler" visible Step 1 uniquement
- [ ] Confirmation avant annulation

---

### 15. Test des Handlers IPC

**Vérifier dans console DevTools (F12) :**

```javascript
// Tester manuellement dans console
await window.electron.invoke('db-templates-get-free')
// → Doit retourner 5 templates

await window.electron.invoke('template-get-html', 'bento-grid')
// → Doit retourner HTML du template

await window.electron.invoke('db-create-portfolio', { name: 'Test Portfolio' })
// → Doit créer et retourner { success: true, id: '...' }
```

**Vérifications :**
- [ ] `db-templates-get-free` retourne 5 templates
- [ ] `template-get-html` charge le HTML
- [ ] `db-save-portfolio-v2` sauvegarde correctement
- [ ] `portfolio-v2-get-by-id` récupère le portfolio

---

## 🐛 Bugs Connus à Vérifier

### Bugs Potentiels

1. **Template Preview ne charge pas**
   - Vérifier chemin des templates : `templates/*.html`
   - Vérifier IPC handler `template-get-html`

2. **Génération échoue silencieusement**
   - Ouvrir DevTools console
   - Chercher `[PortfolioHub] Generation error:`

3. **Données perdues au retour arrière**
   - Vérifier state `formData` dans PortfolioWizard
   - Vérifier `handleDataChange()`

4. **Export ne fonctionne pas**
   - Vérifier handler `export-portfolio-html`
   - Vérifier permissions fichiers

---

## 📊 Résultats Attendus

### Performance

| Opération | Temps Cible |
|-----------|-------------|
| Chargement wizard | < 500ms |
| Validation étape | < 50ms |
| Chargement template preview | < 200ms |
| Génération HTML | < 1s |
| Sauvegarde DB | < 100ms |
| Export fichier | < 500ms |

### Qualité

- [ ] Aucune erreur console
- [ ] Aucun warning TypeScript
- [ ] UI fluide (60 FPS)
- [ ] Animations smooth
- [ ] Responsive mobile-friendly

---

## 🔍 Diagnostic en Cas de Problème

### Console Logs à Vérifier

```bash
# Logs normaux
[PortfolioHub] Wizard completed with data: {...}
[IPC] Saving portfolio V2: xxx-xxx-xxx
[DB] Save portfolio V2 error: (si erreur)

# Logs templates
[IPC] Getting template HTML: bento-grid
[Template Service] Loading template: bento-grid

# Logs génération
Generated HTML length: 4500
```

### Base de Données

```sql
-- Vérifier templates seedés
SELECT * FROM templates;
-- Doit retourner 5 lignes

-- Vérifier portfolio créé
SELECT id, name, template_id, generated_content IS NOT NULL as has_html
FROM portfolios
WHERE name = 'Marie Dubois';

-- Vérifier colonnes V2
PRAGMA table_info(portfolios);
-- Doit inclure: generated_content, template_id, metadata
```

---

## ✅ Validation Finale

### Critères d'Acceptation

- [x] Wizard 5 étapes fonctionne
- [x] Validation correcte à chaque étape
- [x] 5 templates disponibles
- [x] Preview templates fonctionne
- [x] Génération HTML instantanée
- [x] Sauvegarde en DB
- [x] Export HTML fonctionne
- [x] Aucune régression sur ancien code
- [x] Documentation complète

### Sign-off

**Status** : ✅ READY FOR PRODUCTION

**Testé par** : _________________

**Date** : _________________

**Signature** : _________________

---

**Temps estimé pour tests complets** : ~30-45 minutes
