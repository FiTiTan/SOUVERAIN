import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import type { Portfolio, PortfolioSection, SectionContent } from '../../types/portfolio';
import { SECTION_LABELS, SECTION_ICONS } from '../../utils/portfolio';
import { HeroEditor } from './sections/HeroEditor';
import { AboutEditor } from './sections/AboutEditor';
import { ContactEditor } from './sections/ContactEditor';
import { ExperienceEditor } from './sections/ExperienceEditor';
import { SkillsEditor } from './sections/SkillsEditor';
import { EducationEditor } from './sections/EducationEditor';
import { ProjectsEditor } from './sections/ProjectsEditor';
import { ModernTemplate } from './templates/ModernTemplate';

interface PortfolioEditorProps {
  portfolioId: string;
  onBack: () => void;
}

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({ portfolioId, onBack }) => {
  const { theme } = useTheme();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [activeSection, setActiveSection] = useState<PortfolioSection | null>(null);
  const [editedContent, setEditedContent] = useState<SectionContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, [portfolioId]);

  const loadPortfolio = async () => {
    setIsLoading(true);
    try {
      const result = await window.electron.portfolio.getById(portfolioId);
      if (result.success && result.portfolio) {
        setPortfolio(result.portfolio);
        setSections(result.portfolio.sections || []);
        if (result.portfolio.sections && result.portfolio.sections.length > 0) {
          const firstSection = result.portfolio.sections[0];
          setActiveSection(firstSection);
          try {
            const parsed = JSON.parse(firstSection.content);
            setEditedContent(parsed);
          } catch (e) {
            console.error('[PortfolioEditor] Erreur parsing JSON:', e);
            setEditedContent(null);
          }
        }
      }
    } catch (error) {
      console.error('[PortfolioEditor] Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSection = async () => {
    if (!activeSection || !editedContent) return;

    setIsSaving(true);
    try {
      const contentStr = JSON.stringify(editedContent);
      const result = await window.electron.portfolio.updateSection(activeSection.id, contentStr);
      if (result.success) {
        // Reload pour rafraîchir
        await loadPortfolio();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('[PortfolioEditor] Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionClick = (section: PortfolioSection) => {
    setActiveSection(section);
    try {
      const parsed = JSON.parse(section.content);
      setEditedContent(parsed);
    } catch (e) {
      console.error('[PortfolioEditor] Erreur parsing JSON:', e);
      setEditedContent(null);
    }
  };

  const handleContentChange = (newContent: SectionContent) => {
    setEditedContent(newContent);
  };

  const renderSectionEditor = () => {
    if (!activeSection || !editedContent) return null;

    switch (activeSection.section_type) {
      case 'hero':
        return <HeroEditor content={editedContent as any} onChange={handleContentChange} />;
      case 'about':
        return <AboutEditor content={editedContent as any} onChange={handleContentChange} />;
      case 'contact':
        return <ContactEditor content={editedContent as any} onChange={handleContentChange} />;
      case 'experience':
        return <ExperienceEditor content={editedContent as any} onChange={handleContentChange} />;
      case 'skills':
        return <SkillsEditor content={editedContent as any} onChange={handleContentChange} />;
      case 'education':
        return <EducationEditor content={editedContent as any} onChange={handleContentChange} />;
      case 'projects':
        return <ProjectsEditor content={editedContent as any} onChange={handleContentChange} portfolioId={portfolioId} />;
      default:
        return null;
    }
  };

  const preparePreviewData = () => {
    const data: any = {};
    sections.forEach((section) => {
      try {
        const parsed = JSON.parse(section.content);
        data[section.section_type] = parsed;
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    });
    // Utiliser editedContent pour la section active
    if (activeSection && editedContent) {
      data[activeSection.section_type] = editedContent;
    }
    return data;
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1600px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    backButton: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.secondary,
      backgroundColor: theme.bg.secondary,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      margin: 0,
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '250px 1fr 450px',
      gap: '1.5rem',
      minHeight: '70vh',
    },
    sidebar: {
      backgroundColor: theme.bg.elevated,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.xl,
      padding: '1rem',
      height: 'fit-content',
    },
    sidebarTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.secondary,
      textTransform: 'uppercase' as const,
      marginBottom: '1rem',
      letterSpacing: '0.05em',
    },
    sectionList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    sectionItem: (isActive: boolean) => ({
      padding: '0.75rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
      color: isActive ? theme.accent.primary : theme.text.primary,
      backgroundColor: isActive ? theme.accent.muted : 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      textAlign: 'left' as const,
      transition: transitions.fast,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }),
    content: {
      backgroundColor: theme.bg.elevated,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.xl,
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '1rem',
      borderBottom: `1px solid ${theme.border.light}`,
    },
    sectionTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      margin: 0,
    },
    saveButton: {
      padding: '0.625rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: '#FFFFFF',
      backgroundColor: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: isSaving ? 'not-allowed' : 'pointer',
      transition: transitions.fast,
      opacity: isSaving ? 0.6 : 1,
    },
    editor: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    textarea: {
      flex: 1,
      minHeight: '400px',
      padding: '1rem',
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.mono,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      resize: 'vertical' as const,
    },
    hint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
      fontStyle: 'italic',
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      fontSize: typography.fontSize.lg,
      color: theme.text.secondary,
    },
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement du portfolio...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Portfolio introuvable</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← Retour aux portfolios
        </button>
        <h1 style={styles.title}>{portfolio.name}</h1>
        <div style={{ width: '120px' }} /> {/* Spacer for alignment */}
      </div>

      {/* Layout */}
      <div style={styles.layout}>
        {/* Sidebar - Liste des sections */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Sections</div>
          <div style={styles.sectionList}>
            {sections.map((section) => (
              <button
                key={section.id}
                style={styles.sectionItem(activeSection?.id === section.id)}
                onClick={() => handleSectionClick(section)}
                onMouseEnter={(e) => {
                  if (activeSection?.id !== section.id) {
                    e.currentTarget.style.backgroundColor = theme.bg.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection?.id !== section.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{SECTION_ICONS[section.section_type]}</span>
                <span>{SECTION_LABELS[section.section_type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content - Éditeur de section */}
        <div style={styles.content}>
          {activeSection && (
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  {SECTION_ICONS[activeSection.section_type]} {SECTION_LABELS[activeSection.section_type]}
                </h2>
                <button
                  style={styles.saveButton}
                  onClick={handleSaveSection}
                  disabled={isSaving}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = theme.accent.secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = theme.accent.primary;
                    }
                  }}
                >
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>

              <div style={styles.editor}>
                {editedContent && renderSectionEditor()}
              </div>
            </>
          )}
        </div>

        {/* Preview - Aperçu live */}
        <div style={{
          backgroundColor: theme.bg.elevated,
          border: `1px solid ${theme.border.light}`,
          borderRadius: borderRadius.xl,
          overflow: 'auto',
          maxHeight: '80vh',
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: `1px solid ${theme.border.light}`,
            backgroundColor: theme.bg.secondary,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
            <div style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: theme.text.secondary,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              👁️ Aperçu live
            </div>
          </div>
          <ModernTemplate sections={preparePreviewData()} />
        </div>
      </div>
    </div>
  );
};
