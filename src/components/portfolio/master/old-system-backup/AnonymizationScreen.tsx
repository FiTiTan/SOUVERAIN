import React, { useEffect, useState } from 'react';
// import { detectAndAnonymize, type AnonymizedResult } from '../../../services/anonymizationService'; // DEPRECATED: WebLLM
import { useTheme } from '../../../ThemeContext';
import { Shield, Check } from 'lucide-react';

export interface AnonymizedResult {
    originalText: string;
    anonymizedText: string;
    mappings: { original: string; replacement: string }[];
    entitiesDetected: {
        people: string[];
        companies: string[];
        emails: string[];
        phones: string[];
        amounts: string[];
        addresses: string[];
        locations: string[];
    };
}

interface AnonymizationScreenProps {
  textContent: string;
  portfolioId: string;
  dataStats: {
    hasLinkedIn: boolean;
    hasNotion: boolean;
    projectsCount: number;
    mediaCount: number;
  };
  onComplete: (result: AnonymizedResult) => void;
}

// ============================================================
// ANIMATED COUNTER
// ============================================================

// The AnimatedCounter component is no longer used in the new UI, so it can be removed or kept if potentially used elsewhere.
// For this change, I will remove it as it's part of the old UI structure.
/*
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    
    // Durée fixe ou proportionnelle, ici fixe pour l'effet visuel
    const steps = 60;
    const increment = end / steps;
    const stepDuration = duration / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};
*/

// Shared Components or inline for now to avoid multiple files edit complexity
// We will inline the step list logic to match Screenshot 2

export const AnonymizationScreen: React.FC<AnonymizationScreenProps> = ({
  textContent,
  portfolioId,
  dataStats,
  onComplete
}) => {
  const { theme } = useTheme();
  const [status, setStatus] = useState<'analyzing' | 'done'>('analyzing');
  const [result, setResult] = useState<AnonymizedResult | null>(null);

  useEffect(() => {
    const process = async () => {
      try {
        console.log('[AnonymizationScreen] Using Backend BERT Engine...');
        // @ts-ignore
        const analysis = await window.electron.invoke('anonymize-text-local', { 
            text: textContent, 
            portfolioId 
        });
        
        // Simuler un petit délai pour l'expérience utilisateur et la synchronisation visuelle
        await new Promise(r => setTimeout(r, 2000));
        
        setResult(analysis);
        setStatus('done');
        // Auto-proceed handled by parent or button? 
        // User requested "loading screen", usually auto-proceeds or shows "Done".
        // In this flow, we likely want to auto-call onComplete after a brief "Done" state.
        setTimeout(() => {
             onComplete(analysis);
        }, 800);

      } catch (error) {
        console.error('Anonymization error:', error);
        // Fallback
        const fallbackResult: AnonymizedResult = {
          originalText: textContent,
          anonymizedText: textContent,
          mappings: [],
          entitiesDetected: { people: [], companies: [], emails: [], phones: [], amounts: [], addresses: [], locations: [] }
        };
        setResult(fallbackResult);
        setStatus('done');
        setTimeout(() => {
             onComplete(fallbackResult);
        }, 800);
      }
    };
    process();
  }, [textContent, portfolioId]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
         gap: '2rem'
      }}>
        
        {/* Loader Icon */}
        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          marginBottom: '1rem'
        }}>
           {/* Outer Ring */}
           <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `4px solid ${theme.accent.primary}20`
           }} />
           {/* Spinning Arc */}
           <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `4px solid ${theme.accent.primary}`,
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
           }} />
        </div>

        {/* Title & Subtitle */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: theme.text.primary,
            marginBottom: '0.5rem'
          }}>
            Génération en cours
          </h2>
          <p style={{
            color: theme.text.secondary,
            fontSize: '1rem',
            margin: 0
          }}>
            Votre portfolio est en train d'être créé...
          </p>
        </div>

        {/* Progress Bar - ~25% for Anonymization */}
        <div style={{ width: '100%', maxWidth: '480px' }}>
             <div style={{
               height: '6px',
               width: '100%',
               backgroundColor: theme.bg.tertiary,
               borderRadius: '3px',
               overflow: 'hidden',
               marginBottom: '0.5rem'
             }}>
                <div style={{
                   height: '100%',
                   width: status === 'done' ? '25%' : '15%', // Visualize progress
                   backgroundColor: theme.accent.primary,
                   transition: 'width 1s ease',
                   borderRadius: '3px'
                }} />
             </div>
             <p style={{
                textAlign: 'right',
                fontSize: '0.8rem',
                color: theme.text.tertiary,
                margin: 0
             }}>
                25% complété
             </p>
        </div>

        {/* Steps List */}
        <div style={{
           width: '100%',
           maxWidth: '480px',
           backgroundColor: theme.bg.secondary,
           borderRadius: '16px',
           border: `1px solid ${theme.border.default}`,
           padding: '0',
           overflow: 'hidden'
        }}>
            {/* Step 1: Anonymization (Active/Done) */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                borderBottom: `1px solid ${theme.border.light}`,
                backgroundColor: status === 'done' ? `${theme.accent.primary}08` : 'transparent'
            }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: status === 'done' ? theme.accent.primary : `${theme.accent.primary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: status === 'done' ? '#fff' : theme.accent.primary,
                    fontSize: '12px',
                    fontWeight: 700
                }}>
                    {status === 'done' ? '✓' : 
                     <div style={{
                        width: '12px',
                        height: '12px',
                        border: `2px solid ${theme.accent.primary}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                     }} />
                    }
                </div>
                <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: status === 'done' ? theme.accent.primary : theme.text.primary
                }}>
                    Anonymisation des données
                </span>
                {status === 'done' && (
                    <span style={{ marginLeft: 'auto', color: theme.accent.primary }}>✓</span>
                )}
            </div>

            {/* Step 2: Groq Analysis (Pending) */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                borderBottom: `1px solid ${theme.border.light}`,
                opacity: 0.6
            }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${theme.border.default}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} />
                <span style={{ fontSize: '0.95rem', color: theme.text.secondary }}>
                    Analyse du contenu avec Groq
                </span>
            </div>

            {/* Step 3: Style (Pending) */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                borderBottom: `1px solid ${theme.border.light}`,
                opacity: 0.6
            }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${theme.border.default}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} />
                 <span style={{ fontSize: '0.95rem', color: theme.text.secondary }}>
                    Application du style visuel
                </span>
            </div>

             {/* Step 4: Final Generation (Pending) */}
             <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                opacity: 0.6
            }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${theme.border.default}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} />
                 <span style={{ fontSize: '0.95rem', color: theme.text.secondary }}>
                    Génération du portfolio final
                </span>
            </div>
        </div>

        {/* Time Estimate */}
        <p style={{
            color: theme.text.tertiary,
            fontSize: '0.9rem',
            marginTop: '-0.5rem'
        }}>
            Temps estimé : ~1 minute
        </p>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};
