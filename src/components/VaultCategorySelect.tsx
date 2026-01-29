/**
 * SOUVERAIN - Vault Category Select
 * Sélecteur de catégories avec système + personnalisées
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import type { VaultCategory } from './VaultModule';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Crown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

// ============================================================
// CATEGORIES SYSTÈME (11)
// ============================================================

interface SystemCategory {
  value: VaultCategory;
  label: string;
  icon: string;
}

const SYSTEM_CATEGORIES: SystemCategory[] = [
  { value: 'cv', label: 'CV', icon: '📄' },
  { value: 'cover_letter', label: 'Lettre de motivation', icon: '✉️' },
  { value: 'portfolio', label: 'Portfolio', icon: '💼' },
  { value: 'certificate', label: 'Diplôme', icon: '🎓' },
  { value: 'reference', label: 'Recommandation', icon: '⭐' },
  { value: 'contract', label: 'Contrat', icon: '📋' },
  { value: 'payslip', label: 'Fiche de paie', icon: '💰' },
  { value: 'other', label: 'Autre', icon: '📎' },
];

// ============================================================
// CUSTOM CATEGORY TYPE
// ============================================================

interface CustomCategory {
  id: string;
  name: string;
  icon: string;
}

// ============================================================
// COMPONENT
// ============================================================

interface VaultCategorySelectProps {
  selectedCategory?: VaultCategory | 'all';
  onSelectCategory: (category: VaultCategory | 'all') => void;
  onClose: () => void;
  isPremium?: boolean;
}

export const VaultCategorySelect: React.FC<VaultCategorySelectProps> = ({
  selectedCategory = 'all',
  onSelectCategory,
  onClose,
  isPremium = false,
}) => {
  const { theme } = useTheme();
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🏷️');

  const FREE_CUSTOM_LIMIT = 3;

  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const result = await window.electron.vault.getCategories();
      if (result.success) {
        setCustomCategories(result.categories);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    // Check limit pour Free
    if (!isPremium && customCategories.length >= FREE_CUSTOM_LIMIT) {
      alert(`Limite de ${FREE_CUSTOM_LIMIT} catégories personnalisées atteinte. Passez à Premium pour des catégories illimitées.`);
      return;
    }

    try {
      const result = await window.electron.vault.addCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
      });

      if (result.success) {
        await loadCustomCategories();
        setNewCategoryName('');
        setNewCategoryIcon('🏷️');
        setIsCreating(false);
      } else {
        alert(result.error || 'Erreur lors de la création');
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ? Les documents associés seront déplacés vers "Autre".')) {
      return;
    }

    try {
      const result = await window.electron.vault.deleteCategory(id);
      if (result.success) {
        await loadCustomCategories();
      } else {
        alert(result.error || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression');
    }
  };

  // Filtrer les catégories par recherche
  const filteredSystemCategories = SYSTEM_CATEGORIES.filter((cat) =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomCategories = customCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      padding: '2rem',
    },
    modal: {
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius.xl,
      width: '100%',
      maxWidth: '500px',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: theme.shadow.xl,
    },
    header: {
      padding: '1.5rem 2rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    closeButton: {
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    body: {
      flex: 1,
      overflow: 'auto',
      padding: '1.5rem 2rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    searchContainer: {
      position: 'relative' as const,
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.text.tertiary,
      pointerEvents: 'none' as const,
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      fontSize: typography.fontSize.sm,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      color: theme.text.primary,
      outline: 'none',
      transition: transitions.fast,
    },
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    premiumBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.625rem',
      backgroundColor: `${theme.accent.primary}15`,
      color: theme.accent.primary,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    categoryList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    categoryItem: (isSelected: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1rem',
      backgroundColor: isSelected ? theme.accent.muted : theme.bg.secondary,
      border: `1px solid ${isSelected ? theme.accent.primary : theme.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    }),
    categoryIcon: {
      fontSize: '1.25rem',
      lineHeight: 1,
    },
    categoryLabel: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    checkIcon: {
      color: theme.accent.primary,
    },
    deleteButton: {
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      color: theme.semantic.error,
      transition: transitions.fast,
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.875rem 1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px dashed ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    createForm: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
    },
    formRow: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
    },
    iconPicker: {
      width: '48px',
      height: '48px',
      fontSize: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
    },
    input: {
      flex: 1,
      padding: '0.75rem 1rem',
      fontSize: typography.fontSize.sm,
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.md,
      color: theme.text.primary,
      outline: 'none',
    },
    formActions: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '0.625rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    buttonSecondary: {
      backgroundColor: theme.bg.tertiary,
      color: theme.text.primary,
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '2rem 1rem',
      color: theme.text.tertiary,
      fontSize: typography.fontSize.sm,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Catégories</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.X />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Search */}
          <div style={styles.searchContainer}>
            <div style={styles.searchIcon}>
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.accent.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.border.light;
              }}
            />
          </div>

          {/* Catégorie "Toutes" */}
          <div style={styles.categoryList}>
            <div
              style={styles.categoryItem(selectedCategory === 'all')}
              onClick={() => {
                onSelectCategory('all');
                onClose();
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== 'all') {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== 'all') {
                  e.currentTarget.style.backgroundColor = theme.bg.secondary;
                }
              }}
            >
              <span style={styles.categoryIcon}>📁</span>
              <span style={styles.categoryLabel}>Toutes les catégories</span>
              {selectedCategory === 'all' && (
                <div style={styles.checkIcon}>
                  <Icons.Check />
                </div>
              )}
            </div>
          </div>

          {/* Catégories Système */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>Système</div>
            </div>
            <div style={styles.categoryList}>
              {filteredSystemCategories.length > 0 ? (
                filteredSystemCategories.map((cat) => (
                  <div
                    key={cat.value}
                    style={styles.categoryItem(selectedCategory === cat.value)}
                    onClick={() => {
                      onSelectCategory(cat.value);
                      onClose();
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== cat.value) {
                        e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== cat.value) {
                        e.currentTarget.style.backgroundColor = theme.bg.secondary;
                      }
                    }}
                  >
                    <span style={styles.categoryIcon}>{cat.icon}</span>
                    <span style={styles.categoryLabel}>{cat.label}</span>
                    {selectedCategory === cat.value && (
                      <div style={styles.checkIcon}>
                        <Icons.Check />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>Aucune catégorie système trouvée</div>
              )}
            </div>
          </div>

          {/* Catégories Personnalisées */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>Personnalisées</div>
              {!isPremium && customCategories.length >= FREE_CUSTOM_LIMIT && (
                <div style={styles.premiumBadge}>
                  <Icons.Crown />
                  Premium
                </div>
              )}
            </div>

            <div style={styles.categoryList}>
              {filteredCustomCategories.map((cat) => (
                <div
                  key={cat.id}
                  style={styles.categoryItem(selectedCategory === cat.id)}
                  onClick={() => {
                    onSelectCategory(cat.id as any);
                    onClose();
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.backgroundColor = theme.bg.secondary;
                    }
                  }}
                >
                  <span style={styles.categoryIcon}>{cat.icon}</span>
                  <span style={styles.categoryLabel}>{cat.name}</span>
                  {selectedCategory === cat.id && (
                    <div style={styles.checkIcon}>
                      <Icons.Check />
                    </div>
                  )}
                  <button
                    style={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat.id);
                    }}
                    title="Supprimer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icons.X />
                  </button>
                </div>
              ))}
            </div>

            {/* Formulaire de création */}
            {isCreating ? (
              <div style={styles.createForm}>
                <div style={styles.formRow}>
                  <div
                    style={styles.iconPicker}
                    title="Cliquer pour changer l'icône"
                    onClick={() => {
                      const icons = ['🏷️', '📌', '🔖', '⚡', '🎯', '💡', '🔥', '✨', '🚀', '🎨'];
                      const currentIndex = icons.indexOf(newCategoryIcon);
                      const nextIndex = (currentIndex + 1) % icons.length;
                      setNewCategoryIcon(icons[nextIndex]);
                    }}
                  >
                    {newCategoryIcon}
                  </div>
                  <input
                    type="text"
                    placeholder="Nom de la catégorie"
                    style={styles.input}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateCategory();
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewCategoryName('');
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div style={styles.formActions}>
                  <button
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                    onClick={() => {
                      setIsCreating(false);
                      setNewCategoryName('');
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.buttonPrimary }}
                    onClick={handleCreateCategory}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.accent.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.accent.primary;
                    }}
                  >
                    Créer
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={styles.addButton}
                onClick={() => {
                  if (!isPremium && customCategories.length >= FREE_CUSTOM_LIMIT) {
                    alert(`Limite de ${FREE_CUSTOM_LIMIT} catégories personnalisées atteinte.\n\nPassez à Premium pour des catégories illimitées.`);
                    return;
                  }
                  setIsCreating(true);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                  e.currentTarget.style.borderColor = theme.border.default;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.secondary;
                  e.currentTarget.style.borderColor = theme.border.default;
                }}
              >
                <Icons.Plus />
                Nouvelle catégorie {!isPremium && `(${customCategories.length}/${FREE_CUSTOM_LIMIT})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
