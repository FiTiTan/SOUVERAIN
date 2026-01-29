/**
 * SOUVERAIN - Style Picker Modal (MPF-6)
 * Modal pour changer le style visuel du portfolio
 * CALM-UI: CalmModal + CalmCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CalmModal } from '../../ui/CalmModal';
import { CalmCard } from '../../ui/CalmCard';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';
import { STYLE_PALETTES } from '../../../config/stylePalettes';

// ============================================================
// TYPES
// ============================================================

interface StylePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: string;
  onSelectStyle: (styleId: string) => void;
}

// ============================================================
// STYLE METADATA
// ============================================================

const STYLE_METADATA: Record<string, { icon: string; themeColor: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' }> = {
  moderne: { icon: '⚡', themeColor: 'blue' },
  classique: { icon: '🎩', themeColor: 'purple' },
  authentique: { icon: '💫', themeColor: 'pink' },
  artistique: { icon: '🎨', themeColor: 'orange' },
  vitrine: { icon: '🏪', themeColor: 'teal' },
  formel: { icon: '🏛️', themeColor: 'green' },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const StylePickerModal: React.FC<StylePickerModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
}) => {
  const { theme } = useTheme();

  const handleSelect = (styleId: string) => {
    onSelectStyle(styleId);
    onClose();
  };

  const styles = {
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.5rem',
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    currentBadge: {
      position: 'absolute' as const,
      top: '0.75rem',
      right: '0.75rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.accent.primary,
      background: theme.accent.muted,
      padding: '0.25rem 0.75rem',
      borderRadius: borderRadius.full,
      border: `1px solid ${theme.accent.primary}40`,
      zIndex: 10,
    },
    styleWrapper: {
      position: 'relative' as const,
    },
    previewBox: {
      marginTop: '2rem',
      padding: '1.5rem',
      background: theme.bg.secondary,
      borderRadius: borderRadius.xl,
      border: `1px solid ${theme.border.light}`,
    },
    previewTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: '0.75rem',
    },
    previewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
    },
    previewItem: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
    },
    previewLabel: {
      fontWeight: typography.fontWeight.medium,
      color: theme.text.tertiary,
    },
    previewValue: {
      color: theme.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
  };

  const selectedPalette = currentStyle ? STYLE_PALETTES[currentStyle] : null;

  return (
    <CalmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Choisir un style"
      width="700px"
    >
      <div>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Changez l'apparence de votre portfolio</h2>
          <p style={styles.headerSubtitle}>
            Chaque style modifie les couleurs, typographies, espacements et animations
          </p>
        </div>

        {/* Style Grid */}
        <div style={styles.grid}>
          {Object.entries(STYLE_PALETTES).map(([styleId, palette], index) => {
            const isCurrent = styleId === currentStyle;
            const metadata = STYLE_METADATA[styleId] || { icon: '✨', themeColor: 'blue' as const };

            return (
              <motion.div
                key={styleId}
                style={styles.styleWrapper}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {isCurrent && <div style={styles.currentBadge}>Style actuel</div>}
                <CalmCard
                  title={palette.name}
                  description={`${palette.tagline}\n${palette.idealFor}`}
                  icon={metadata.icon}
                  themeColor={metadata.themeColor}
                  onClick={() => handleSelect(styleId)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Preview Box */}
        {selectedPalette && (
          <motion.div
            style={styles.previewBox}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={styles.previewTitle}>
              Aperçu du style "{selectedPalette.name}"
            </div>
            <div style={styles.previewGrid}>
              <div style={styles.previewItem}>
                <span style={styles.previewLabel}>Police titres : </span>
                <span style={styles.previewValue}>{selectedPalette.designTokens.typography.headingFont}</span>
              </div>
              <div style={styles.previewItem}>
                <span style={styles.previewLabel}>Police texte : </span>
                <span style={styles.previewValue}>{selectedPalette.designTokens.typography.bodyFont}</span>
              </div>
              <div style={styles.previewItem}>
                <span style={styles.previewLabel}>Couleur principale : </span>
                <span
                  style={{
                    ...styles.previewValue,
                    color: selectedPalette.designTokens.colors.primary,
                  }}
                >
                  {selectedPalette.designTokens.colors.primary}
                </span>
              </div>
              <div style={styles.previewItem}>
                <span style={styles.previewLabel}>Animations : </span>
                <span style={styles.previewValue}>
                  {selectedPalette.designTokens.animations.enabled ? 'Activées' : 'Désactivées'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </CalmModal>
  );
};
