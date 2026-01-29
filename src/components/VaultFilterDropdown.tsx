/**
 * SOUVERAIN - Vault Filter Dropdown
 * Dropdown consolidé pour filtrer les documents du coffre-fort
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import type { VaultCategory } from './VaultModule';

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
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

// ============================================================
// COMPONENT
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
  availableTags: string[];
  currentFilters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
  onClose: () => void;
}

export const VaultFilterDropdown: React.FC<VaultFilterDropdownProps> = ({
  availableYears,
  availableTags,
  currentFilters,
  onApplyFilters,
  onClose,
}) => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FilterValues>(currentFilters);

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
      width: '320px',
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
    section: {
      marginBottom: '1.25rem',
    },
    label: {
      display: 'block',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.secondary,
      marginBottom: '0.5rem',
    },
    select: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.md,
      color: theme.text.primary,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23${theme.text.tertiary.slice(1)}' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      outline: 'none',
      transition: transitions.fast,
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
    radioGroup: {
      display: 'flex',
      gap: '1rem',
    },
    radioButton: (selected: boolean) => ({
      flex: 1,
      padding: '0.625rem',
      backgroundColor: selected ? theme.accent.muted : theme.bg.secondary,
      border: `1px solid ${selected ? theme.accent.primary : theme.border.light}`,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: selected ? theme.accent.primary : theme.text.primary,
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: transitions.fast,
    }),
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
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Filtres</h3>
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

        {/* Année */}
        <div style={styles.section}>
          <label style={styles.label}>Année</label>
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
        </div>

        {/* Mois */}
        <div style={styles.section}>
          <label style={styles.label}>Mois</label>
          <div style={styles.checkboxList}>
            {MONTHS.map((month) => (
              <button
                key={month.value}
                style={styles.checkboxItem}
                onClick={() => setFilters({ ...filters, months: toggleArrayItem(filters.months, month.value) })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={styles.checkbox(filters.months.includes(month.value))}>
                  {filters.months.includes(month.value) && <span style={styles.checkmark}>✓</span>}
                </div>
                <span style={styles.checkboxLabel}>{month.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Catégorie */}
        <div style={styles.section}>
          <label style={styles.label}>Catégorie</label>
          <div style={styles.checkboxList}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                style={styles.checkboxItem}
                onClick={() => setFilters({ ...filters, categories: toggleArrayItem(filters.categories, cat.value) })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={styles.checkbox(filters.categories.includes(cat.value))}>
                  {filters.categories.includes(cat.value) && <span style={styles.checkmark}>✓</span>}
                </div>
                <span style={styles.checkboxLabel}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div style={styles.section}>
            <label style={styles.label}>Tags</label>
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
          </div>
        )}

        {/* Favoris */}
        <div style={styles.section}>
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
        </div>

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
              e.currentTarget.style.backgroundColor = theme.accent.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.primary;
            }}
          >
            Appliquer
          </button>
        </div>
      </div>
    </>
  );
};
