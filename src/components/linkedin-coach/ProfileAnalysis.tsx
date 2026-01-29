import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { type LinkedInProfile, type ProfileAnalysis as ProfileAnalysisType, analyzeLinkedInProfile } from '../../services/linkedinCoachService';

interface ProfileAnalysisProps {
  profile: Partial<LinkedInProfile>;
  portfolioId: string;
  onComplete: (analysis: ProfileAnalysisType) => void;
  onError: (error: string) => void;
}

export const ProfileAnalysis: React.FC<ProfileAnalysisProps> = ({
  profile, portfolioId, onComplete, onError
}) => {
  const { theme, mode } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    'Extraction des informations',
    'Analyse de la headline',
    'Analyse du résumé (About)',
    'Analyse des expériences',
    'Analyse des compétences',
    'Calcul du score global',
    'Génération des recommandations'
  ];

  useEffect(() => {
    performAnalysis();
  }, []);

  const performAnalysis = async () => {
    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setProgress((i / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 700));
      }

      const result = await analyzeLinkedInProfile(profile as LinkedInProfile, portfolioId);
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete(result);
    } catch (error) {
      console.error('Analysis error:', error);
      onError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: '4rem', marginBottom: '2rem' }}>
          🔍
        </motion.div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: theme.text.primary, marginBottom: '3rem' }}>
          Analyse de votre profil LinkedIn
        </h2>
        <div style={{
          background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)', borderRadius: '16px', border: `1px solid ${theme.border.light}`,
          padding: '2rem', marginBottom: '2rem', textAlign: 'left'
        }}>
          {steps.map((step, index) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: index < steps.length - 1 ? '1rem' : 0 }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: index < currentStep ? theme.semantic.success : index === currentStep ? theme.accent.primary : theme.bg.tertiary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {index < currentStep ? <span style={{ color: '#ffffff', fontSize: '0.875rem' }}>✓</span> :
                  index === currentStep ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ width: '12px', height: '12px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%' }} /> :
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.text.tertiary, opacity: 0.3 }} />}
              </div>
              <p style={{ fontSize: '0.875rem', color: index <= currentStep ? theme.text.primary : theme.text.tertiary }}>{step}</p>
            </div>
          ))}
        </div>
        <div style={{ width: '100%', height: '8px', background: theme.bg.tertiary, borderRadius: '999px', overflow: 'hidden', marginBottom: '2rem' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`, borderRadius: '999px' }} />
        </div>
        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.text.primary, marginBottom: '1rem' }}>{Math.round(progress)}%</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: theme.text.tertiary, fontSize: '0.875rem' }}>
          <span>🔒</span><span>Vos données sont anonymisées avant analyse</span>
        </div>
      </motion.div>
    </div>
  );
};
