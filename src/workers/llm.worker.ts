import { env, pipeline, TextStreamer } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = 'https://huggingface.co';

if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
    env.backends.onnx.wasm.numThreads = 8; 
    env.backends.onnx.wasm.simd = true;
}

let generator: any = null;

onmessage = async (e) => {
    const { model, text, max_tokens } = e.data;

    try {
        if (!generator) {
            self.postMessage({ status: 'init', message: 'Réveil du cerveau 360M...' });
            generator = await pipeline('text-generation', `onnx-community/${model}`, {
                device: 'wasm', 
                dtype: 'q4',    
            });
            self.postMessage({ status: 'ready' });
        }

        if (text) {
            const streamer = new TextStreamer(generator.tokenizer, {
                skip_prompt: true,
                callback_function: (token: string) => self.postMessage({ status: 'update', token }),
            });

            await generator(text, {
                max_new_tokens: max_tokens || 300,
                streamer,
                temperature: 0.2,        // Température basse pour la stabilité
                repetition_penalty: 1.3,  // Moins besoin de force que le 135M
                do_sample: false,       // Mode déterministe obligatoire sur CPU
                stop_sequences: ['<|im_end|>', '<|endoftext|>', '\nuser'], 
            });

            self.postMessage({ status: 'complete' });
        }
    } catch (err: any) {
        self.postMessage({ status: 'error', error: err.message });
    }
};