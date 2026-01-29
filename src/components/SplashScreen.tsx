
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
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
            backgroundColor: '#1a1a1a', // Dark theme professional background
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                    width: '600px',
                    height: '400px',
                    backgroundColor: '#252525',
                    borderRadius: '4px', // Adobe style sharp/small radius
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Background Art / Texture */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 80%)',
                    zIndex: 0
                }} />

                <div style={{ zIndex: 1, padding: '40px', flex: 1, display: 'flex', flexDirection: 'colum', justifyContent: 'space-between' }}>
                    
                    {/* Header */}
                    <div>
                        <h1 style={{ 
                            fontSize: '48px', 
                            fontWeight: 700, 
                            margin: 0, 
                            letterSpacing: '-1px',
                            background: 'linear-gradient(to right, #60a5fa, #ffffff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Souverain
                        </h1>
                        <p style={{ 
                            fontSize: '18px', 
                            color: '#9ca3af', 
                            marginTop: '5px',
                            fontWeight: 300
                        }}>
                            Agent de Carrière Autonome
                        </p>
                    </div>

                    {/* Version & Names */}
                    <div style={{ marginTop: 'auto', marginBottom: '40px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>Version 2.0.0 (Alpha)</p>
                        <p style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px' }}>
                             © 2026 Deepmind Antigravity Project
                        </p>
                    </div>
                </div>

                {/* Footer / Loading Area */}
                <div style={{ backgroundColor: '#1f1f1f', padding: '15px 40px', zIndex: 1, borderTop: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#d1d5db' }}>{loadingText}</span>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{Math.round(progress)}%</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                        {/* Progress Bar Fill */}
                        <motion.div 
                           style={{ height: '100%', backgroundColor: '#3b82f6' }}
                           animate={{ width: `${progress}%` }}
                           transition={{ ease: "linear", duration: 0.15 }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
