import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { CalmCard } from '../../ui/CalmCard';
import { StyleIcons } from './StyleIcons';
import type { StyleAnalysisResult } from '../../../services/portfolioAnalysisService';

interface StyleConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  tagline: string;
  idealFor: string;
  features: string[];
  colors: { primary: string; accent: string; bg: string };
  themeColor: 'blue' | 'teal' | 'purple' | 'pink' | 'orange';
}

const STYLES: StyleConfig[] = [
  {
    id: 'moderne',
    name: 'Moderne',
    icon: StyleIcons.moderne,
    tagline: 'Dynamique et connecté',
    idealFor: 'Freelance tech, startup',
    features: ['Bento grid', 'Typo Inter', 'Gradients'],
    colors: { primary: '#3b82f6', accent: '#8b5cf6', bg: '#f8fafc' },
    themeColor: 'blue'
  },
  {
    id: 'classique',
    name: 'Classique',
    icon: StyleIcons.classique,
    tagline: 'Sobre et structuré',
    idealFor: 'Consultant, expert',
    features: ['Colonnes', 'Serif', 'Bleu marine'],
    colors: { primary: '#1e3a5f', accent: '#d4af37', bg: '#fafafa' },
    themeColor: 'purple'
  },
  {
    id: 'authentique',
    name: 'Authentique',
    icon: StyleIcons.authentique,
    tagline: 'Chaleureux et terrain',
    idealFor: 'Artisan, local',
    features: ['Hero wide', 'Tons terre', 'Photos'],
    colors: { primary: '#b45309', accent: '#059669', bg: '#fffbeb' },
    themeColor: 'orange'
  },
  {
    id: 'artistique',
    name: 'Artistique',
    icon: StyleIcons.artistique,
    tagline: "L'image avant tout",
    idealFor: 'Photographe, artiste',
    features: ['Masonry', 'Minimal', 'Noir/blanc'],
    colors: { primary: '#18181b', accent: '#71717a', bg: '#ffffff' },
    themeColor: 'pink'
  },
  {
    id: 'vitrine',
    name: 'Vitrine',
    icon: StyleIcons.vitrine,
    tagline: 'Pratique et accueillant',
    idealFor: 'Commerce, resto',
    features: ['Infos sticky', 'Horaires', 'Galerie'],
    colors: { primary: '#dc2626', accent: '#16a34a', bg: '#fef2f2' },
    themeColor: 'teal'
  },
  {
    id: 'formel',
    name: 'Formel',
    icon: StyleIcons.formel,
    tagline: 'Institutionnel',
    idealFor: 'Cabinet, notaire',
    features: ['Sections', 'Serif', 'Or'],
    colors: { primary: '#1e3a5f', accent: '#b8860b', bg: '#f8fafc' },
    themeColor: 'blue'
  },
];

interface StyleSuggestionProps {
  analysisResult: StyleAnalysisResult;
  onSelect: (styleId: string) => void;
  onBack: () => void;
}

export const StyleSuggestion: React.FC<StyleSuggestionProps> = ({
  analysisResult,
  onSelect,
  onBack,
}) => {
  const { theme } = useTheme();
  
  const { recommendedStyle, confidence, reasoning } = analysisResult;
  const recommendedConfig = STYLES.find(s => s.id === recommendedStyle);
  const otherStyles = STYLES.filter(s => s.id !== recommendedStyle);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
       {/* Header (20vh) */}
        <div style={{ 
            minHeight: '20vh', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '2rem'
        }}>
            <button
             onClick={onBack}
             style={{
               position: 'absolute',
               top: '2rem',
               left: '2rem',
               background: 'none',
               border: 'none',
               color: theme.text.secondary,
               cursor: 'pointer',
               fontSize: '0.95rem',
               display: 'flex', 
               alignItems: 'center', 
               gap: '0.5rem'
             }}
            >
              ← Retour
            </button>

            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 200,
              color: theme.text.primary,
              marginBottom: '1rem',
              letterSpacing: '-0.03em'
            }}>
              Analyse & Style
            </h1>
            
            {/* VISION SUMMARY BOX */}
            <div style={{
                maxWidth: '800px',
                padding: '1.5rem',
                background: theme.bg.secondary,
                borderRadius: '16px',
                border: `1px solid ${theme.border.default}`,
                textAlign: 'left'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '0.5rem',
                    color: theme.accent.primary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em'
                }}>
                    <span>✨</span> Vision Transversale
                </div>
                <p style={{
                    fontSize: '1.1rem',
                    color: theme.text.primary,
                    lineHeight: '1.6',
                    margin: 0
                }}>
                  "{analysisResult.summary}"
                </p>
                <div style={{ 
                    marginTop: '1rem', 
                    display: 'flex', 
                    gap: '1rem', 
                    fontSize: '0.85rem', 
                    color: theme.text.secondary 
                }}>
                    <span>🎯 <strong>Cible:</strong> {analysisResult.targetAudience}</span>
                    <span>🏭 <strong>Secteur:</strong> {analysisResult.detectedSector}</span>
                </div>
            </div>
        </div>

       {/* Recommended Style (Hero) */}
       {recommendedConfig && (
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem' }}>
              <CalmCard
                title={recommendedConfig.name}
                description={recommendedConfig.tagline}
                icon={recommendedConfig.icon}
                themeColor={recommendedConfig.themeColor}
                recommended
                onClick={() => onSelect(recommendedConfig.id)}
                style={{ width: '320px', transform: 'scale(1.1)' }}
              >
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {recommendedConfig.features.map(f => (
                          <span key={f} style={{ 
                              fontSize: '0.75rem', 
                              padding: '0.25rem 0.5rem', 
                              background: theme.bg.tertiary, 
                              borderRadius: '4px' 
                          }}>
                              {f}
                          </span>
                      ))}
                  </div>
                  <button style={{
                      marginTop: '2rem',
                      padding: '0.75rem 2rem',
                      borderRadius: '12px',
                      background: theme.accent.primary,
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer'
                  }}>
                      Choisir {recommendedConfig.name}
                  </button>
              </CalmCard>
           </div>
       )}

       {/* Other Styles Grid */}
       <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
           <h3 style={{ 
               textAlign: 'center', 
               fontSize: '1.5rem', 
               fontWeight: 300, 
               marginBottom: '2rem',
               color: theme.text.secondary
           }}>
               Ou explorez d'autres univers
           </h3>
           <div style={{
               display: 'flex',
               flexWrap: 'wrap',
               gap: '2rem',
               justifyContent: 'center'
           }}>
               {otherStyles.map(style => (
                   <CalmCard
                     key={style.id}
                     title={style.name}
                     description={style.tagline}
                     icon={style.icon}
                     themeColor={style.themeColor}
                     onClick={() => onSelect(style.id)}
                     style={{ width: '280px', minHeight: '300px' }}
                   />
               ))}
           </div>
       </div>

    </div>
  );
};
