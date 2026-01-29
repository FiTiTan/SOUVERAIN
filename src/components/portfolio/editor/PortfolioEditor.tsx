/**
 * SOUVERAIN - Portfolio Editor (MPF-6)
 * Éditeur de portfolio avec drag & drop, preview live, et auto-save
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SectionEditor } from './SectionEditor';
import { AddSectionModal } from './AddSectionModal';
import { StylePickerModal } from './StylePickerModal';
import { PracticalInfoEditor } from './PracticalInfoEditor';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  GripVertical: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  ),
  MoreVertical: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
  Pencil: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Loader: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="1s"
        repeatCount="indefinite"
      />
    </svg>
  )
};

// ============================================================
// TYPES
// ============================================================

interface Section {
  id: string;
  type: 'hero' | 'about' | 'services' | 'projects' | 'testimonials' | 'practical' | 'contact' | 'custom';
  title: string;
  content: string;
  metadata?: Record<string, any>;
  order: number;
}

interface PortfolioData {
  id: string;
  name: string;
  style: string;
  sections: Section[];
  projects: any[];
  practicalData?: any;
  seo: { title: string; description: string; keywords: string[] };
}

interface PortfolioEditorProps {
  portfolioId: string;
  onBack: () => void;
  onPreview: (html: string) => void;
  onPublish: () => void;
}

// ============================================================
// SORTABLE SECTION ITEM
// ============================================================

interface SortableSectionProps {
  section: Section;
  onEdit: (section: Section) => void;
  onDelete: (id: string) => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({ section, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardStyles = {
    container: {
      padding: '1rem',
      background: theme.bg.elevated,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: 'grab',
      ...style,
    },
    dragHandle: {
      color: theme.text.tertiary,
      cursor: 'grab',
      flexShrink: 0,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: '0.25rem',
    },
    preview: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    actions: {
      display: 'flex',
      gap: '0.5rem',
      flexShrink: 0,
    },
    actionButton: {
      padding: '0.5rem',
      borderRadius: borderRadius.md,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: theme.text.secondary,
      transition: transitions.fast,
    },
  };

  return (
    <div ref={setNodeRef} style={cardStyles.container}>
      <div {...attributes} {...listeners} style={cardStyles.dragHandle}>
        <Icons.GripVertical />
      </div>
      <div style={cardStyles.content}>
        <div style={cardStyles.title}>{section.title}</div>
        <div style={cardStyles.preview}>
          {section.content.substring(0, 60)}...
        </div>
      </div>
      <div style={cardStyles.actions}>
        <button
          style={cardStyles.actionButton}
          onClick={() => onEdit(section)}
          onMouseEnter={(e) => e.currentTarget.style.color = theme.accent.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
        >
          <Icons.Pencil />
        </button>
        <button
          style={cardStyles.actionButton}
          onClick={() => onDelete(section.id)}
          onMouseEnter={(e) => e.currentTarget.style.color = theme.semantic.error}
          onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  portfolioId,
  onBack,
  onPreview,
  onPublish,
}) => {
  const { theme, mode } = useTheme();

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');

  // Modal states
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showPracticalEditor, setShowPracticalEditor] = useState(false);

  // Load portfolio
  useEffect(() => {
    loadPortfolio();
  }, [portfolioId]);

  // Regenerate preview when data changes
  useEffect(() => {
    if (portfolio) {
      regeneratePreview();
    }
  }, [portfolio]);

  // Auto-save
  useEffect(() => {
    if (hasChanges && portfolio) {
      const timeout = setTimeout(() => savePortfolio(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasChanges, portfolio]);

  const loadPortfolio = async () => {
    try {
      // @ts-ignore
      const data = await window.electron.invoke('db-get-portfolio', portfolioId);
      setPortfolio(data);
    } catch (error) {
      console.error('[PortfolioEditor] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const regeneratePreview = async () => {
    if (!portfolio) return;
    try {
      // @ts-ignore
      const html = await window.electron.invoke('render-portfolio-html', {
        sections: portfolio.sections,
        seo: portfolio.seo,
        style: portfolio.style,
        projects: portfolio.projects,
        practicalData: portfolio.practicalData,
      });
      setPreviewHTML(html);
    } catch (error) {
      console.error('[PortfolioEditor] Preview error:', error);
    }
  };

  const savePortfolio = async () => {
    if (!portfolio) return;
    setIsSaving(true);
    try {
      // @ts-ignore
      await window.electron.invoke('db-update-portfolio', portfolio);
      setHasChanges(false);
    } catch (error) {
      console.error('[PortfolioEditor] Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !portfolio) return;

    const oldIndex = portfolio.sections.findIndex(s => s.id === active.id);
    const newIndex = portfolio.sections.findIndex(s => s.id === over.id);

    const newSections = [...portfolio.sections];
    const [removed] = newSections.splice(oldIndex, 1);
    newSections.splice(newIndex, 0, removed);

    newSections.forEach((s, i) => s.order = i);

    setPortfolio({ ...portfolio, sections: newSections });
    setHasChanges(true);
  };

  const deleteSection = (sectionId: string) => {
    if (!portfolio || !confirm('Supprimer cette section ?')) return;
    setPortfolio({
      ...portfolio,
      sections: portfolio.sections.filter(s => s.id !== sectionId),
    });
    setHasChanges(true);
  };

  const handleSectionEdit = (section: Section) => {
    setEditingSection(section);
  };

  const handleSectionUpdate = (updates: Partial<Section>) => {
    if (!portfolio || !editingSection) return;
    setPortfolio({
      ...portfolio,
      sections: portfolio.sections.map(s =>
        s.id === editingSection.id ? { ...s, ...updates } : s
      ),
    });
    setHasChanges(true);
    setEditingSection(null);
  };

  const handleAddSection = (type: Section['type']) => {
    if (!portfolio) return;
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      title: getSectionDefaultTitle(type),
      content: getSectionDefaultContent(type),
      order: portfolio.sections.length,
    };
    setPortfolio({
      ...portfolio,
      sections: [...portfolio.sections, newSection],
    });
    setHasChanges(true);
  };

  const handleStyleChange = (newStyle: string) => {
    if (!portfolio) return;
    setPortfolio({ ...portfolio, style: newStyle });
    setHasChanges(true);
  };

  const handlePracticalDataUpdate = (data: any) => {
    if (!portfolio) return;
    setPortfolio({ ...portfolio, practicalData: data });
    setHasChanges(true);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: mode === 'dark' ? '#0f1729' : '#f8fafc',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      background: theme.bg.elevated,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${theme.border.light}`,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: 'transparent',
      border: 'none',
      color: theme.text.secondary,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
      borderRadius: borderRadius.md,
      transition: transitions.fast,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    statusBadge: (type: 'unsaved' | 'saving') => ({
      fontSize: typography.fontSize.xs,
      padding: '0.25rem 0.75rem',
      borderRadius: borderRadius.full,
      background: type === 'unsaved' ? theme.semantic.warningBg : theme.accent.muted,
      color: type === 'unsaved' ? theme.semantic.warning : theme.accent.primary,
      fontWeight: typography.fontWeight.medium,
    }),
    headerRight: {
      display: 'flex',
      gap: '0.75rem',
    },
    button: (variant: 'secondary' | 'primary') => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      border: variant === 'secondary' ? `1px solid ${theme.border.default}` : 'none',
      background: variant === 'secondary' ? 'transparent' : theme.accent.primary,
      color: variant === 'secondary' ? theme.text.primary : '#FFFFFF',
      cursor: 'pointer',
      transition: transitions.fast,
    }),
    main: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '400px 1fr',
      gap: '1.5rem',
      padding: '2rem',
      overflow: 'hidden',
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
      overflowY: 'auto' as const,
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    sectionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      background: theme.accent.muted,
      color: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    sectionsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
    },
    settingButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    preview: {
      background: theme.bg.elevated,
      borderRadius: borderRadius.xl,
      border: `1px solid ${theme.border.light}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    previewHeader: {
      padding: '1rem 1.5rem',
      borderBottom: `1px solid ${theme.border.light}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    previewFrame: {
      flex: 1,
      width: '100%',
      border: 'none',
    },
    loader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    },
  };

  if (isLoading) {
    return (
      <div style={styles.loader}>
        <Icons.Loader />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={styles.loader}>
        <p style={{ color: theme.text.secondary }}>Portfolio non trouvé</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            style={styles.backButton}
            onClick={onBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.bg.secondary;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.text.secondary;
            }}
          >
            <Icons.ArrowLeft />
            Mes Portfolios
          </button>
          <div style={{ width: '1px', height: '24px', background: theme.border.light }} />
          <h1 style={styles.title}>{portfolio.name}</h1>
          {hasChanges && <span style={styles.statusBadge('unsaved')}>Non sauvegardé</span>}
          {isSaving && <span style={styles.statusBadge('saving')}>Sauvegarde...</span>}
        </div>
        <div style={styles.headerRight}>
          <button
            style={styles.button('secondary')}
            onClick={() => onPreview(previewHTML)}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.bg.secondary}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Icons.Eye />
            Aperçu
          </button>
          <button
            style={styles.button('primary')}
            onClick={onPublish}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Icons.Globe />
            Publier
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Sections */}
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Sections</h2>
              <button
                style={styles.addButton}
                onClick={() => setShowAddSection(true)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Icons.Plus />
                Ajouter
              </button>
            </div>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={portfolio.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div style={styles.sectionsList}>
                  {portfolio.sections.map(section => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onEdit={handleSectionEdit}
                      onDelete={deleteSection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Settings */}
          <div>
            <h2 style={styles.sectionTitle}>Paramètres</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                style={{
                  ...styles.settingButton,
                  background: theme.bg.elevated,
                  border: `1px solid ${theme.border.light}`,
                }}
                onClick={() => setShowStylePicker(true)}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.bg.secondary}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.bg.elevated}
              >
                <span style={{ fontSize: '1.25rem' }}>🎨</span>
                <div style={{ flex: 1, textAlign: 'left' as const }}>
                  <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
                    Style visuel
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
                    {portfolio.style.charAt(0).toUpperCase() + portfolio.style.slice(1)}
                  </div>
                </div>
                <span style={{ color: theme.text.tertiary }}>→</span>
              </button>

              <button
                style={{
                  ...styles.settingButton,
                  background: theme.bg.elevated,
                  border: `1px solid ${theme.border.light}`,
                }}
                onClick={() => setShowPracticalEditor(true)}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.bg.secondary}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.bg.elevated}
              >
                <span style={{ fontSize: '1.25rem' }}>📍</span>
                <div style={{ flex: 1, textAlign: 'left' as const }}>
                  <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
                    Infos pratiques
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
                    Horaires, tarifs, localisation
                  </div>
                </div>
                <span style={{ color: theme.text.tertiary }}>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={styles.preview}>
          <div style={styles.previewHeader}>Aperçu Live</div>
          <iframe
            style={styles.previewFrame}
            srcDoc={previewHTML}
            title="Portfolio Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Modals */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          isOpen={true}
          onClose={() => setEditingSection(null)}
          onSave={handleSectionUpdate}
        />
      )}

      <AddSectionModal
        isOpen={showAddSection}
        onClose={() => setShowAddSection(false)}
        onAdd={handleAddSection}
        existingSections={portfolio.sections.map(s => s.type)}
      />

      <StylePickerModal
        isOpen={showStylePicker}
        onClose={() => setShowStylePicker(false)}
        currentStyle={portfolio.style}
        onSelectStyle={handleStyleChange}
      />

      <PracticalInfoEditor
        isOpen={showPracticalEditor}
        onClose={() => setShowPracticalEditor(false)}
        data={portfolio.practicalData || {}}
        onSave={handlePracticalDataUpdate}
      />
    </div>
  );
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getSectionDefaultTitle(type: Section['type']): string {
  const titles: Record<Section['type'], string> = {
    hero: 'Bienvenue',
    about: 'À propos',
    services: 'Mes services',
    projects: 'Réalisations',
    testimonials: 'Témoignages',
    practical: 'Informations pratiques',
    contact: 'Contact',
    custom: 'Nouvelle section',
  };
  return titles[type];
}

function getSectionDefaultContent(type: Section['type']): string {
  const contents: Record<Section['type'], string> = {
    hero: 'Votre titre accrocheur ici',
    about: 'Présentez-vous en quelques lignes...',
    services: 'Décrivez vos services et expertises...',
    projects: 'Découvrez mes réalisations ci-dessous.',
    testimonials: 'Les retours de mes clients...',
    practical: 'Horaires, localisation et disponibilités.',
    contact: 'Prenons contact pour échanger sur vos projets.',
    custom: 'Votre contenu personnalisé ici...',
  };
  return contents[type];
}
