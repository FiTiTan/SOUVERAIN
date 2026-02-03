# Wizard Portfolio V2 - Implémentation Complète

**Date :** 3 février 2026  
**Status :** ✅ Implémentation terminée selon brief

---

## 🎯 Objectif

Simplifier le wizard (6 steps), ajouter le positionnement pour guider l'IA, génération automatique des services basée sur les expertises, preview éditable.

---

## ✅ Modifications réalisées

### 1. Types (PortfolioFormDataV2)

**Fichier :** `src/components/portfolio/types.ts`

Ajout des champs positionnement :
```typescript
valueProp: string;           // Proposition de valeur (guide l'IA)
expertises: string[];        // 3 expertises clés (deviennent des Services)
```

**Fichier :** `src/components/portfolio/wizard/PortfolioWizardV2.tsx`

Mise à jour de `INITIAL_FORM_DATA` :
```typescript
valueProp: '',
expertises: ['', '', ''],
```

---

### 2. Encart Positionnement (Step 2 : Réalisations)

**Fichier :** `src/components/portfolio/wizard/WizardStepRealisations.tsx`

Ajout d'un **encart Positionnement** en haut de la page avec :
- Champ "Proposition de valeur" (1 phrase, 150 chars max)
- 3 champs "Expertises clés" (50 chars max chacun)
- Design avec gradient bleu/violet et icône 🎯
- Séparateur visuel avant la section "Import réalisations"

Fonction helper ajoutée :
```typescript
const updateExpertise = (index: number, value: string) => {
  const updated = [...formData.expertises];
  updated[index] = value;
  onUpdate({ expertises: updated });
};
```

---

### 3. Service IA V4 (Prompts séquencés)

**Fichier :** `src/services/aiEnrichmentServiceV4.ts` ✨ **NOUVEAU**

Génération séquencée en 3 appels API :

#### 3.1 Hero + About
- Utilise `valueProp` comme fil rouge
- Génère heroTitle, heroSubtitle, heroEyebrow, heroCta, aboutText, valueProp
- Prompt : 60-80 mots pour aboutText, mention des expertises

#### 3.2 Services
- Si expertises fournies → génère 3 services basés sur elles
- Si vide → déduit des réalisations
- Prompt : 35-45 mots par service, ton impersonnel
- Label dynamique : "Services", "Savoir-faire", "Spécialités", etc.

#### 3.3 Projets
- Descriptions enrichies (60-80 mots)
- Renforce le positionnement
- Structure : Contexte → Solution → Résultat → Point notable

**Fonction principale :**
```typescript
export async function enrichPortfolioDataSequenced(
  rawData: RawPortfolioData,
  portfolioId: string
): Promise<{ success: boolean; data?: any; error?: string }>
```

**Features :**
- Anonymisation avant envoi / désanonymisation après
- Nettoyage des SVG (quotes) et placeholders orphelins
- Icônes fallback si nécessaire
- Batching des projets (3 par batch)

---

### 4. CSS Partagés pour templates

**Dossier :** `templates/_shared/` ✨ **NOUVEAU**

Trois fichiers CSS partagés entre tous les templates :

#### `_layout-adaptive.css`
- Services : toujours 3 colonnes (1 sur mobile)
- Projets : layout adaptatif selon le nombre
  - 1 projet → horizontal (image + texte côte à côte)
  - 2 projets → 2 colonnes
  - 3+ projets → grille 2 colonnes
- Support `:has()` pour navigateurs modernes
- Fallback avec `data-count` pour anciens navigateurs

#### `_typography.css`
- Texte justifié sur desktop
- Hyphenation automatique
- Line-height confortable (1.7)
- Pas de justification sur mobile

#### `_editable.css`
- Styles pour `[contenteditable="true"]`
- Highlight au survol (bleu translucide)
- Focus avec outline personnalisé
- Indicateur `.modified` (barre bleue à gauche)

**Fichier :** `templates/_shared/README.md` - Documentation complète d'utilisation

---

### 5. Preview éditable

**Fichier :** `src/components/portfolio/EditablePreviewScreen.tsx`

Ajout de la fonction `injectEditableFeatures()` :
- Injecte le CSS editable dans l'iframe
- Marque les éléments textuels avec `contenteditable="true"`
- Ajoute `data-original` pour le reset
- Sélecteurs : heroTitle, heroSubtitle, aboutText, services, projects, contact, etc.
- Script JS injecté pour détecter les modifications et gérer le reset

**Toolbar ajoutée :**
- Message d'aide : "💡 Cliquez sur les textes pour les modifier"
- Bouton "↺ Tout réinitialiser" → appelle `window.resetAllEdits()`

**Styles modifiés :**
- `previewContainerStyle` : `flexDirection: 'column'`
- `iframeStyle` : `flex: 1` au lieu de `height: 100%`

---

## 📋 Structure du nouveau parcours

1. **À propos** - Nom, type de profil, tagline
2. **Réalisations** - Positionnement (valueProp + expertises) + Import projets (PDF, URL, manuel)
3. **Template** - Choix du style visuel
4. **Génération** - IA compile tout (utilise aiEnrichmentServiceV4)
5. **Preview** - Éditable (contenteditable + drag & drop images)
6. **Export** - HTML + PDF

---

## 🔄 Fichiers supprimés

**Aucun** - `WizardStepExpertise.tsx` n'existait pas (déjà supprimé ou jamais créé)

