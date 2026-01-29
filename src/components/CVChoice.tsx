/**
 * SOUVERAIN - CV Coach Module
 * Écran de choix - Design "Calm" (Glassmorphism & Soft UI)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { typography } from '../design-system';

// ============================================================
// TYPES
// ============================================================

type CVPath = 'choice' | 'existing' | 'scratch' | 'linkedin';

interface CVChoiceProps {
  onSelectPath: (path: 'existing' | 'scratch' | 'linkedin') => void;
}

// ============================================================
// ICONS
// ============================================================

const Icons = {
  FileText: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Rocket: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  LinkedIn: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
};

// ============================================================
// CALM CARD COMPONENT
// ============================================================

interface CalmCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  colorTheme: 'blue' | 'teal' | 'purple';
}

const CalmCard: React.FC<CalmCardProps> = ({ icon, title, description, onClick, colorTheme }) => {
  const { theme, mode } = useTheme();

  // Définition des palettes de couleurs "Calm"
  const colors = {
    blue: {
      bg: mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
      iconBg: '#3B82F6',
      shadow: 'rgba(59, 130, 246, 0.4)', // Increased opacity for glow
      glow: 'rgba(59, 130, 246, 0.25)' // New wide glow
    },
    teal: {
      bg: mode === 'dark' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.1)',
      iconBg: '#14B8A6',
      shadow: 'rgba(20, 184, 166, 0.4)',
      glow: 'rgba(20, 184, 166, 0.25)'
    },
    purple: {
      bg: mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
      iconBg: '#8B5CF6',
      shadow: 'rgba(139, 92, 246, 0.4)',
      glow: 'rgba(139, 92, 246, 0.25)'
    }
  };

  const currentTheme = colors[colorTheme];

  return (
    <motion.div
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        flex: 1,
        transform: 'translate3d(0,0,0)',
        minWidth: '280px',
        maxWidth: '320px',
        height: '360px', // Standard Height
        background: mode === 'dark' 
          ? 'rgba(30, 30, 35, 0.6)' 
          : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        padding: '2.5rem 2rem',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}`,
        // Standard shadow by default (no color)
        boxShadow: `0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'visible',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease' // Smooth transition for non-motion props if needed
      }}

      variants={{
        hover: { 
          y: -8, 
          scale: 1.02,
          // borderColor: currentTheme.iconBg, // REMOVED: No colored border property
          boxShadow: `
            0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'},
            0 20px 60px -20px ${currentTheme.shadow}
          `
        },
        tap: { scale: 0.98 }
      }}
    >
      {/* Halo de couleur subtil en fond */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '180px',
        height: '180px',
        background: currentTheme.iconBg,
        opacity: 0.12,
        filter: 'blur(60px)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Icon Circle */}
      <motion.div 
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${currentTheme.iconBg}, ${currentTheme.iconBg})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          color: '#FFFFFF',
          // Default shadow
          boxShadow: `0 10px 20px -5px ${mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`, 
          zIndex: 1
        }}
        variants={{
          hover: { 
            rotate: 5, 
            scale: 1.1, 
            // REMOVED: No extra glow on icon, just standard shadow lifting if desired, or keep default
            boxShadow: `0 15px 30px -5px ${mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)'}`
          }
        }}
      >
        {icon}
      </motion.div>

      {/* Content */}
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: theme.text.primary,
        marginBottom: '0.75rem',
        zIndex: 1
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: typography.fontSize.sm,
        color: theme.text.secondary,
        lineHeight: 1.6,
        zIndex: 1
      }}>
        {description}
      </p>
    </motion.div>
  );
};

// ============================================================
// CV CHOICE SCREEN
// ============================================================

export const CVChoice: React.FC<CVChoiceProps> = ({ onSelectPath }) => {
  const { theme, mode } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '2rem',
      background: 'transparent', // Uses Shell background
    }}>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          minHeight: '20vh', // Standard Mascot Space
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <h1 style={{
          fontSize: '3.5rem', // Très grand titre fin
          fontWeight: 200, // Light font weight
          color: theme.text.primary,
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          fontFamily: typography.fontFamily.sans
        }}>
          Édition de CV
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: theme.text.tertiary,
          fontWeight: 300
        }}>
          Comment souhaitez-vous commencer ?
        </p>
      </motion.div>

      <div style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px'
      }}>
        <CalmCard
          icon={<Icons.FileText />}
          title="J'ai déjà un CV"
          description="Analysez et améliorez votre document existant."
          onClick={() => onSelectPath('existing')}
          colorTheme="blue"
        />
        
        <CalmCard
          icon={<Icons.Rocket />}
          title="Je pars de zéro"
          description="Créez un CV étape par étape avec notre assistant."
          onClick={() => onSelectPath('scratch')}
          colorTheme="teal"
        />
        
        <CalmCard
          icon={<Icons.LinkedIn />}
          title="Importer LinkedIn"
          description="Transformez votre profil en CV professionnel."
          onClick={() => onSelectPath('linkedin')}
          colorTheme="purple"
        />
      </div>
    </div>
  );
};

// ============================================================
// SCRATCH PLACEHOLDER (Keep for compatibility)
// ============================================================

interface ScratchPlaceholderProps {
  onBack: () => void;
}

export const ScratchPlaceholder: React.FC<ScratchPlaceholderProps> = ({ onBack }) => {
  return null; // Not used in new design flow
};

