/**
 * SOUVERAIN - Slogan & Difference Generator
 * 
 * Génère des suggestions basées sur métier + expertises (+ slogan pour différence)
 * Aucune donnée personnelle n'est envoyée (nom, email, adresse...)
 */

import React, { useState } from 'react';

// ============================================
// PROMPTS
// ============================================

const SLOGAN_PROMPT = `Génère 3 slogans courts (4-7 mots) pour ce professionnel.

Activité : {{ACTIVITY}}
Spécialités : {{EXPERTISES}}

RÈGLES :
- Direct, mémorable, orienté bénéfice client
- Pas de "Passionné par", "Expert en", "Spécialisé dans"
- Pas de mots creux : "unique", "authentique", "excellence"
- Phrases percutantes, style publicitaire
- Intègre les spécialités si pertinent

Exemples de BON style :
- "Du concept au déploiement"
- "Le café qui réveille le quartier"  
- "Là quand il faut, 7j/7"
- "Vos droits, sans le jargon"
- "Gourmandise sans gluten"

JSON uniquement :
{ "suggestions": ["...", "...", "..."] }`;

const DIFFERENCE_PROMPT = `Génère 3 propositions de "ce qui différencie" ce professionnel (10-15 mots chacune).

Activité : {{ACTIVITY}}
Spécialités : {{EXPERTISES}}
Slogan : {{SLOGAN}}

RÈGLES :
- Concret, factuel, orienté bénéfice client
- Mettre en avant un avantage compétitif crédible
- Peut inclure : expérience, méthode, garantie, résultat
- Cohérent avec le slogan

Exemples de BON style :
- "Spécialiste e-commerce, +50 boutiques livrées, code propre garanti"
- "100% sans gluten, 100% fait maison, fournisseurs locaux"
- "Intervention en 1h, devis gratuit, garantie 2 ans"

JSON uniquement :
{ "suggestions": ["...", "...", "..."] }`;

// ============================================
// SERVICES
// ============================================

async function callDeepSeek(prompt: string): Promise<string[]> {
  // @ts-ignore
  const keyResult = await window.electron.deepseek.getApiKey();
  if (!keyResult.success || !keyResult.key) {
    throw new Error('Clé API non configurée');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${keyResult.key}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }

  const result = await response.json();
  let content = result.choices[0].message.content;
  content = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  
  const parsed = JSON.parse(content);
  if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
    throw new Error('Format de réponse invalide');
  }
  
  return parsed.suggestions;
}

export async function generateSloganSuggestions(
  activity: string, 
  expertises: string[]
): Promise<string[]> {
  const prompt = SLOGAN_PROMPT
    .replace('{{ACTIVITY}}', activity.trim())
    .replace('{{EXPERTISES}}', expertises.join(', '));
  
  return callDeepSeek(prompt);
}

export async function generateDifferenceSuggestions(
  activity: string, 
  expertises: string[],
  slogan: string
): Promise<string[]> {
  const prompt = DIFFERENCE_PROMPT
    .replace('{{ACTIVITY}}', activity.trim())
    .replace('{{EXPERTISES}}', expertises.join(', '))
    .replace('{{SLOGAN}}', slogan.trim());
  
  return callDeepSeek(prompt);
}

// ============================================
// COMPOSANTS
// ============================================

interface AIButtonProps {
  type: 'slogan' | 'difference';
  activity: string;
  expertises: string[];
  slogan?: string; // Requis pour type='difference'
  onSelect: (value: string) => void;
}

