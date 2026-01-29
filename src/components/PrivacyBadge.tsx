/**
 * SOUVERAIN - Privacy Badge
 * Badge RGPD permanent dans la sidebar
 * STRICT NAVITEM CLONE : 48px height, 9999px radius, Absolute Masking.
 * Preserve le style Vert "Success".
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius } from '../design-system';

interface PrivacyBadgeProps {
  collapsed: boolean;
  onClick?: () => void;
}

// Icône Shield
const ShieldIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ collapsed, onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={collapsed ? "Données protégées" : undefined}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'block',
        width: '100%',
        height: '48px', // Match NavItem strictly
        padding: 0,
        border: `1px solid ${theme.border.light}`,
        backgroundColor: isHovered ? theme.semantic.successBg : theme.bg.tertiary,
        color: theme.semantic.success, // Toujours vert
        cursor: onClick ? 'pointer' : 'default',
        
        borderRadius: '9999px', // Pill Shape
        position: 'relative',
        overflow: 'hidden', // MASK
      }}
    >
        {/* ICON CONTAINER: Absolute Left (0) */}
        <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '48px', // Fixed 48px
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transition: 'transform 0.2s ease' // Optional small interaction
        }}>
           {/* Allow icon to have its own small motion if needed, but here simple is good */}
            <motion.div
              animate={isHovered ? { rotate: 10 } : { rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ShieldIcon />
            </motion.div>
        </div>

        {/* TEXT CONTAINER: Absolute Left (48px) */}
        <div style={{
            position: 'absolute',
            left: '48px',
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            paddingRight: '1rem',
            zIndex: 1,
            fontSize: typography.fontSize.sm, // increased to match items
            fontWeight: 500, // Constant weight
        }}>
            Données protégées
        </div>
    </motion.button>
  );
};

import { CalmModal } from './ui/CalmModal';

// ... (ShieldIconLarge defined above or here)
const ShieldIconLarge: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme } = useTheme();

  return (
    <CalmModal
      isOpen={true}
      onClose={onClose}
      title="Protection de vos données"
      width="500px"
    >
      <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          color: theme.text.secondary,
          fontSize: typography.fontSize.sm,
          lineHeight: typography.lineHeight.relaxed
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
                padding: '12px', 
                background: theme.semantic.successBg, // Green tint
                borderRadius: '50%',
                color: theme.semantic.success
            }}>
                <ShieldIconLarge />
            </div>
            <div>
                <p style={{ marginTop: 0 }}>
                    SOUVERAIN respecte votre vie privée. Vos données professionnelles sont traitées
                    avec le plus haut niveau de sécurité.
                </p>
            </div>
        </div>

        <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            marginTop: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
        }}>
          {[
              'Anonymisation avant envoi au cloud',
              'Stockage local chiffré AES-256',
              'Aucune donnée vendue ou partagée',
              'Conformité RGPD'
          ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                  <span style={{ color: theme.semantic.success }}>✓</span>
                  {item}
              </li>
          ))}
        </ul>

        <div style={{ 
            padding: '1rem', 
            background: theme.bg.tertiary, 
            borderRadius: borderRadius.lg,
            fontSize: typography.fontSize.xs,
            border: `1px solid ${theme.border.light}`
        }}>
            Votre CV reste sur votre machine. Seule une version anonymisée est analysée par
            notre IA, et les données personnelles sont automatiquement restaurées après traitement.
        </div>

        <button 
            onClick={onClose}
            style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: theme.accent.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: borderRadius.lg,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '1rem'
            }}
        >
            Compris, continuer
        </button>
      </div>
    </CalmModal>
  );
};
