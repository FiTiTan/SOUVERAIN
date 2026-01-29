# Portfolio Assets - Documentation d'Implémentation

## Vue d'ensemble

Implémentation complète du système de gestion des assets (images, PDFs, vidéos) pour le module Portfolio de SOUVERAIN.

## Fonctionnalités Implémentées

### ✅ 1. Import de Fichiers
- **Composant**: `AssetImporter.tsx`
- **Formats supportés**:
  - Images: JPG, JPEG, PNG, GIF, WEBP
  - Documents: PDF
  - Vidéos: MP4, MOV, WEBM
- **Fonctionnalités**:
  - Sélection multiple de fichiers
  - Validation de format et de taille (max 100 Mo par fichier)
  - Import asynchrone avec feedback utilisateur
  - Notifications toast (succès/erreur)

### ✅ 2. Stockage Local
- **Handler IPC**: `portfolio-v2-save-file`
- **Structure de dossiers**:
  ```
  userData/
  └── portfolios/
      └── {portfolio_id}/
          ├── assets/
          │   ├── fichier1.jpg
          │   ├── fichier2.pdf
          │   └── fichier3.mp4
          └── thumbnails/
              ├── fichier1_thumb.jpg
              └── fichier3_thumb.jpg
  ```
- **Nommage unique**: `{baseName}_{timestamp}{extension}`

### ✅ 3. Génération de Miniatures
- **Handler IPC**: `portfolio-v2-generate-thumbnail`
- **Technologie**: Electron `nativeImage` API
- **Paramètres**:
  - Largeur max: 300px
  - Hauteur max: 300px
  - Format: JPEG (qualité 80%)
  - Préservation du ratio d'aspect
- **Applicable à**: Images uniquement (JPG, PNG, GIF, WEBP)

### ✅ 4. Base de Données
- **Table**: `portfolio_assets`
- **Champs**:
  - `id`: Identifiant unique
  - `portfolio_id`: Foreign key vers `portfolios_v2`
  - `source_type`: Type de source ('local', 'url', 'github')
  - `source_path`: Chemin source original
  - `local_path`: Chemin absolu sur le disque
  - `format`: Extension du fichier
  - `original_filename`: Nom original du fichier
  - `file_size`: Taille en octets
  - `metadata_json`: Métadonnées additionnelles
  - `thumbnail_path`: Chemin de la miniature (si applicable)
  - `created_at`: Date de création

### ✅ 5. Affichage des Assets
- **Composant Grid**: `AssetGrid.tsx`
  - Grille responsive (min 250px par carte)
  - État vide avec message personnalisé
  - Gap de 1rem entre les cartes

- **Composant Carte**: `AssetCard.tsx`
  - Miniature ou icône selon le type
  - Nom du fichier (avec ellipsis)
  - Badge du format (ex: JPG, PDF, MP4)
  - Taille du fichier formatée
  - Bouton supprimer (avec confirmation)
  - Effet hover avec bordure et ombre
  - Support clic pour ouvrir/preview

### ✅ 6. Service Asset
- **Fichier**: `src/services/assetService.ts`
- **Fonctions**:
  - `importAsset(portfolioId, file)`: Import complet avec miniature
  - `deleteAsset(assetId)`: Suppression de l'asset
  - `getAssetsByPortfolioId(portfolioId)`: Récupération des assets
  - `getAssetIcon(format)`: Icône selon le type
  - `getAssetCategory(format)`: Catégorie (image/document/video/other)
  - `formatFileSize(bytes)`: Formatage de la taille

### ✅ 7. Intégration dans PortfolioModule
- **Fichier**: `src/components/portfolio/PortfolioModule.tsx`
- **Vue détail d'un portfolio**:
  - Header avec informations du portfolio
  - Section "Assets du Portfolio"
  - Bouton "Importer des fichiers"
  - Grille d'affichage des assets
  - Rechargement automatique après import/suppression

## Architecture des Fichiers

```
src/
├── services/
│   └── assetService.ts           # Service de gestion des assets
├── components/
│   └── portfolio/
│       ├── AssetImporter.tsx      # Bouton d'import
│       ├── AssetGrid.tsx          # Grille d'affichage
│       ├── AssetCard.tsx          # Carte individuelle
│       └── PortfolioModule.tsx    # Intégration principale

main.cjs                           # Handlers IPC
├── portfolio-v2-save-file         # Sauvegarde fichier
├── portfolio-v2-generate-thumbnail # Génération miniature
├── portfolio-asset-create         # Création asset DB
├── portfolio-asset-get-by-portfolio # Récupération assets
└── portfolio-asset-delete         # Suppression asset

preload.cjs                        # API exposée
└── window.electron.portfolioV2
    ├── saveFile(...)
    ├── generateThumbnail(...)
    └── assets
        ├── create(...)
        ├── getByPortfolio(...)
        └── delete(...)

database.cjs                       # Gestion BDD
├── portfolioAsset_create(...)
├── portfolioAsset_getByPortfolioId(...)
└── portfolioAsset_delete(...)
```

## Flow Utilisateur

1. **Ouverture d'un portfolio**
   - L'utilisateur clique sur un portfolio dans la liste
   - `selectedPortfolioId` est défini
   - Les assets sont chargés automatiquement via `loadAssets()`

2. **Import de fichiers**
   - Clic sur "Importer des fichiers"
   - Sélecteur natif s'ouvre (multi-sélection)
   - Validation de format et taille
   - Pour chaque fichier:
     - Lecture comme ArrayBuffer
     - Sauvegarde sur disque via IPC
     - Génération de miniature (si image)
     - Création enregistrement BDD
   - Toast de confirmation
   - Rechargement de la grille

