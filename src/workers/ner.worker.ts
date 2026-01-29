import { env, pipeline } from '@huggingface/transformers';

// Configuration locale identique à llm.worker.ts
env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = 'https://huggingface.co';

if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
    env.backends.onnx.wasm.numThreads = 4; // Un peu moins gourmand que le LLM
    env.backends.onnx.wasm.simd = true;
}

let nerPipeline: any = null;

// Modèle léger et efficace pour le NER multilingue
const NER_MODEL = 'Xenova/bert-base-multilingual-cased-ner-hrl';

onmessage = async (e) => {
    const { text, type } = e.data;

    try {
        if (type === 'init') {
            if (!nerPipeline) {
                self.postMessage({ status: 'init', message: 'Chargement du modèle d\'anonymisation...' });
                nerPipeline = await pipeline('token-classification', NER_MODEL, {
                    device: 'wasm',
                    quantized: true,
                });
                self.postMessage({ status: 'ready' });
            }
            return;
        }

        if (type === 'analyze' && text) {
            if (!nerPipeline) {
                // Auto-init if needed
                nerPipeline = await pipeline('token-classification', NER_MODEL, {
                    device: 'wasm',
                    quantized: true,
                });
            }

            const output = await nerPipeline(text, {
                ignore_labels: ['O'], // Ignorer les tokens non-entités
                aggregation_strategy: 'simple', // Grouper les sous-tokens (ex: Jean + - + Pierre)
            });

            // Normaliser la sortie pour notre service
            const entities = output.map((entity: any) => ({
                type: mapEntityType(entity.entity_group),
                value: entity.word.trim(),
                score: entity.score
            }));

            self.postMessage({ status: 'complete', entities });
        }
    } catch (err: any) {
        self.postMessage({ status: 'error', error: err.message });
    }
};

// Mapping des types BERT vers notre format interne
function mapEntityType(bertType: string): string {
    switch (bertType) {
        case 'PER': return 'person';
        case 'ORG': return 'company';
        case 'LOC': return 'location';
        case 'MISC': return 'misc'; // Souvent des produits ou événements
        default: return 'unknown';
    }
}
