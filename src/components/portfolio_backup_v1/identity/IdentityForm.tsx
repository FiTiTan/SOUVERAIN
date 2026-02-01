import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import type { PortfolioV2 } from '../../../types/portfolio';

interface IdentityFormProps {
  portfolio: PortfolioV2;
  onUpdate: () => void;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({ portfolio, onUpdate }) => {
  const { mode } = useTheme();
  const [authorName, setAuthorName] = useState(portfolio.authorName || portfolio.title || ''); // Fallback to title if name empty
  const [tagline, setTagline] = useState(portfolio.tagline || '');
  const [authorBio, setAuthorBio] = useState(portfolio.authorBio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Sync state if portfolio updates externally
    setAuthorName(portfolio.authorName || portfolio.title || '');
    setTagline(portfolio.tagline || '');
    setAuthorBio(portfolio.authorBio || '');
  }, [portfolio]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      // @ts-ignore
      const result = await window.electron.invoke('portfolio-update-identity', {
        id: portfolio.id,
        authorName,
        tagline,
        authorBio
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Identité mise à jour' });
        onUpdate();
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur sauvegarde' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`p-6 rounded-xl border ${mode === 'dark' ? 'bg-[#1A1A1C] border-[#333]' : 'bg-white border-gray-200'} space-y-6`}>
      <h3 className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Carte d'Identité</h3>
      
      {/* Name Input */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Nom complet (Auteur)
        </label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Ex: Ralph Lauren"
          className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors
            ${mode === 'dark' 
              ? 'bg-[#0A0A0B] border-[#333] text-white placeholder-gray-600' 
              : 'bg-gray-50 border-gray-200 text-gray-900'}`}
        />
      </div>

      {/* Tagline Input */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Accroche / Titre (Tagline)
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Ex: Architecte de Solutions Numériques"
          className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors
            ${mode === 'dark' 
              ? 'bg-[#0A0A0B] border-[#333] text-white placeholder-gray-600' 
              : 'bg-gray-50 border-gray-200 text-gray-900'}`}
        />
      </div>

      {/* Bio Input */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Biographie Courte
        </label>
        <textarea
          value={authorBio}
          onChange={(e) => setAuthorBio(e.target.value)}
          rows={4}
          placeholder="Une brève description de qui vous êtes et de votre mission..."
          className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none
            ${mode === 'dark' 
              ? 'bg-[#0A0A0B] border-[#333] text-white placeholder-gray-600' 
              : 'bg-gray-50 border-gray-200 text-gray-900'}`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm">
          {message && (
            <span className={message.type === 'success' ? 'text-green-500' : 'text-red-500'}>
              {message.text}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
            ${mode === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};
