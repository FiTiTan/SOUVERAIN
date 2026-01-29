import React, { useEffect, useState } from 'react';
import { detectAndAnonymize, type AnonymizedResult } from '../../../../../services/anonymizationService';
import { useTheme } from '../../../../../ThemeContext';

interface Step3Props {
    files: File[];
    portfolioId: string;
    onComplete: (data: any) => void;
}

export const Step3_Anonymization: React.FC<Step3Props> = ({ files, portfolioId, onComplete }) => {
    const { mode } = useTheme();
    const [status, setStatus] = useState<'analyzing' | 'done'>('analyzing');
    const [result, setResult] = useState<AnonymizedResult | null>(null);

    useEffect(() => {
        const process = async () => {
            if (files.length === 0) {
                // No files, just pass empty text (or maybe skip anonymization?)
                const result = await detectAndAnonymize("Aucun fichier fourni. Projet vide.", portfolioId, null);
                setResult(result);
                setStatus('done');
                return;
            }

            try {
                let fullText = "";

                for (const file of files) {
                    // @ts-ignore - Electron file path
                    const filePath = file.path;
                    if (!filePath) continue;

                    // Interact with Electron Extractor
                    // @ts-ignore
                    const extractResult = await window.electron.invoke('extractor-extract-file', {
                        filePath,
                        options: { textOnly: true } // Optimization if supported, otherwise just extract
                    });

                    if (extractResult.success && extractResult.elements) {
                        // Concatenate all text elements
                        const text = extractResult.elements
                            .filter((el: any) => el.elementType === 'text' && el.contentText)
                            .map((el: any) => el.contentText)
                            .join('\n');

                        fullText += `\n--- Fichier: ${file.name} ---\n${text}`;
                    }
                }

                if (!fullText.trim()) {
                    fullText = "Aucun texte extractible trouvé dans les fichiers.";
                }

                const analysis = await detectAndAnonymize(fullText, portfolioId, null);
                setResult(analysis);
                setStatus('done');

                // Manual advance is better for review, but we'll auto-call complete
                // ONLY if it's very fast, otherwise let user review.
                // For now, let's just let the user click "Continue" which we'll add to UI.

            } catch (error) {
                console.error("Extraction failed", error);
                const fallbackResult = await detectAndAnonymize("Erreur lors de l'extraction des fichiers.", portfolioId, null);
                setResult(fallbackResult);
                setStatus('done');
            }
        };
        process();
    }, [files, portfolioId]);

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4
                ${status === 'analyzing' ? 'bg-blue-100 animate-pulse' : 'bg-green-100'}
            `}>
                {status === 'analyzing' ? '🛡️' : '✅'}
            </div>

            <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">
                    {status === 'analyzing' ? 'Anonymisation en cours...' : 'Données sécurisées'}
                </h3>
                <p className="opacity-60 max-w-md mx-auto">
                    {status === 'analyzing' 
                        ? 'Nous analysons vos fichiers pour détecter et masquer les données sensibles avant l\'envoi à l\'IA.'
                        : 'Vos documents sont prêts. L\'IA ne verra que les versions anonymisées.'}
                </p>
            </div>

            {result && (
                <div className={`w-full max-w-2xl p-6 rounded-xl border space-y-4 text-left
                    ${mode === 'dark' ? 'bg-[#252528] border-[#333]' : 'bg-white border-gray-200'}
                `}>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                            <span className="text-xs font-bold text-red-500 uppercase block mb-1">Emails</span>
                            <span className="text-xl font-bold">{result.entitiesDetected.emails.length}</span>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <span className="text-xs font-bold text-blue-500 uppercase block mb-1">Téléphones</span>
                            <span className="text-xl font-bold">{result.entitiesDetected.phones.length}</span>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                            <span className="text-xs font-bold text-green-500 uppercase block mb-1">Total Entités</span>
                            <span className="text-xl font-bold">{result.mappings.length}</span>
                        </div>
                    </div>
                    
                    <div className="text-xs font-mono p-3 rounded bg-black/5 dark:bg-white/5 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {result.anonymizedText.slice(0, 1000) + (result.anonymizedText.length > 1000 ? '...' : '')}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={() => onComplete(result)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all"
                        >
                            Valider et Continuer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
