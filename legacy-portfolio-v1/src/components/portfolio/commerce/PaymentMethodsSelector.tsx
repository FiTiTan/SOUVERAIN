/**
 * SOUVERAIN - PaymentMethodsSelector
 * Sélecteur de moyens de paiement pour les commerces
 */

import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../../design-system';
import type { PaymentMethod } from '../../../types/commerce';
import { PAYMENT_LABELS } from '../../../types/commerce';

// ============================================================
// TYPES
// ============================================================

interface PaymentMethodsSelectorProps {
  value: PaymentMethod[];
  onChange: (methods: PaymentMethod[]) => void;
  priceRange?: 1 | 2 | 3 | 4;
  onPriceRangeChange?: (range: 1 | 2 | 3 | 4) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const PaymentMethodsSelector: React.FC<PaymentMethodsSelectorProps> = ({
  value,
  onChange,
  priceRange,
  onPriceRangeChange,
}) => {
  const { theme } = useTheme();

  // Handlers
  const handleToggleMethod = (method: PaymentMethod) => {
    const newMethods = value.includes(method)
      ? value.filter((m) => m !== method)
      : [...value, method];
    onChange(newMethods);
  };

  const handleSelectAllCommon = () => {
    const commonMethods: PaymentMethod[] = ['cash', 'card', 'contactless'];
    onChange([...new Set([...value, ...commonMethods])]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[4],
    },
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    quickActions: {
      display: 'flex',
      gap: spacing[2],
    },
    quickButton: {
      padding: `${spacing[1]} ${spacing[3]}`,
      fontSize: typography.fontSize.xs,
      color: theme.accent.primary,
      backgroundColor: 'transparent',
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      fontWeight: typography.fontWeight.medium,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: spacing[3],
    },
    checkboxCard: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: spacing[3],
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      userSelect: 'none' as const,
    },
    checkboxCardSelected: {
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
    },
    checkbox: {
      width: '18px',
      height: '18px',
      borderRadius: borderRadius.sm,
      border: `2px solid ${theme.border.default}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: transitions.fast,
    },
    checkboxChecked: {
      backgroundColor: theme.accent.primary,
      borderColor: theme.accent.primary,
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: '12px',
      fontWeight: typography.fontWeight.bold,
    },
    icon: {
      fontSize: typography.fontSize.lg,
      flexShrink: 0,
    },
    labelText: {
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
    priceRangeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[4],
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
    },
    priceRangeLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    priceRangeOptions: {
      display: 'flex',
      gap: spacing[2],
      flex: 1,
    },
    priceOption: {
      flex: 1,
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.secondary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: transitions.fast,
    },
    priceOptionSelected: {
      color: theme.accent.primary,
      backgroundColor: theme.accent.muted,
      borderColor: theme.accent.primary,
    },
    hint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      marginTop: spacing[1],
    },
  };

  // Render checkbox card
  const renderCheckboxCard = (
    method: PaymentMethod,
    label: string,
    icon: string
  ) => {
    const isSelected = value.includes(method);

    return (
      <div
        key={method}
        style={{
          ...styles.checkboxCard,
          ...(isSelected ? styles.checkboxCardSelected : {}),
        }}
        onClick={() => handleToggleMethod(method)}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleMethod(method);
          }
        }}
      >
        <div
          style={{
            ...styles.checkbox,
            ...(isSelected ? styles.checkboxChecked : {}),
          }}
        >
          {isSelected && <span style={styles.checkmark}>✓</span>}
        </div>
        <span style={styles.icon}>{icon}</span>
        <span style={styles.labelText}>{label}</span>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Moyens de paiement */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>💳 Moyens de paiement acceptés</h3>
          <div style={styles.quickActions}>
            <button
              type="button"
              style={styles.quickButton}
              onClick={handleSelectAllCommon}
            >
              Sélection courante
            </button>
            <button
              type="button"
              style={styles.quickButton}
              onClick={handleClearAll}
            >
              Tout effacer
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {(Object.entries(PAYMENT_LABELS) as [PaymentMethod, typeof PAYMENT_LABELS[PaymentMethod]][]).map(
            ([key, { label, icon }]) => renderCheckboxCard(key, label, icon)
          )}
        </div>
      </div>

      {/* Gamme de prix (optionnel) */}
      {onPriceRangeChange && (
        <div style={styles.section}>
          <div style={styles.priceRangeContainer}>
            <span style={styles.priceRangeLabel}>Gamme de prix :</span>
            <div style={styles.priceRangeOptions}>
              {[1, 2, 3, 4].map((range) => (
                <div
                  key={range}
                  style={{
                    ...styles.priceOption,
                    ...(priceRange === range ? styles.priceOptionSelected : {}),
                  }}
                  onClick={() => onPriceRangeChange(range as 1 | 2 | 3 | 4)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPriceRangeChange(range as 1 | 2 | 3 | 4);
                    }
                  }}
                >
                  {'€'.repeat(range)}
                </div>
              ))}
            </div>
          </div>
          <p style={styles.hint}>
            € = Économique • €€ = Modéré • €€€ = Élevé • €€€€ = Très élevé
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsSelector;
