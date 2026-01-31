/**
 * Modern Splash Screen - Option C (Hybrid)
 * Phase 1: Logo fade in (1s)
 * Phase 2: Skeleton screen (progressive)
 * Total: 2-3s perçu
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius } from '../design-system';

interface SplashScreenModernProps {
  onComplete: () => void;
  isAppReady?: boolean; // Signal from App that everything is loaded
}

export const SplashScreenModern: React.FC<SplashScreenModernProps> = ({ onComplete, isAppReady = false }) => {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'logo' | 'skeleton' | 'done'>('logo');
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Phase 1: Logo (3s)
    const logoTimer = setTimeout(() => {
      setPhase('skeleton');
    }, 3000);

    // Minimum time: 8s (branding moment)
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 8000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(minTimer);
    };
  }, []);

  // Wait for BOTH: minimum time elapsed AND app ready
  useEffect(() => {
    if (minTimeElapsed && isAppReady) {
      setPhase('done');
      setTimeout(onComplete, 800); // Smooth fade out
    }
  }, [minTimeElapsed, isAppReady, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'done' ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: theme.bg.primary,
        zIndex: 9999,
        pointerEvents: 'all', // Block all clicks
      }}>
      <AnimatePresence mode="wait">
        {phase === 'logo' && (
          <motion.div
            key="logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}
          >
            {/* Logo Text */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                fontSize: typography.fontSize['5xl'],
                fontWeight: typography.fontWeight.bold,
                margin: 0,
                letterSpacing: '-2px',
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.text.primary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Souverain
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{
                fontSize: typography.fontSize.lg,
                color: theme.text.secondary,
                fontWeight: typography.fontWeight.light,
                margin: 0,
              }}
            >
              Agent de Carrière Autonome
            </motion.p>

            {/* Subtle spinner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{
                marginTop: '2rem',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `2px solid ${theme.border.light}`,
                borderTopColor: theme.accent.primary,
                animation: 'spin 1s linear infinite',
              }}
            />
          </motion.div>
        )}

        {phase === 'skeleton' && (
          <SkeletonScreen theme={theme} />
        )}
      </AnimatePresence>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

// Skeleton Screen Component
const SkeletonScreen: React.FC<{ theme: any }> = ({ theme }) => {
  return (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: theme.bg.primary,
      }}
    >
      {/* Sidebar skeleton */}
      <div style={{
        width: '280px',
        height: '100%',
        backgroundColor: theme.bg.elevated,
        borderRight: `1px solid ${theme.border.light}`,
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        pointerEvents: 'none', // Non-cliquable
        userSelect: 'none', // Non-sélectionnable
      }}>
        {/* Logo area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            height: '40px',
            backgroundColor: theme.border.default,
            borderRadius: borderRadius.md,
          }}
        />

        {/* Nav items */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.3, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            style={{
              height: '48px',
              backgroundColor: theme.border.default,
              borderRadius: borderRadius.md,
            }}
          />
        ))}
      </div>

      {/* Main content skeleton */}
      <div style={{
        flex: 1,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        pointerEvents: 'none', // Non-cliquable
        userSelect: 'none', // Non-sélectionnable
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            height: '60px',
            backgroundColor: theme.border.default,
            borderRadius: borderRadius.lg,
          }}
        />

        {/* Content grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          flex: 1,
        }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.3, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              style={{
                height: '200px',
                backgroundColor: theme.border.default,
                borderRadius: borderRadius.lg,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
