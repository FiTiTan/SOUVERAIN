/**
 * Modern Splash Screen - Simplified
 * Single phase: Logo + Tips
 * Total: 5s minimum for readability
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius } from '../design-system';
import { getRandomTip, type LoadingTip } from '../data/loadingTips';

interface SplashScreenModernProps {
  onComplete: () => void;
  isAppReady?: boolean; // Signal from App that everything is loaded
}

export const SplashScreenModern: React.FC<SplashScreenModernProps> = ({ onComplete, isAppReady = false }) => {
  const { theme } = useTheme();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [tip] = useState<LoadingTip>(() => getRandomTip());
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Minimum time: 5s (proof of value readability + config compatibility)
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 5000);

    return () => {
      clearTimeout(minTimer);
    };
  }, []);

  // Wait for BOTH: minimum time elapsed AND app ready
  useEffect(() => {
    if (minTimeElapsed && isAppReady) {
      setIsDone(true);
      setTimeout(onComplete, 1000); // Smooth fade out + scale
    }
  }, [minTimeElapsed, isAppReady, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{ 
        opacity: isDone ? 0 : 1,
        scale: isDone ? 0.95 : 1
      }}
      transition={{ 
        duration: 1,
        ease: [0.4, 0, 0.2, 1] // Smooth ease-out curve
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: theme.bg.primary,
        zIndex: 9999,
        pointerEvents: 'all', // Block all clicks
      }}>
      {!isDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
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

          {/* Loading Tip - Proof of Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            style={{
              padding: '1.5rem',
              backgroundColor: theme.bg.elevated,
              borderRadius: borderRadius.lg,
              border: `1px solid ${theme.border.light}`,
              marginTop: '3rem',
              maxWidth: '600px',
              width: '100%',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}>
              {/* Icon */}
              <div style={{
                flexShrink: 0,
                width: '32px',
                height: '32px',
              }}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zM12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"
                    fill={theme.accent.primary}
                    opacity="0.9"
                  />
                  <path
                    d="M11.5 9.5L9 14h3l-.5 2.5L14 12h-3l.5-2.5z"
                    fill={theme.bg.primary}
                  />
                </svg>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: typography.fontSize.sm,
                  color: theme.text.secondary,
                  margin: 0,
                  lineHeight: typography.lineHeight.relaxed,
                }}>
                  {tip.text}
                </p>
                {tip.source && (
                  <p style={{
                    fontSize: typography.fontSize.xs,
                    color: theme.text.tertiary,
                    margin: '0.5rem 0 0 0',
                    fontStyle: 'italic',
                  }}>
                    Source : {tip.source}
                  </p>
                )}
              </div>

              {/* Stat Badge */}
              {tip.stat && (
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: `${theme.accent.primary}20`,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${theme.accent.primary}40`,
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: theme.accent.primary,
                  }}>
                    {tip.stat}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};