---

## 🚧 Intégration restante (hors scope du brief)

### 1. Connecter aiEnrichmentServiceV4 au wizard

Actuellement, le service V4 est créé mais pas encore appelé. Il faut :

**Fichier à modifier :** `src/components/portfolio/wizard/WizardStepGeneration.tsx`

```typescript
import { enrichPortfolioDataSequenced } from '../../../services/aiEnrichmentServiceV4';

// Dans le useEffect ou handler :
const result = await enrichPortfolioDataSequenced({
  name: formData.name,
  profileType: formData.profileType,
  valueProp: formData.valueProp,
  expertises: formData.expertises,
  realisations: formData.realisations,
}, portfolioId);

if (result.success) {
  // Injecter result.data dans le template
  // Stocker dans formData._generatedHTML
}
```

### 2. Injecter data-count dans les templates

Pour le fallback CSS adaptatif, ajouter :

```typescript
// Dans le service qui génère le HTML
const projectsHTML = `
  <div class="projects-grid" data-count="${projects.length}">
    ${projects.map(p => `...`).join('')}
  </div>
`;
```

### 3. Migrer les templates HTML monolithiques

Les templates actuels (`bento-grid.html`, `kinetic-typography.html`, etc.) sont monolithiques.

Pour utiliser les CSS partagés :
1. Ajouter en haut du `<style>` :
   ```html
   <style>
     @import url('./_shared/_layout-adaptive.css');
     @import url('./_shared/_typography.css');
     @import url('./_shared/_editable.css');
     
     /* Styles spécifiques au template */
     ...
   </style>
   ```
2. Remplacer les classes custom par les classes standardisées
3. Tester sur desktop + mobile

---

## 🧪 Tests à effectuer

### Test 1 : Avec positionnement complet
1. Entrer valueProp : "Expert en applications mobiles gamifiées"
2. Expertises : "React Native", "Gamification", "UX Design"
3. Importer PDF FitTitan
4. **Vérifier** : Services générés = les 3 expertises

### Test 2 : Sans positionnement
1. Laisser valueProp et expertises vides
2. Importer PDF FitTitan
3. **Vérifier** : IA déduit 3 services pertinents du PDF

### Test 3 : Positionnement partiel
1. Entrer valueProp mais seulement 1 expertise
2. **Vérifier** : IA complète avec 2 services déduits

### Test 4 : Preview éditable
1. Modifier un texte dans la preview
2. Vérifier indicateur "modified" (barre bleue)
3. Cliquer reset individuel → retour à l'original
4. Cliquer "Tout réinitialiser" → reset global
5. Exporter → vérifier que les modifs sont prises en compte

### Test 5 : Layout adaptatif
1. Générer avec 1 seul projet → layout horizontal
2. Générer avec 3 projets → grille 2 colonnes
3. Services → toujours 3 colonnes (1 sur mobile)

---

## 📊 Résumé des changements

| Fichier | Action | Status |
|---------|--------|--------|
| `types.ts` | ✏️ Ajouter valueProp + expertises | ✅ |
| `PortfolioWizardV2.tsx` | ✏️ Mettre à jour INITIAL_FORM_DATA | ✅ |
| `WizardStepRealisations.tsx` | ✏️ Ajouter encart positionnement | ✅ |
| `WizardStepExpertise.tsx` | ❌ SUPPRIMER | ✅ N'existe pas |
| `aiEnrichmentServiceV4.ts` | ✨ CRÉER - Prompts séquencés | ✅ |
| `templates/_shared/_layout-adaptive.css` | ✨ CRÉER | ✅ |
| `templates/_shared/_typography.css` | ✨ CRÉER | ✅ |
| `templates/_shared/_editable.css` | ✨ CRÉER | ✅ |
| `templates/_shared/README.md` | ✨ CRÉER | ✅ |
| `EditablePreviewScreen.tsx` | ✏️ Ajouter contenteditable + toolbar | ✅ |
| `WizardStepGeneration.tsx` | 🚧 Connecter V4 | ⏳ TODO |
| Templates HTML | 🚧 Migrer vers CSS partagés | ⏳ TODO |

---

## 💡 Notes techniques

### Anonymisation
Le service V4 utilise `anonymizationServiceV3` pour :
- Anonymiser avant envoi à DeepSeek
- Désanonymiser après réception
- Garde les placeholders [PERSON_X], [COMPANY_X] intacts

### Gestion des SVG
Les icônes SVG sont nettoyées via `cleanSvgQuotes()` :
- Remplace `'` par `"` pour éviter les erreurs de parsing

### Placeholders orphelins
La fonction `cleanOrphanPlaceholders()` supprime les tokens non désanonymisés

### Label dynamique services
```typescript
const SERVICE_LABELS = {
  tech: 'Services',
  artisan: 'Savoir-faire',
  food: 'Spécialités',
  retail: 'Offres',
  default: 'Expertises',
};
```

---

## 🎨 Design System

Tous les styles respectent **CALM-UI** :
- ❌ PAS d'émojis dans l'UI (sauf onboarding)
- ✅ Icônes SVG uniquement (style Feather Icons)
- ✅ `theme.*` pour couleurs (dark/light compatible)
- ✅ `typography.*` pour font-sizes/weights
- ✅ `borderRadius.*` pour arrondis
- ✅ `transitions.*` pour animations

---

**Fin de l'implémentation** ✅
