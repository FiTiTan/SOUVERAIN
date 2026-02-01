import React, { useState } from 'react';
import { useTheme } from '../../../../../ThemeContext';
import type { ProjectData } from '../../../../../services/projectAIService';

/*
interface ProjectData {
    title: string;
    description: string;
    context: string;
    process: string;
    results: string;
    tags: string[];
}
*/

interface Step5Props {
    project: ProjectData;
    onSave: (data: ProjectData) => void;
}

export const Step5_GeneratedEditor: React.FC<Step5Props> = ({ project: initialProject, onSave }) => {
    const { mode } = useTheme();
    const [project, setProject] = useState(initialProject);

    const handleChange = (field: keyof ProjectData, value: string) => {
        setProject(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-2xl font-bold">Fiche Projet Générée !</h3>
                <p className="opacity-60">L'IA a structuré vos informations. Vérifiez et ajustez si besoin.</p>
            </div>

            <div className={`p-8 rounded-xl border space-y-6 shadow-sm
                ${mode === 'dark' ? 'bg-[#252528] border-[#333]' : 'bg-white border-gray-200'}
            `}>
                {/* Title */}
                <div>
                    <label className="block text-xs uppercase font-bold opacity-50 mb-1">Titre du Projet</label>
                    <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={`w-full text-2xl font-bold bg-transparent border-b border-transparent focus:border-blue-500 outline-none pb-1
                            ${mode === 'dark' ? 'text-white' : 'text-gray-900'}
                        `}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs uppercase font-bold opacity-50 mb-1">Résumé</label>
                    <textarea
                        value={project.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className={`w-full bg-transparent resize-none outline-none text-lg opacity-80
                            ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'}
                        `}
                        rows={2}
                    />
                </div>

                {/* Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                        <label className="block text-xs uppercase font-bold text-blue-500">Contexte</label>
                        <textarea
                            value={project.context}
                            onChange={(e) => handleChange('context', e.target.value)}
                            className="w-full bg-transparent resize-none outline-none text-sm opacity-80 h-32 p-2 border rounded border-dashed border-gray-500/30 focus:border-blue-500 focus:border-solid transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs uppercase font-bold text-purple-500">Réalisation</label>
                        <textarea
                            value={project.process}
                            onChange={(e) => handleChange('process', e.target.value)}
                            className="w-full bg-transparent resize-none outline-none text-sm opacity-80 h-32 p-2 border rounded border-dashed border-gray-500/30 focus:border-purple-500 focus:border-solid transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs uppercase font-bold text-green-500">Résultats</label>
                        <textarea
                            value={project.results}
                            onChange={(e) => handleChange('results', e.target.value)}
                            className="w-full bg-transparent resize-none outline-none text-sm opacity-80 h-32 p-2 border rounded border-dashed border-gray-500/30 focus:border-green-500 focus:border-solid transition-colors"
                        />
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-xs uppercase font-bold opacity-50 mb-2">Tags IA</label>
                    <div className="flex gap-2 flex-wrap">
                        {project.tags.map((tag, i) => (
                            <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold
                                ${mode === 'dark' ? 'bg-[#333] text-gray-300' : 'bg-gray-100 text-gray-700'}
                            `}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => onSave(project)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/20 transition-all transform hover:scale-105"
                >
                    Valider et Créer le Projet
                </button>
            </div>
        </div>
    );
};
