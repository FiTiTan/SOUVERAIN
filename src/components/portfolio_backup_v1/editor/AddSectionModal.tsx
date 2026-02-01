/**
 * SOUVERAIN - Add Section Modal (MPF-6)
 * Modal pour ajouter une nouvelle section au portfolio
 * CALM-UI: CalmModal + CalmCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CalmModal } from '../../ui/CalmModal';
import { CalmCard } from '../../ui/CalmCard';
import { useTheme } from '../../../ThemeContext';
import { typography } from '../../../design-system';

// ============================================================
// TYPES
// ============================================================

type SectionType = 'hero' | 'about' | 'services' | 'projects' | 'testimonials' | 'practical' | 'contact' | 'custom';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: SectionType) => void;
  existingSections: SectionType[];
}

// ============================================================
// SECTION TEMPLATES
// ============================================================

interface SectionTemplate {
  type: SectionType;
  icon: string;
  title: string;
  description: string;
  themeColor: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal';
  unique?: boolean; // Can only have one of this type
}

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'hero',
    icon: '✨',
    title: 'Hero / Titre principal',
    description: 'Grande section d\'accroche en haut de page avec votre titre et baseline',
    themeColor: 'purple',
    unique: true,
  },
  {
    type: 'about',
    icon: '👤',
    title: 'À propos',
    description: 'Présentez-vous, votre parcours et votre expertise',
    themeColor: 'blue',
  },
  {
    type: 'services',
    icon: '🎯',
    title: 'Services / Expertise',
    description: 'Listez vos services, prestations ou domaines d\'expertise',
    themeColor: 'green',
  },
  {
    type: 'projects',
    icon: '📁',
    title: 'Réalisations / Projets',
    description: 'Galerie de vos projets avec liens vers les détails',
    themeColor: 'orange',
    unique: true,
  },
  {
    type: 'testimonials',
    icon: '💬',
    title: 'Témoignages',
    description: 'Citations de clients ou collaborateurs satisfaits',
    themeColor: 'pink',
  },
  {
    type: 'practical',
    icon: '📍',
    title: 'Informations pratiques',
    description: 'Horaires, localisation, disponibilités, tarifs',
    themeColor: 'teal',
  },
  {
    type: 'contact',
    icon: '✉️',
    title: 'Contact',
    description: 'Formulaire de contact ou coordonnées',
    themeColor: 'blue',
    unique: true,
  },
  {
    type: 'custom',
    icon: '⚙️',
    title: 'Section personnalisée',
    description: 'Créez une section sur-mesure avec votre propre contenu',
    themeColor: 'purple',
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingSections,
}) => {
  const { theme } = useTheme();

  const handleSelect = (type: SectionType) => {
    onAdd(type);
    onClose();
  };

  const isDisabled = (template: SectionTemplate): boolean => {
    return template.unique === true && existingSections.includes(template.type);
  };

  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    helpText: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: '1.5rem',
      textAlign: 'center' as const,
    },
    disabledOverlay: {
      position: 'relative' as const,
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    disabledBadge: {
      position: 'absolute' as const,
      top: '0.5rem',
      right: '0.5rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.semantic.warning,
      background: theme.semantic.warningBg,
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      zIndex: 10,
    },
  };

  return (
    <CalmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une section"
      width="700px"
    >
      <div>
        <p style={styles.helpText}>
          Choisissez le type de section que vous souhaitez ajouter à votre portfolio.
        </p>

        <div style={styles.grid}>
          {SECTION_TEMPLATES.map((template, index) => {
            const disabled = isDisabled(template);

            return (
              <motion.div
                key={template.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={disabled ? styles.disabledOverlay : undefined}
              >
                {disabled && <div style={styles.disabledBadge}>Déjà ajoutée</div>}
                <CalmCard
                  title={template.title}
                  description={template.description}
                  icon={template.icon}
                  themeColor={template.themeColor}
                  onClick={() => !disabled && handleSelect(template.type)}
                  disabled={disabled}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </CalmModal>
  );
};
