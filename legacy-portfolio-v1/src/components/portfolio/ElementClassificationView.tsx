/**
 * SOUVERAIN - ElementClassificationView
 * Vue de classification IA des éléments du portfolio
 * Permet de classifier les éléments importés avec Ollama en local
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { useToast } from '../ui/NotificationToast';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { getFormatIcon, getFormatCategory } from '../../types/formats';
import { classifyElement } from '../../services/classificationService';

// ============================================================
// TYPES
// ============================================================

export interface PortfolioElement {
  id: string;
  assetId: string;
  portfolioId: string;
  title: string;
  description: string;
  format: string;
  thumbnailUrl?: string;
  classification?: ElementClassification;
  createdAt: string;
}

export interface ElementClassification {
  category: string;         // Ex: "Design", "Development", "Marketing"
  tags: string[];          // Ex: ["UI/UX", "Mobile", "iOS"]
  suggestedProject?: string; // Ex: "Application Mobile E-commerce"
  confidence: number;      // 0-1
  reasoning?: string;      // Explication de la classification
}

interface ElementClassificationViewProps {
  portfolioId: string;
  onElementsClassified: (elements: PortfolioElement[]) => void;
  onBack?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const ElementClassificationView: React.FC<ElementClassificationViewProps> = ({
  portfolioId,
  onElementsClassified,
  onBack,
}) => {
  const { theme } = useTheme();
  const toast = useToast();

  // State
  const [elements, setElements] = useState<PortfolioElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [classificationProgress, setClassificationProgress] = useState(0);

  // Load elements from database
  useEffect(() => {
    loadElements();
  }, [portfolioId]);

  const loadElements = async () => {
    try {
      setLoading(true);
      const elementsData = await window.electron.portfolioV2.elements.getByPortfolio(portfolioId);
      setElements(elementsData);
    } catch (error) {
      console.error('[ElementClassificationView] Erreur chargement éléments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle element selection
  const toggleElementSelection = (elementId: string) => {
    setSelectedElements((prev) => {
      const next = new Set(prev);
      if (next.has(elementId)) {
        next.delete(elementId);
      } else {
        next.add(elementId);
      }
      return next;
    });
  };

  // Select all elements
  const selectAll = () => {
    setSelectedElements(new Set(elements.map((e) => e.id)));
  };

  // Deselect all elements
  const deselectAll = () => {
    setSelectedElements(new Set());
  };

  // Classify selected elements with AI
  const classifySelectedElements = async () => {
    if (selectedElements.size === 0) {
      toast.warning('Aucun élément sélectionné', 'Veuillez sélectionner au moins un élément.');
      return;
    }

    setClassifying(true);
    setClassificationProgress(0);

    const selectedElementsList = elements.filter((e) => selectedElements.has(e.id));
    const total = selectedElementsList.length;

    for (let i = 0; i < selectedElementsList.length; i++) {
      const element = selectedElementsList[i];

      try {
        // Appeler le service de classification IA
        const classificationResult = await classifyElement({
          elementId: element.id,
          title: element.title,
          description: element.description,
          format: element.format,
          thumbnailUrl: element.thumbnailUrl,
        });

        const classification: ElementClassification = {
          category: classificationResult.category,
          tags: classificationResult.tags,
          suggestedProject: classificationResult.suggestedProject,
          confidence: classificationResult.confidence,
          reasoning: classificationResult.reasoning,
        };

        // Mettre à jour l'élément en BDD
        await window.electron.portfolioV2.elements.updateClassification(
          element.id,
          classification
        );

        // Mettre à jour l'état local
        setElements((prev) =>
          prev.map((e) =>
            e.id === element.id ? { ...e, classification } : e
          )
        );

        setClassificationProgress(((i + 1) / total) * 100);
      } catch (error) {
        console.error('[ElementClassificationView] Erreur classification:', error);
      }
    }

    setClassifying(false);
    toast.success('Classification terminée !', `${selectedElementsList.length} élément(s) classifié(s)`);
  };

  // Skip classification and go to next step
  const skipClassification = () => {
    onElementsClassified(elements);
  };

  // Continue to next step
  const continueToNextStep = () => {
    onElementsClassified(elements);
  };

  // Styles
  const styles = {
    container: {
      padding: spacing[6],
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      marginBottom: spacing[6],
      textAlign: 'center' as const,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[4],
      padding: spacing[3],
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
    },
    toolbarLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
    },
    toolbarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    button: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: theme.text.secondary,
      border: `1px solid ${theme.border.default}`,
    },
    selectedCount: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
    },
    grid: {
      flex: 1,
      overflow: 'auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: spacing[3],
      alignContent: 'start',
    },
    card: {
      border: `2px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: transitions.normal,
      position: 'relative' as const,
    },
    cardSelected: {
      borderColor: theme.accent.primary,
      boxShadow: `0 0 0 2px ${theme.accent.primary}40`,
    },
    cardCheckbox: {
      position: 'absolute' as const,
      top: spacing[2],
      left: spacing[2],
      width: '20px',
      height: '20px',
      borderRadius: borderRadius.sm,
      backgroundColor: '#FFFFFF',
      border: `2px solid ${theme.border.default}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    cardCheckboxChecked: {
      backgroundColor: theme.accent.primary,
      borderColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    cardThumbnail: {
      width: '100%',
      height: '120px',
      backgroundColor: theme.bg.tertiary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
    },
    cardContent: {
      padding: spacing[3],
    },
    cardTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      marginBottom: spacing[1],
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    cardMeta: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      marginBottom: spacing[2],
    },
    cardTags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: spacing[1],
    },
    tag: {
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      backgroundColor: theme.accent.muted,
      color: theme.accent.primary,
      borderRadius: borderRadius.sm,
    },
    progressBar: {
      marginTop: spacing[4],
      height: '8px',
      backgroundColor: theme.border.light,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accent.primary,
      transition: transitions.normal,
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing[6],
      paddingTop: spacing[4],
      borderTop: `1px solid ${theme.border.light}`,
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: spacing[8],
      color: theme.text.tertiary,
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p>Chargement des éléments...</p>
        </div>
      </div>
    );
  }

  if (elements.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: spacing[3] }}>📁</div>
          <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
            Aucun élément à classifier
          </h3>
          <p>Veuillez d'abord importer des fichiers à l'étape précédente.</p>
          {onBack && (
            <button
              type="button"
              style={{ ...styles.button, ...styles.buttonSecondary, marginTop: spacing[4] }}
              onClick={onBack}
            >
              ← Retour
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Classification IA</h2>
        <p style={styles.subtitle}>
          Laissez l'IA analyser et classifier vos éléments automatiquement
        </p>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={selectAll}
            disabled={classifying}
          >
            Tout sélectionner
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={deselectAll}
            disabled={classifying}
          >
            Tout désélectionner
          </button>
          <span style={styles.selectedCount}>
            {selectedElements.size} / {elements.length} sélectionné{selectedElements.size > 1 ? 's' : ''}
          </span>
        </div>
        <div style={styles.toolbarRight}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={classifySelectedElements}
            disabled={classifying || selectedElements.size === 0}
          >
            {classifying ? '⏳ Classification...' : '🤖 Classifier avec IA'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {classifying && (
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${classificationProgress}%` }} />
        </div>
      )}

      {/* Grid of elements */}
      <div style={styles.grid}>
        {elements.map((element) => {
          const isSelected = selectedElements.has(element.id);
          const isClassified = !!element.classification;

          return (
            <div
              key={element.id}
              style={{
                ...styles.card,
                ...(isSelected ? styles.cardSelected : {}),
              }}
              onClick={() => !classifying && toggleElementSelection(element.id)}
            >
              {/* Checkbox */}
              <div
                style={{
                  ...styles.cardCheckbox,
                  ...(isSelected ? styles.cardCheckboxChecked : {}),
                }}
              >
                {isSelected && '✓'}
              </div>

              {/* Thumbnail */}
              <div style={styles.cardThumbnail}>
                {element.thumbnailUrl ? (
                  <img
                    src={element.thumbnailUrl}
                    alt={element.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getFormatIcon(element.format)
                )}
              </div>

              {/* Content */}
              <div style={styles.cardContent}>
                <div style={styles.cardTitle}>{element.title}</div>
                <div style={styles.cardMeta}>
                  {element.format.toUpperCase()}
                  {isClassified && ' • Classifié ✓'}
                </div>

                {/* Tags */}
                {isClassified && element.classification!.tags.length > 0 && (
                  <div style={styles.cardTags}>
                    {element.classification!.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} style={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          type="button"
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={skipClassification}
          disabled={classifying}
        >
          Passer cette étape
        </button>
        <button
          type="button"
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={continueToNextStep}
          disabled={classifying}
        >
          Continuer →
        </button>
      </div>
    </div>
  );
};

export default ElementClassificationView;
