import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, totalSteps }) => {
  const { theme } = useTheme();

  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Step indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div style={{ color: theme.text.primary, fontSize: '0.95rem', fontWeight: 500 }}>
          Étape {currentStep}/{totalSteps}
        </div>
        <div style={{ color: theme.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>
          {Math.round(percentage)}%
        </div>
      </div>

      {/* Progress bar container */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: theme.bg.tertiary,
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            height: '100%',
            backgroundColor: theme.text.secondary,
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Visual step dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
        }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <motion.div
              key={stepNumber}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: isActive ? 1.2 : 1,
                opacity: isActive || isCompleted ? 1 : 0.3,
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: isActive ? '10px' : '8px',
                height: isActive ? '10px' : '8px',
                borderRadius: '50%',
                backgroundColor: isCompleted
                  ? theme.text.secondary
                  : isActive
                  ? theme.text.primary
                  : theme.text.muted,
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
