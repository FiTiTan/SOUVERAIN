# MPF-5 & MPF-6 - Guide d'Intégration

**Guide pratique pour intégrer les composants de Génération et Édition dans l'application SOUVERAIN**

---

## 🎯 Vue d'Ensemble

Ce guide explique comment intégrer les nouveaux composants MPF-5 (GenerationScreen) et MPF-6 (PortfolioEditor) dans le flow principal de l'application.

---

## 1️⃣ Intégration dans PortfolioHub

### Fichier: `src/components/portfolio/PortfolioHub.tsx`

**Ajoutez les imports:**
```typescript
import { GenerationScreen } from './master/GenerationScreen';
import { PortfolioEditor } from './editor/PortfolioEditor';
```

**Ajoutez les états:**
```typescript
const [currentView, setCurrentView] = useState<'list' | 'generate' | 'edit' | 'preview'>('list');
const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
const [generationData, setGenerationData] = useState<any>(null);
const [previewHTML, setPreviewHTML] = useState<string>('');
```

**Ajoutez le switch de vue:**
```typescript
const renderView = () => {
  switch (currentView) {
    case 'list':
      return <PortfolioList onGenerate={handleStartGeneration} onEdit={handleEdit} />;

    case 'generate':
      return (
        <GenerationScreen
          portfolioData={generationData}
          onComplete={(result) => {
            setSelectedPortfolioId(result.portfolioId);
            setCurrentView('edit');
          }}
          onError={(error) => {
            console.error('Generation error:', error);
            alert(`Erreur: ${error}`);
            setCurrentView('list');
          }}
        />
      );

    case 'edit':
      return selectedPortfolioId ? (
        <PortfolioEditor
          portfolioId={selectedPortfolioId}
          onBack={() => setCurrentView('list')}
          onPreview={(html) => {
            setPreviewHTML(html);
            setCurrentView('preview');
          }}
          onPublish={() => handlePublish(selectedPortfolioId)}
        />
      ) : null;

    case 'preview':
      return (
        <PreviewScreen
          html={previewHTML}
          onBack={() => setCurrentView('edit')}
          onPublish={() => handlePublish(selectedPortfolioId!)}
        />
      );

    default:
      return <PortfolioList />;
  }
};
```

**Handlers:**
```typescript
const handleStartGeneration = (data: any) => {
  setGenerationData({
    portfolioId: crypto.randomUUID(),
    intentions: data.intentions,
    style: data.style,
    projects: data.projects,
    practicalData: data.practicalData,
  });
  setCurrentView('generate');
};

const handleEdit = (portfolioId: string) => {
  setSelectedPortfolioId(portfolioId);
  setCurrentView('edit');
};

const handlePublish = async (portfolioId: string) => {
  // @ts-ignore
  const result = await window.electron.invoke('publish-portfolio', { portfolioId });
  if (result.success) {
    alert(`Portfolio publié avec succès!\nURL: ${result.url}`);
  }
};
```

---

## 2️⃣ Ajout du Bouton "Éditer" dans la Liste

### Fichier: `src/components/portfolio/PortfolioList.tsx`

**Ajoutez dans chaque card de portfolio:**
```typescript
<button
  onClick={() => onEdit(portfolio.id)}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: theme.accent.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  }}
>
  <PencilIcon />
  Éditer
</button>
```

---

## 3️⃣ Flow Complet de Génération

### Étape 1: Choix du Chat (MPF-1) ✅
**Fichier:** `src/components/portfolio/ChatSelectionScreen.tsx`
- Utilisateur choisit le chat source
- Navigation vers MPF-2

### Étape 2: Import Données (MPF-2) ✅
**Fichier:** `src/components/portfolio/ImportDataScreen.tsx`
- Import LinkedIn, Notion, CV
- Données stockées dans `portfolioData`
- Navigation vers MPF-3

### Étape 3: Choix du Style (MPF-3) ✅
**Fichier:** `src/components/portfolio/StyleSuggestionScreen.tsx`
- 6 styles proposés
- Style sélectionné stocké
- Navigation vers MPF-4

