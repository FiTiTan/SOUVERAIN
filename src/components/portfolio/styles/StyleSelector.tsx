import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { getAllPalettes, type StylePalette } from '../../../config/stylePalettes';
import { 
  suggestStyleWithOllama, 
  type StyleSuggestion 
} from '../../../services/styleService';
import { getIntention } from '../../../services/intentionService';
import { Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  currentStyle?: string;
  onSelect: (styleId: string) => void;
  portfolioId: string;
  externalAccounts?: any[];
  projectsCount?: number;
  mediaStats?: { images: number; videos: number; documents: number };
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  currentStyle,
  onSelect,
  portfolioId,
  externalAccounts = [],
  projectsCount = 0,
  mediaStats = { images: 0, videos: 0, documents: 0 }
}) => {
  const { mode } = useTheme();
  const palettes = getAllPalettes();
  const [suggestion, setSuggestion] = useState<StyleSuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(true);

  // Load AI suggestion on mount
  useEffect(() => {
    const loadSuggestion = async () => {
      setIsLoadingSuggestion(true);
      try {
        const intention = await getIntention(portfolioId);
        const result = await suggestStyleWithOllama(
          externalAccounts,
          intention,
          projectsCount,
          mediaStats
        );
        setSuggestion(result);
      } catch (error) {
        console.error('[StyleSelector] Erreur suggestion style:', error);
      } finally {
        setIsLoadingSuggestion(false);
      }
    };
    
    if (portfolioId) {
      loadSuggestion();
    }
  }, [portfolioId, externalAccounts, projectsCount, mediaStats]);

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      onSelect(suggestion.suggestedStyle);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestion Block with Loader */}
      {isLoadingSuggestion ? (
        <div className={`p-6 rounded-xl border-2 animate-pulse ${
          mode === 'dark'
            ? 'bg-zinc-800/50 border-zinc-700'
            : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className="text-4xl opacity-50">✨</div>
            <div className="flex-1 space-y-3">
              <div className={`h-4 rounded w-48 ${mode === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
              <div className={`h-3 rounded w-64 ${mode === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
              <div className={`h-3 rounded w-56 ${mode === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      ) : suggestion && (
        <div className={`p-6 rounded-xl border-2 ${
          mode === 'dark'
            ? 'bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-500/30'
            : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300'
        }`}>
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-violet-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-violet-400">Suggestion IA</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                  {Math.round(suggestion.confidence * 100)}% confiance
                </span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Je vous suggère le style <span className="text-violet-500">
                  {palettes.find(p => p.id === suggestion.suggestedStyle)?.name}
                </span>
              </h3>
              <p className={`text-sm mb-4 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {suggestion.reasoning}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAcceptSuggestion}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-violet-500/20"
                >
                  Appliquer ce style
                </button>
                <button
                  onClick={() => {}}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    mode === 'dark'
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Voir tous les styles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`p-6 rounded-xl border ${
        mode === 'dark' ? 'bg-[#1A1A1C] border-[#333]' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-2xl font-bold mb-2 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Quelle ambiance vous correspond ?
        </h3>
        <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Choisissez une palette basée sur votre personnalité
        </p>
      </div>

      {/* Palette Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {palettes.map((palette) => {
          const isSelected = currentStyle === palette.id || (!currentStyle && palette.id === 'moderne');
          const isSuggested = suggestion?.suggestedStyle === palette.id;

          return (
            <button
              key={palette.id}
              onClick={() => onSelect(palette.id)}
              className={`text-left relative flex flex-col h-full p-6 rounded-xl border-2 transition-all duration-200 group
                ${isSelected
                  ? 'border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20'
                  : isSuggested
                    ? 'border-purple-400 bg-purple-500/5'
                    : mode === 'dark'
                      ? 'border-[#333] hover:border-gray-500 bg-[#1A1A1C]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'}
              `}
            >
              {/* Badge if suggested */}
              {isSuggested && !isSelected && (
                <div className="absolute top-3 right-3">
                  <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    SUGGÉRÉ
                  </span>
                </div>
              )}

              {/* Color Preview + Name */}
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: palette.designTokens.colors.primary,
                    border: `2px solid ${palette.designTokens.colors.primaryLight}`
                  }}
                >
                  {isSelected && <span className="text-white text-xl font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-lg leading-tight ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {palette.name}
                  </h4>
                  <span className={`text-xs font-medium opacity-70 ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {palette.tagline}
                  </span>
                </div>
              </div>

              {/* Ideal For */}
              <p className={`text-sm mb-4 flex-grow ${
                mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span className="font-semibold block mb-1 text-xs uppercase tracking-wide opacity-60">
                  Idéal pour :
                </span>
                {palette.idealFor}
              </p>

              {/* Color Swatches */}
              <div className={`border-t pt-4 mt-auto ${
                mode === 'dark' ? 'border-[#333]' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: palette.designTokens.colors.primary }}
                    title="Couleur principale"
                  />
                  <div
                    className="w-6 h-6 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: palette.designTokens.colors.accent }}
                    title="Couleur accent"
                  />
                  <div
                    className="w-6 h-6 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: palette.designTokens.colors.secondary }}
                    title="Couleur secondaire"
                  />
                  <span className={`text-[10px] ml-auto font-mono opacity-50 ${
                    mode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {palette.designTokens.typography.headingFont}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
