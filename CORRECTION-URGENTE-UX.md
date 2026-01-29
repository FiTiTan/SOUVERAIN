# CORRECTION URGENTE - BUGS CRITIQUES UX/UI

**Date:** 23 janvier 2026
**Priorité:** BLOQUANT - À faire AVANT les corrections P2/P3
**Temps estimé:** 2-3h

---

## PROBLÈMES IDENTIFIÉS

### ❌ BUG 1 : Bouton "Nouveau Projet" non fonctionnel
Le bouton existe mais ne déclenche rien au clic.

### ❌ BUG 2 : Formulaire secteur affiché au mauvais endroit
Le formulaire "Personnalisez votre portfolio" avec les secteurs apparaît sur la page d'accueil des projets. 
- Il devrait apparaître UNIQUEMENT au premier accès (onboarding)
- OU dans les paramètres du portfolio
- PAS en bas de la liste des projets

### ❌ BUG 3 : Design non conforme à l'UI existante
- Les pills de secteur ont un style "outline" basique
- Pas de cohérence avec le dark theme zinc de SOUVERAIN
- Boutons "Retour/Terminer" sans style

---

## CORRECTION BUG 1 : BOUTON NOUVEAU PROJET

### Diagnostic
Vérifier dans `src/components/portfolio/projects/ProjectHub.tsx` ou équivalent :

```tsx
// PROBLÈME PROBABLE :
<button onClick={handleNewProject}>+ Nouveau Projet</button>

// La fonction handleNewProject est-elle définie ?
// Le state showWizard est-il utilisé ?
```

### Solution

```tsx
// Dans le composant ProjectHub ou ProjectsPage :

const [showWizard, setShowWizard] = useState(false);

const handleNewProject = () => {
  console.log('Opening wizard...'); // Debug
  setShowWizard(true);
};

// Dans le render :
<button 
  onClick={handleNewProject}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
>
  <Plus className="w-4 h-4" />
  Nouveau Projet
</button>

// Et le wizard conditionnel :
{showWizard && (
  <ProjectCreationWizard
    portfolioId={portfolioId}
    onClose={() => setShowWizard(false)}
    onComplete={(project) => {
      setShowWizard(false);
      // Refresh la liste des projets
      loadProjects();
    }}
  />
)}
```

### Test de validation
- ✅ Cliquer "Nouveau Projet" → Wizard s'ouvre
- ✅ Console.log visible pour debug si besoin

---

## CORRECTION BUG 2 : FORMULAIRE SECTEUR MAL PLACÉ

### Problème actuel
Le bloc "Personnalisez votre portfolio / Dans quel secteur travaillez-vous ?" est rendu directement dans la page Projets.

### Règle UX correcte

```
PREMIER ACCÈS AU PORTFOLIO (pas de projets, pas d'intention remplie)
  → Afficher formulaire intention en PLEIN ÉCRAN (modal/overlay)
  → Une fois rempli, ne plus jamais l'afficher automatiquement

PAGE PROJETS (après onboarding)
  → Liste des projets uniquement
  → Boutons : Paramètres / Exporter / Nouveau Projet
  → PAS de formulaire intention visible

PARAMÈTRES PORTFOLIO
  → Résumé des intentions (IntentionSummary)
  → Bouton "Modifier" pour réouvrir le formulaire
```

### Solution

#### 1. Supprimer le formulaire de ProjectHub/ProjectsPage

```tsx
// SUPPRIMER ce genre de code de la page Projets :
<div className="mt-8">
  <h2>Personnalisez votre portfolio</h2>
  <p>Dans quel secteur travaillez-vous ?</p>
  {/* ... secteurs ... */}
</div>
```

#### 2. Gérer l'onboarding au niveau PortfolioHub

```tsx
// Dans PortfolioHub.tsx (composant parent)

const [showOnboarding, setShowOnboarding] = useState(false);
const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

useEffect(() => {
  const checkOnboarding = async () => {
    const completed = await hasCompletedIntention(portfolioId);
    setHasCompletedOnboarding(completed);
    if (!completed) {
      setShowOnboarding(true);
    }
  };
  checkOnboarding();
}, [portfolioId]);

// AVANT de rendre les onglets (Médiathèque/Projets/Comptes) :
if (hasCompletedOnboarding === null) {
  return <LoadingSpinner />;
}

if (showOnboarding) {
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-8">
      <IntentionForm
        onComplete={async (data) => {
          await saveIntention(portfolioId, data);
          setShowOnboarding(false);
          setHasCompletedOnboarding(true);
        }}
        onSkip={() => {
          setShowOnboarding(false);
          setHasCompletedOnboarding(true);
        }}
      />
    </div>
  );
}

// Sinon, afficher l'interface normale avec onglets
return (
  <div>
    <Tabs>...</Tabs>
  </div>
);
```

### Test de validation
- ✅ Premier accès → Formulaire plein écran
- ✅ Après avoir rempli → Page projets sans formulaire
- ✅ Retour sur portfolio → Pas de formulaire (déjà fait)
- ✅ Paramètres → Résumé visible avec bouton Modifier

---

## CORRECTION BUG 3 : DESIGN COMPLIANCE

