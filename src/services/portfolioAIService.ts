// SOUVERAIN - Portfolio AI Service
// Service de chat conversationnel pour construire le Master Portfolio

import type { ChatMessage } from '../hooks/useAIChat';

export interface MPFChatContext {
  portfolioId: string;
  currentPortfolio: any;
  projectsCount: number;
  highlightsCount: number;
  accountsCount: number;
  mediaStats: {
    images: number;
    videos: number;
    documents: number;
  };
}

export interface AIResponse {
  message: string;
  suggestedData?: any;
  nextQuestion?: string;
  confidence?: number;
  completed?: boolean;
}

/**
 * Questions de base pour construire le MPF
 */
const MPF_QUESTIONS = [
  {
    id: 'activity',
    question: "Bonjour ! 👋 Je vais vous aider à créer votre portfolio.\n\nParlez-moi de votre activité professionnelle : que faites-vous ?",
    field: 'activity_description'
  },
  {
    id: 'objective',
    question: "Quel est l'objectif principal de ce portfolio ? (Trouver des clients, un emploi, montrer votre expertise, etc.)",
    field: 'objective'
  },
  {
    id: 'audience',
    question: "À qui s'adresse principalement ce portfolio ? Qui sont vos interlocuteurs cibles ?",
    field: 'target_audience'
  },
  {
    id: 'differentiation',
    question: "Qu'est-ce qui vous différencie dans votre domaine ? Quelle est votre spécialité ou votre approche unique ?",
    field: 'differentiation'
  },
  {
    id: 'practical_info',
    question: "Avez-vous des informations pratiques à afficher ? (Contact, horaires, zone d'intervention, etc.)",
    field: 'practical_info'
  }
];

/**
 * Envoie une question à Ollama pour analyser et construire le MPF
 */
export async function askMPFQuestion(
  userMessage: string,
  conversationHistory: ChatMessage[],
  context: MPFChatContext
): Promise<AIResponse> {
  try {
    // Détermine quelle question poser ensuite
    const currentQuestionIndex = conversationHistory.filter(m => m.role === 'assistant').length;
    
    if (currentQuestionIndex < MPF_QUESTIONS.length) {
      // Sauvegarder la réponse au fur et à mesure
      const currentQuestion = MPF_QUESTIONS[currentQuestionIndex];
      await savePortfolioField(context.portfolioId, currentQuestion.field, userMessage);
      
      // Analyser la réponse avec Ollama
      const analysis = await analyzeUserResponse(userMessage, currentQuestion.id, context);
      
      // Retourner la prochaine question avec suggestions
      const nextQuestion = MPF_QUESTIONS[currentQuestionIndex + 1];
      
      if (nextQuestion) {
        return {
          message: `Merci ! ${analysis.feedback}\n\n${nextQuestion.question}`,
          suggestedData: analysis.suggestedData,
          nextQuestion: nextQuestion.id,
          completed: false
        };
      } else {
        // Fin du questionnaire
        return {
          message: `Parfait ! J'ai toutes les informations nécessaires.\n\nVotre portfolio est maintenant personnalisé et prêt à être visualisé. Vous pouvez le consulter dans la vue d'ensemble.`,
          completed: true,
          confidence: analysis.confidence
        };
      }
    }

    return {
      message: "Merci pour toutes ces informations ! Votre portfolio est maintenant personnalisé.",
      completed: true
    };
  } catch (error) {
    console.error('[portfolioAIService] Error:', error);
    throw error;
  }
}

/**
 * Analyse la réponse utilisateur avec Ollama
 */
async function analyzeUserResponse(
  userMessage: string,
  questionId: string,
  context: MPFChatContext
): Promise<{
  feedback: string;
  suggestedData?: any;
  confidence: number;
}> {
  try {
    const prompt = buildAnalysisPrompt(userMessage, questionId, context);
    
    // @ts-ignore
    const result = await window.electron.invoke('ollama-generate', {
      model: 'llama3.2:3b',
      prompt,
      stream: false,
      system: `Tu es un assistant qui aide à créer des portfolios professionnels. 
Tu analyses les réponses des utilisateurs et fournis un feedback encourageant.
Réponds en JSON uniquement.`
    });

    if (result.success && result.response) {
      try {
        const parsed = JSON.parse(result.response);
        return {
          feedback: parsed.feedback || "Très bien !",
          suggestedData: parsed.suggestions,
          confidence: parsed.confidence || 0.8
        };
      } catch {
        return {
          feedback: "Très bien !",
          confidence: 0.7
        };
      }
    }

    return {
      feedback: "Merci pour cette information !",
      confidence: 0.7
    };
  } catch (error) {
    console.error('[analyzeUserResponse] Error:', error);
    return {
      feedback: "Merci !",
      confidence: 0.5
    };
  }
}

/**
 * Construit le prompt d'analyse
 */
function buildAnalysisPrompt(
  userMessage: string,
  questionId: string,
  context: MPFChatContext
): string {
  return `Analyse cette réponse d'un utilisateur créant son portfolio :

Question posée : ${questionId}
Réponse utilisateur : "${userMessage}"

Contexte :
- ${context.projectsCount} projets
- ${context.highlightsCount} highlights
- ${context.accountsCount} comptes externes
- ${context.mediaStats.images} images, ${context.mediaStats.videos} vidéos

Fournis un feedback encourageant (1 phrase max) et des suggestions d'amélioration si pertinent.

Réponds en JSON :
{
  "feedback": "Super ! J'ai bien compris que...",
  "suggestions": { /* données structurées pertinentes */ },
  "confidence": 0.85
}`;
}

/**
 * Sauvegarde un champ du portfolio
 */
async function savePortfolioField(
  portfolioId: string,
  field: string,
  value: string
): Promise<void> {
  try {
    // Récupérer le portfolio actuel
    // @ts-ignore
    const result = await window.electron.portfolio.getAll();
    if (result.success) {
      const portfolio = result.portfolios.find((p: any) => p.id === portfolioId);
      if (portfolio) {
        // Mettre à jour avec le nouveau champ
        const updatedData = {
          ...portfolio,
          [field]: value
        };

        // @ts-ignore
        await window.electron.portfolio.update(portfolioId, updatedData);
      }
    }
  } catch (error) {
    console.error('[savePortfolioField] Error:', error);
  }
}

/**
 * Démarre une conversation MPF
 */
export function startMPFConversation(): AIResponse {
  return {
    message: MPF_QUESTIONS[0].question,
    nextQuestion: MPF_QUESTIONS[0].id,
    completed: false
  };
}

/**
 * Analyse le contenu global et suggère une structure
 */
export async function analyzeMPFContent(
  context: MPFChatContext
): Promise<{
  suggestedSections: string[];
  suggestedTone: string;
  suggestedHighlights: string[];
}> {
  // TODO: Implémenter l'analyse complète
  return {
    suggestedSections: ['hero', 'projects', 'about', 'contact'],
    suggestedTone: 'professional',
    suggestedHighlights: []
  };
}
