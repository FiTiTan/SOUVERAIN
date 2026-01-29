# MPF-1 : Sélection Portfolio & Chat IA Conversationnel

**Module:** Portfolio Maître SOUVERAIN
**Priorité:** 🔴 Critique
**Temps estimé:** 4-5h
**Prérequis:** Structure de base Electron fonctionnelle

---

## OBJECTIF

Créer le premier écran du module Portfolio Maître permettant :
1. Sélectionner un portfolio existant OU en créer un nouveau
2. Présenter la valeur ajoutée de l'outil
3. Guider l'utilisateur via un chat IA conversationnel (3 questions)

---

## ÉCRAN 1 : SÉLECTION / CRÉATION PORTFOLIO

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SOUVERAIN          Portfolio Maître                    [?] [⌘K]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  🎯 Portfolio Maître                                    │   │
│  │                                                         │   │
│  │  Créez une vitrine professionnelle complète qui        │   │
│  │  rassemble vos réalisations, votre identité et vos     │   │
│  │  informations pratiques en un seul endroit.            │   │
│  │                                                         │   │
│  │  ✓ Génération intelligente par IA locale               │   │
│  │  ✓ Données 100% privées et chiffrées                   │   │
│  │  ✓ Export HTML autonome sans dépendance                │   │
│  │  ✓ Publication en un clic sur souverain.io             │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Mes Portfolios                                                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │              │  │              │  │      +       │          │
│  │  Portfolio   │  │  Portfolio   │  │              │          │
│  │  Freelance   │  │  Boutique    │  │   Nouveau    │          │
│  │              │  │              │  │   Portfolio  │          │
│  │  Modifié     │  │  Modifié     │  │              │          │
│  │  il y a 2j   │  │  il y a 1sem │  │   [PREMIUM]  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ℹ️ Version gratuite : 1 portfolio | Premium : illimité        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Composant : `src/components/portfolio/master/PortfolioSelector.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Lock, Shield, Globe, FileDown } from 'lucide-react';

interface Portfolio {
  id: string;
  name: string;
  updatedAt: Date;
  thumbnail?: string;
  status: 'draft' | 'published';
}

interface PortfolioSelectorProps {
  onSelect: (portfolioId: string) => void;
  onCreate: () => void;
}

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({
  onSelect,
  onCreate,
}) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
    checkPremiumStatus();
  }, []);

  const loadPortfolios = async () => {
    try {
      const result = await window.electron.invoke('db-get-all-portfolios');
      setPortfolios(result || []);
    } catch (error) {
      console.error('Erreur chargement portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const status = await window.electron.invoke('get-premium-status');
      setIsPremium(status?.isPremium || false);
    } catch {
      setIsPremium(false);
    }
  };

  const canCreateNew = isPremium || portfolios.length === 0;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} sem`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header avec valeur ajoutée */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Portfolio Maître</h1>
          </div>
          <p className="text-blue-100 mb-6 max-w-xl">
            Créez une vitrine professionnelle complète qui rassemble vos réalisations, 
            votre identité et vos informations pratiques en un seul endroit.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>Génération intelligente par IA locale</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-300" />
              <span>Données 100% privées et chiffrées</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileDown className="w-4 h-4 text-blue-300" />
              <span>Export HTML autonome</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-blue-300" />
              <span>Publication sur souverain.io</span>
            </div>
          </div>
        </div>

        {/* Liste des portfolios */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">Mes Portfolios</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-zinc-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Portfolios existants */}
            {portfolios.map(portfolio => (
              <button
                key={portfolio.id}
                onClick={() => onSelect(portfolio.id)}
                className="group relative bg-white rounded-xl border border-zinc-200 p-6 text-left hover:border-blue-400 hover:shadow-lg transition-all"
              >
                {portfolio.thumbnail ? (
                  <div className="w-full h-20 bg-zinc-100 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={portfolio.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-3xl">📁</span>
                  </div>
                )}
                <h3 className="font-medium text-zinc-900 mb-1">{portfolio.name}</h3>
                <p className="text-sm text-zinc-500">
                  Modifié {formatDate(portfolio.updatedAt)}
                </p>
                {portfolio.status === 'published' && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    En ligne
                  </span>
                )}
              </button>
            ))}

            {/* Bouton Nouveau Portfolio */}
            <button
              onClick={canCreateNew ? onCreate : undefined}
              disabled={!canCreateNew}
              className={`relative flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed transition-all ${
                canCreateNew
                  ? 'border-zinc-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  : 'border-zinc-200 bg-zinc-50 cursor-not-allowed'
              }`}
            >
              {canCreateNew ? (
                <>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="font-medium text-zinc-700">Nouveau Portfolio</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-zinc-200 rounded-full flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-zinc-400" />
                  </div>
                  <span className="font-medium text-zinc-400">Nouveau Portfolio</span>
                  <span className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Premium requis
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Info limite */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          {isPremium ? (
            <span className="text-amber-600">✨ Premium actif — Portfolios illimités</span>
          ) : (
            <span>Version gratuite : 1 portfolio • <button className="text-blue-600 hover:underline">Passer Premium</button></span>
          )}
        </p>
      </div>
    </div>
  );
};

