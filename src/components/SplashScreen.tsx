
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const { theme, mode } = useTheme();
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initialisation de Souverain...');

    useEffect(() => {
        // Durée totale ~15 secondes pour "stabiliser" et impressionner
        const totalDuration = 15000; 
        const intervalTime = 150; // Update progress frequently
        const steps = totalDuration / intervalTime;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            const newProgress = Math.min((currentStep / steps) * 100, 100);
            setProgress(newProgress);

            // Simulation des étapes de chargement
            if (newProgress < 20) setLoadingText('Chargement des modules principaux...');
            else if (newProgress < 40) setLoadingText('Connexion à la base de données locale sécurisée...');
            else if (newProgress < 60) setLoadingText('Initialisation du moteur IA (Groq Cloud)...');
            else if (newProgress < 80) setLoadingText('Optimisation des rendus graphiques...');
            else if (newProgress < 95) setLoadingText('Finalisation du démarrage...');
            else setLoadingText('Prêt.');

            if (currentStep >= steps) {
                clearInterval(interval);
                setTimeout(onComplete, 500); // Petit délai à 100%
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: theme.bg.primary,
            color: theme.text.primary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            fontFamily: typography.fontFamily.sans
        }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                    width: '600px',
                    height: '400px',
                    backgroundColor: theme.bg.elevated,
                    borderRadius: borderRadius.xl,
                    boxShadow: theme.shadow.xl,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    border: `1px solid ${theme.border.light}`,
                }}
            >
                {/* Background Art / Texture */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.accent.primary}20 0%, ${theme.bg.primary} 80%)`
                        : `linear-gradient(135deg, ${theme.accent.primary}10 0%, ${theme.bg.secondary} 80%)`,
                    zIndex: 0
                }} />

                <div style={{ zIndex: 1, padding: '40px', flex: 1, display: 'flex', flexDirection: 'colum', justifyContent: 'space-between' }}>
                    
                    {/* Header */}
                    <div>
                        <h1 style={{ 
                            fontSize: typography.fontSize['4xl'],
                            fontWeight: typography.fontWeight.bold, 
                            margin: 0, 
                            letterSpacing: '-1px',
                            background: `linear-gradient(to right, ${theme.accent.primary}, ${theme.text.primary})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Souverain
                        </h1>
                        <p style={{ 
                            fontSize: typography.fontSize.lg,
                            color: theme.text.secondary, 
                            marginTop: '5px',
                            fontWeight: typography.fontWeight.light
                        }}>
                            Agent de Carrière Autonome
                        </p>
                    </div>

                    {/* Version & Names */}
                    <div style={{ marginTop: 'auto', marginBottom: '40px' }}>
                        <p style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>Version 2.0.0 (Alpha)</p>
                        <p style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary, marginTop: '4px' }}>
                             © 2026 Deepmind Antigravity Project
                        </p>
                    </div>
                </div>

                {/* Footer / Loading Area */}
                <div style={{ backgroundColor: theme.bg.secondary, padding: '15px 40px', zIndex: 1, borderTop: `1px solid ${theme.border.light}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: typography.fontSize.xs, color: theme.text.secondary }}>{loadingText}</span>
                        <span style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>{Math.round(progress)}%</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{ width: '100%', height: '4px', backgroundColor: theme.border.default, borderRadius: borderRadius.sm, overflow: 'hidden' }}>
                        {/* Progress Bar Fill */}
                        <motion.div 
                           style={{ height: '100%', backgroundColor: theme.accent.primary }}
                           animate={{ width: `${progress}%` }}
                           transition={{ ease: "linear", duration: 0.15 }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
