/**
 * SOUVERAIN - AI Providers Configuration
 * 
 * Providers supportés :
 * - DeepSeek (défaut) : Meilleure qualité, moins cher
 * - Groq (fallback) : Rapide, gratuit
 */

export const AI_PROVIDERS = {
  groq: {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    defaultModel: 'llama-3.3-70b-versatile',
  },
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat', // DeepSeek V3
  },
} as const;

export type AIProvider = keyof typeof AI_PROVIDERS;
