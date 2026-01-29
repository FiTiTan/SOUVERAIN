import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

// Configuration du modèle
// Llama-3.2-3B-Instruct est un bon compromis performance/qualité pour le local
const SELECTED_MODEL = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

let engine: MLCEngine | null = null;
let isLoading = false;

export interface LlamaStatus {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress?: string;
  progressVal?: number;
}

type StatusCallback = (status: LlamaStatus) => void;

class WebLlamaService {
  private static instance: WebLlamaService;
  private listeners: StatusCallback[] = [];
  private currentStatus: LlamaStatus = { status: 'idle' };

  private constructor() {}

  public static getInstance(): WebLlamaService {
    if (!WebLlamaService.instance) {
      WebLlamaService.instance = new WebLlamaService();
    }
    return WebLlamaService.instance;
  }

  public subscribe(callback: StatusCallback) {
    this.listeners.push(callback);
    callback(this.currentStatus); // Initial update
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private updateStatus(newStatus: LlamaStatus) {
    this.currentStatus = newStatus;
    this.listeners.forEach(l => l(newStatus));
  }

  public async initialize() {
    if (engine || isLoading) return;

    try {
      isLoading = true;
      this.updateStatus({ status: 'loading', progress: 'Initialisation du moteur...', progressVal: 0 });

      console.log('[WebLLM] Starting engine initialization...');
      
      const initProgressCallback = (report: { text: string; progress: number }) => {
        console.log('[WebLLM] Progress:', report.text, report.progress);
        this.updateStatus({
          status: 'loading',
          progress: report.text,
          progressVal: report.progress
        });
      };

      engine = await CreateMLCEngine(
        SELECTED_MODEL,
        { initProgressCallback }
      );

      console.log('[WebLLM] Engine Ready!');
      isLoading = false;
      this.updateStatus({ status: 'ready', progress: 'Modèle chargé et prêt', progressVal: 1 });

    } catch (error) {
      console.error('[WebLLM] Initialization Error:', error);
      isLoading = false;
      this.updateStatus({ status: 'error', progress: 'Erreur de chargement: ' + (error as Error).message });
      throw error;
    }
  }

  public async analyzeEntities(text: string): Promise<any> {
    if (!engine) {
      await this.initialize();
    }

    if (!engine) throw new Error("Engine failed to initialize");

    const prompt = `Tu es un expert en protection des données (RGPD). Ta tâche est d'identifier scrupuleusement TOUTES les données personnelles dans le texte fourni.
    
Catégories à détecter :
- PERSON : Noms et Prénoms (ex: Jean Dupont, Mme Martin). INCLUS LES NOMS EN MAJUSCULES (ex: DURAND).
- EMAIL : Adresses email.
- PHONE : Numéros de téléphone.
- ADDRESS : Adresses postales, villes, codes postaux.
- ORGANIZATION : Entreprises, marques, employeurs (ex: BMW, Google).
- UNKNOWN : Tout autre élément identifiant (SSN, Age, etc).

RÈGLE IMPÉRATIVE : Réponds UNIQUEMENT avec un objet JSON contenant la liste des entités. PAS DE MARKDOWN, PAS DE TEXTE AVANT OU APRÈS.

Format JSON attendu :
{
  "entities": [
    { "type": "PERSON", "value": "..." },
    { "type": "EMAIL", "value": "..." }
  ]
}

Texte à analyser :
"${text.substring(0, 4000)}"`; // Limit context window just in case

    try {
      console.log('[WebLLM] Running inference...');
      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, // Très déterministe
        max_tokens: 1024,
        response_format: { type: "json_object" } // Force JSON if supported by model version, else rely on prompt
      });

      const content = response.choices[0].message.content || "{}";
      console.log('[WebLLM] Response:', content);

      // Parsing robuste
      try {
        // Find JSON block if text is included
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error('[WebLLM] JSON Parse error', e);
        return { entities: [] };
      }

    } catch (error) {
      console.error('[WebLLM] Inference error', error);
      throw error;
    }
  }
}

export const webLlamaService = WebLlamaService.getInstance();
