import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';

interface GenerationStep {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'processing' | 'done';
}

interface GenerationProgressProps {
  currentStep: string;
  steps?: GenerationStep[];
  error?: string | null;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  currentStep,
  steps: propSteps,
  error,
}) => {
  const { theme } = useTheme();
  
  const defaultSteps: GenerationStep[] = [
    { id: 'anonymize', label: 'Anonymisation des données', icon: '🔒', status: 'pending' },
    { id: 'analyze', label: 'Analyse du contenu avec Groq', icon: '🧠', status: 'pending' },
    { id: 'design', label: 'Application du style visuel', icon: '🎨', status: 'pending' },
    { id: 'generate', label: 'Génération du portfolio final', icon: '📄', status: 'pending' },
  ];

  const steps = propSteps || defaultSteps;

  // Calcul du progrès basé sur l'index de l'étape courante
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = Math.max(5, Math.min(100, ((currentStepIndex + (error ? 0 : 0.5)) / steps.length) * 100));

  // Determine status for visualization
  const getStepStatus = (index: number) => {
    if (error && index === currentStepIndex) return 'error';
    if (index < currentStepIndex) return 'done';
    if (index === currentStepIndex) return 'processing';
    return 'pending';
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg.primary,
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: `${theme.accent.primary}22`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${theme.accent.primary}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: theme.text.primary,
            margin: '0 0 0.5rem 0'
          }}>
            Génération en cours
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: theme.text.secondary,
            margin: 0
          }}>
            Votre portfolio est en train d'être créé...
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            height: '8px',
            backgroundColor: theme.border.light,
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                height: '100%',
                backgroundColor: theme.accent.primary,
                transition: 'width 0.5s ease',
                width: `${progress}%`
              }}
            />
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: theme.text.secondary,
            marginTop: '0.5rem'
          }}>
            {Math.round(progress)}% complété
          </p>
        </div>

        {/* Steps */}
        <div style={{
          backgroundColor: theme.bg.secondary,
          borderRadius: '16px',
          border: `1px solid ${theme.border.default}`,
          overflow: 'hidden'
        }}>
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isProcessing = status === 'processing';
            const isDone = status === 'done';
            const isError = status === 'error';

            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: isProcessing ? `${theme.accent.primary}11` : 'transparent',
                  borderBottom: index < steps.length - 1 ? `1px solid ${theme.border.light}` : 'none'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? '#D1FAE5' : isError ? '#FEE2E2' : isProcessing ? `${theme.accent.primary}22` : theme.bg.tertiary || theme.bg.primary,
                  color: isDone ? '#10B981' : isError ? '#DC2626' : isProcessing ? theme.accent.primary : theme.text.tertiary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                  transition: 'all 0.3s'
                }}>
                  {isDone ? (
                    <span style={{ fontSize: '1.25rem' }}>✓</span>
                  ) : isError ? (
                    <span>⚠️</span>
                  ) : isProcessing ? (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: `2px solid ${theme.accent.primary}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: 500,
                    color: isDone ? '#10B981' : isProcessing ? theme.accent.primary : theme.text.tertiary,
                    margin: 0,
                    fontSize: '0.875rem',
                    transition: 'color 0.3s'
                  }}>
                    {step.label}
                  </p>
                </div>
                {isDone && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#10B981'
                  }}>
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '12px'
          }}>
            <p style={{
              color: '#991B1B',
              fontSize: '0.875rem',
              margin: 0
            }}>
              ❌ {error}
            </p>
          </div>
        )}

        {/* CSS Animation for spinner */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GenerationProgress;