export default PortfolioSelector;
```

---

## ÉCRAN 2 : CRÉATION — CHOIX INITIAL

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour                              Étape 1/5 : Démarrage    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Créer votre Portfolio                        │
│                                                                 │
│         Comment souhaitez-vous commencer ?                      │
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │                             │  │                         │  │
│  │  🚀                         │  │  📥                     │  │
│  │                             │  │                         │  │
│  │  Partir de zéro             │  │  Importer un design     │  │
│  │                             │  │                         │  │
│  │  L'IA vous guide étape      │  │  Réutilisez un template │  │
│  │  par étape pour créer       │  │  que vous avez déjà     │  │
│  │  votre portfolio idéal      │  │  créé ou exporté        │  │
│  │                             │  │                         │  │
│  │  [Recommandé]               │  │  [Premium ✨]           │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Composant : `src/components/portfolio/master/CreationChoice.tsx`

```tsx
import React from 'react';
import { Rocket, Download, Sparkles, ArrowLeft } from 'lucide-react';

interface CreationChoiceProps {
  isPremium: boolean;
  onStartFromScratch: () => void;
  onImportDesign: () => void;
  onBack: () => void;
}

export const CreationChoice: React.FC<CreationChoiceProps> = ({
  isPremium,
  onStartFromScratch,
  onImportDesign,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <span className="text-sm text-zinc-500">Étape 1/5 : Démarrage</span>
        </div>

        {/* Titre */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Créer votre Portfolio
          </h1>
          <p className="text-zinc-600">
            Comment souhaitez-vous commencer ?
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Option 1 : Partir de zéro */}
          <button
            onClick={onStartFromScratch}
            className="group relative bg-white rounded-2xl border-2 border-zinc-200 p-8 text-left hover:border-blue-500 hover:shadow-xl transition-all"
          >
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Recommandé
              </span>
            </div>
            
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
              <Rocket className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Partir de zéro
            </h3>
            <p className="text-zinc-600">
              L'IA vous guide étape par étape pour créer votre portfolio idéal, 
              adapté à vos besoins et votre secteur.
            </p>
          </button>

          {/* Option 2 : Importer */}
          <button
            onClick={isPremium ? onImportDesign : undefined}
            disabled={!isPremium}
            className={`group relative bg-white rounded-2xl border-2 p-8 text-left transition-all ${
              isPremium
                ? 'border-zinc-200 hover:border-amber-500 hover:shadow-xl cursor-pointer'
                : 'border-zinc-100 bg-zinc-50 cursor-not-allowed'
            }`}
          >
            {!isPremium && (
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </span>
              </div>
            )}
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              isPremium 
                ? 'bg-amber-100 group-hover:bg-amber-200' 
                : 'bg-zinc-200'
            }`}>
              <Download className={`w-8 h-8 ${isPremium ? 'text-amber-600' : 'text-zinc-400'}`} />
            </div>
            
            <h3 className={`text-xl font-semibold mb-2 ${isPremium ? 'text-zinc-900' : 'text-zinc-400'}`}>
              Importer un design
            </h3>
            <p className={isPremium ? 'text-zinc-600' : 'text-zinc-400'}>
              Réutilisez un template ou un portfolio que vous avez 
              déjà créé ou exporté depuis SOUVERAIN.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreationChoice;
```

---

## ÉCRAN 3 : CHAT IA CONVERSATIONNEL (3 QUESTIONS)

### Logique du chat

Le chat pose 3 questions guidées avec des choix prédéfinis + champ libre optionnel.

**Question 1 — But du portfolio**
```
"Pour qui créez-vous ce portfolio ?"

Options :
- 👤 Moi-même (personnel / freelance)
- 🏢 Une entreprise
- 🏪 Une boutique / commerce
- 🍽️ Un restaurant / café
- ⚖️ Un cabinet (avocat, notaire, expert...)
- 🏥 Un praticien santé
- 🎨 Un projet artistique
- 📦 Autre (préciser)
```

**Question 2 — Critère fondamental (question ouverte guidée)**
```
"Quel est l'élément le plus important pour vous ?"

Options suggérées (multi-sélection possible) :
- 🎯 Attirer de nouveaux clients
- 💼 Montrer mon expertise / crédibilité
- 🖼️ Mettre en avant mes réalisations visuelles
- 📞 Faciliter la prise de contact
- 💰 Afficher mes tarifs / prestations
- ⭐ Inspirer confiance
- 🔍 Être trouvé sur Google
- ✏️ Autre (champ libre)
```

**Question 3 — Informations pratiques**
```
"Quelles informations pratiques souhaitez-vous afficher ?"

Options (multi-sélection) :
- 🕐 Horaires d'ouverture
- 📍 Adresse / localisation
- 📞 Téléphone
- 📧 Email de contact
- 💰 Tarifs / grille tarifaire
- 📅 Prise de rendez-vous
- 🌐 Réseaux sociaux
- ❌ Aucune information pratique
```

### Layout du chat

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour                            Étape 2/5 : Vos intentions │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🤖                                                       │   │
│  │                                                         │   │
│  │ Pour qui créez-vous ce portfolio ?                      │   │
│  │                                                         │   │
│  │ Cela m'aide à adapter le style et le contenu.          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ 👤      │ │ 🏢      │ │ 🏪      │ │ 🍽️      │              │
│  │Moi-même │ │Entreprise│ │Boutique │ │Restaurant│             │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ ⚖️      │ │ 🏥      │ │ 🎨      │ │ 📦      │              │
│  │ Cabinet │ │Praticien│ │Artistique│ │ Autre   │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│                                             [Continuer →]       │
└─────────────────────────────────────────────────────────────────┘
```

### Composant : `src/components/portfolio/master/IntentionChat.tsx`

```tsx
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, Check } from 'lucide-react';

