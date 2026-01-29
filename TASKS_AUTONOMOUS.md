# Task Checklist - AUTONOMOUS SESSION

## 🤖 AUTONOMOUS SESSION (User Away ~1h)
**Objective**: Complete Export Logic, UI Polish, and Ghost Mode Prep.

### 1. UI Polish (Visuals)
- [ ] **Display AI Tags** <!-- id: 11 -->
    - [ ] Modify `AssetCard.tsx` to accept `classification` prop (tags, category).
    - [ ] Render tags as badges on the card (overlay or footer).
    - [ ] Update `AssetGrid` to pass classification data to cards.

### 2. Export Logic (Core)
- [ ] **PDF Engine** <!-- id: 12 -->
    - [ ] Create `src/services/pdfExporter.ts`.
    - [ ] Implement `generatePortfolioPDF(project, assets)` function using `jspdf`.
    - [ ] Add basic layout (Title, Description, Grid of images).

### 3. Advanced Export Features (Phase D)
- [ ] **Ghost Mode Logic** (Privacy) <!-- id: 14 -->
    - [ ] Create `src/utils/ghostMode.ts`.
    - [ ] Implement `anonymizeContent(text, map)` function.
    - [ ] Create regex patterns for sensitive data (Emails, Phones, Names).
- [ ] **Export Options UI** <!-- id: 15 -->
    - [ ] Create `ExportModal` component.
    - [ ] Add toggles for "Inclure Description", "Inclure Tags", "Ghost Mode".
    - [ ] Add "Générer PDF" button calling the service.
- [ ] **Connect UI** <!-- id: 16 -->
    - [ ] Add "Export PDF" button to `PortfolioModule` (Project View).
    - [ ] Wire up `ExportModal`.
