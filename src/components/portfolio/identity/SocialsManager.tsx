import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import type { ExternalAccount } from '../../../types/portfolio';

interface SocialsManagerProps {
  portfolioId: string;
}

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'github', label: 'GitHub', icon: '💻' },
  { id: 'twitter', label: 'Twitter / X', icon: '🐦' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'dribbble', label: 'Dribbble', icon: '🎨' },
  { id: 'behance', label: 'Behance', icon: '🔵' },
  { id: 'website', label: 'Site Web', icon: '🌐' },
  { id: 'other', label: 'Autre', icon: '🔗' },
];

export const SocialsManager: React.FC<SocialsManagerProps> = ({ portfolioId }) => {
  const { mode } = useTheme();
  const [socials, setSocials] = useState<ExternalAccount[]>([]);
  const [newPlatform, setNewPlatform] = useState<string>('linkedin');
  const [newUrl, setNewUrl] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocials();
  }, [portfolioId]);

  const fetchSocials = async () => {
    try {
      // @ts-ignore
      const data = await window.electron.portfolioV2.externalAccount.getAll(portfolioId);
      setSocials(data);
    } catch (error) {
      console.error('Failed to fetch socials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newUrl) return;
    
    try {
      const account = {
        portfolioId,
        platform: newPlatform,
        url: newUrl,
        username: newUsername,
        isPrimary: socials.length === 0 // First one is primary by default
      };

      // @ts-ignore
      const res = await window.electron.portfolioV2.externalAccount.add(account);
      if (res.success) {
        setNewUrl('');
        setNewUsername('');
        fetchSocials();
      }
    } catch (error) {
      console.error('Failed to add social:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce lien ?')) return;
    try {
      // @ts-ignore
      const res = await window.electron.portfolioV2.externalAccount.delete(id);
      fetchSocials();
    } catch (error) {
      console.error('Failed to delete social:', error);
    }
  };

  const getIcon = (platform: string) => {
    const p = PLATFORMS.find(x => x.id === platform);
    return p ? p.icon : '🔗';
  };

  return (
    <div className={`p-6 rounded-xl border ${mode === 'dark' ? 'bg-[#1A1A1C] border-[#333]' : 'bg-white border-gray-200'} space-y-6 h-full flex flex-col`}>
      <h3 className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Réseaux & Liens</h3>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
        {loading ? (
          <div className="text-gray-500 italic">Chargement...</div>
        ) : socials.length === 0 ? (
          <div className="text-gray-500 italic text-center py-8">Aucun réseau connecté</div>
        ) : (
          socials.map((social) => {
            const Icon = getIcon(social.platform);
            return (
              <div key={social.id} className={`flex items-center justify-between p-3 rounded-lg group
                ${mode === 'dark' ? 'bg-[#252528]' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`p-2 rounded-full text-xl ${mode === 'dark' ? 'bg-[#333]' : 'bg-white'}`}>
                    {Icon}
                  </div>
                  <div className="truncate">
                    <div className={`font-medium truncate ${mode === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                    </div>
                    {(social.username || social.url) && (
                      <div className="text-xs text-gray-500 truncate">
                        {social.username || social.url}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(social.id)}
                  className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ❌
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add New */}
      <div className={`pt-4 border-t ${mode === 'dark' ? 'border-[#333]' : 'border-gray-200'} space-y-3`}>
        <div className="flex space-x-2">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            className={`p-2 rounded-lg border outline-none
              ${mode === 'dark' ? 'bg-[#252528] border-[#333] text-white' : 'bg-white border-gray-300'}`}
          >
            {PLATFORMS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="@username (optionnel)"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className={`flex-1 p-2 rounded-lg border outline-none
              ${mode === 'dark' ? 'bg-[#252528] border-[#333] text-white' : 'bg-white border-gray-300'}`}
          />
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="URL (https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className={`flex-1 p-2 rounded-lg border outline-none
              ${mode === 'dark' ? 'bg-[#252528] border-[#333] text-white' : 'bg-white border-gray-300'}`}
          />
          <button
            onClick={handleAdd}
            disabled={!newUrl}
            className={`p-2 rounded-lg flex items-center justify-center w-10
              ${!newUrl ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            ➕
          </button>
        </div>
      </div>
    </div>
  );
};
