// SOUVERAIN - LinkedIn Coach Service
// Analyzes and optimizes LinkedIn profiles using Groq API

import { detectAndAnonymize, deanonymize, type AnonymizationMapping } from './anonymizationService';

export interface LinkedInProfile {
  id: string;
  rawContent: string;
  headline?: string;
  about?: string;
  experiences?: any[];
  skills?: string[];
  recommendations?: number;
  url?: string;
  createdAt: string;
}

export interface SectionScore {
  name: string;
  score: number;
  maxScore: number;
  issues: string[];
  tips: string[];
}

export interface ProfileAnalysis {
  id: string;
  profileId: string;
  globalScore: number;
  percentile: number;
  sections: SectionScore[];
  priorityAction: string;
  suggestions: {
    headline: string[];
    about: string[];
  };
  createdAt: string;
}

const ANALYSIS_PROMPT = `Tu es un expert LinkedIn et personal branding.

PROFIL LINKEDIN (anonymisé) :
{PROFILE}

Analyse ce profil et réponds en JSON :

{
  "globalScore": <0-100>,
  "percentile": <1-100>,
  "sections": [
    {
      "name": "Photo de profil",
      "score": <0-100>,
      "maxScore": 100,
      "issues": ["problème 1", "problème 2"],
      "tips": ["conseil 1", "conseil 2"]
    },
    {
      "name": "Headline",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "About (Résumé)",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "Expériences",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "Compétences",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "Recommandations",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "Activité/Posts",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    }
  ],
  "priorityAction": "Action prioritaire pour gagner le plus de points",
  "suggestions": {
    "headline": ["suggestion 1", "suggestion 2", "suggestion 3"],
    "about": ["version optimisée du résumé"]
  }
}

Critères de scoring :
- Photo : Professionnelle, bien cadrée, sourire
- Headline : Spécifique, valeur ajoutée, différenciant
- About : Storytelling, résultats chiffrés, CTA
- Expériences : Verbes d'action, métriques, pertinence
- Compétences : Pertinentes, endorsées, ordonnées
- Recommandations : Nombre et qualité
- Activité : Fréquence, engagement, valeur

Sois précis et actionnable.`;

const CONTENT_GENERATION_PROMPT = `Tu es un expert en copywriting LinkedIn.

PROFIL (anonymisé) :
{PROFILE}

TYPE DE CONTENU : {CONTENT_TYPE}
CONTEXTE : {CONTEXT}
TON : {TONE}

Génère le contenu demandé. Sois engageant, authentique et professionnel.
Utilise des emojis avec parcimonie.
Pour les posts, structure avec des sauts de ligne pour la lisibilité.

Réponds uniquement avec le contenu généré, sans explication.`;

export async function analyzeLinkedInProfile(
  profile: LinkedInProfile,
  portfolioId: string
): Promise<ProfileAnalysis> {
  try {
    // 1. Anonymiser
    const profileText = JSON.stringify({
      headline: profile.headline,
      about: profile.about,
      experiences: profile.experiences,
      skills: profile.skills
    });

    const anon = await detectAndAnonymize(profileText, portfolioId, null);

    // 2. Construire le prompt
    const prompt = ANALYSIS_PROMPT.replace('{PROFILE}', anon.anonymizedText);

    // 3. Appeler Groq via IPC
    // @ts-ignore
    const response = await window.electron.invoke('groq-chat', {
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    if (!response.success || !response.message) {
      throw new Error('Groq API call failed');
    }

    const content = response.message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const parsed = JSON.parse(jsonMatch[0]);

    // 4. Dé-anonymiser les suggestions
    const suggestions = {
      headline: parsed.suggestions.headline.map((s: string) => deanonymize(s, anon.mappings)),
      about: parsed.suggestions.about.map((s: string) => deanonymize(s, anon.mappings))
    };

    const result: ProfileAnalysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      profileId: profile.id,
      globalScore: parsed.globalScore,
      percentile: parsed.percentile,
      sections: parsed.sections,
      priorityAction: parsed.priorityAction,
      suggestions,
      createdAt: new Date().toISOString()
    };

    return result;

  } catch (error) {
    console.error('[LinkedInCoach] Analysis error:', error);
    throw error;
  }
}

export async function generateLinkedInContent(
  profile: LinkedInProfile,
  contentType: 'headline' | 'about' | 'post' | 'connection_message',
  context: string,
  tone: 'professional' | 'inspiring' | 'casual' | 'expert',
  portfolioId: string
): Promise<string> {
  try {
    const profileText = JSON.stringify({
      headline: profile.headline,
      about: profile.about,
      experiences: profile.experiences
    });

    const anon = await detectAndAnonymize(profileText, portfolioId, null);

    const prompt = CONTENT_GENERATION_PROMPT
      .replace('{PROFILE}', anon.anonymizedText)
      .replace('{CONTENT_TYPE}', contentType)
      .replace('{CONTEXT}', context || 'Aucun contexte spécifique')
      .replace('{TONE}', tone);

    // @ts-ignore
    const response = await window.electron.invoke('groq-chat', {
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    if (!response.success || !response.message) {
      throw new Error('Groq API call failed');
    }

    let generatedContent = response.message.content;

    // Dé-anonymiser
    generatedContent = deanonymize(generatedContent, anon.mappings);

    return generatedContent;

  } catch (error) {
    console.error('[LinkedInCoach] Content generation error:', error);
    throw error;
  }
}
