# BRIEF CORRECTIF URGENT - Finalisation Wizard Portfolio Maître

**Priorité:** 🔴 BLOQUANT - À faire AVANT les autres modules
**Temps estimé:** 45min - 1h
**Contexte:** Le wizard Portfolio Maître ne génère pas le portfolio à la fin

---

## 🐛 Problème Actuel

Le wizard s'arrête après le choix du style. Il manque :
1. La génération effective du portfolio HTML
2. L'écran de preview avec options
3. La sauvegarde et l'accès au portfolio créé

---

## 🎯 Flux Cible

```
[Wizard actuel]
    ↓
Style choisi
    ↓
┌─────────────────────────────────────────┐
│         GÉNÉRATION (nouveau)            │
│  - Anonymisation                        │
│  - Appel Groq                           │
│  - Rendu HTML                           │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│          PREVIEW (nouveau)              │
│  - Affichage du portfolio               │
│  - Bouton "Modifier" → retour récap     │
│  - Bouton "Exporter PDF"                │
│  - Bouton "Enregistrer"                 │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│      LISTE PORTFOLIOS (modifier)        │
│  - Le nouveau portfolio apparaît        │
│  - Clic → ouvre en mode édition/view    │
└─────────────────────────────────────────┘
```

---

## 📐 Écran Preview Final

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Modifier                    Preview                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │                                                          │   │
│  │                   [IFRAME PORTFOLIO]                     │   │
│  │                                                          │   │
│  │                   Rendu HTML généré                      │   │
│  │                                                          │   │
│  │                                                          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Desktop  │  │ Tablet   │  │ Mobile   │   ← Toggle device    │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [← Modifier le récap]    [Exporter PDF]    [✓ Enregistrer]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Actions des boutons

| Bouton | Action |
|--------|--------|
| **← Modifier le récap** | Retour à l'écran de récapitulatif (avant génération) |
| **Exporter PDF** | Génère un PDF du portfolio (ou HTML pour V1) |
| **✓ Enregistrer** | Sauvegarde en DB + redirige vers liste portfolios |

---

## 📐 Liste des Portfolios (mise à jour)