3. **Affichage des assets**
   - Grille responsive avec miniatures
   - Hover révèle le bouton supprimer
   - Clic sur carte pour ouvrir/preview (futur)

4. **Suppression d'un asset**
   - Clic sur bouton supprimer
   - Confirmation utilisateur
   - Suppression de l'enregistrement BDD
   - TODO: Suppression du fichier physique
   - Rechargement de la grille

## Points Techniques

### Gestion des Chemins Windows
```typescript
// Normalisation pour Windows
const normalizedPath = imagePath
  ? `file:///${imagePath.replace(/\\/g, '/')}`
  : '';
```

### Mapping DB Snake_Case → CamelCase
```javascript
// database.cjs
return assets.map(asset => ({
  id: asset.id,
  portfolioId: asset.portfolio_id,
  sourceType: asset.source_type,
  // ... etc
}));
```

### Thumbnail avec Electron nativeImage
```javascript
const { nativeImage } = require('electron');
const image = nativeImage.createFromPath(filePath);
const thumbnail = image.resize({ width, height, quality: 'good' });
fs.writeFileSync(thumbnailPath, thumbnail.toJPEG(80));
```

## Tests Manuels

### Test 1: Import d'une image
1. Créer/ouvrir un portfolio
2. Cliquer "Importer des fichiers"
3. Sélectionner une image JPG/PNG
4. Vérifier:
   - ✅ Toast de succès
   - ✅ Miniature apparaît dans la grille
   - ✅ Badge format correct
   - ✅ Taille affichée
   - ✅ Fichier dans `userData/portfolios/{id}/assets/`
   - ✅ Miniature dans `userData/portfolios/{id}/thumbnails/`

### Test 2: Import d'un PDF
1. Sélectionner un fichier PDF
2. Vérifier:
   - ✅ Toast de succès
   - ✅ Icône 📄 affiché (pas de miniature)
   - ✅ Badge "PDF"
   - ✅ Taille affichée

### Test 3: Import d'une vidéo
1. Sélectionner un fichier MP4
2. Vérifier:
   - ✅ Toast de succès
   - ✅ Icône 🎥 affiché
   - ✅ Badge "MP4"
   - ✅ Taille affichée

### Test 4: Import multiple
1. Sélectionner 3-4 fichiers de types différents
2. Vérifier:
   - ✅ Tous importés correctement
   - ✅ Toast indique "X fichier(s) importé(s)"
   - ✅ Grille affiche tous les assets

### Test 5: Validation de format
1. Tenter d'importer un fichier .txt
2. Vérifier:
   - ✅ Toast warning "Format non supporté"
   - ✅ Fichier non ajouté

### Test 6: Validation de taille
1. Tenter d'importer un fichier > 100 Mo
2. Vérifier:
   - ✅ Toast warning "Fichier trop volumineux"
   - ✅ Fichier non ajouté

### Test 7: Suppression
1. Cliquer sur le bouton supprimer d'un asset
2. Confirmer
3. Vérifier:
   - ✅ Dialogue de confirmation
   - ✅ Toast de succès
   - ✅ Asset retiré de la grille
   - ✅ Enregistrement supprimé de la BDD

### Test 8: Persistance
1. Importer des assets
2. Fermer l'app
3. Rouvrir l'app et ouvrir le même portfolio
4. Vérifier:
   - ✅ Assets toujours présents
   - ✅ Miniatures affichées correctement

## Améliorations Futures (TODO)

### Haute Priorité
- [ ] Supprimer le fichier physique lors de `deleteAsset()`
- [ ] Génération de miniatures pour les vidéos (première frame)
- [ ] Preview plein écran au clic sur un asset
- [ ] Drag & drop pour importer des fichiers

### Moyenne Priorité
- [ ] Édition des métadonnées (nom, description, tags)
- [ ] Réorganisation par drag & drop
- [ ] Filtrage par type (images/PDFs/vidéos)
- [ ] Recherche par nom
- [ ] Export en lot

### Basse Priorité
- [ ] Support de formats additionnels (SVG, HEIC, AVI, etc.)
- [ ] Compression automatique des images
- [ ] OCR sur les PDFs
- [ ] Preview vidéo au hover
- [ ] Galerie lightbox

## Contraintes Respectées

✅ **Tout en local** - Aucun upload cloud
✅ **Async IPC** - Pas de blocage UI
✅ **Thumbnails 300px max** - Respecté
✅ **Structure dossiers propre** - assets/ et thumbnails/ séparés
✅ **Gestion erreurs** - Try/catch + fallbacks
✅ **UX fluide** - Feedback toast, loading states

## Commandes de Test

```bash
# Compiler TypeScript (vérifier erreurs)
npx tsc --noEmit

# Lancer l'app en dev
npm start

# Localiser le dossier userData
# Windows: C:\Users\{USER}\AppData\Roaming\souverain
# macOS: ~/Library/Application Support/souverain
# Linux: ~/.config/souverain
```

## Conclusion

L'implémentation est **complète et fonctionnelle**. Le système permet d'importer, afficher, et supprimer des assets (images, PDFs, vidéos) avec génération automatique de miniatures pour les images. Tous les fichiers concernés ont été créés ou modifiés, et l'intégration dans PortfolioModule est opérationnelle.

**Status**: ✅ PHASE B TERMINÉE
