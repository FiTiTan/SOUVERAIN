/**
 * SOUVERAIN - SectorSelector
 * Sélection du secteur d'activité selon le mode choisi
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import {
  getSectorsByMode,
  isSectorAvailable,
  type PortfolioMode,
  type SectorConfig,
} from '../../types/sectors';

interface SectorSelectorProps {
  mode: PortfolioMode;
  selectedSector: string | null;
  onSelect: (sectorId: string) => void;
  disabled?: boolean;
}

export const SectorSelector: React.FC<SectorSelectorProps> = ({
  mode,
  selectedSector,
  onSelect,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les secteurs par mode
  const sectors = useMemo(() => {
    const modeSectors = getSectorsByMode(mode);

    if (!searchQuery.trim()) return modeSectors;

    const query = searchQuery.toLowerCase();
    return modeSectors.filter(
      (s) =>
        s.label.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }, [mode, searchQuery]);

  // Séparer Tier 1 et Tier 2
  const tier1Sectors = sectors.filter((s) => s.tier === 'tier1');
  const tier2Sectors = sectors.filter((s) => s.tier === 'tier2');

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[6],
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
    },
    header: {
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
    searchContainer: {
      position: 'relative' as const,
      maxWidth: '400px',
      margin: '0 auto',
    },
    searchIcon: {
      position: 'absolute' as const,
      left: spacing[3],
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.text.tertiary,
      fontSize: typography.fontSize.base,
    },
    searchInput: {
      width: '100%',
      padding: `${spacing[3]} ${spacing[4]} ${spacing[3]} ${spacing[10]}`,
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      outline: 'none',
      transition: transitions.fast,
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.tertiary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: spacing[3],
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: spacing[3],
    },
    card: {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[4],
      backgroundColor: theme.bg.secondary,
      border: `2px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: transitions.normal,
      opacity: disabled ? 0.5 : 1,
    },
    cardHovered: {
      borderColor: theme.accent.primary,
      boxShadow: theme.shadow.md,
      transform: 'translateY(-2px)',
    },
    cardSelected: {
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
    },
    cardDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    iconContainer: {
      width: '48px',
      height: '48px',
      borderRadius: borderRadius.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      flexShrink: 0,
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[1],
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    cardDescription: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      lineHeight: typography.lineHeight.normal,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    },
    badge: {
      position: 'absolute' as const,
      top: spacing[2],
      right: spacing[2],
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.sm,
    },
    badgeSoon: {
      backgroundColor: theme.semantic.warningBg,
      color: theme.semantic.warning,
    },
    checkmark: {
      position: 'absolute' as const,
      top: spacing[2],
      right: spacing[2],
      width: '24px',
      height: '24px',
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontSize: typography.fontSize.sm,
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: spacing[8],
      color: theme.text.tertiary,
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: spacing[3],
    },
    emptyText: {
      fontSize: typography.fontSize.base,
    },
  };

  const getCardStyle = (sector: SectorConfig) => {
    const isSelected = selectedSector === sector.id;
    const isHovered = hoveredSector === sector.id;
    const isAvailable = isSectorAvailable(sector.id);

    return {
      ...styles.card,
      ...(isHovered && !disabled && isAvailable ? styles.cardHovered : {}),
      ...(isSelected ? styles.cardSelected : {}),
      ...(!isAvailable ? styles.cardDisabled : {}),
    };
  };

  const getIconStyle = (sector: SectorConfig) => ({
    ...styles.iconContainer,
    backgroundColor: `${sector.color}20`,
  });

  const handleSelect = (sector: SectorConfig) => {
    if (disabled || !isSectorAvailable(sector.id)) return;
    onSelect(sector.id);
  };

  const renderSectorCard = (sector: SectorConfig) => {
    const isSelected = selectedSector === sector.id;
    const isAvailable = isSectorAvailable(sector.id);

    return (
      <div
        key={sector.id}
        style={getCardStyle(sector)}
        onClick={() => handleSelect(sector)}
        onMouseEnter={() => setHoveredSector(sector.id)}
        onMouseLeave={() => setHoveredSector(null)}
        role="button"
        tabIndex={disabled || !isAvailable ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && isAvailable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect(sector.id);
          }
        }}
        aria-selected={isSelected}
        aria-disabled={disabled || !isAvailable}
      >
        {/* Badge "Bientôt" pour Tier 2 */}
        {!isAvailable && (
          <div style={{ ...styles.badge, ...styles.badgeSoon }}>Bientôt</div>
        )}

        {/* Checkmark si sélectionné */}
        {isSelected && isAvailable && (
          <div style={styles.checkmark}>✓</div>
        )}

        {/* Icône avec couleur du secteur */}
        <div style={getIconStyle(sector)}>
          {sector.icon}
        </div>

        {/* Contenu */}
        <div style={styles.cardContent}>
          <h4 style={styles.cardTitle}>{sector.label}</h4>
          <p style={styles.cardDescription}>{sector.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Quel est votre secteur d'activité ?</h2>
        <p style={styles.subtitle}>
          Sélectionnez votre domaine pour bénéficier de templates et contenus adaptés.
        </p>
      </div>

      {/* Recherche */}
      <div style={styles.searchContainer}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher un secteur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
          disabled={disabled}
        />
      </div>

      {/* Secteurs Tier 1 */}
      {tier1Sectors.length > 0 && (
        <div>
          <h3 style={styles.sectionTitle}>Secteurs disponibles</h3>
          <div style={styles.grid}>
            {tier1Sectors.map(renderSectorCard)}
          </div>
        </div>
      )}

      {/* Secteurs Tier 2 */}
      {tier2Sectors.length > 0 && (
        <div>
          <h3 style={styles.sectionTitle}>Prochainement</h3>
          <div style={styles.grid}>
            {tier2Sectors.map(renderSectorCard)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sectors.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <p style={styles.emptyText}>
            Aucun secteur ne correspond à votre recherche.
          </p>
        </div>
      )}
    </div>
  );
};

export default SectorSelector;
