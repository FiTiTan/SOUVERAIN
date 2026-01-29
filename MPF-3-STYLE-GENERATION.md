# MPF-3 : Suggestion Style, Preview & Génération

**Module:** Portfolio Maître SOUVERAIN
**Priorité:** 🟡 Final
**Temps estimé:** 4-5h
**Prérequis:** MPF-1 et MPF-2 complétés

---

## OBJECTIF

Créer les écrans finaux permettant :
1. Suggérer un style basé sur l'analyse IA du contenu
2. Permettre à l'utilisateur de choisir/refuser la suggestion
3. Afficher un récapitulatif avant génération
4. Anonymiser les données localement via Ollama
5. Générer le portfolio final

---

## LES 6 STYLES DISPONIBLES

| Style | Cible | Caractéristiques |
|-------|-------|------------------|
| **MODERNE** | Freelance tech, startup, digital | Bento grid, Inter, gradients, animations |
| **CLASSIQUE** | Consultant, expert, libéral | Colonnes, Serif, bleu marine, sobre |
| **AUTHENTIQUE** | Artisan, métier manuel, local | Hero fullwidth, tons terre, photos terrain |
| **ARTISTIQUE** | Photographe, artiste, créatif | Masonry, minimal, noir/blanc, 90% images |
| **VITRINE** | Boutique, restaurant, commerce | Infos pratiques sticky, horaires, avis |
| **FORMEL** | Cabinet, notaire, institution | Sections numérotées, serif, bleu/or |

---

## LOGIQUE DE SUGGESTION IA

### Règles de décision

```
SI portfolioTarget = "shop" OU "restaurant"
   ET practicalInfo contient "hours" OU "address"
   → VITRINE (90% confiance)

SI portfolioTarget = "cabinet" OU "health"
   → FORMEL (85% confiance)

SI portfolioTarget = "artistic"
   OU (images > 10 ET priorité = "showcase_work")
   → ARTISTIQUE (85% confiance)

SI hasLinkedIn = true
   ET priorité contient "attract_clients" OU "show_expertise"
   → MODERNE (80% confiance)

SI portfolioTarget = "company"
   ET priorité contient "build_trust"
   → CLASSIQUE (80% confiance)

SI portfolioTarget = "personal"
   ET practicalInfo contient "pricing" OU "booking"
   → AUTHENTIQUE (75% confiance)

SINON
   → MODERNE (60% confiance, défaut)
```

---

