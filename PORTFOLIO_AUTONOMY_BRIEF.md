# SOUVERAIN - Brief d'Autonomie V3 (Master Plan Portfolio)

Ce document est la source de vérité pour "Gemini CLI" afin de finaliser le module Portfolio.
**Objectif :** Rendre le Portfolio 100% fonctionnel, de la création à l'export PDF "Excellence".

## 1. INFRASTRUCTURE & TYPES (Fondations)
- [x] **Types TypeScript (`src/types/portfolio.ts`)** :
    - S'assurer que `PortfolioProjectV2` contient bien les champs : `context_text`, `challenge_text`, `solution_text`, `result_text`.
    - Vérifier les types pour `ProjectMedia` (liaison).
- [ ] **Backend (`main.cjs` / `database.cjs`)** :
    - Vérifier que `projectMedia_add` et `projectMedia_delete` sont bien exposés via IPC.
    - S'assurer que l'ordre (`display_order`) est géré lors de l'ajout/suppression de médias.

## 2. LINKING MÉDIAS (Le Chaînon Manquant)
Actuellement, on peut créer un projet et uploader des médias, mais pas les lier.
**(Priorité Absolue)**

### A. Interface de Sélection (`MediaPickerModal`)
- **Fichier :** `src/components/portfolio/mediatheque/MediaPickerModal.tsx` (À Créer)
- **Fonctionnalités :**
    - Afficher la grille de la médiathèque (réutiliser `MediathequeGrid` ou une version simplifiée).
    - Mode "Sélection" (Cases à cocher sur les cartes).
    - Bouton "Valider la sélection (X éléments)".
    - Props : `isOpen`, `onClose`, `onSelect(mediaIds: string[])`.

### B. Intégration dans `ProjectsModule` / `ProjectEditor`
- **Fichier :** `src/components/portfolio/projects/ProjectEditModal.tsx` (ou étendre `ProjectCreateModal`, ou nouvelle vue)
- **Actions :**
    - Créer une vraie vue "Détail Projet" (qui remplace le simple Modal de création à terme, ou s'ouvre après création).
    - Section "Galerie Média".
    - Bouton "+ Lier des médias" -> Ouvre `MediaPickerModal`.
    - **Liste des médias liés :**
        - Affichage horizontal ou grille.
        - Bouton "Détacher" (poubelle) pour chaque média.
        - Drag & Drop pour réordonner (optionnel maia recommandé pour l'ordre PDF).

## 3. EXPORT PDF "EXCELLENCE"
Le moteur est prêt (`src/services/pdfExporter.ts`), il faut maintenant le connecter parfaitement à l'UI.

### A. UI d'Export
- **Fichier :** `src/components/portfolio/ExportModal.tsx`
- **Actions :**
    - Mettre à jour pour proposer "Export Excellence (PDF)".
    - Options : "Ghost Mode" (Anonymisation), "Inclure Média".
    - Bouton principal déclenchant `generatePortfolioPDF` avec les données complètes du projet.

### B. Validation du Rendu
- **Checklist Qualité PDF :**
    - [ ] Titre et Date sur la première page.
    - [ ] Sections (Contexte, Défi, Solution, Résultat) bien séparées et lisibles.
    - [ ] Sauts de page logiques (ne pas couper un titre en bas de page).
    - [ ] Grille d'images (2 par ligne) avec résolution correcte.
    - [ ] **Ghost Mode** : Vérifier que [CLIENT] remplace bien le nom du client si activé.

## 4. MODULE COMPTES (Identité Numérique)
Permettre à l'utilisateur d'ajouter ses liens pro.

- **Fichier :** `src/components/portfolio/accounts/AccountsModule.tsx` (À Créer)
- **Fonctionnalités :**
    - "Ajouter un compte" (Dropdown: LinkedIn, GitHub, Dribbble, Website, Autre).
    - Champs : URL, Username (optionnel).
    - Liste des comptes ajoutés avec icônes.
    - Sauvegarde en BDD (`external_accounts`).

## 5. RECOMMANDATIONS UX (Pour l'Agent Autonome)
- **Feedback :** Toujours afficher un toast/notification après une sauvegarde (Projet créé, Média lié).
- **Navigation :** Si je crée un projet, proposez-moi immédiatement d'ajouter des médias (ne pas fermer la modal brutalement).
- **Empty States :** Si la galerie est vide, afficher un beau placeholder "Glissez des images ou sélectionnez-les depuis la médiathèque".

---
**Note pour Gemini CLI :**
Commence par le point **2. LINKING MÉDIAS**. C'est le bloqueur fonctionnel principal.
Ensuite, valide l'export PDF avec de vraies images.
Finis par le module Comptes.
Bon code.
