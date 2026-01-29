import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../../ThemeContext';
import { Step1_TypeSelector } from './steps/Step1_TypeSelector';
import { Step2_FileImporter } from './steps/Step2_FileImporter';
import { Step3_Anonymization } from './steps/Step3_Anonymization';
import { Step4_AIChat } from './steps/Step4_AIChat';
import { Step5_GeneratedEditor } from './steps/Step5_GeneratedEditor';

interface ProjectCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (projectId: string) => void;
    portfolioId: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface WizardState {
    projectType: string;
    files: File[];
    anonymizedContent: any; // Placeholder for now
    chatHistory: any[];
    generatedProject: any;
}

export const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({ isOpen, onClose, onSuccess, portfolioId: _portfolioId }) => {
    const { mode } = useTheme();
    const [step, setStep] = useState<WizardStep>(1);
    const [state, setState] = useState<WizardState>({
        projectType: '',
        files: [],
        anonymizedContent: null,
        chatHistory: [],
        generatedProject: null
    });

    React.useEffect(() => {
        console.log("ProjectCreationWizard Mounted. isOpen:", isOpen, "PortfolioId:", _portfolioId);
        return () => console.log("ProjectCreationWizard Unmounted");
    }, [isOpen]);

    if (!isOpen) return null;

    // handlers for updating state
    const handleTypeSelect = (type: string) => {
        setState(prev => ({ ...prev, projectType: type }));
        setStep(2);
    };

    const handleFilesSelected = (files: File[]) => {
        setState(prev => ({ ...prev, files }));
        setStep(3);
    };

    const handleAnonymizationComplete = (anonymizedData: any) => {
        setState(prev => ({ ...prev, anonymizedContent: anonymizedData }));
        setStep(4);
    };

    const handleChatComplete = (generatedData: any) => {
        setState(prev => ({ ...prev, generatedProject: generatedData }));
        setStep(5);
    };

    const handleFinalValidation = async (finalData: any) => {
        if (!_portfolioId) {
            console.error("No portfolio ID provided");
            return;
        }

        try {
            // Mapping Generated Data to DB Schema
            const dbPayload = {
                portfolio_id: _portfolioId,
                title: finalData.title,
                brief_text: finalData.description, // 'description' mapping to 'brief_text' as summary
                context_text: finalData.context,
                solution_text: finalData.process, // 'process' mapping to 'solution_text'
                result_text: finalData.results,
                display_order: 0
            };
            
            // @ts-ignore
            const result = await window.electron.invoke('project-create', dbPayload);
            
            if (result.success) {
                console.log("Project created:", result.id);
                onSuccess(result.id);
            } else {
                console.error("Failed to create project:", result.error);
            }
        } catch (e) {
            console.error("Save Error:", e);
        } 
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100
                ${mode === 'dark' ? 'bg-[#1A1A1C] text-white border border-[#333]' : 'bg-white text-gray-900 border border-gray-200'}
            `}>
                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-center ${mode === 'dark' ? 'border-[#333]' : 'border-gray-100'}`}>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Nouveau Projet</h2>
                        <div className="flex gap-2 text-sm font-medium mt-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} className={`transition-colors ${step >= s ? 'text-blue-500' : 'opacity-40'}`}>
                                    {s}. {['Type', 'Fichiers', 'Anonymisation', 'IA Chat', 'Validation'][s-1]}
                                    {s < 5 && <span className="mx-2 opacity-30 text-black dark:text-white">•</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-black/20">
                    {step === 1 && <Step1_TypeSelector onSelect={handleTypeSelect} />}
                    {step === 2 && <Step2_FileImporter onNext={handleFilesSelected} existingFiles={state.files} />}
                    {step === 3 && <Step3_Anonymization files={state.files} portfolioId={_portfolioId} onComplete={handleAnonymizationComplete} />}
                    {step === 4 && <Step4_AIChat context={state} onComplete={handleChatComplete} />}
                    {step === 5 && <Step5_GeneratedEditor project={state.generatedProject} onSave={handleFinalValidation} />}
                </div>
            </div>
        </div>,
        document.body
    );
};