```
┌─────────────────────────────────────────────────────────────────┐
│  Mes Portfolios                              [+ Nouveau]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎨  Mon Portfolio Freelance                              │   │
│  │     Style: Moderne | Créé le 27/01/2026                 │   │
│  │                                                          │   │
│  │     [Voir]    [Éditer]    [Exporter]    [Supprimer]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏪  Portfolio Boutique                                   │   │
│  │     Style: Vitrine | Créé le 25/01/2026                 │   │
│  │                                                          │   │
│  │     [Voir]    [Éditer]    [Exporter]    [Supprimer]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Actions

| Bouton | Action |
|--------|--------|
| **Voir** | Ouvre la preview en lecture seule |
| **Éditer** | Ouvre `PortfolioEditor.tsx` (déjà créé) |
| **Exporter** | Télécharge HTML ou PDF |
| **Supprimer** | Confirmation + suppression |

---

## 🔧 Modifications à Faire

### 1. Ajouter l'étape "Génération" dans le wizard

**Fichier:** `PortfolioMasterWizard.tsx` (ou équivalent)

```tsx
// Après la sélection du style
const handleStyleConfirm = async (selectedStyle: string) => {
  setStep('generating'); // Nouvel état
  
  try {
    // 1. Générer le contenu via Groq
    const generatedContent = await window.electron.invoke('generate-portfolio-content', {
      intentions,
      projects: selectedProjects,
      media: selectedMedia,
      style: selectedStyle,
    });
    
    // 2. Rendre le HTML
    const html = await window.electron.invoke('render-portfolio-html', {
      ...generatedContent,
      style: selectedStyle,
    });
    
    setGeneratedHTML(html);
    setStep('preview'); // Passer à la preview
    
  } catch (error) {
    toast.error('Erreur', 'La génération a échoué');
    setStep('style'); // Retour au choix de style
  }
};
```

### 2. Créer le composant `PortfolioFinalPreview.tsx`

**Fichier:** `src/components/portfolio/master/PortfolioFinalPreview.tsx`

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, Tablet, Smartphone, Download, Save } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';
import { useToast } from '../../ui/NotificationToast';

interface PortfolioFinalPreviewProps {
  html: string;
  portfolioData: any;
  onModify: () => void;  // Retour au récap
  onSave: () => void;    // Sauvegarde et redirection
}

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

export const PortfolioFinalPreview: React.FC<PortfolioFinalPreviewProps> = ({
  html,
  portfolioData,
  onModify,
  onSave,
}) => {
  const { theme } = useTheme();
  const { success, error } = useToast();
  const [device, setDevice] = useState<Device>('desktop');
  const [isSaving, setIsSaving] = useState(false);

  const currentSize = DEVICE_SIZES[device];
  const scale = device === 'desktop' ? 0.5 : device === 'tablet' ? 0.6 : 0.75;

  const handleExportPDF = async () => {
    try {
      // Pour V1, on exporte en HTML
      await window.electron.invoke('export-portfolio-html', {
        html,
        filename: `${portfolioData.name || 'portfolio'}.html`,
      });
      success('Exporté !', 'Le fichier a été téléchargé');
    } catch (err) {
      error('Erreur', "L'export a échoué");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await window.electron.invoke('save-generated-portfolio', {
        ...portfolioData,
        generatedHTML: html,
        status: 'generated',
        generatedAt: new Date().toISOString(),
      });
      success('Enregistré !', 'Votre portfolio est accessible dans la liste');
      onSave();
    } catch (err) {
      error('Erreur', "L'enregistrement a échoué");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.border.light}`,
        backgroundColor: theme.bg.secondary,
      }}>
        <button
          onClick={onModify}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.text.secondary,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          <ArrowLeft size={18} />
          Modifier le récap
        </button>

        <span style={{ color: theme.text.primary, fontWeight: 600 }}>
          Preview de votre portfolio
        </span>

        <div style={{ width: '150px' }} /> {/* Spacer */}
      </div>

      {/* Device Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '16px',
        backgroundColor: theme.bg.secondary,
      }}>
        {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: device === d ? theme.accent.primary : theme.bg.tertiary,
              color: device === d ? '#fff' : theme.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {d === 'desktop' && <Monitor size={16} />}
            {d === 'tablet' && <Tablet size={16} />}
            {d === 'mobile' && <Smartphone size={16} />}
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Preview Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: theme.bg.tertiary,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: currentSize.width * scale,
            height: currentSize.height * scale,
            backgroundColor: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }}
        >
          <iframe
            srcDoc={html}
            title="Portfolio Preview"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              border: 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </motion.div>
      </div>

      {/* Footer Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
        borderTop: `1px solid ${theme.border.light}`,
        backgroundColor: theme.bg.secondary,
      }}>
        <button
          onClick={onModify}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: `1px solid ${theme.border.default}`,
            backgroundColor: 'transparent',
            color: theme.text.primary,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          ← Modifier le récap
        </button>

        <button
          onClick={handleExportPDF}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: `1px solid ${theme.border.default}`,
            backgroundColor: 'transparent',
            color: theme.text.primary,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Download size={18} />
          Exporter
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '12px 32px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: theme.accent.primary,
            color: '#fff',
            cursor: isSaving ? 'wait' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          <Save size={18} />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};

export default PortfolioFinalPreview;
```

### 3. Mettre à jour la liste des portfolios

**Fichier:** `PortfolioHub.tsx` ou `PortfolioList.tsx`

Ajouter les boutons d'action pour chaque portfolio :

```tsx
// Pour chaque portfolio dans la liste
<div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
  <button onClick={() => handleView(portfolio.id)}>Voir</button>
  <button onClick={() => handleEdit(portfolio.id)}>Éditer</button>
  <button onClick={() => handleExport(portfolio.id)}>Exporter</button>
  <button onClick={() => handleDelete(portfolio.id)}>Supprimer</button>
</div>
```

### 4. Handlers IPC à vérifier/ajouter

```javascript
// Dans main.cjs - Vérifier que ces handlers existent

// Sauvegarder le portfolio généré
ipcMain.handle('save-generated-portfolio', async (event, data) => {
  const id = data.id || crypto.randomUUID();
  return db.portfolios_save({
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  });
});

// Récupérer tous les portfolios (pour la liste)
ipcMain.handle('db-get-all-portfolios', async () => {
  return db.portfolios_getAll();
});

// Supprimer un portfolio
ipcMain.handle('db-delete-portfolio', async (event, id) => {
  return db.portfolios_delete(id);
});
```

---

## ✅ Checklist

- [ ] État `generating` ajouté au wizard
- [ ] État `preview` ajouté au wizard
- [ ] `PortfolioFinalPreview.tsx` créé
- [ ] Bouton "Modifier" retourne au récap
- [ ] Bouton "Exporter" télécharge le fichier
- [ ] Bouton "Enregistrer" sauvegarde et redirige
- [ ] Liste des portfolios affiche les portfolios sauvegardés
- [ ] Boutons Voir/Éditer/Exporter/Supprimer fonctionnels
- [ ] Navigation vers `PortfolioEditor` depuis "Éditer"

---

## 🚀 Ordre d'implémentation

1. **D'abord** : Créer `PortfolioFinalPreview.tsx`
2. **Ensuite** : Modifier le wizard pour ajouter les étapes `generating` → `preview`
3. **Puis** : Connecter le bouton "Enregistrer" à la sauvegarde DB
4. **Enfin** : Mettre à jour la liste des portfolios avec les actions

---

**Ce brief est PRIORITAIRE. À faire AVANT Job Matching et LinkedIn Coach.**
