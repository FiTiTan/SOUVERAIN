/**
 * SOUVERAIN - Anonymization Animation
 * Animation pendant l'analyse avec feedback sur l'anonymisation et checklist dynamique
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius } from '../design-system';
import { AnonymizationTicker } from './ui/AnonymizationTicker';

// ============================================================
// TYPES
// ============================================================

interface AnalysisAnimationProps {
  isActive: boolean;
  anonymizationStats?: {
    persons?: number;
    emails?: number;
    phones?: number;
    companies?: number;
    schools?: number;
    locations?: number;
    totalMasked?: number;
  };
  currentPhase?: 'reading' | 'anonymizing' | 'analyzing' | 'complete' | 'design' | 'generate' | 'done';
  customSteps?: Array<{ id: string; label: string }>;
}

// ============================================================
// ICONS
// ============================================================

const AnimIcons = {
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Pending: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity: 0.3}}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const AnalysisAnimation: React.FC<AnalysisAnimationProps> = ({
  isActive,
  anonymizationStats,
  currentPhase = 'reading',
  customSteps
}) => {
  const { theme, mode } = useTheme();

  // Liste des étapes affichées (Checklist)
  // Default to CV steps if not provided
  const steps = customSteps || [
    { id: 'reading', label: 'Lecture du fichier CV' },
    { id: 'anonymizing', label: 'Anonymisation des données sensibles' },
    { id: 'analyzing', label: 'Analyse IA & Rédaction du rapport' },
    { id: 'complete', label: 'Finalisation' }
  ];

  // Déterminer l'état de chaque étape
  const getStepStatus = (stepId: string) => {
    const phases = ['reading', 'anonymizing', 'analyzing', 'complete'];
    const currentIndex = phases.indexOf(currentPhase);
    const stepIndex = phases.indexOf(stepId);

    if (stepIndex < currentIndex) return 'done';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '3rem',
        backgroundColor: theme.bg.secondary,
        borderRadius: borderRadius.xl,
        boxShadow: theme.shadow.xl,
        border: `1px solid ${theme.border.light}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: theme.text.primary,
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em'
          }}>
            Analyse en cours
          </h2>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: theme.text.tertiary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ 
              display: 'inline-block',
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: theme.semantic.warningBg,
              animation: 'pulse 1.5s infinite' 
            }}/>
            Temps estimé : ~1 minute
          </p>
        </div>

        {/* Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const isDone = status === 'done';
            const isActiveStep = status === 'active';

            return (
              <div key={step.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                opacity: status === 'pending' ? 0.4 : 1,
                transform: isActiveStep ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDone ? theme.semantic.success : (isActiveStep ? theme.accent.primary : theme.text.tertiary)
                }}>
                  {isDone ? <AnimIcons.Check /> : (isActiveStep ? <AnimIcons.Loader /> : <AnimIcons.Pending />)}
                </div>
                <span style={{
                  fontSize: isActiveStep ? typography.fontSize.lg : typography.fontSize.base,
                  fontWeight: isActiveStep ? typography.fontWeight.semibold : typography.fontWeight.normal,
                  color: isDone ? theme.text.secondary : (isActiveStep ? theme.text.primary : theme.text.tertiary),
                  transition: 'all 0.3s ease'
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Message (Anonymization specifics) */}
        {currentPhase === 'anonymizing' && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: theme.bg.tertiary,
            borderRadius: borderRadius.lg,
            borderLeft: `3px solid ${theme.accent.primary}`,
          }}>
            <p style={{ fontSize: typography.fontSize.xs, color: theme.text.secondary }}>
              🔒 <strong>Confidentialité :</strong> Nous remplaçons vos informations personnelles par des pseudonymes avant l'envoi à l'IA.
            </p>
          </div>
        )}

      </div>

      {/* Pop-up Ticker - Active during anonymization AND analysis to reassure user */}
      <AnonymizationTicker isActive={currentPhase === 'anonymizing' || currentPhase === 'analyzing'} />

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${theme.semantic.warning}40; }
          70% { box-shadow: 0 0 0 6px ${theme.semantic.warning}00; }
          100% { box-shadow: 0 0 0 0 ${theme.semantic.warning}00; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};


export default AnalysisAnimation;