export const AIGeneratorButton: React.FC<AIButtonProps> = ({
  type,
  activity,
  expertises,
  slogan = '',
  onSelect,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier les prérequis
  const hasActivity = activity && activity.trim() !== '';
  const hasExpertises = expertises && expertises.filter(e => e.trim() !== '').length > 0;
  const hasSlogan = slogan && slogan.trim() !== '';

  const canGenerate = type === 'slogan' 
    ? hasActivity && hasExpertises
    : hasActivity && hasExpertises && hasSlogan;

  // Message d'erreur selon les prérequis manquants
  const getMissingMessage = () => {
    if (type === 'slogan') {
      if (!hasExpertises) return "⚠️ Renseignez d'abord vos spécialités pour activer la suggestion IA";
    } else {
      if (!hasExpertises && !hasSlogan) return "⚠️ Renseignez d'abord vos spécialités et votre slogan";
      if (!hasExpertises) return "⚠️ Renseignez d'abord vos spécialités";
      if (!hasSlogan) return "⚠️ Renseignez d'abord votre slogan";
    }
    return null;
  };

  const missingMessage = getMissingMessage();

  const handleClick = () => {
    if (!canGenerate) return;
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError(null);

    try {
      const results = type === 'slogan'
        ? await generateSloganSuggestions(activity, expertises.filter(e => e.trim() !== ''))
        : await generateDifferenceSuggestions(activity, expertises.filter(e => e.trim() !== ''), slogan);
      
      setSuggestions(results);
      setShowResultsModal(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setShowResultsModal(false);
  };

  const filteredExpertises = expertises.filter(e => e.trim() !== '');

  return (
    <div className="flex flex-col">
      {/* Bouton ✨ */}
      <button
        type="button"
        onClick={handleClick}
        disabled={!canGenerate || loading}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={canGenerate ? "Générer des suggestions" : missingMessage || ""}
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Génération...
          </>
        ) : (
          <>
            <span>✨</span>
            Suggérer
          </>
        )}
      </button>

      {/* Message prérequis manquants */}
      {!canGenerate && missingMessage && (
        <p className="text-sm text-amber-600 mt-2">{missingMessage}</p>
      )}

      {/* Erreur */}
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {/* Modal de confirmation RGPD */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔒</span>
              <h3 className="text-lg font-semibold text-gray-900">
                Génération par IA
              </h3>
            </div>
            
            <div className="space-y-3 text-gray-600 mb-6">
              <p>
                Pour générer des suggestions, seuls les champs suivants seront envoyés à l'IA :
              </p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Votre métier : <strong>{activity}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Vos spécialités : <strong>{filteredExpertises.join(', ')}</strong></span>
                </li>
                {type === 'difference' && hasSlogan && (
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Votre slogan : <strong>{slogan}</strong></span>
                  </li>
                )}
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <p className="flex items-start gap-2 text-green-700">
                  <span className="mt-0.5">✓</span>
                  <span>Aucune donnée personnelle n'est compromise (nom, email, adresse...)</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 text-white bg-purple-600 rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des résultats */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">✨</span>
              <h3 className="text-lg font-semibold text-gray-900">
                {type === 'slogan' ? 'Choisissez votre slogan' : 'Choisissez votre différence'}
              </h3>
            </div>
            
            <p className="text-gray-500 text-sm mb-4">
              Cliquez sur une suggestion pour l'utiliser :
            </p>

            <div className="space-y-2 mb-6">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(suggestion)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <span className="text-gray-400 mr-2">{index + 1}.</span>
                  <span className="text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowResultsModal(false)}
              className="w-full px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// USAGE EXAMPLE
// ============================================

/*
import { AIGeneratorButton } from './sloganGenerator';

// Bouton pour Slogan
<div className="flex gap-2 items-start">
  <input
    type="text"
    value={formData.tagline}
    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
    placeholder="Ex: Des apps qui convertissent"
    className="flex-1 px-4 py-2 border rounded-lg"
  />
  <AIGeneratorButton
    type="slogan"
    activity={formData.activity}
    expertises={formData.expertises}
    onSelect={(value) => setFormData({ ...formData, tagline: value })}
  />
</div>

// Bouton pour "Ce qui vous différencie"
<div className="flex gap-2 items-start">
  <input
    type="text"
    value={formData.valueProp}
    onChange={(e) => setFormData({ ...formData, valueProp: e.target.value })}
    placeholder="Ex: Spécialiste e-commerce, +50 boutiques livrées"
    className="flex-1 px-4 py-2 border rounded-lg"
  />
  <AIGeneratorButton
    type="difference"
    activity={formData.activity}
    expertises={formData.expertises}
    slogan={formData.tagline}
    onSelect={(value) => setFormData({ ...formData, valueProp: value })}
  />
</div>
*/
