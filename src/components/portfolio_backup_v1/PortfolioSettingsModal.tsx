import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { IdentityForm } from './identity/IdentityForm';
import { SocialsManager } from './identity/SocialsManager';
import { StyleSelector } from './styles/StyleSelector';
import { PublishManager } from './publication/PublishManager';
import type { PortfolioV2, PortfolioProjectV2 } from '../../types/portfolio'; 

interface PortfolioSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    portfolio: PortfolioV2;
    projects: PortfolioProjectV2[];
    onUpdate: () => void;
}

export const PortfolioSettingsModal: React.FC<PortfolioSettingsModalProps> = ({ 
    isOpen, onClose, portfolio, projects, onUpdate 
}) => {
    const { mode } = useTheme();
    const [activeTab, setActiveTab] = useState<'identity' | 'style' | 'publish'>('identity');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden
                ${mode === 'dark' ? 'bg-[#1A1A1C] text-white' : 'bg-white text-gray-900'}
            `}>
                <div className="p-6 border-b flex justify-between items-center border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold">Paramètres du Portfolio</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">✕</button>
                </div>

                <div className="flex h-full overflow-hidden">
                    {/* Sidebar */}
                    <div className={`w-64 p-4 border-r ${mode === 'dark' ? 'border-[#333] bg-[#222]' : 'border-gray-200 bg-gray-50'}`}>
                        <nav className="space-y-2">
                            <button 
                                onClick={() => setActiveTab('identity')}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors
                                    ${activeTab === 'identity' ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}
                                `}
                            >
                                👤 Identité & Réseaux
                            </button>
                            <button 
                                onClick={() => setActiveTab('style')}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors
                                    ${activeTab === 'style' ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}
                                `}
                            >
                                🎨 Style & Ambiance
                            </button>
                            <button 
                                onClick={() => setActiveTab('publish')}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors
                                    ${activeTab === 'publish' ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}
                                `}
                            >
                                🚀 Publication
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {activeTab === 'identity' && (
                            <div className="space-y-8">
                                <IdentityForm portfolio={portfolio} onUpdate={onUpdate} />
                                <SocialsManager portfolioId={portfolio.id} />
                            </div>
                        )}
                        {activeTab === 'style' && (
                            <StyleSelector 
                                currentStyle={portfolio.template || 'moderne'} 
                                onSelect={async (styleId) => {
                                    // Use standard V2 update to save the style as the template
                                    // @ts-ignore
                                    await window.electron.invoke('portfolio-v2-update', { 
                                        id: portfolio.id, 
                                        updates: { template: styleId } 
                                    });
                                    onUpdate();
                                }} 
                            />
                        )}
                        {activeTab === 'publish' && (
                            <PublishManager portfolio={portfolio} projects={projects} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
