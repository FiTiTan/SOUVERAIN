# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Souverain is a French-language Electron desktop application for CV (resume) analysis. It uses Groq Cloud API to provide detailed CV coaching with anonymization for privacy protection. The app stores analysis history in an encrypted SQLite database.

## Development Commands

```bash
# Start development (Vite + Electron)
npm start

# Run Vite dev server only
npm run vite:dev

# Run Electron only (requires Vite running)
npm run electron:dev

# Build for production
npm run build

# Rebuild native modules after install
npm run postinstall
```

## Architecture

### Dual-Process Structure (Electron)

**Main Process (CJS modules in root):**
- `main.cjs` - Electron app lifecycle, IPC handlers, window creation
- `preload.cjs` - Context bridge exposing API to renderer
- `groq-client.cjs` - Groq API client with CV analysis prompt
- `anonymizer.cjs` - Two anonymizers: `Anonymizer` (NER-based) and `AnonymizerGroq` (LLM-based, recommended)
- `database.cjs` - Encrypted SQLite vault using better-sqlite3-multiple-ciphers

**Renderer Process (React/TypeScript in `src/`):**
- `App.tsx` - Main application with three states: upload, file loaded, report display
- `src/components/` - UI components (`ui.tsx`, `ReportComponents.tsx`)
- `src/design-system.ts` - Theme tokens, typography, colors for light/dark modes
- `src/ThemeContext.tsx` - Theme provider with localStorage persistence
- `src/reportParser.ts` - Parses raw Groq response into structured `ParsedReport`

### Data Flow

1. User imports CV (PDF/TXT) via `window.electron.importCV()`
2. Main process extracts text using pdf.js-extract
3. `AnonymizerGroq` masks personal data (names, emails, phones, companies, schools)
4. `GroqClient.analyzeCV()` sends anonymized text to Groq API
5. Response is de-anonymized and returned to renderer
6. `parseReport()` transforms raw text into structured sections
7. Analysis saved to encrypted SQLite vault

### IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `analyze-cv` | R→M | CV analysis workflow |
| `import-cv` | R→M | File picker and text extraction |
| `get-system-status` | R→M | Check Groq API connectivity |
| `save-to-vault` | R→M | Persist analysis to database |
| `load-history` | R→M | Retrieve past analyses |
| `save-pdf` | R→M | Export report as PDF |

### Key Types

```typescript
// Report structure (src/reportParser.ts)
interface ParsedReport {
  diagnostic: DiagnosticData;    // Métier, secteur, niveau, experience
  score: ScoreData;              // Global score + impact/lisibilité/optimisation
  experiences: ExperienceData[]; // Per-experience analysis
  ats: ATSData;                  // Present and missing keywords
  reformulations: ReformulationData[];
  actions: ActionData[];         // Priority 1-3 action items
  conclusion: string;
  raw: string;
}
```

## Key Implementation Details

- **Theme system**: Uses inline styles with theme tokens from `design-system.ts`, not Tailwind utility classes
- **Anonymization tokens**: Format `[TYPE_N]` (e.g., `[PERSON_1]`, `[COMPANY_2]`) - must be preserved in prompts
- **Database encryption**: AES-256 via `better-sqlite3-multiple-ciphers`, key in `database.cjs`
- **Groq model**: Uses `llama-3.3-70b-versatile` for analysis, `llama-3.1-8b-instant` for extraction
- **UI language**: French throughout (interface, prompts, reports)

## File Conventions

- Main process: CommonJS (`.cjs`) for Electron compatibility
- Renderer: ESM + TypeScript (`.ts`, `.tsx`)
- Entry points: `main.cjs` (Electron), `src/main.tsx` (React)


# SOUVERAIN - Contexte Projet

## Stack
- Electron + React + TypeScript + Vite
- Groq Cloud API (llama-3.3-70b-versatile)
- SQLite AES-256 pour le coffre-fort
- Anonymisation LLM avant envoi cloud

## Architecture
- main.cjs : Orchestrateur Electron
- groq-client.cjs : API Groq + prompt Coach CV
- anonymizer.cjs : AnonymizerGroq (extraction entités)
- src/App.tsx : Interface React
- src/components/ : UI components (HomeScreen, AnalysisAnimation, etc.)

## Vision Produit
"Votre carrière. Vos règles."
- CV = hook d'acquisition
- Coffre-Fort + Portfolio + LinkedIn = rétention
- 6 features : Privacy, Coffre-Fort, CV, Job Matching, LinkedIn, Boutique

## V17 en cours
- ✅ Écran d'accueil avec choix parcours
- ✅ Icônes colorées par feature
- ✅ Animation d'anonymisation pendant analyse
- 🔜 Questionnaire "Je pars de zéro"
- 🔜 Pages Coffre-Fort et Aide