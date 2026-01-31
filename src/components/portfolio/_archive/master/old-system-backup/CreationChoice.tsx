import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { CalmCard } from '../../ui/CalmCard';

interface CreationChoiceProps {
  isPremium: boolean;
  onStartFromScratch: () => void;
  onImportDesign: () => void;
  onBack: () => void;
}

export const CreationChoice: React.FC<CreationChoiceProps> = ({
  isPremium,
  onStartFromScratch,
  onImportDesign,
  onBack,
}) => {
  const { theme } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden', // Prevent horizontal scroll from glow
      position: 'relative' // Ensure contained
    }}>
      {/* 20vh Header Space for Mascot/Title as per CALM-UI */}
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
            fontWeight: 200, // Thin title
            color: theme.text.primary,
            marginBottom: '1rem',
            letterSpacing: '-0.03em'
          }}>
            Créer votre Portfolio
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: theme.text.secondary,
            maxWidth: '600px'
          }}>
            Choisissez comment vous souhaitez commencer votre aventure
          </p>
      </div>

      {/* Cards Container */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingBottom: '4rem'
      }}>
          <CalmCard 
            title="Partir de zéro"
            description="L'IA vous guide étape par étape pour créer un portfolio unique, structure le contenu et rédige les textes pour vous."
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
              </svg>
            }
            themeColor="blue"
            recommended
            onClick={onStartFromScratch}
          />

          <CalmCard 
            title="Importer un design"
            description="Réutilisez un template existant ou importez une sauvegarde d'un portfolio précédent pour gagner du temps."
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            }
            themeColor="orange"
            disabled={!isPremium}
            onClick={isPremium ? onImportDesign : undefined}
          >
             {!isPremium && (
                 <div style={{
                     marginTop: '1rem',
                     padding: '0.5rem 1rem',
                     background: 'rgba(245, 158, 11, 0.1)',
                     color: '#F59E0B',
                     borderRadius: '12px',
                     fontSize: '0.8rem',
                     fontWeight: 600
                 }}>
                     ✨ Premium Uniquement
                 </div>
             )}
          </CalmCard>
      </div>
    </div>
  );
};

export default CreationChoice;
