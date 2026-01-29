/**
 * SOUVERAIN - Vault Filter Dropdown V2
 * Dropdown amélioré avec sections pliables, boutons "Tout sélectionner", reset par section
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import type { VaultCategory } from './VaultModule';

// ============================================================
// TYPES
// ============================================================

interface FilterValues {
  years: string[];
  months: string[];
  categories: (VaultCategory | 'all')[];
  tags: string[];
  favoritesOnly: boolean;
}

interface VaultFilterDropdownProps {
  availableYears: string[];
  availableMonths: string[];
  availableCategories: VaultCategory[];
  availableTags: string[];
  currentFilters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
  onClose: () => void;
}

interface CollapsedState {
  years: boolean;
  months: boolean;
  categories: boolean;
  tags: boolean;
  favorites: boolean;
}

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Filter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronDown: ({ rotated }: { rotated: boolean }) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transform: rotated ? 'rotate(-90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease'
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Star: ({ filled }: { filled: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

// ============================================================
// CATEGORIES
// ============================================================

const CATEGORIES: { value: VaultCategory; label: string }[] = [
  { value: 'cv', label: 'CV' },
  { value: 'cover_letter', label: 'Lettre de motivation' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'certificate', label: 'Diplôme/Certif' },
  { value: 'reference', label: 'Recommandation' },
  { value: 'contract', label: 'Contrat' },
  { value: 'payslip', label: 'Fiche de paie' },
  { value: 'other', label: 'Autre' },
];

const MONTHS = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

// ============================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================

interface CollapsibleSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onReset: () => void;
  onSelectAll?: () => void;
  showSelectAll?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isCollapsed,
  onToggleCollapse,
  onReset,
  onSelectAll,
  showSelectAll,
  children
}) => {
  const { theme } = useTheme();

  const styles = {
    section: {
      marginBottom: '1rem',
      borderBottom: `1px solid ${theme.border.light}`,
      paddingBottom: '1rem',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: isCollapsed ? '0' : '0.75rem',
      cursor: 'pointer',
      userSelect: 'none' as const,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    selectAllButton: {
      padding: '0.25rem 0.5rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: 'transparent',
      color: theme.accent.primary,
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.sm,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    resetButton: {
      padding: '0.25rem',
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.text.tertiary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: transitions.fast,
    },
    collapseButton: {
      padding: '0.25rem',
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.text.tertiary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      display: isCollapsed ? 'none' : 'block',
    },
  };

  return (
    <div style={styles.section}>
      <div style={styles.header} onClick={onToggleCollapse}>
        <div style={styles.headerLeft}>
          <button style={styles.collapseButton} type="button">
            <Icons.ChevronDown rotated={isCollapsed} />
          </button>
          <span style={styles.title}>{title}</span>
        </div>

        <div style={styles.headerRight} onClick={(e) => e.stopPropagation()}>
          {showSelectAll && onSelectAll && !isCollapsed && (
            <button
              style={styles.selectAllButton}
              onClick={onSelectAll}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accent.muted;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Tout
            </button>
          )}
          <button
            style={styles.resetButton}
            onClick={onReset}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.semantic.error;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.text.tertiary;
            }}
            title="Réinitialiser cette section"
          >
            <Icons.X />
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const VaultFilterDropdownV2: React.FC<VaultFilterDropdownProps> = ({
  availableYears,
  availableMonths,
  availableCategories,
  availableTags,
  currentFilters,
  onApplyFilters,
  onClose,
}) => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FilterValues>(currentFilters);

  // État des sections pliées (persisté en localStorage)
  const [collapsed, setCollapsed] = useState<CollapsedState>(() => {
    const saved = localStorage.getItem('vault_filter_collapsed_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Si erreur de parsing, utiliser l'état par défaut
      }
    }
    return {
      years: true,
      months: true,
      categories: true,
      tags: true,
      favorites: true,
    };
  });

  // Persister l'état collapsed dans localStorage
  useEffect(() => {
    localStorage.setItem('vault_filter_collapsed_state', JSON.stringify(collapsed));
  }, [collapsed]);

  const handleReset = () => {
    const defaultFilters: FilterValues = {
      years: [],
      months: [],
      categories: [],
      tags: [],
      favoritesOnly: false,
    };
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  // Helper pour toggle un item dans un array
  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  // Handlers pour sections pliables
  const toggleSection = (section: keyof CollapsedState) => {
    setCollapsed({ ...collapsed, [section]: !collapsed[section] });
  };

  // Handlers pour reset par section
  const resetYears = () => setFilters({ ...filters, years: [] });
  const resetMonths = () => setFilters({ ...filters, months: [] });
  const resetCategories = () => setFilters({ ...filters, categories: [] });
  const resetTags = () => setFilters({ ...filters, tags: [] });
  const resetFavorites = () => setFilters({ ...filters, favoritesOnly: false });

  // Handlers pour "Tout sélectionner"
  const selectAllCategories = () => {
    setFilters({ ...filters, categories: availableCategories });
  };

  const selectAllTags = () => {
    setFilters({ ...filters, tags: [...availableTags] });
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      zIndex: 999,
    },
    dropdown: {
      position: 'absolute' as const,
      top: '3.5rem',
      right: '0',
      width: '340px',
      maxHeight: '600px',
      overflowY: 'auto' as const,
      backgroundColor: theme.bg.elevated,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.xl,
      boxShadow: theme.shadow.xl,
      padding: '1.5rem',
      zIndex: 1000,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: `1px solid ${theme.border.light}`,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    closeButton: {
      width: '28px',
      height: '28px',
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
    checkboxList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
      maxHeight: '150px',
      overflowY: 'auto' as const,
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 0.75rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      textAlign: 'left' as const,
    },
    checkbox: (checked: boolean) => ({
      width: '18px',
      height: '18px',
      borderRadius: borderRadius.sm,
      border: `2px solid ${checked ? theme.accent.primary : theme.border.default}`,
      backgroundColor: checked ? theme.accent.primary : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: transitions.fast,
    }),
    checkboxLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      flex: 1,
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: '12px',
      fontWeight: typography.fontWeight.bold,
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      maxHeight: '120px',
      overflowY: 'auto' as const,
    },
    tagButton: (selected: boolean) => ({
      padding: '0.375rem 0.75rem',
      backgroundColor: selected ? theme.accent.muted : theme.bg.secondary,
      border: `1px solid ${selected ? theme.accent.primary : theme.border.light}`,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      color: selected ? theme.accent.primary : theme.text.primary,
      cursor: 'pointer',
      transition: transitions.fast,
    }),
    favoriteCheckbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    footer: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: `1px solid ${theme.border.light}`,
    },
    button: {
      flex: 1,
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
      border: `1px solid ${theme.border.light}`,
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>FILTRES</h3>
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

        {/* Année Section */}
        <CollapsibleSection
          title="Année"
          isCollapsed={collapsed.years}
          onToggleCollapse={() => toggleSection('years')}
          onReset={resetYears}
        >
          <div style={styles.checkboxList}>
            {availableYears.map((year) => (
              <button
                key={year}
                style={styles.checkboxItem}
                onClick={() => setFilters({ ...filters, years: toggleArrayItem(filters.years, year) })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={styles.checkbox(filters.years.includes(year))}>
                  {filters.years.includes(year) && <span style={styles.checkmark}>✓</span>}
                </div>
                <span style={styles.checkboxLabel}>{year}</span>
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Mois Section */}
        <CollapsibleSection
          title="Mois"
          isCollapsed={collapsed.months}
          onToggleCollapse={() => toggleSection('months')}
          onReset={resetMonths}
        >
          <div style={styles.checkboxList}>
            {availableMonths.map((monthValue) => {
              const monthInfo = MONTHS.find(m => m.value === monthValue);
              if (!monthInfo) return null;
              return (
                <button
                  key={monthValue}
                  style={styles.checkboxItem}
                  onClick={() => setFilters({ ...filters, months: toggleArrayItem(filters.months, monthValue) })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={styles.checkbox(filters.months.includes(monthValue))}>
                    {filters.months.includes(monthValue) && <span style={styles.checkmark}>✓</span>}
                  </div>
                  <span style={styles.checkboxLabel}>{monthInfo.label}</span>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* Catégorie Section */}
        <CollapsibleSection
          title="Catégorie"
          isCollapsed={collapsed.categories}
          onToggleCollapse={() => toggleSection('categories')}
          onReset={resetCategories}
          onSelectAll={selectAllCategories}
          showSelectAll={true}
        >
          <div style={styles.checkboxList}>
            {availableCategories.map((catValue) => {
              const catInfo = CATEGORIES.find(c => c.value === catValue);
              if (!catInfo) return null;
              return (
                <button
                  key={catValue}
                  style={styles.checkboxItem}
                  onClick={() => setFilters({ ...filters, categories: toggleArrayItem(filters.categories, catValue) })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={styles.checkbox(filters.categories.includes(catValue))}>
                    {filters.categories.includes(catValue) && <span style={styles.checkmark}>✓</span>}
                  </div>
                  <span style={styles.checkboxLabel}>{catInfo.label}</span>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* Tags Section */}
        {availableTags.length > 0 && (
          <CollapsibleSection
            title="Tags"
            isCollapsed={collapsed.tags}
            onToggleCollapse={() => toggleSection('tags')}
            onReset={resetTags}
            onSelectAll={selectAllTags}
            showSelectAll={true}
          >
            <div style={styles.tagsContainer}>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  style={styles.tagButton(filters.tags.includes(tag))}
                  onClick={() => {
                    const newTags = filters.tags.includes(tag)
                      ? filters.tags.filter((t) => t !== tag)
                      : [...filters.tags, tag];
                    setFilters({ ...filters, tags: newTags });
                  }}
                  onMouseEnter={(e) => {
                    if (!filters.tags.includes(tag)) {
                      e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!filters.tags.includes(tag)) {
                      e.currentTarget.style.backgroundColor = theme.bg.secondary;
                    }
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Favoris Section */}
        <CollapsibleSection
          title="Favoris"
          isCollapsed={collapsed.favorites}
          onToggleCollapse={() => toggleSection('favorites')}
          onReset={resetFavorites}
        >
          <button
            style={{
              ...styles.favoriteCheckbox,
              borderColor: filters.favoritesOnly ? theme.accent.primary : theme.border.light,
              backgroundColor: filters.favoritesOnly ? theme.accent.muted : theme.bg.secondary,
            }}
            onClick={() => setFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = filters.favoritesOnly ? theme.accent.muted : theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = filters.favoritesOnly ? theme.accent.muted : theme.bg.secondary;
            }}
          >
            <div style={styles.checkbox(filters.favoritesOnly)}>
              {filters.favoritesOnly && <span style={styles.checkmark}>✓</span>}
            </div>
            <span style={styles.checkboxLabel}>Favoris uniquement</span>
            <div style={{ color: filters.favoritesOnly ? '#FACC15' : theme.text.tertiary }}>
              <Icons.Star filled={filters.favoritesOnly} />
            </div>
          </button>
        </CollapsibleSection>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={handleReset}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.elevated;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
          >
            Réinitialiser
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={handleApply}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Appliquer
          </button>
        </div>
      </div>
    </>
  );
};