### Étape 4: Analyse IA (MPF-4) ✅
**Fichier:** `src/components/portfolio/AnalysisScreen.tsx`
- Analyse du contenu
- Suggestions de structure
- Navigation vers MPF-5

### Étape 5: Génération (MPF-5) ✅ NOUVEAU
**Fichier:** `src/components/portfolio/master/GenerationScreen.tsx`
```typescript
<GenerationScreen
  portfolioData={{
    portfolioId: 'uuid-here',
    intentions: chatIntentions,
    style: selectedStyle,
    projects: importedProjects,
    practicalData: practicalInfo,
  }}
  onComplete={(result) => {
    // result.html = HTML généré
    // result.portfolioId = ID du portfolio
    navigateToEditor(result.portfolioId);
  }}
  onError={(error) => {
    showErrorToast(error);
  }}
/>
```

### Étape 6: Édition (MPF-6) ✅ NOUVEAU
**Fichier:** `src/components/portfolio/editor/PortfolioEditor.tsx`
```typescript
<PortfolioEditor
  portfolioId={portfolioId}
  onBack={() => navigateToHub()}
  onPreview={(html) => showPreview(html)}
  onPublish={() => publishPortfolio()}
/>
```

---

## 4️⃣ Gestion des États dans App.tsx

### Ajoutez dans le state principal:
```typescript
interface AppState {
  currentModule: 'cv' | 'portfolio' | 'vault' | ...;
  portfolioFlow: {
    step: 'chat' | 'import' | 'style' | 'analysis' | 'generation' | 'editor' | 'preview';
    data: PortfolioFlowData;
  };
}
```

### Navigation entre étapes:
```typescript
const advancePortfolioFlow = (nextStep: PortfolioFlowStep, data?: any) => {
  setAppState(prev => ({
    ...prev,
    portfolioFlow: {
      step: nextStep,
      data: { ...prev.portfolioFlow.data, ...data },
    },
  }));
};
```

---

## 5️⃣ IPC Handlers Vérification

### Handlers requis dans `main.cjs`:

**MPF-5 (Génération):**
- ✅ `groq-generate-portfolio-content` (ligne ~2601)
- ✅ `render-portfolio-html` (ligne ~2615)
- ✅ `save-generated-portfolio` (ligne ~2654)
- ✅ `export-portfolio-html` (ligne ~2685)

**MPF-6 (Édition):**
- ✅ `db-get-portfolio` (ligne ~2712)
- ✅ `db-update-portfolio` (ligne ~2745)

**À ajouter (optionnel):**
```javascript
// Publish portfolio to souverain.io
ipcMain.handle('publish-portfolio', async (event, { portfolioId }) => {
  try {
    const portfolio = await getPortfolioById(portfolioId);
    const publishUrl = await uploadToSouverainIO(portfolio);
    return { success: true, url: publishUrl };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

---

## 6️⃣ Database Schema Vérification

### Table `portfolios` doit avoir:
```sql
CREATE TABLE portfolios (
  id TEXT PRIMARY KEY,
  name TEXT,
  style TEXT,
  generated_html TEXT,
  generated_sections TEXT, -- JSON array
  projects TEXT,           -- JSON array
  practical_data TEXT,     -- JSON object
  seo TEXT,               -- JSON object
  created_at TEXT,
  updated_at TEXT
);
```

### Migrations si nécessaire:
```javascript
// Ajouter colonnes manquantes
ALTER TABLE portfolios ADD COLUMN practical_data TEXT;
ALTER TABLE portfolios ADD COLUMN seo TEXT;
```

---

## 7️⃣ Exemple Complet d'Intégration

### `src/components/portfolio/PortfolioMasterFlow.tsx`
```typescript
import React, { useState } from 'react';
import { ChatSelectionScreen } from './ChatSelectionScreen';
import { ImportDataScreen } from './ImportDataScreen';
import { StyleSuggestionScreen } from './StyleSuggestionScreen';
import { AnalysisScreen } from './AnalysisScreen';
import { GenerationScreen } from './master/GenerationScreen';
import { PortfolioEditor } from './editor/PortfolioEditor';