interface IntentionData {
  portfolioTarget: string;
  portfolioTargetOther?: string;
  keyPriorities: string[];
  keyPriorityOther?: string;
  practicalInfo: string[];
}

interface IntentionChatProps {
  onComplete: (data: IntentionData) => void;
  onBack: () => void;
}

const TARGET_OPTIONS = [
  { id: 'personal', icon: '👤', label: 'Moi-même', desc: 'Personnel / Freelance' },
  { id: 'company', icon: '🏢', label: 'Une entreprise', desc: '' },
  { id: 'shop', icon: '🏪', label: 'Une boutique', desc: 'Commerce local' },
  { id: 'restaurant', icon: '🍽️', label: 'Un restaurant', desc: 'Café / Bar' },
  { id: 'cabinet', icon: '⚖️', label: 'Un cabinet', desc: 'Avocat, notaire...' },
  { id: 'health', icon: '🏥', label: 'Un praticien', desc: 'Santé / Bien-être' },
  { id: 'artistic', icon: '🎨', label: 'Un projet artistique', desc: '' },
  { id: 'other', icon: '📦', label: 'Autre', desc: 'Préciser' },
];

const PRIORITY_OPTIONS = [
  { id: 'attract_clients', icon: '🎯', label: 'Attirer de nouveaux clients' },
  { id: 'show_expertise', icon: '💼', label: 'Montrer mon expertise' },
  { id: 'showcase_work', icon: '🖼️', label: 'Mettre en avant mes réalisations' },
  { id: 'easy_contact', icon: '📞', label: 'Faciliter la prise de contact' },
  { id: 'show_pricing', icon: '💰', label: 'Afficher mes tarifs' },
  { id: 'build_trust', icon: '⭐', label: 'Inspirer confiance' },
  { id: 'seo', icon: '🔍', label: 'Être trouvé sur Google' },
  { id: 'other', icon: '✏️', label: 'Autre' },
];

