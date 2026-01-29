// SOUVERAIN - Job Matching Service
// Analyzes job offers against CV profiles using Groq API

import { detectAndAnonymize, deanonymize, type AnonymizationMapping } from './anonymizationService';

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  rawContent: string;
  url?: string;
  extractedSkills?: string[];
  extractedRequirements?: string[];
  createdAt: string;
}

export interface CVProfile {
  id: string;
  name: string;
  skills: string[];
  experiences: any[];
  education: any[];
  rawContent?: string;
}

export interface MatchingResult {
  id: string;
  jobOfferId: string;
  cvId: string;
  score: number; // 0-100
  category: 'excellent' | 'good' | 'average' | 'poor';
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  optimizations: string[];
  createdAt: string;
}

const MATCHING_PROMPT = `Tu es un expert en recrutement et analyse de CV.

OFFRE D'EMPLOI (anonymisée) :
{JOB_OFFER}

PROFIL CANDIDAT (anonymisé) :
{CV_PROFILE}

Analyse la compatibilité et réponds en JSON :

{
  "score": <0-100>,
  "category": "excellent|good|average|poor",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1"],
  "recommendations": [
    "Recommandation spécifique 1",
    "Recommandation spécifique 2"
  ],
  "optimizations": [
    "Optimisation CV 1",
    "Optimisation CV 2"
  ]
}

Règles de scoring :
- 85-100 : Excellente compatibilité (category: excellent)
- 70-84 : Bonne compatibilité (category: good)
- 50-69 : Compatibilité moyenne (category: average)
- 0-49 : Faible compatibilité (category: poor)

Sois précis et actionnable dans tes recommandations.`;

export async function analyzeJobMatching(
  jobOffer: JobOffer,
  cvProfile: CVProfile,
  portfolioId: string
): Promise<MatchingResult> {
  try {
    // 1. Anonymiser les données
    const jobText = JSON.stringify({
      title: jobOffer.title,
      company: jobOffer.company,
      content: jobOffer.rawContent
    });

    const cvText = JSON.stringify({
      name: cvProfile.name,
      skills: cvProfile.skills,
      experiences: cvProfile.experiences
    });

    const jobAnon = await detectAndAnonymize(jobText, portfolioId, null);
    const cvAnon = await detectAndAnonymize(cvText, portfolioId, null);

    // 2. Construire le prompt
    const prompt = MATCHING_PROMPT
      .replace('{JOB_OFFER}', jobAnon.anonymizedText)
      .replace('{CV_PROFILE}', cvAnon.anonymizedText);

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

    // 4. Parser le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const parsed = JSON.parse(jsonMatch[0]);

    // 5. Dé-anonymiser les recommandations si nécessaire
    const allMappings = [...jobAnon.mappings, ...cvAnon.mappings];

    const result: MatchingResult = {
      id: `matching_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobOfferId: jobOffer.id,
      cvId: cvProfile.id,
      score: parsed.score,
      category: parsed.category,
      matchedSkills: parsed.matchedSkills || [],
      missingSkills: parsed.missingSkills || [],
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      recommendations: parsed.recommendations.map((r: string) => deanonymize(r, allMappings)),
      optimizations: parsed.optimizations.map((o: string) => deanonymize(o, allMappings)),
      createdAt: new Date().toISOString()
    };

    return result;

  } catch (error) {
    console.error('[JobMatching] Analysis error:', error);
    // Fallback basique
    return {
      id: `matching_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobOfferId: jobOffer.id,
      cvId: cvProfile.id,
      score: 50,
      category: 'average',
      matchedSkills: [],
      missingSkills: [],
      strengths: ['Analyse non disponible'],
      weaknesses: [],
      recommendations: ['Veuillez réessayer plus tard'],
      optimizations: [],
      createdAt: new Date().toISOString()
    };
  }
}

export async function extractJobOfferFromURL(url: string): Promise<Partial<JobOffer>> {
  // TODO: Implémenter le scraping (ou demander copier-coller pour V1)
  throw new Error('URL scraping not implemented - use paste mode');
}