### Problème
Les composants ajoutés ne respectent pas le design system SOUVERAIN :
- Dark theme : `bg-zinc-950`, `bg-zinc-900`, `bg-zinc-800`
- Borders : `border-zinc-800`, `border-zinc-700`
- Text : `text-white`, `text-zinc-400`, `text-zinc-500`
- Accent : `bg-blue-600`, `hover:bg-blue-500`

### Référence visuelle (depuis le screenshot)

```
Header : bg-white avec texte noir (light mode partiel)
Tabs : underline bleu sur actif
Cards : bg-white avec border gris clair, coins arrondis
Boutons primaires : bg-blue-600 text-white rounded-lg
Boutons secondaires : border border-blue-600 text-blue-600 bg-transparent
```

### Pills de secteur - Style correct

```tsx
// AVANT (incorrect) :
<button className="border px-2 py-1">
  Tech / Digital
</button>

// APRÈS (conforme) :
<button 
  className={`
    flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
    ${isSelected 
      ? 'bg-blue-600 text-white border-blue-600' 
      : 'bg-white text-zinc-700 border-zinc-300 hover:border-blue-400 hover:bg-blue-50'
    }
  `}
>
  <span>💻</span>
  <span>Tech / Digital</span>
</button>
```

### Boutons Retour/Terminer - Style correct

```tsx
// AVANT (incorrect) :
<button>Retour</button>
<button>Terminer</button>

// APRÈS (conforme) :
<div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200">
  <button 
    onClick={handleBack}
    className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
  >
    <ChevronLeft className="w-4 h-4" />
    Retour
  </button>
  
  <button 
    onClick={handleComplete}
    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
  >
    Terminer
  </button>
</div>
```

### Zone vide "Aucun projet" - Style correct

```tsx
// Style conforme :
<div className="flex flex-col items-center justify-center py-16 px-8 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50">
  <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mb-4">
    <Folder className="w-8 h-8 text-zinc-400" />
  </div>
  <p className="text-zinc-600 text-center mb-2">
    Aucun projet.
  </p>
  <p className="text-zinc-400 text-sm text-center">
    Cliquez sur "Nouveau Projet" pour commencer l'expérience IA.
  </p>
</div>
```

---

## CHECKLIST DESIGN SYSTEM

Avant de valider une correction, vérifier :

| Élément | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background page | `bg-white` ou `bg-zinc-50` | `bg-zinc-950` |
| Background card | `bg-white` | `bg-zinc-900` |
| Background input | `bg-white` | `bg-zinc-800` |
| Border | `border-zinc-200` ou `border-zinc-300` | `border-zinc-700` ou `border-zinc-800` |
| Text primary | `text-zinc-900` | `text-white` |
| Text secondary | `text-zinc-600` | `text-zinc-400` |
| Text muted | `text-zinc-400` | `text-zinc-500` |
| Button primary | `bg-blue-600 text-white` | idem |
| Button hover | `hover:bg-blue-500` | idem |
| Selected state | `bg-blue-600 text-white` ou `bg-blue-50 border-blue-500` | `bg-blue-600 text-white` ou `bg-blue-500/10 border-blue-500` |

**Note :** D'après le screenshot, l'app semble être en **Light Mode**. Respecter ce mode.

---

## FICHIERS À VÉRIFIER/MODIFIER

1. `src/components/portfolio/projects/ProjectHub.tsx` ou `ProjectsPage.tsx`
   - Supprimer le formulaire intention inline
   - Vérifier que `handleNewProject` fonctionne

2. `src/components/portfolio/PortfolioHub.tsx`
   - Gérer l'onboarding en overlay plein écran
   - Conditionner l'affichage des onglets

3. `src/components/portfolio/intention/IntentionForm.tsx`
   - Appliquer les styles conformes (pills, boutons)

4. Tout composant avec des boutons/pills/cards
   - Vérifier conformité design system

---

## ORDRE D'EXÉCUTION

1. **D'abord** : Fix bouton "Nouveau Projet" (5 min)
   - Ajouter console.log pour debug
   - Vérifier que setShowWizard est appelé

2. **Ensuite** : Déplacer le formulaire intention (30 min)
   - Supprimer de ProjectHub
   - Ajouter overlay dans PortfolioHub

3. **Enfin** : Corriger les styles (1h)
   - Pills de secteur
   - Boutons navigation
   - Zone vide

---

## COMMANDE GEMINI SUGGÉRÉE

```
Lis CORRECTION-URGENTE-UX.md

PROBLÈME CRITIQUE : Le bouton "Nouveau Projet" ne fonctionne pas.

1. Trouve le fichier qui contient ce bouton (probablement ProjectHub.tsx ou ProjectsPage.tsx)
2. Vérifie que la fonction onClick est bien définie et appelle setShowWizard(true)
3. Ajoute un console.log('Click nouveau projet') pour debug
4. Vérifie que le composant ProjectCreationWizard est bien importé et rendu conditionnellement

Montre-moi le code actuel avant de modifier.
```

---

## VALIDATION FINALE

Après corrections :

1. ✅ Cliquer "Nouveau Projet" → Wizard s'ouvre
2. ✅ Page Projets → PAS de formulaire secteur visible
3. ✅ Premier accès portfolio → Formulaire intention en overlay
4. ✅ Styles cohérents avec le reste de l'app (Light Mode)
5. ✅ Pills et boutons ont le bon style

---

**Ce brief corrige les problèmes AVANT de continuer sur P2/P3.**
**Sans ces fixes, l'app n'est pas utilisable.**