const PRACTICAL_INFO_OPTIONS = [
  { id: 'hours', icon: '🕐', label: 'Horaires d\'ouverture' },
  { id: 'address', icon: '📍', label: 'Adresse / localisation' },
  { id: 'phone', icon: '📞', label: 'Téléphone' },
  { id: 'email', icon: '📧', label: 'Email de contact' },
  { id: 'pricing', icon: '💰', label: 'Tarifs / grille tarifaire' },
  { id: 'booking', icon: '📅', label: 'Prise de rendez-vous' },
  { id: 'socials', icon: '🌐', label: 'Réseaux sociaux' },
  { id: 'none', icon: '❌', label: 'Aucune information pratique' },
];

export const IntentionChat: React.FC<IntentionChatProps> = ({
  onComplete,
  onBack,
}) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntentionData>({
    portfolioTarget: '',
    portfolioTargetOther: '',
    keyPriorities: [],
    keyPriorityOther: '',
    practicalInfo: [],
  });

  const totalSteps = 3;

  const handleTargetSelect = (targetId: string) => {
    setData(prev => ({ ...prev, portfolioTarget: targetId }));
  };

  const togglePriority = (priorityId: string) => {
    setData(prev => ({
      ...prev,
      keyPriorities: prev.keyPriorities.includes(priorityId)
        ? prev.keyPriorities.filter(p => p !== priorityId)
        : [...prev.keyPriorities, priorityId],
    }));
  };

  const togglePracticalInfo = (infoId: string) => {
    if (infoId === 'none') {
      setData(prev => ({ ...prev, practicalInfo: ['none'] }));
      return;
    }
    setData(prev => ({
      ...prev,
      practicalInfo: prev.practicalInfo.includes('none')
        ? [infoId]
        : prev.practicalInfo.includes(infoId)
          ? prev.practicalInfo.filter(i => i !== infoId)
          : [...prev.practicalInfo, infoId],
    }));
  };

  const canContinue = () => {
    switch (step) {
      case 1: return data.portfolioTarget !== '';
      case 2: return data.keyPriorities.length > 0;
      case 3: return data.practicalInfo.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const renderQuestion = () => {
    switch (step) {
      case 1:
        return (
          <>
            {/* Message IA */}
            <div className="flex gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-zinc-100 max-w-lg">
                <p className="font-medium text-zinc-900 mb-1">
                  Pour qui créez-vous ce portfolio ?
                </p>
                <p className="text-sm text-zinc-500">
                  Cela m'aide à adapter le style et le contenu à votre situation.
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TARGET_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleTargetSelect(option.id)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    data.portfolioTarget === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <span className="text-2xl mb-2">{option.icon}</span>
                  <span className="font-medium text-zinc-900 text-sm text-center">
                    {option.label}
                  </span>
                  {option.desc && (
                    <span className="text-xs text-zinc-500 text-center mt-0.5">
                      {option.desc}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Champ "Autre" */}
            {data.portfolioTarget === 'other' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={data.portfolioTargetOther}
                  onChange={e => setData(prev => ({ ...prev, portfolioTargetOther: e.target.value }))}
                  placeholder="Précisez..."
                  className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </>
        );

      case 2:
        return (
          <>
            {/* Message IA */}
            <div className="flex gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-zinc-100 max-w-lg">
                <p className="font-medium text-zinc-900 mb-1">
                  Quel est l'élément le plus important pour vous ?
                </p>
                <p className="text-sm text-zinc-500">
                  Sélectionnez une ou plusieurs priorités. Je mettrai l'accent dessus.
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {PRIORITY_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => togglePriority(option.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    data.keyPriorities.includes(option.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium text-zinc-900 text-sm">
                    {option.label}
                  </span>
                  {data.keyPriorities.includes(option.id) && (
                    <Check className="w-4 h-4 text-blue-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Champ "Autre" */}
            {data.keyPriorities.includes('other') && (
              <div className="mt-4">
                <input
                  type="text"
                  value={data.keyPriorityOther}
                  onChange={e => setData(prev => ({ ...prev, keyPriorityOther: e.target.value }))}
                  placeholder="Précisez votre priorité..."
                  className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </>
        );

      case 3:
        return (
          <>
            {/* Message IA */}
            <div className="flex gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-zinc-100 max-w-lg">
                <p className="font-medium text-zinc-900 mb-1">
                  Dernière question ! Quelles informations pratiques afficher ?
                </p>
                <p className="text-sm text-zinc-500">
                  Ces informations seront mises en avant sur votre portfolio.
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {PRACTICAL_INFO_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => togglePracticalInfo(option.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    data.practicalInfo.includes(option.id)
                      ? option.id === 'none' 
                        ? 'border-zinc-500 bg-zinc-100'
                        : 'border-blue-500 bg-blue-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium text-zinc-900 text-sm">
                    {option.label}
                  </span>
                  {data.practicalInfo.includes(option.id) && (
                    <Check className={`w-4 h-4 ml-auto ${option.id === 'none' ? 'text-zinc-600' : 'text-blue-600'}`} />
                  )}
                </button>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <span className="text-sm text-zinc-500">
            Étape 2/5 : Vos intentions ({step}/3)
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        {renderQuestion()}

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleNext}
            disabled={!canContinue()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              canContinue()
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            {step === totalSteps ? 'Terminer' : 'Continuer'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntentionChat;
```

---

## HANDLERS IPC À AJOUTER

Dans `main.cjs` :

```javascript
// Récupérer tous les portfolios
ipcMain.handle('db-get-all-portfolios', async () => {
  return db.portfolios_getAll();
});

// Créer un nouveau portfolio
ipcMain.handle('db-create-portfolio', async (event, { name }) => {
  const id = crypto.randomUUID();
  return db.portfolios_insert({ id, name, created_at: new Date().toISOString() });
});

// Sauvegarder les intentions
ipcMain.handle('db-save-portfolio-intentions', async (event, { portfolioId, intentions }) => {
  return db.portfolios_updateIntentions(portfolioId, JSON.stringify(intentions));
});

// Vérifier statut premium
ipcMain.handle('get-premium-status', async () => {
  // Pour l'instant, retourner false
  // À implémenter avec la logique de licence
  return { isPremium: false };
});
```

Dans `database.cjs` :

```javascript
portfolios_getAll() {
  return this.db.prepare('SELECT * FROM portfolios ORDER BY updated_at DESC').all();
}

portfolios_insert(data) {
  const stmt = this.db.prepare(`
    INSERT INTO portfolios (id, name, created_at, updated_at) 
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(data.id, data.name, data.created_at, data.created_at);
}

portfolios_updateIntentions(portfolioId, intentionsJson) {
  const stmt = this.db.prepare(`
    UPDATE portfolios SET intention_form_json = ?, updated_at = ? WHERE id = ?
  `);
  return stmt.run(intentionsJson, new Date().toISOString(), portfolioId);
}
```

---

## FICHIERS À CRÉER

1. `src/components/portfolio/master/PortfolioSelector.tsx`
2. `src/components/portfolio/master/CreationChoice.tsx`
3. `src/components/portfolio/master/IntentionChat.tsx`
4. `src/components/portfolio/master/index.ts` (exports)

## FICHIERS À MODIFIER

1. `main.cjs` — Ajouter handlers IPC
2. `database.cjs` — Ajouter fonctions DB
3. `src/components/portfolio/PortfolioHub.tsx` — Intégrer le nouveau flux

---

## TESTS DE VALIDATION

1. ✅ Accès module Portfolio → Écran sélection affiché
2. ✅ Clic "Nouveau Portfolio" → Écran choix (zéro / import)
3. ✅ Clic "Partir de zéro" → Chat IA démarre
4. ✅ Question 1 → Sélection target fonctionne
5. ✅ Question 2 → Multi-sélection priorités fonctionne
6. ✅ Question 3 → Multi-sélection infos pratiques fonctionne
7. ✅ Terminer → Données sauvegardées en DB
8. ✅ Premium désactivé → Import design grisé
9. ✅ 1 portfolio existant + gratuit → Nouveau grisé avec badge Premium

---

**Fin du brief MPF-1**
