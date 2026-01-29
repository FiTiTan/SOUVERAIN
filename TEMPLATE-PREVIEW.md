# TEMPLATE-PREVIEW.md

## Standard de Prévisualisation des Médias — SOUVERAIN

**Version:** 1.0
**Date:** 23 janvier 2026
**Scope:** Tous les composants de prévisualisation de médias dans l'application

---

## OBJECTIF

Définir un composant de prévisualisation unifié pour tous les médias (images, vidéos, PDF, documents) utilisable dans :
- Médiathèque
- Import de médias (MPF-2)
- Projets
- Portfolio final

---

## SPÉCIFICATIONS VISUELLES

### Layout général

```
┌─────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← FOND NOIR
│ ▓                                                             ▓ │     rgba(0,0,0,0.9)
│ ▓  ┌─────────────────────────────────────────────────────┐   ▓ │
│ ▓  │ photo_2024.jpg                              [×]     │   ▓ │  ← TOP BAR
│ ▓  └─────────────────────────────────────────────────────┘   ▓ │     (fond semi-transparent)
│ ▓                                                             ▓ │
│ ▓                                                             ▓ │
│ ▓                                                             ▓ │
│ ▓                      ┌───────────────┐                      ▓ │
│ ▓                      │               │                      ▓ │
│ ▓                      │               │                      ▓ │
│ ▓                      │     MÉDIA     │                      ▓ │  ← MÉDIA CENTRÉ
│ ▓                      │               │                      ▓ │     (contain, pas de crop)
│ ▓                      │               │                      ▓ │
│ ▓                      └───────────────┘                      ▓ │
│ ▓                                                             ▓ │
│ ▓                                                             ▓ │
│ ▓                                                             ▓ │
│ ▓  ┌─────────────────────────────────────────────────────┐   ▓ │
│ ▓  │     [←]           3 / 5            [→]              │   ▓ │  ← BOTTOM BAR
│ ▓  └─────────────────────────────────────────────────────┘   ▓ │     (fond semi-transparent)
│ ▓                                                             ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────────────────────────────────────┘
```

---

## COMPOSANTS

### 1. Overlay (fond)

```css
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
}
```

**Comportement :**
- Plein écran (`fixed inset-0`)
- Z-index élevé (50+) pour passer au-dessus de tout
- Clic sur l'overlay (hors média) → ferme la preview
- Touche `Escape` → ferme la preview

---

### 2. Top Bar (Material 3 inspired)

```
┌─────────────────────────────────────────────────────────────────┐
│  📄 photo_projet_2024.jpg                                  [×]  │
└─────────────────────────────────────────────────────────────────┘
```

**Spécifications :**

| Propriété | Valeur |
|-----------|--------|
| Position | `fixed top-0 left-0 right-0` |
| Hauteur | `56px` (standard M3) |
| Background | `rgba(0, 0, 0, 0.6)` avec `backdrop-blur-md` |
| Padding | `0 16px` |
| Contenu gauche | Icône type fichier + Nom du fichier |
| Contenu droite | Bouton fermer (×) |

**Icônes par type :**
- Image : `🖼️` ou `<Image />`
- Vidéo : `🎬` ou `<Video />`
- PDF : `📄` ou `<FileText />`
- Document : `📝` ou `<File />`

**Style du nom :**
```css
.filename {
  color: white;
  font-size: 14px;
  font-weight: 500;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Bouton fermer :**
```css
.close-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: transparent;
  transition: background 0.2s;
}
.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

---

### 3. Zone Média (centre)

**Spécifications :**

