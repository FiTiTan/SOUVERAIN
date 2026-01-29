import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import { DeveloperTemplate } from './templates/DeveloperTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { VisualTemplate } from './templates/VisualTemplate';

interface PortfolioProjectViewerProps {
  project: any;
  onClose: () => void;
  onEdit: () => void;
}

type TemplateType = 'developer' | 'minimal' | 'visual';

export const PortfolioProjectViewer: React.FC<PortfolioProjectViewerProps> = ({
  project,
  onClose,
  onEdit
}) => {
  const { theme } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('visual');

  const styles = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.xl,
      boxShadow: theme.shadow.xl,
      width: '90%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      overflow: 'auto' as const,
      border: `1px solid ${theme.border.default}`,
    },
    header: {
      padding: '1.5rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky' as const,
      top: 0,
      backgroundColor: theme.bg.primary,
      zIndex: 10,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    templateSelector: {
      display: 'flex',
      gap: '0.5rem',
      padding: '0.25rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
    },
    templateButton: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: 'transparent',
      color: theme.text.secondary,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    templateButtonActive: {
      backgroundColor: theme.bg.elevated,
      color: theme.text.primary,
      boxShadow: theme.shadow.sm,
    },
    editButton: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: typography.fontSize['2xl'],
      color: theme.text.secondary,
      cursor: 'pointer',
      padding: '0.25rem',
    },
    content: {
      padding: '2rem',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.templateSelector}>
              <button
                style={{
                  ...styles.templateButton,
                  ...(selectedTemplate === 'visual' ? styles.templateButtonActive : {}),
                }}
                onClick={() => setSelectedTemplate('visual')}
              >
                🎨 Visual
              </button>
              <button
                style={{
                  ...styles.templateButton,
                  ...(selectedTemplate === 'developer' ? styles.templateButtonActive : {}),
                }}
                onClick={() => setSelectedTemplate('developer')}
              >
                🖥️ Developer
              </button>
              <button
                style={{
                  ...styles.templateButton,
                  ...(selectedTemplate === 'minimal' ? styles.templateButtonActive : {}),
                }}
                onClick={() => setSelectedTemplate('minimal')}
              >
                ✨ Minimal
              </button>
            </div>
          </div>

          <div style={styles.headerRight}>
            <button
              style={styles.editButton}
              onClick={onEdit}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accent.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.accent.primary;
              }}
            >
              ✏️ Éditer
            </button>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {selectedTemplate === 'visual' && <VisualTemplate project={project} />}
          {selectedTemplate === 'developer' && <DeveloperTemplate project={project} />}
          {selectedTemplate === 'minimal' && <MinimalTemplate project={project} />}
        </div>
      </div>
    </div>
  );
};