## ÉCRAN 6 : SUGGESTION DE STYLE

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour                          Étape 5/5 : Votre style      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🤖                                                       │   │
│  │                                                         │   │
│  │ Basé sur vos réponses, je vous suggère le style...      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  ✨ MODERNE                              [Suggéré 85%]  │   │
│  │                                                         │   │
│  │  Dynamique et connecté                                  │   │
│  │                                                         │   │
│  │  Idéal pour : Freelance tech, startup, créatif digital  │   │
│  │                                                         │   │
│  │  • Layouts bento grid, cards carousel                   │   │
│  │  • Typographie Inter, moderne                           │   │
│  │  • Couleurs vives, gradients                            │   │
│  │  • Animations subtiles                                  │   │
│  │                                                         │   │
│  │  [████████░░] Preview                                   │   │
│  │                                                         │   │
│  │         [Choisir ce style]                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Ou choisissez un autre style :                                 │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Classique│ │Authentiq│ │Artistiq │ │ Vitrine │ │ Formel  │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Composant : `src/components/portfolio/master/StyleSuggestion.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Check, Bot } from 'lucide-react';

interface StyleConfig {
  id: string;
  name: string;
  tagline: string;
  idealFor: string;
  features: string[];
  colors: { primary: string; accent: string; bg: string };
  preview: string;
}

const STYLES: StyleConfig[] = [
  {
    id: 'moderne',
    name: 'Moderne',
    tagline: 'Dynamique et connecté',
    idealFor: 'Freelance tech, startup, créatif digital',
    features: ['Bento grid', 'Typo Inter', 'Gradients', 'Animations'],
    colors: { primary: '#3b82f6', accent: '#8b5cf6', bg: '#f8fafc' },
    preview: '/previews/moderne.png',
  },
  {
    id: 'classique',
    name: 'Classique',
    tagline: 'Sobre et structuré',
    idealFor: 'Consultant, expert, profession libérale',
    features: ['Colonnes', 'Typo Serif', 'Bleu marine', 'Sans animation'],
    colors: { primary: '#1e3a5f', accent: '#d4af37', bg: '#fafafa' },
    preview: '/previews/classique.png',
  },
  {
    id: 'authentique',
    name: 'Authentique',
    tagline: 'Chaleureux et terrain',
    idealFor: 'Artisan, métier manuel, service local',
    features: ['Hero fullwidth', 'Tons terre', 'Photos terrain', 'Confortable'],
    colors: { primary: '#b45309', accent: '#059669', bg: '#fffbeb' },
    preview: '/previews/authentique.png',
  },
  {
    id: 'artistique',
    name: 'Artistique',
    tagline: "L'image avant tout",
    idealFor: 'Photographe, artiste, architecte',
    features: ['Masonry', 'Minimal', 'Noir/blanc', '90% images'],
    colors: { primary: '#18181b', accent: '#71717a', bg: '#ffffff' },
    preview: '/previews/artistique.png',
  },
  {
    id: 'vitrine',
    name: 'Vitrine',
    tagline: 'Pratique et accueillant',
    idealFor: 'Boutique, restaurant, commerce local',
    features: ['Infos sticky', 'Horaires', 'Galerie produits', 'Avis'],
    colors: { primary: '#dc2626', accent: '#16a34a', bg: '#fef2f2' },
    preview: '/previews/vitrine.png',
  },
  {
    id: 'formel',
    name: 'Formel',
    tagline: 'Institutionnel et rigoureux',
    idealFor: 'Cabinet, notaire, institution',
    features: ['Sections numérotées', 'Serif', 'Bleu/or', 'Strict'],
    colors: { primary: '#1e3a5f', accent: '#b8860b', bg: '#f8fafc' },
    preview: '/previews/formel.png',
  },
];

interface StyleSuggestion {
  styleId: string;
  confidence: number;
  reason: string;
}

interface StyleSuggestionProps {
  suggestion: StyleSuggestion;
  onSelect: (styleId: string) => void;
  onBack: () => void;
}

export const StyleSuggestionScreen: React.FC<StyleSuggestionProps> = ({
  suggestion,
  onSelect,
  onBack,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const suggestedStyle = STYLES.find(s => s.id === suggestion.styleId);
  const otherStyles = STYLES.filter(s => s.id !== suggestion.styleId);

  const handleConfirm = () => {
    const finalStyle = selectedStyle || suggestion.styleId;
    onSelect(finalStyle);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <span className="text-sm text-zinc-500">Étape 5/5 : Votre style</span>
        </div>

        {/* Message IA */}
        <div className="flex gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-zinc-100 max-w-lg">
            <p className="font-medium text-zinc-900 mb-1">
              Basé sur vos réponses, je vous suggère...
            </p>
            <p className="text-sm text-zinc-500">
              {suggestion.reason}
            </p>
          </div>
        </div>

        {/* Style suggéré */}
        {suggestedStyle && (
          <div 
            className={`mb-8 p-6 rounded-2xl border-2 transition-all ${
              selectedStyle === null || selectedStyle === suggestedStyle.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-zinc-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {suggestedStyle.name}
                  </h3>
                  <p className="text-zinc-600">{suggestedStyle.tagline}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                Suggéré {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>

            <p className="text-sm text-zinc-500 mb-4">
              <strong>Idéal pour :</strong> {suggestedStyle.idealFor}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {suggestedStyle.features.map(feature => (
                <span 
                  key={feature}
                  className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-sm text-zinc-700"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Preview couleurs */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-zinc-500">Couleurs :</span>
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: suggestedStyle.colors.primary }}
              />
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: suggestedStyle.colors.accent }}
              />
              <div 
                className="w-8 h-8 rounded-full border-2 border-zinc-200"
                style={{ backgroundColor: suggestedStyle.colors.bg }}
              />
            </div>

            <button
              onClick={() => {
                setSelectedStyle(suggestedStyle.id);
                handleConfirm();
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
            >
              Choisir ce style
            </button>
          </div>
        )}

        {/* Autres styles */}
        <div>
          <p className="text-sm font-medium text-zinc-700 mb-4">
            Ou choisissez un autre style :
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherStyles.map(style => (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedStyle(style.id);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-lg mb-2"
                  style={{ backgroundColor: style.colors.primary }}
                />
                <p className="font-medium text-zinc-900 text-sm">{style.name}</p>
                <p className="text-xs text-zinc-500 truncate">{style.tagline}</p>
              </button>
            ))}
          </div>

          {selectedStyle && selectedStyle !== suggestion.styleId && (
            <button
              onClick={handleConfirm}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
            >
              Valider le style {STYLES.find(s => s.id === selectedStyle)?.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleSuggestionScreen;
```

---

## ÉCRAN 7 : RÉCAPITULATIF & GÉNÉRATION

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour                              Prêt à générer !         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  🎉 Votre portfolio est prêt à être généré              │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Récapitulatif                                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎯 Type          │  Freelance personnel                 │   │
│  │ 📝 Priorités     │  Attirer clients, Montrer expertise  │   │
│  │ 📍 Infos         │  Email, Téléphone, Réseaux sociaux   │   │
│  │ 📁 Projets       │  3 projets sélectionnés              │   │
│  │ 🖼️ Médias        │  8 images, 2 PDF                     │   │
│  │ 💼 LinkedIn      │  Profil importé                      │   │
│  │ 🎨 Style         │  Moderne                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔒 Protection des données                               │   │
│  │                                                         │   │
│  │ Vos données seront anonymisées localement avant        │   │
│  │ traitement par l'IA. Aucune donnée n'est envoyée       │   │
│  │ vers le cloud.                                          │   │
│  │                                                         │   │
│  │ ☑️ J'ai compris                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                        [🚀 Générer mon portfolio]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Composant : `src/components/portfolio/master/GenerationRecap.tsx`

```tsx
import React, { useState } from 'react';
import { ArrowLeft, Target, FileText, MapPin, Folder, Image, Linkedin, Palette, Shield, Rocket, Check } from 'lucide-react';

interface PortfolioData {
  intentions: {
    portfolioTarget: string;
    keyPriorities: string[];
    practicalInfo: string[];
  };
  projects: {
    selectedIds: string[];
    linkedInData?: { profileUrl?: string; rawContent?: string };
    notionData?: { pageContent?: string };
  };
  media: {
    files: Array<{ name: string; type: string }>;
  };
  style: string;
}

interface GenerationRecapProps {
  data: PortfolioData;
  onGenerate: () => void;
  onBack: () => void;
}

const TARGET_LABELS: Record<string, string> = {
  personal: 'Personnel / Freelance',
  company: 'Entreprise',
  shop: 'Boutique / Commerce',
  restaurant: 'Restaurant / Café',
  cabinet: 'Cabinet professionnel',
  health: 'Praticien santé',
  artistic: 'Projet artistique',
  other: 'Autre',
};

const PRIORITY_LABELS: Record<string, string> = {
  attract_clients: 'Attirer des clients',
  show_expertise: 'Montrer expertise',
  showcase_work: 'Mettre en avant réalisations',
  easy_contact: 'Faciliter contact',
  show_pricing: 'Afficher tarifs',
  build_trust: 'Inspirer confiance',
  seo: 'Visibilité Google',
};

const INFO_LABELS: Record<string, string> = {
  hours: 'Horaires',
  address: 'Adresse',
  phone: 'Téléphone',
  email: 'Email',
  pricing: 'Tarifs',
  booking: 'RDV',
  socials: 'Réseaux sociaux',
  none: 'Aucune',
};

const STYLE_LABELS: Record<string, string> = {
  moderne: 'Moderne',
  classique: 'Classique',
  authentique: 'Authentique',
  artistique: 'Artistique',
  vitrine: 'Vitrine',
  formel: 'Formel',
};

export const GenerationRecap: React.FC<GenerationRecapProps> = ({
  data,
  onGenerate,
  onBack,
}) => {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const mediaStats = {
    images: data.media.files.filter(f => f.type.startsWith('image/')).length,
    videos: data.media.files.filter(f => f.type.startsWith('video/')).length,
    pdfs: data.media.files.filter(f => f.type.includes('pdf')).length,
    docs: data.media.files.filter(f => 
      f.type.includes('document') || f.type.includes('word')
    ).length,
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerate();
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <span className="text-sm text-zinc-500">Prêt à générer !</span>
        </div>

        {/* Titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Votre portfolio est prêt à être généré
          </h1>
          <p className="text-zinc-600">
            Vérifiez le récapitulatif avant de lancer la génération
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100 mb-6">
          
          {/* Type */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Type de portfolio</p>
              <p className="font-medium text-zinc-900">
                {TARGET_LABELS[data.intentions.portfolioTarget] || data.intentions.portfolioTarget}
              </p>
            </div>
          </div>

          {/* Priorités */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Priorités</p>
              <p className="font-medium text-zinc-900">
                {data.intentions.keyPriorities.map(p => PRIORITY_LABELS[p] || p).join(', ')}
              </p>
            </div>
          </div>

          {/* Infos pratiques */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Informations pratiques</p>
              <p className="font-medium text-zinc-900">
                {data.intentions.practicalInfo.map(i => INFO_LABELS[i] || i).join(', ')}
              </p>
            </div>
          </div>

          {/* Projets */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Projets</p>
              <p className="font-medium text-zinc-900">
                {data.projects.selectedIds.length} projet{data.projects.selectedIds.length > 1 ? 's' : ''} sélectionné{data.projects.selectedIds.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Médias */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Médias</p>
              <p className="font-medium text-zinc-900">
                {[
                  mediaStats.images > 0 && `${mediaStats.images} image${mediaStats.images > 1 ? 's' : ''}`,
                  mediaStats.videos > 0 && `${mediaStats.videos} vidéo${mediaStats.videos > 1 ? 's' : ''}`,
                  mediaStats.pdfs > 0 && `${mediaStats.pdfs} PDF`,
                  mediaStats.docs > 0 && `${mediaStats.docs} document${mediaStats.docs > 1 ? 's' : ''}`,
                ].filter(Boolean).join(', ') || 'Aucun média'}
              </p>
            </div>
          </div>

          {/* LinkedIn */}
          {(data.projects.linkedInData?.profileUrl || data.projects.linkedInData?.rawContent) && (
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-500">LinkedIn</p>
                <p className="font-medium text-zinc-900">Profil importé ✓</p>
              </div>
            </div>
          )}

          {/* Style */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Style choisi</p>
              <p className="font-medium text-zinc-900">
                {STYLE_LABELS[data.style] || data.style}
              </p>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-emerald-900 mb-1">
                Protection des données
              </p>
              <p className="text-sm text-emerald-700 mb-3">
                Vos données seront anonymisées localement avant traitement par l'IA. 
                Aucune donnée n'est envoyée vers le cloud.
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAccepted}
                  onChange={e => setHasAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-emerald-800">J'ai compris</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bouton générer */}
        <button
          onClick={handleGenerate}
          disabled={!hasAccepted || isGenerating}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-lg transition-all ${
            hasAccepted && !isGenerating
              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25'
              : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Générer mon portfolio
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GenerationRecap;
```

---

## ÉCRAN 8 : GÉNÉRATION EN COURS

### Composant : `src/components/portfolio/master/GenerationProgress.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { Shield, Brain, Palette, FileText, Check, Loader2 } from 'lucide-react';

interface GenerationStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'done';
}

interface GenerationProgressProps {
  onComplete: (portfolioId: string) => void;
  portfolioData: any;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  onComplete,
  portfolioData,
}) => {
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'anonymize', label: 'Anonymisation des données', icon: <Shield className="w-5 h-5" />, status: 'pending' },
    { id: 'analyze', label: 'Analyse du contenu', icon: <Brain className="w-5 h-5" />, status: 'pending' },
    { id: 'design', label: 'Application du style', icon: <Palette className="w-5 h-5" />, status: 'pending' },
    { id: 'generate', label: 'Génération du portfolio', icon: <FileText className="w-5 h-5" />, status: 'pending' },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runGeneration();
  }, []);

  const updateStepStatus = (stepId: string, status: 'processing' | 'done') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const runGeneration = async () => {
    try {
      // Étape 1 : Anonymisation
      updateStepStatus('anonymize', 'processing');
      await window.electron.invoke('anonymize-portfolio-data', portfolioData);
      updateStepStatus('anonymize', 'done');
      setCurrentStepIndex(1);

      // Étape 2 : Analyse
      updateStepStatus('analyze', 'processing');
      await window.electron.invoke('analyze-portfolio-content', portfolioData);
      updateStepStatus('analyze', 'done');
      setCurrentStepIndex(2);

      // Étape 3 : Style
      updateStepStatus('design', 'processing');
      await window.electron.invoke('apply-portfolio-style', portfolioData);
      updateStepStatus('design', 'done');
      setCurrentStepIndex(3);

      // Étape 4 : Génération
      updateStepStatus('generate', 'processing');
      const result = await window.electron.invoke('generate-portfolio-final', portfolioData);
      updateStepStatus('generate', 'done');

      // Terminé
      setTimeout(() => {
        onComplete(result.portfolioId);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de génération');
    }
  };

  const progress = (steps.filter(s => s.status === 'done').length / steps.length) * 100;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        
        {/* Titre */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Génération en cours
          </h1>
          <p className="text-zinc-600">
            Votre portfolio est en train d'être créé...
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-zinc-500 mt-2">
            {Math.round(progress)}% complété
          </p>
        </div>

        {/* Étapes */}
        <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-4 p-4 ${
                step.status === 'processing' ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.status === 'done' 
                  ? 'bg-green-100 text-green-600'
                  : step.status === 'processing'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-zinc-100 text-zinc-400'
              }`}>
                {step.status === 'done' ? (
                  <Check className="w-5 h-5" />
                ) : step.status === 'processing' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  step.status === 'done' 
                    ? 'text-green-700'
                    : step.status === 'processing'
                      ? 'text-blue-700'
                      : 'text-zinc-400'
                }`}>
                  {step.label}
                </p>
              </div>
              {step.status === 'done' && (
                <span className="text-xs text-green-600">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Erreur */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationProgress;
```

---

## SERVICE DE SUGGESTION STYLE

### Fichier : `src/services/styleSuggestionService.ts`

```typescript
interface StyleSuggestionInput {
  portfolioTarget: string;
  keyPriorities: string[];
  practicalInfo: string[];
  projectsCount: number;
  hasLinkedIn: boolean;
  hasNotion: boolean;
  mediaStats: {
    images: number;
    videos: number;
    pdfs: number;
    documents: number;
  };
}

interface StyleSuggestion {
  styleId: string;
  confidence: number;
  reason: string;
}

export function suggestStyle(input: StyleSuggestionInput): StyleSuggestion {
  const { portfolioTarget, keyPriorities, practicalInfo, mediaStats, hasLinkedIn } = input;

  // VITRINE : Commerce local avec infos pratiques
  if (
    ['shop', 'restaurant'].includes(portfolioTarget) &&
    practicalInfo.some(p => ['hours', 'address', 'phone'].includes(p))
  ) {
    return {
      styleId: 'vitrine',
      confidence: 0.9,
      reason: 'Votre commerce bénéficiera d\'un style mettant en avant vos informations pratiques.',
    };
  }

  // FORMEL : Cabinet, praticien
  if (['cabinet', 'health'].includes(portfolioTarget)) {
    return {
      styleId: 'formel',
      confidence: 0.85,
      reason: 'Un style institutionnel inspirera confiance à vos clients et patients.',
    };
  }

  // ARTISTIQUE : Projet artistique ou beaucoup d'images
  if (
    portfolioTarget === 'artistic' ||
    (mediaStats.images > 10 && keyPriorities.includes('showcase_work'))
  ) {
    return {
      styleId: 'artistique',
      confidence: 0.85,
      reason: 'Vos visuels méritent d\'être mis en avant dans un style épuré.',
    };
  }

  // MODERNE : Freelance avec LinkedIn
  if (
    portfolioTarget === 'personal' &&
    hasLinkedIn &&
    keyPriorities.some(p => ['attract_clients', 'show_expertise'].includes(p))
  ) {
    return {
      styleId: 'moderne',
      confidence: 0.8,
      reason: 'Un style dynamique correspondra parfaitement à votre profil freelance.',
    };
  }

  // CLASSIQUE : Entreprise avec confiance
  if (
    portfolioTarget === 'company' &&
    keyPriorities.includes('build_trust')
  ) {
    return {
      styleId: 'classique',
      confidence: 0.8,
      reason: 'Un style sobre et professionnel renforcera la crédibilité de votre entreprise.',
    };
  }

  // AUTHENTIQUE : Artisan avec tarifs/RDV
  if (
    practicalInfo.some(p => ['pricing', 'booking'].includes(p)) &&
    !['shop', 'restaurant', 'cabinet', 'health'].includes(portfolioTarget)
  ) {
    return {
      styleId: 'authentique',
      confidence: 0.75,
      reason: 'Un style chaleureux mettra en valeur votre savoir-faire.',
    };
  }

  // Défaut : MODERNE
  return {
    styleId: 'moderne',
    confidence: 0.6,
    reason: 'Le style Moderne est polyvalent et s\'adapte à la plupart des profils.',
  };
}
```

---

## HANDLERS IPC À AJOUTER

Dans `main.cjs` :

```javascript
// Anonymiser les données du portfolio
ipcMain.handle('anonymize-portfolio-data', async (event, data) => {
  // Appel Ollama pour NER
  const anonymized = await anonymizeWithOllama(data);
  return anonymized;
});

// Analyser le contenu
ipcMain.handle('analyze-portfolio-content', async (event, data) => {
  // Analyse du contenu pour enrichissement
  return { success: true };
});

// Appliquer le style
ipcMain.handle('apply-portfolio-style', async (event, data) => {
  // Préparation des design tokens
  return { success: true };
});

// Générer le portfolio final
ipcMain.handle('generate-portfolio-final', async (event, data) => {
  const portfolioId = crypto.randomUUID();
  
  // Sauvegarder en base
  db.portfolios_saveFinal(portfolioId, data);
  
  return { portfolioId };
});
```

---

## FICHIERS À CRÉER

1. `src/components/portfolio/master/StyleSuggestion.tsx`
2. `src/components/portfolio/master/GenerationRecap.tsx`
3. `src/components/portfolio/master/GenerationProgress.tsx`
4. `src/services/styleSuggestionService.ts`

## FICHIERS À MODIFIER

1. `main.cjs` — Ajouter handlers génération
2. `database.cjs` — Ajouter fonction sauvegarde finale

---

## FLUX COMPLET RÉCAPITULATIF

```
[Sélection Portfolio] → MPF-1
        ↓
[Choix démarrage] → MPF-1
        ↓
[Chat IA 3 questions] → MPF-1
        ↓
[Import Projets + LinkedIn/Notion] → MPF-2
        ↓
[Import Médias] → MPF-2
        ↓
[Suggestion Style] → MPF-3
        ↓
[Récapitulatif] → MPF-3
        ↓
[Génération] → MPF-3
        ↓
[Portfolio créé !]
```

---

## TESTS DE VALIDATION

1. ✅ Suggestion style → Style recommandé affiché avec confiance
2. ✅ Changer de style → Autre style sélectionnable
3. ✅ Récapitulatif → Toutes les infos affichées
4. ✅ Checkbox sécurité → Obligatoire pour générer
5. ✅ Clic Générer → Écran progress affiché
6. ✅ 4 étapes → Progression visible
7. ✅ Génération terminée → Redirection vers portfolio

---

**Fin du brief MPF-3**
