# SOUVERAIN - Guide de l'Agent de Développement (Ralph-Style)

Ce fichier définit les règles de comportement pour la Gemini CLI. Tu dois le lire avant chaque session pour garantir la souveraineté du projet.

## 1. Vision et Vetos (Source de Vérité)
Le projet SOUVERAIN est une application desktop Electron "offline-first".
- **VETO CLOUD :** Interdiction d'utiliser des API Cloud pour l'IA du produit final. Tout doit passer par **Ollama** en local.
- **SÉCURITÉ :** Les données sensibles sont stockées dans une base **SQLite chiffrée** (AES-256).
- **HARDWARE :** Code optimisé pour CPU mobile (type Surface Pro 7).

## 2. Stack Technique
- **Frontend :** React, TypeScript, Tailwind CSS.
- **Backend :** Electron (Main process en `.cjs`), SQLite (better-sqlite3-multiple-ciphers).
- **Médias :** sharp, ffmpeg, pdf-parse.

## 3. Workflow Autonome (Le Rendu "Ralph")
Tu agis de manière proactive via les commandes `/dev` ou `/edit`. À chaque tâche réussie :

1. **Vérification TypeScript :** Assure-toi qu'aucune erreur de type ne subsiste dans les fichiers modifiés.
2. **Commits Atomiques :** Effectue un commit Git automatique pour chaque fonctionnalité ou correction validée.
   - *Format :* `feat(module): description` ou `fix(module): description`.
3. **Documentation Vivante :** Mets à jour la section **"ETAT ACTUEL"** de `SOUVERAIN-BRIEF.md` à la fin de chaque session.
   - Liste les implémentations réalisées.
   - Note les décisions techniques et les bugs résolus.
   - Définis la "Prochaine étape".

## 4. Focus Actuel : Phase D (Générateur de Portfolio)
- **Objectif :** Créer le moteur de rendu HTML/PDF à partir des assets et projets.
- **Modes :** Gérer le "Mode Indépendant" et le "Mode Commerce".
- **Anonymisation :** Respecter les tokens ([CLIENT_1], [ADRESSE], etc.) lors de l'export.

## 5. Commandes Utiles
- `npm start` : Lancement Electron + Vite.
- `/ide status` : Vérifier la connexion à Antigravity.
- `/dev "commande"` : Lancer une boucle d'itération autonome.