import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius } from '../../design-system';

interface AnonymizationTickerProps {
  isActive: boolean;
}

const MESSAGES = [
  // Phase Anonymisation - Direct & Exhaustif
  "Emails anonymisés 🔒",
  "Numéros de téléphone masqués 🔒",
  "Identités pseudonymisées 🛡️",
  "Adresses postales floutées 📍",
  "Entreprises protégées 🏢",
  "Établissements scolaires masqués 🎓",
  "Liens & réseaux sociaux chiffrés 🔗",
  
  // Phase Analyse (Transition)
  "Transmission sécurisée à l'IA...",
  "Analyse des compétences techniques...",
  "Détection des Soft Skills...",
  "Évaluation de l'impact...",
  "Comparaison avec le marché...",
  "Calcul du score de lisibilité...",
  "Rédaction des recommandations...",
  "Génération du rapport final..."
];

export const AnonymizationTicker: React.FC<AnonymizationTickerProps> = ({ isActive }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      return;
    }

    // Changement de message toutes les 2.5 secondes pour couvrir la minute
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: theme.semantic.successBg,
            color: theme.semantic.success, // Darker green text
            border: `1px solid ${theme.semantic.success}`, // Green border
            padding: '0.75rem 1.25rem',
            borderRadius: borderRadius.lg,
            boxShadow: theme.shadow.lg,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontFamily: typography.fontFamily.mono,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            backdropFilter: 'blur(8px)',
            transform: 'translate3d(0,0,0)', // Force GPU
          }}
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: theme.semantic.success,
            boxShadow: `0 0 8px ${theme.semantic.success}`
          }} />
          {MESSAGES[currentStep]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
