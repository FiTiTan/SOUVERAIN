/**
 * SOUVERAIN - Anonymization Animation
 * Animation pendant l'analyse avec feedback sur l'anonymisation
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';

// ============================================================
// TYPES
// ============================================================

interface AnonymizationStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'done';
  count?: number;
  examples?: string[];
}

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
  currentPhase?: 'reading' | 'anonymizing' | 'analyzing' | 'complete';
}

// ============================================================
// ICONS
// ============================================================

const AnimIcons = {
  Eye: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Shield: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" opacity="0.2"/>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Building: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="6" x2="9" y2="6" strokeLinecap="round" />
      <line x1="15" y1="6" x2="15" y2="6" strokeLinecap="round" />
      <line x1="9" y1="10" x2="9" y2="10" strokeLinecap="round" />
      <line x1="15" y1="10" x2="15" y2="10" strokeLinecap="round" />
      <line x1="9" y1="14" x2="9" y2="14" strokeLinecap="round" />
      <line x1="15" y1="14" x2="15" y2="14" strokeLinecap="round" />
      <path d="M9 18h6v4H9z" />
    </svg>
  ),
  Brain: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04" />
    </svg>
  ),
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
};

// ============================================================
// ANIMATED COUNTER
// ============================================================

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 500 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const AnalysisAnimation: React.FC<AnalysisAnimationProps> = ({
  isActive,
  anonymizationStats,
  currentPhase = 'reading'
}) => {
  const { theme, mode } = useTheme();
  const [progress, setProgress] = useState(0);
  const [visibleItems, setVisibleItems] = useState<string[]>([]);

  // Simulate progress
  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setVisibleItems([]);
      return;
    }

    const phases = {
      reading: 15,
      anonymizing: 45,
      analyzing: 85,
      complete: 100
    };

    const targetProgress = phases[currentPhase];
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) return targetProgress;
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isActive, currentPhase]);

  // Reveal anonymization items progressively
  useEffect(() => {
    if (currentPhase !== 'anonymizing' || !anonymizationStats) return;

    const items: string[] = [];
    if (anonymizationStats.persons) items.push('persons');
    if (anonymizationStats.emails) items.push('emails');
    if (anonymizationStats.companies) items.push('companies');
    if (anonymizationStats.schools) items.push('schools');
    if (anonymizationStats.phones) items.push('phones');
    if (anonymizationStats.locations) items.push('locations');

    let idx = 0;
    const timer = setInterval(() => {
      if (idx < items.length) {
        setVisibleItems(prev => [...prev, items[idx]]);
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 300);

    return () => clearInterval(timer);
  }, [currentPhase, anonymizationStats]);

  if (!isActive) return null;

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'reading': return 'Lecture du document...';
      case 'anonymizing': return 'Protection de vos données...';
      case 'analyzing': return 'Analyse par l\'IA...';
      case 'complete': return 'Analyse terminée !';
      default: return 'Traitement...';
    }
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'reading': return <AnimIcons.Eye />;
      case 'anonymizing': return <AnimIcons.Shield />;
      case 'analyzing': return <AnimIcons.Brain />;
      case 'complete': return <AnimIcons.Check />;
      default: return <AnimIcons.Loader />;
    }
  };

  const anonymizationItems = [
    { key: 'persons', icon: <AnimIcons.User />, label: 'Identités', count: anonymizationStats?.persons || 0, token: '[PERSON_X]' },
    { key: 'emails', icon: <AnimIcons.Mail />, label: 'Emails', count: anonymizationStats?.emails || 0, token: '[EMAIL_X]' },
    { key: 'companies', icon: <AnimIcons.Building />, label: 'Entreprises', count: anonymizationStats?.companies || 0, token: '[COMPANY_X]' },
    { key: 'schools', icon: <AnimIcons.Building />, label: 'Écoles', count: anonymizationStats?.schools || 0, token: '[SCHOOL_X]' },
  ].filter(item => item.count > 0);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        padding: '2.5rem',
        backgroundColor: theme.bg.secondary,
        borderRadius: borderRadius.xl,
        boxShadow: theme.shadow.xl,
        border: `1px solid ${theme.border.light}`,
      }}>
        {/* Header with animated icon */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: currentPhase === 'complete' ? theme.semantic.successBg : theme.accent.muted,
            color: currentPhase === 'complete' ? theme.semantic.success : theme.accent.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            animation: currentPhase !== 'complete' ? 'pulse 2s infinite' : 'none',
          }}>
            {getPhaseIcon()}
          </div>
          
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}>
            {getPhaseLabel()}
          </h2>
          
          <p style={{
            fontSize: typography.fontSize.sm,
            color: theme.text.tertiary,
            textAlign: 'center',
          }}>
            {currentPhase === 'anonymizing' 
              ? 'Vos informations personnelles sont masquées avant envoi'
              : currentPhase === 'analyzing'
              ? 'L\'IA analyse votre CV de manière confidentielle'
              : ''}
          </p>
        </div>

        {/* Anonymization details */}
        {(currentPhase === 'anonymizing' || currentPhase === 'analyzing') && anonymizationItems.length > 0 && (
          <div style={{
            backgroundColor: theme.bg.tertiary,
            borderRadius: borderRadius.lg,
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: `1px solid ${theme.border.light}`,
            }}>
              <AnimIcons.Shield />
              <span style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: theme.text.primary,
              }}>
                Données protégées
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.bold,
                color: theme.semantic.success,
              }}>
                <AnimatedCounter value={anonymizationStats?.totalMasked || 0} />
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {anonymizationItems.map((item, idx) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: theme.bg.secondary,
                    borderRadius: borderRadius.md,
                    opacity: visibleItems.includes(item.key) || currentPhase === 'analyzing' ? 1 : 0,
                    transform: visibleItems.includes(item.key) || currentPhase === 'analyzing' ? 'translateX(0)' : 'translateX(-20px)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span style={{ color: theme.semantic.success }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary, flex: 1 }}>
                    {item.count} {item.label}
                  </span>
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    fontFamily: 'monospace',
                    color: theme.text.tertiary,
                    backgroundColor: theme.bg.tertiary,
                    padding: '0.125rem 0.5rem',
                    borderRadius: borderRadius.sm,
                  }}>
                    → {item.token}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}>
            <span style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
              Progression
            </span>
            <span style={{ fontSize: typography.fontSize.xs, color: theme.text.secondary, fontWeight: typography.fontWeight.medium }}>
              {progress}%
            </span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: theme.border.light,
            borderRadius: borderRadius.full,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: currentPhase === 'complete' ? theme.semantic.success : theme.accent.primary,
              borderRadius: borderRadius.full,
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }} />
          </div>
        </div>

        {/* Trust message */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem',
          backgroundColor: theme.semantic.successBg,
          borderRadius: borderRadius.lg,
          color: theme.semantic.success,
          fontSize: typography.fontSize.xs,
        }}>
          <AnimIcons.Shield />
          Vos données personnelles ne quittent jamais votre appareil
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
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