type FlowStep = 'chat' | 'import' | 'style' | 'analysis' | 'generation' | 'editor';

export const PortfolioMasterFlow: React.FC = () => {
  const [step, setStep] = useState<FlowStep>('chat');
  const [portfolioData, setPortfolioData] = useState({
    portfolioId: crypto.randomUUID(),
    chatId: null,
    intentions: null,
    imports: null,
    style: null,
    projects: [],
    practicalData: {},
  });

  const updateData = (updates: any) => {
    setPortfolioData(prev => ({ ...prev, ...updates }));
  };

  switch (step) {
    case 'chat':
      return (
        <ChatSelectionScreen
          onNext={(chatId, intentions) => {
            updateData({ chatId, intentions });
            setStep('import');
          }}
        />
      );

    case 'import':
      return (
        <ImportDataScreen
          onNext={(imports) => {
            updateData({ imports });
            setStep('style');
          }}
          onBack={() => setStep('chat')}
        />
      );

    case 'style':
      return (
        <StyleSuggestionScreen
          onNext={(style) => {
            updateData({ style });
            setStep('analysis');
          }}
          onBack={() => setStep('import')}
        />
      );

    case 'analysis':
      return (
        <AnalysisScreen
          data={portfolioData}
          onNext={(projects) => {
            updateData({ projects });
            setStep('generation');
          }}
          onBack={() => setStep('style')}
        />
      );

    case 'generation':
      return (
        <GenerationScreen
          portfolioData={portfolioData}
          onComplete={() => setStep('editor')}
          onError={(error) => alert(error)}
        />
      );

    case 'editor':
      return (
        <PortfolioEditor
          portfolioId={portfolioData.portfolioId}
          onBack={() => setStep('generation')}
          onPreview={(html) => console.log('Preview:', html)}
          onPublish={() => alert('Publié!')}
        />
      );

    default:
      return null;
  }
};
```

---

## 8️⃣ Tests de Bout en Bout

### Test Flow Complet:
```bash
1. Ouvrir l'application
2. Aller dans Portfolio Hub
3. Cliquer "Créer un nouveau portfolio"
4. Sélectionner un chat → MPF-1 ✅
5. Importer données LinkedIn → MPF-2 ✅
6. Choisir style "Moderne" → MPF-3 ✅
7. Voir analyse IA → MPF-4 ✅
8. Attendre génération → MPF-5 ✅ (5 étapes)
9. Éditer sections → MPF-6 ✅
10. Drag & drop réordonner → MPF-6 ✅
11. Changer style → MPF-6 ✅
12. Preview live → MPF-6 ✅
13. Publier → Handler custom
```

---

## 9️⃣ Troubleshooting

### Problème: Génération échoue
**Solution:** Vérifier que Groq API key est configurée dans `groq-client.cjs`

### Problème: Preview ne s'affiche pas
**Solution:** Vérifier que `renderService.ts` existe et retourne du HTML valide

### Problème: Auto-save ne fonctionne pas
**Solution:** Vérifier que `db-update-portfolio` handler existe et fonctionne

### Problème: Drag & drop ne marche pas
**Solution:** Installer `@dnd-kit/*` dependencies:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## 🎉 Checklist Finale

- [ ] Installer dépendances `@dnd-kit/*`
- [ ] Vérifier tous les IPC handlers (5 nouveaux)
- [ ] Vérifier schema DB `portfolios` table
- [ ] Intégrer `GenerationScreen` dans le flow
- [ ] Intégrer `PortfolioEditor` dans le flow
- [ ] Ajouter bouton "Éditer" dans PortfolioList
- [ ] Tester flow complet (MPF-1 à MPF-6)
- [ ] Tester dark/light mode
- [ ] Tester drag & drop sections
- [ ] Tester auto-save (2s debounce)

---

**Guide créé par:** Claude Code (Sonnet 4.5)
**Date:** 2026-01-27
**Version:** MPF-5-6 Integration Guide v1.0

✨ **Prêt pour l'intégration !** ✨