| Propriété | Valeur |
|-----------|--------|
| Position | `flex-1` (remplit l'espace disponible) |
| Display | `flex items-center justify-center` |
| Padding | `64px 48px` (espace pour les barres) |

**Règles d'affichage :**

**Images :**
```css
.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
```

**Vidéos :**
```css
.preview-video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
```
- Autoplay : Non
- Controls : Oui (natifs du navigateur)
- Muted par défaut : Non

**PDF :**
- Utiliser `<iframe>` ou composant PDF viewer
- Afficher avec contrôles de zoom/page

**Documents non prévisualisables :**
- Afficher une card avec icône + nom + taille + bouton "Télécharger"

---

### 4. Bottom Bar (Navigation)

```
┌─────────────────────────────────────────────────────────────────┐
│           [←]              3 / 5              [→]               │
└─────────────────────────────────────────────────────────────────┘
```

**Spécifications :**

| Propriété | Valeur |
|-----------|--------|
| Position | `fixed bottom-0 left-0 right-0` |
| Hauteur | `64px` |
| Background | `rgba(0, 0, 0, 0.6)` avec `backdrop-blur-md` |
| Display | `flex items-center justify-center gap-8` |

**Boutons navigation :**
```css
.nav-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}
.nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}
.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

**Compteur :**
```css
.counter {
  color: white;
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}
```

**Format compteur :** `{index actuel} / {total}`
- Exemple : `3 / 5`
- Si un seul média : masquer la bottom bar ou afficher `1 / 1`

---

## INTERACTIONS

### Clavier

| Touche | Action |
|--------|--------|
| `Escape` | Fermer la preview |
| `←` ou `ArrowLeft` | Média précédent |
| `→` ou `ArrowRight` | Média suivant |
| `Home` | Premier média |
| `End` | Dernier média |

### Souris / Touch

| Action | Résultat |
|--------|----------|
| Clic sur overlay (fond) | Fermer |
| Clic sur bouton × | Fermer |
| Clic sur ← | Précédent |
| Clic sur → | Suivant |
| Swipe gauche (mobile) | Suivant |
| Swipe droite (mobile) | Précédent |

### Gestes avancés (optionnel)

| Geste | Résultat |
|-------|----------|
| Pinch zoom (mobile) | Zoom sur image |
| Double-tap (mobile) | Zoom 2x / Reset |
| Scroll molette (desktop) | Zoom progressif |

---

## COMPOSANT REACT

### Fichier : `src/components/common/MediaPreview.tsx`

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image, Video, FileText, File, Download } from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  type: string; // MIME type
  url: string; // URL ou chemin local
  size?: number;
}

interface MediaPreviewProps {
  items: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  items,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentItem = items[currentIndex];
  const total = items.length;

  // Navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev < total - 1 ? prev + 1 : prev));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Home':
          setCurrentIndex(0);
          break;
        case 'End':
          setCurrentIndex(total - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrevious, goToNext, total]);

  // Empêcher le scroll du body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Déterminer le type de fichier
  const getFileType = (mimeType: string): 'image' | 'video' | 'pdf' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'document';
  };

  const fileType = getFileType(currentItem.type);

  // Icône par type
  const getIcon = () => {
    switch (fileType) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  // Format taille fichier
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Rendu du média
  const renderMedia = () => {
    switch (fileType) {
      case 'image':
        return (
          <img
            src={currentItem.url}
            alt={currentItem.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            draggable={false}
          />
        );

      case 'video':
        return (
          <video
            key={currentItem.id} // Force re-render on change
            src={currentItem.url}
            controls
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        );

      case 'pdf':
        return (
          <iframe
            src={currentItem.url}
            title={currentItem.name}
            className="w-full h-full max-w-4xl rounded-lg shadow-2xl bg-white"
          />
        );

      default:
        // Document non prévisualisable
        return (
          <div className="bg-zinc-900 rounded-2xl p-8 text-center max-w-sm">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <File className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="font-medium text-white mb-1">{currentItem.name}</p>
            {currentItem.size && (
              <p className="text-sm text-zinc-500 mb-4">{formatSize(currentItem.size)}</p>
            )}
            <p className="text-sm text-zinc-400 mb-4">
              Aperçu non disponible pour ce type de fichier
            </p>
            <button
              onClick={() => window.electron?.invoke('open-file', currentItem.url)}
              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Download className="w-4 h-4" />
              Ouvrir le fichier
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90">
      
      {/* TOP BAR */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 z-10">
        {/* Gauche : Icône + Nom */}
        <div className="flex items-center gap-3 text-white">
          <span className="text-zinc-400">{getIcon()}</span>
          <span className="font-medium text-sm max-w-[300px] truncate">
            {currentItem.name}
          </span>
        </div>

        {/* Droite : Fermer */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ZONE MÉDIA */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-16 pt-20 pb-24"
        onClick={(e) => {
          // Fermer si clic sur le fond (pas sur le média)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {renderMedia()}
      </div>

      {/* BOTTOM BAR */}
      {total > 1 && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-md flex items-center justify-center gap-8 z-10">
          {/* Précédent */}
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Compteur */}
          <span className="text-white font-medium text-sm min-w-[60px] text-center">
            {currentIndex + 1} / {total}
          </span>

          {/* Suivant */}
          <button
            onClick={goToNext}
            disabled={currentIndex === total - 1}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Suivant"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
```

---

## UTILISATION

### Import et usage basique

```tsx
import { MediaPreview } from '@/components/common/MediaPreview';

// Dans un composant parent :
const [showPreview, setShowPreview] = useState(false);
const [previewIndex, setPreviewIndex] = useState(0);

const mediaItems = [
  { id: '1', name: 'photo1.jpg', type: 'image/jpeg', url: '/path/to/photo1.jpg' },
  { id: '2', name: 'video.mp4', type: 'video/mp4', url: '/path/to/video.mp4' },
  { id: '3', name: 'document.pdf', type: 'application/pdf', url: '/path/to/doc.pdf' },
];

// Ouvrir la preview au clic sur une image
const handleMediaClick = (index: number) => {
  setPreviewIndex(index);
  setShowPreview(true);
};

return (
  <>
    {/* Grille de médias */}
    <div className="grid grid-cols-3 gap-4">
      {mediaItems.map((item, index) => (
        <button key={item.id} onClick={() => handleMediaClick(index)}>
          <img src={item.url} alt={item.name} />
        </button>
      ))}
    </div>

    {/* Preview modale */}
    {showPreview && (
      <MediaPreview
        items={mediaItems}
        initialIndex={previewIndex}
        onClose={() => setShowPreview(false)}
      />
    )}
  </>
);
```

---

## VARIANTS

### Preview simple (un seul média)

```tsx
<MediaPreview
  items={[{ id: '1', name: 'image.jpg', type: 'image/jpeg', url: '/path/to/image.jpg' }]}
  onClose={() => setShowPreview(false)}
/>
```
→ La bottom bar de navigation est masquée automatiquement.

### Preview depuis la Médiathèque

```tsx
const mediathequeItems = mediathequeData.map(item => ({
  id: item.id,
  name: item.filename,
  type: item.mime_type,
  url: item.filepath,
  size: item.file_size,
}));

<MediaPreview
  items={mediathequeItems}
  initialIndex={clickedIndex}
  onClose={() => setShowPreview(false)}
/>
```

---

## ACCESSIBILITÉ

| Critère | Implémentation |
|---------|----------------|
| Focus trap | Focus reste dans la modale |
| ARIA labels | `aria-label` sur tous les boutons |
| Keyboard nav | Flèches, Escape, Home, End |
| Contrast | Texte blanc sur fond sombre |
| Screen reader | Annonce du média courant |

---

## NOTES D'IMPLÉMENTATION

1. **Performance** : Utiliser `loading="lazy"` pour les images dans la galerie source
2. **Mémoire** : Libérer les Object URLs si créées dynamiquement
3. **Mobile** : Ajouter support swipe avec `touch-action` ou lib comme `react-swipeable`
4. **Zoom** : Optionnel en V1, peut être ajouté avec `react-zoom-pan-pinch`

---

## FICHIERS CONCERNÉS

Ce template doit être implémenté/utilisé dans :

- `src/components/common/MediaPreview.tsx` — Composant principal
- `src/components/portfolio/mediatheque/MediathequeGrid.tsx` — Galerie médiathèque
- `src/components/portfolio/master/MediaImport.tsx` — Import médias MPF-2
- `src/components/portfolio/projects/ProjectEditor.tsx` — Éditeur de projet

---

**Ce standard garantit une expérience de prévisualisation cohérente dans toute l'application.**
