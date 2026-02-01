import React from 'react';
import { useTheme } from '../../../../../ThemeContext';

interface Step1Props {
    onSelect: (type: string) => void;
}

const TYPES = [
    { id: 'mission', label: 'Mission Client', desc: 'Prestation réalisée pour un client', icon: '💼' },
    { id: 'perso', label: 'Projet Personnel', desc: 'Side project, expérimentation', icon: '🚀' },
    { id: 'collab', label: 'Collaboration', desc: 'Travail en équipe ou partenariat', icon: '🤝' },
    { id: 'formation', label: 'Formation', desc: 'Projet d\'étude ou certification', icon: '🎓' },
    { id: 'concours', label: 'Concours', desc: 'Hackathon, challenge design', icon: '🏆' },
    { id: 'opensource', label: 'Open Source', desc: 'Contribution à un repo public', icon: '🌐' },
];

export const Step1_TypeSelector: React.FC<Step1Props> = ({ onSelect }) => {
    const { mode } = useTheme();

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">Quel type de projet souhaitez-vous ajouter ?</h3>
                <p className="opacity-60">Cette information aidera l'IA à vous poser les bonnes questions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TYPES.map(type => (
                    <button
                        key={type.id}
                        onClick={() => onSelect(type.id)}
                        className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02]
                            ${mode === 'dark' 
                                ? 'bg-[#252528] border-[#333] hover:border-blue-500 hover:bg-[#2A2A2D]' 
                                : 'bg-gray-50 border-gray-100 hover:border-blue-500 hover:bg-white hover:shadow-lg'
                            }
                        `}
                    >
                        <div className="text-4xl mb-4">{type.icon}</div>
                        <h4 className="font-bold text-lg mb-1">{type.label}</h4>
                        <p className="text-sm opacity-60">{type.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
