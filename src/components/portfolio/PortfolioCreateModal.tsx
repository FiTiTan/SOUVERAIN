import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import { generateId, generateSlug } from '../../utils/portfolio';
import { mapCvToPortfolio } from '../../utils/cvToPortfolio';

interface PortfolioCreateModalProps {
  onClose: () => void;
  onSuccess: (portfolioId: string) => void;
  existingSlugs: string[];
}

export const PortfolioCreateModal: React.FC<PortfolioCreateModalProps> = ({
  onClose,
  onSuccess,
  existingSlugs,
}) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('modern');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importFromCv, setImportFromCv] = useState(false);
  const [cvHistory, setCvHistory] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>('');

  useEffect(() => {
    loadCvHistory();
  }, []);

  const loadCvHistory = async () => {
    try {
      const history = await window.electron.loadHistory();
      if (history && history.length > 0) {
        setCvHistory(history);
        setSelectedCvId(history[0].id.toString());
      }
    } catch (error) {
      console.error('[PortfolioCreateModal] Erreur chargement CV:', error);
    }
  };

  const importCvData = async (portfolioId: string) => {
    try {
      // Récupérer l'analyse CV complète
      const cvData = await window.electron.getAnalysisById?.(parseInt(selectedCvId));
      if (!cvData || !cvData.ia_result) {
        console.warn('[PortfolioCreateModal] Pas de données CV');
        return;
      }

      // Mapper CV → Portfolio
      const mappedSections = mapCvToPortfolio(cvData.ia_result);

      // Récupérer le portfolio pour avoir les IDs des sections
      const portfolioResult = await window.electron.portfolio.getById(portfolioId);
      if (!portfolioResult.success || !portfolioResult.portfolio) {
        console.error('[PortfolioCreateModal] Portfolio introuvable');
        return;
      }

      // Mettre à jour chaque section
      const sections = portfolioResult.portfolio.sections || [];
      for (const section of sections) {
        const mappedContent = mappedSections[section.section_type];
        if (mappedContent) {
          await window.electron.portfolio.updateSection(section.id, JSON.stringify(mappedContent));
        }
      }

      console.log('[PortfolioCreateModal] Import CV réussi');
    } catch (error) {
      console.error('[PortfolioCreateModal] Erreur import CV:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Le nom du portfolio est obligatoire');
      return;
    }

    setIsLoading(true);

    try {
      const id = generateId();
      const slug = generateSlug(name, existingSlugs);

      const result = await window.electron.portfolio.create({
        id,
        name: name.trim(),
        slug,
        template,
        metadata: null,
      });

      if (result.success) {
        // Import CV si demandé
        if (importFromCv && selectedCvId) {
          try {
            await importCvData(id);
          } catch (err) {
            console.error('[PortfolioCreateModal] Erreur import CV:', err);
            // Continue même si l'import échoue
          }
        }
        onSuccess(id);
      } else {
        if (result.error === 'LIMIT_REACHED') {
          setError('Vous avez atteint la limite de portfolios en version gratuite (1 maximum).');
        } else {
          setError(result.message || "Erreur lors de la création du portfolio");
        }
      }
    } catch (err) {
      console.error('[PortfolioCreateModal] Erreur:', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius.xl,
      boxShadow: theme.shadow.xl,
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      border: `1px solid ${theme.border.default}`,
    },
    header: {
      padding: '1.5rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      margin: 0,
    },
    closeButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontSize: typography.fontSize.xl,
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    form: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    field: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    required: {
      color: theme.semantic.error,
      marginLeft: '0.25rem',
    },
    input: {
      padding: '0.75rem',
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      transition: transitions.fast,
    },
    templateGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.75rem',
    },
    templateCard: (isSelected: boolean) => ({
      padding: '1rem',
      backgroundColor: isSelected ? theme.accent.muted : theme.bg.secondary,
      border: `2px solid ${isSelected ? theme.accent.primary : theme.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      textAlign: 'center' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '0.5rem',
    }),
    templateIcon: {
      fontSize: '2rem',
    },
    templateName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    templateDesc: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
    },
    error: {
      padding: '0.75rem',
      backgroundColor: theme.semantic.errorBg,
      color: theme.semantic.error,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      border: `1px solid ${theme.semantic.error}`,
    },
    footer: {
      padding: '1.5rem',
      borderTop: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    button: {
      padding: '0.625rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    cancelButton: {
      color: theme.text.secondary,
      backgroundColor: theme.bg.secondary,
    },
    submitButton: (disabled: boolean) => ({
      color: '#FFFFFF',
      backgroundColor: disabled ? theme.text.muted : theme.accent.primary,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
    }),
  };

  const templates = [
    { id: 'modern', name: 'Modern', desc: 'Épuré et pro', icon: '💼' },
    { id: 'classic', name: 'Classic', desc: 'Bientôt', icon: '📄', disabled: true },
    { id: 'creative', name: 'Creative', desc: 'Bientôt', icon: '🎨', disabled: true },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Créer un portfolio</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Nom */}
          <div style={styles.field}>
            <label style={styles.label}>
              Nom du portfolio
              <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mon Portfolio Pro"
              style={styles.input}
              autoFocus
              disabled={isLoading}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.accent.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.border.default;
              }}
            />
          </div>

          {/* Template */}
          <div style={styles.field}>
            <label style={styles.label}>Template</label>
            <div style={styles.templateGrid}>
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  style={styles.templateCard(template === tmpl.id)}
                  onClick={() => {
                    if (!tmpl.disabled && !isLoading) {
                      setTemplate(tmpl.id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!tmpl.disabled && !isLoading) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={styles.templateIcon}>{tmpl.icon}</div>
                  <div style={styles.templateName}>{tmpl.name}</div>
                  <div style={styles.templateDesc}>{tmpl.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Import CV */}
          {cvHistory.length > 0 && (
            <div style={styles.field}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={importFromCv}
                  onChange={(e) => setImportFromCv(e.target.checked)}
                  disabled={isLoading}
                  style={{ cursor: 'pointer' }}
                />
                <span>Pré-remplir depuis une analyse CV</span>
              </label>

              {importFromCv && (
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  style={styles.input}
                  disabled={isLoading}
                >
                  {cvHistory.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.filename} - {new Date(cv.created_at).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              )}

              {importFromCv && (
                <span style={styles.hint}>
                  ✨ Vos expériences, compétences et informations seront automatiquement importées
                </span>
              )}
            </div>
          )}

          {/* Error */}
          {error && <div style={styles.error}>{error}</div>}
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={onClose}
            disabled={isLoading}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.secondary;
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            style={{ ...styles.button, ...styles.submitButton(isLoading || !name.trim()) }}
            disabled={isLoading || !name.trim()}
            onMouseEnter={(e) => {
              if (!isLoading && name.trim()) {
                e.currentTarget.style.backgroundColor = theme.accent.secondary;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && name.trim()) {
                e.currentTarget.style.backgroundColor = theme.accent.primary;
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoading ? 'Création...' : 'Créer le portfolio'}
          </button>
        </div>
      </div>
    </div>
  );
};
