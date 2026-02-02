# Module E-Réputation

Dashboard de pilotage de la présence en ligne et de la visibilité professionnelle.

## 🎯 Fonctionnalités

### Score Global (0-100)
Calculé à partir de 4 composantes :
- **Complétude du profil** (30%) : CV, Portfolio, Photo, Bio, Coordonnées
- **Présence sociale** (25%) : Réseaux connectés + score de chaque plateforme
- **Fraîcheur du contenu** (25%) : Date de dernière mise à jour
- **Engagement** (20%) : Interactions (likes, comments, stars)

### Actions Recommandées
Suggestions priorisées pour améliorer le score :
- Impact quantifié (+X points)
- 3 niveaux de priorité (Urgent / Important / Plus tard)
- Actions internes (routage dans l'app) ou externes (liens)
- Tri par impact décroissant

### Plateformes Sociales
- Statut de connexion (connecté / non connecté)
- Score individuel par plateforme
- Détection d'anomalies (photo manquante, bio vide, etc.)
- Boutons de connexion

### Objectifs & Milestones
- Score cible paramétrable
- Jalons (Débutant 60+ / Intermédiaire 75+ / Expert 90+)
- Visualisation des paliers atteints

## 📁 Structure

```
reputation/
├── ReputationDashboard.tsx    # Page principale
├── ScoreGauge.tsx              # Jauge circulaire animée
├── ActionCard.tsx              # Card action cliquable
├── ScoreBreakdown.tsx          # Détail des composantes
├── SocialPlatforms.tsx         # Liste plateformes sociales
└── index.ts                    # Exports

services/
└── reputationService.ts        # Logique métier (calcul score, actions)

types/
└── reputation.ts               # Types TypeScript
```

## 🚀 Intégration

**Sidebar :**
- Icône : TrendingUp (📈)
- Position : 2ème item (après CV Coach)
- Raccourci : `Ctrl+2` / `Cmd+2`
- Couleur : Jaune/Doré (#F59E0B)

**Shell :**
- Lazy loading du module
- Fallback de chargement

## 🎨 Design

### Couleurs Score
- **80-100** : Vert (#10B981)
- **60-79** : Orange (#F59E0B)
- **0-59** : Rouge (#EF4444)

### Animations
- Jauge : transition 1s ease-in-out
- Cards : hover effect (transform, border)
- Progress bars : width transition 0.5s

## 📊 Données Mock (TODO: Remplacer par API)

Actuellement les données sont mockées :
- Score global : calculé dynamiquement
- Évolution : 30 derniers jours simulés
- Plateformes : LinkedIn + GitHub connectés, Twitter non
- Actions : générées selon score

### TODO Intégrations Futures
- [ ] LinkedIn API (profil, posts, engagement)
- [ ] GitHub API (repos, stars, contributions)
- [ ] Database locale (save/load score historique)
- [ ] Twitter/X API
- [ ] Instagram API (si pertinent)
- [ ] Portfolio analytics (si hébergé)

## 🧪 Tests

Pour tester le module :
1. Lancer l'app : `npm run dev`
2. Sidebar → "E-Réputation" (2ème item)
3. Ou raccourci : `Ctrl+2`

Le dashboard affiche :
- Score global autour de 75/100
- 4 composantes détaillées
- 2-3 actions prioritaires
- 3 plateformes (2 connectées, 1 non)
- Objectif 90 points avec jalons

## 🎯 Roadmap

**Phase 1** (Actuelle) : Dashboard avec données mockées ✅
**Phase 2** : Intégration LinkedIn API
**Phase 3** : Intégration GitHub API
**Phase 4** : Historique local (SQLite)
**Phase 5** : Système de notifications (alertes score)
**Phase 6** : Export rapports PDF
