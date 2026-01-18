import { useState } from "react";

export function useLocalAI() {
  const [status, setStatus] = useState("Souverain Prêt");
  const [isLoaded, setIsLoaded] = useState(true); // Ollama gère le chargement
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  // On utilise Qwen 2.5 0.5B ou 1.5B (beaucoup plus puissant et rapide ici)
  const MODEL_ID = "qwen2.5:0.5b"; 

  const askAI = async (prompt: string, context: string) => {
    setIsGenerating(true);
    setStreamingText("Analyse en cours...");

    const fullPrompt = `<|im_start|>system\nExpert RH. Analyse ce CV de manière concise.<|im_end|>\n<|im_start|>user\n${context.substring(0, 3000)}<|im_end|>\n<|im_start|>assistant\n`;

    try {
      // On appelle le handler Electron qui parle à Ollama
      const result = await (window as any).electron.askOllama({ 
        model: MODEL_ID, 
        prompt: fullPrompt 
      });
      setStreamingText(result);
    } catch (e) {
      setStreamingText("Erreur de connexion au moteur natif.");
    } finally {
      setIsGenerating(false);
    }
  };

  return { status, isLoaded, isGenerating, streamingText, initAI: () => {}, askAI };
}