import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { typography } from '../../design-system';

interface PortfolioLandingProps {
  onNavigate: (view: 'mpf' | 'projects' | 'mediatheque' | 'config') => void;
  projectCount?: number;
  mediaCount?: number;
}

// SVG Icons (Standardized large format)
const Icons = {
  Briefcase: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Layers: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Image: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Settings: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
};

export const PortfolioLanding: React.FC<PortfolioLandingProps> = ({
  onNavigate,
  projectCount = 0,
  mediaCount = 0
}) => {
  const { theme, mode } = useTheme();

  const cards = [
    {
      id: 'mpf' as const,
      Icon: Icons.Briefcase,
      title: 'Portfolio Maître',
      description: 'Gérez votre identité professionnelle et votre CV.',
      badge: null,
      colorTheme: 'blue' as const,
      colors: {
        iconBg: '#3B82F6',
        shadow: 'rgba(59, 130, 246, 0.4)',
        glow: 'rgba(59, 130, 246, 0.25)'
      }
    },
    {
      id: 'projects' as const,
      Icon: Icons.Layers,
      title: 'Projets',
      description: 'Cataloguez vos réalisations et expériences.',
      badge: projectCount > 0 ? `${projectCount} projet${projectCount > 1 ? 's' : ''}` : null,
      colorTheme: 'teal' as const,
      colors: {
        iconBg: '#14B8A6',
        shadow: 'rgba(20, 184, 166, 0.4)',
        glow: 'rgba(20, 184, 166, 0.25)'
      }
    },
    {
      id: 'mediatheque' as const,
      Icon: Icons.Image,
      title: 'Médiathèque',
      description: 'Centralisez vos images et documents.',
      badge: mediaCount > 0 ? `${mediaCount} média${mediaCount > 1 ? 's' : ''}` : null,
      colorTheme: 'pink' as const,
      colors: {
        iconBg: '#EC4899',
        shadow: 'rgba(236, 72, 153, 0.4)',
        glow: 'rgba(236, 72, 153, 0.25)'
      }
    },
    {
      id: 'config' as const,
      Icon: Icons.Settings,
      title: 'Configuration',
      description: 'Paramètres globaux et préférences.',
      badge: null,
      colorTheme: 'purple' as const,
      colors: {
        iconBg: '#8B5CF6',
        shadow: 'rgba(139, 92, 246, 0.4)',
        glow: 'rgba(139, 92, 246, 0.25)'
      }
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100%',
      padding: '4rem 2rem',
      background: 'transparent',
      overflowX: 'hidden'
    }}>
      {/* Header (Mascot Space) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
          maxWidth: '800px',
          minHeight: '20vh', // Standard 1/5th screen height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 200,
          letterSpacing: '-0.02em',
          color: theme.text.primary,
          marginBottom: '1rem',
          fontFamily: typography.fontFamily.sans
        }}>
          Portfolio Hub
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: theme.text.tertiary,
          fontWeight: 300
        }}>
          Votre centre de contrôle unifié
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '2rem',
        width: '100%',
        maxWidth: '1400px'
      }}>
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover="hover"
            whileTap="tap"
            variants={{
              hover: { 
                y: -8, 
                scale: 1.02,
                // borderColor: card.colors.iconBg, // REMOVED
                boxShadow: `
                  0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'},
                  0 20px 60px -20px ${card.colors.shadow}
                `
              },
              tap: { scale: 0.98 }
            }}
            onClick={() => onNavigate(card.id)}
            style={{
              flex: '1 1 280px',
              maxWidth: '320px',
              height: '360px', // Fixed Standard Height
              background: mode === 'dark' ? 'rgba(30, 30, 35, 0.6)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              padding: '2.5rem',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}`,
              // Standard shadow default
              boxShadow: `0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}
          >
            {/* Ambient Background Halo */}
            <div style={{
              position: 'absolute',
              top: '-20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '180px',
              height: '180px',
              background: card.colors.iconBg,
              opacity: 0.12,
              filter: 'blur(60px)',
              borderRadius: '50%',
              zIndex: 0,
              pointerEvents: 'none'
            }} />

            {/* Icon Container */}
            <motion.div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${card.colors.iconBg}, ${card.colors.iconBg})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '2rem',
              boxShadow: `0 10px 20px -5px ${mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
              zIndex: 1
            }}
            variants={{
              hover: { 
                rotate: 5, 
                scale: 1.1, 
                // REMOVED: No extra glow
                boxShadow: `0 15px 30px -5px ${mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)'}`
              }
            }}
            >
              <card.Icon />
            </motion.div>

            {/* Title */}
            <h2 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: theme.text.primary,
              marginBottom: '0.75rem',
              zIndex: 1
            }}>
              {card.title}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: typography.fontSize.sm,
              color: theme.text.secondary,
              lineHeight: '1.6',
              zIndex: 1
            }}>
              {card.description}
            </p>

            {/* Optional Badge */}
            {card.badge && (
              <div style={{
                marginTop: 'auto',
                paddingTop: '1.5rem',
                zIndex: 1
              }}>
                 <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: `${card.colors.iconBg}15`,
                    color: card.colors.iconBg,
                    fontSize: '0.75rem',
                    fontWeight: 600
                 }}>
                   {card.badge}
                 </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
