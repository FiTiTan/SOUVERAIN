/**
 * SOUVERAIN - Vault Module (Coffre-Fort)
 * Stockage sécurisé de documents professionnels (chiffré AES-256)
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import { VaultDocumentCard } from './VaultDocumentCard';
import { VaultDocumentList } from './VaultDocumentList';
import { VaultImportModal } from './VaultImportModal';
import { VaultPreviewModal } from './VaultPreviewModal';
import { VaultEmptyState } from './VaultEmptyState';
import { PremiumBadge } from './PremiumBadge';
import { VaultFilterDropdownV2 as VaultFilterDropdown } from './VaultFilterDropdownV2';

// ============================================================
// TYPES
// ============================================================

export type VaultCategory =
  | 'cv'
  | 'cover_letter'
  | 'portfolio'
  | 'certificate'
  | 'reference'
  | 'contract'
  | 'payslip'
  | 'other';

export interface VaultDocument {
  id: string;
  name: string;
  category: VaultCategory;
  file_type: string;
  file_size: number;
  tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'created_at' | 'name' | 'category' | 'file_size';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Grid: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  List: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
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
// VAULT MODULE
// ============================================================

export const VaultModule: React.FC = () => {
  const { theme } = useTheme();

  // State
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<(VaultCategory | 'all')[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<VaultCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [documentCount, setDocumentCount] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Charger les documents au montage
  useEffect(() => {
    // Force le rechargement de toutes les données
    loadDocuments();
    loadDocumentCount();
    loadTotalStorage();
    loadAvailableYears();
    loadAvailableMonths();
    loadAvailableCategories();
  }, []);

  // Extraire les tags disponibles des documents
  useEffect(() => {
    const allTags = new Set<string>();
    documents.forEach((doc) => {
      if (doc.tags) {
        doc.tags.forEach((tag) => allTags.add(tag));
      }
    });
    setAvailableTags(Array.from(allTags).sort());
  }, [documents]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const filters = {
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        years: selectedYears.length > 0 ? selectedYears : undefined,
        months: selectedMonths.length > 0 ? selectedMonths : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        favoritesOnly: favoritesOnly || undefined,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
      };

      const result = await window.electron.vault.getDocuments(filters);
      if (result.success) {
        setDocuments(result.documents);
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentCount = async () => {
    try {
      const result = await window.electron.vault.countDocuments();
      if (result.success) {
        setDocumentCount(result.count);
      }
    } catch (error) {
      console.error('Erreur comptage documents:', error);
    }
  };

  const loadTotalStorage = async () => {
    try {
      const result = await window.electron.vault.getTotalStorage();
      if (result.success) {
        setTotalStorage(result.totalBytes);
      }
    } catch (error) {
      console.error('Erreur calcul stockage:', error);
    }
  };

  const loadAvailableYears = async () => {
    try {
      const result = await window.electron.vault.getAvailableYears();
      if (result.success) {
        setAvailableYears(result.years);
      }
    } catch (error) {
      console.error('Erreur chargement années:', error);
    }
  };

  const loadAvailableMonths = async () => {
    try {
      const result = await window.electron.vault.getAvailableMonths();
      if (result.success) {
        setAvailableMonths(result.months);
      }
    } catch (error) {
      console.error('Erreur chargement mois:', error);
    }
  };

  const loadAvailableCategories = async () => {
    try {
      const result = await window.electron.vault.getUsedCategories();
      if (result.success) {
        setAvailableCategories(result.categories);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  // Handler de tri par colonne
  const handleSort = (column: string) => {
    if (column === sortBy) {
      // Toggle l'ordre si on clique sur la même colonne
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Nouvelle colonne : trier par ASC par défaut
      setSortBy(column as SortBy);
      setSortOrder('ASC');
    }
  };

  // Handler pour appliquer les filtres du dropdown
  const handleApplyFilters = (filters: any) => {
    setSelectedYears(filters.years);
    setSelectedMonths(filters.months);
    setSelectedCategories(filters.categories);
    setSelectedTags(filters.tags);
    setFavoritesOnly(filters.favoritesOnly);
  };

  // Handler pour effacer tous les filtres
  const handleClearAllFilters = () => {
    setSelectedYears([]);
    setSelectedMonths([]);
    setSelectedCategories([]);
    setSelectedTags([]);
    setFavoritesOnly(false);
  };

  // Compter les filtres actifs
  const activeFiltersCount = [
    selectedYears.length > 0 ? 1 : 0,
    selectedMonths.length > 0 ? 1 : 0,
    selectedCategories.length > 0 ? 1 : 0,
    selectedTags.length > 0 ? 1 : 0,
    favoritesOnly ? 1 : 0,
  ].reduce((sum, val) => sum + val, 0);

  // Recharger quand les filtres changent
  useEffect(() => {
    loadDocuments();
  }, [selectedYears, selectedMonths, selectedCategories, selectedTags, favoritesOnly, searchQuery, sortBy, sortOrder]);

  const handleImportSuccess = () => {
    loadDocuments();
    loadDocumentCount();
    loadTotalStorage();
    loadAvailableYears(); // Recharger les années car un nouveau document peut avoir une nouvelle année
    setShowImportModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;

    try {
      const result = await window.electron.vault.deleteDocument(id);
      if (result.success) {
        loadDocuments();
        loadDocumentCount();
        loadTotalStorage();
      }
    } catch (error) {
      console.error('Erreur suppression document:', error);
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await window.electron.vault.updateDocument(id, { is_favorite: !isFavorite });
      loadDocuments();
    } catch (error) {
      console.error('Erreur toggle favori:', error);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const result = await window.electron.vault.downloadDocument(id);
      if (!result.success) {
        alert(result.error || 'Erreur téléchargement');
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<VaultDocument>) => {
    try {
      await window.electron.vault.updateDocument(id, updates);
      loadDocuments();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  // Formater le stockage en MB
  const formatStorage = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Styles
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    viewToggle: {
      display: 'flex',
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
      overflow: 'hidden',
    },
    viewButton: (active: boolean) => ({
      padding: '0.5rem 0.75rem',
      backgroundColor: active ? theme.bg.secondary : 'transparent',
      color: active ? theme.text.primary : theme.text.tertiary,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: transitions.fast,
    }),
    addButton: {
      padding: '0.75rem 1.25rem',
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: transitions.fast,
    },
    toolbar: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      alignItems: 'center',
    },
    searchBox: {
      flex: 1,
      position: 'relative' as const,
      maxWidth: '400px',
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      color: theme.text.primary,
      fontSize: typography.fontSize.sm,
      outline: 'none',
      transition: transitions.fast,
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.text.tertiary,
      pointerEvents: 'none' as const,
    },
    select: {
      padding: '0.75rem 2.5rem 0.75rem 1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      color: theme.text.primary,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23${theme.text.tertiary.slice(1)}' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '1.25rem',
    },
    button: {
      padding: '0.75rem 1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      color: theme.text.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      transition: transitions.fast,
    },
  };

  // Afficher état vide si aucun document
  if (!loading && documents.length === 0 && activeFiltersCount === 0 && !searchQuery) {
    return (
      <>
        <VaultEmptyState onAddDocument={() => setShowImportModal(true)} />

        {/* Import Modal */}
        {showImportModal && (
          <VaultImportModal
            currentCount={documentCount}
            onClose={() => setShowImportModal(false)}
            onSuccess={handleImportSuccess}
          />
        )}

        {/* Preview Modal */}
        {previewDocId && (
          <VaultPreviewModal
            documentId={previewDocId}
            onClose={() => setPreviewDocId(null)}
          />
        )}
      </>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Coffre-Fort</h1>
          <p style={styles.subtitle}>
            {documentCount}/20 documents • {formatStorage(totalStorage)}/500 MB •{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Free
              <PremiumBadge size="sm" />
            </span>
          </p>
        </div>
        <div style={styles.headerRight}>
          {/* View toggle */}
          <div style={styles.viewToggle}>
            <button
              style={styles.viewButton(viewMode === 'grid')}
              onClick={() => setViewMode('grid')}
              title="Vue grille"
            >
              <Icons.Grid />
            </button>
            <button
              style={styles.viewButton(viewMode === 'list')}
              onClick={() => setViewMode('list')}
              title="Vue liste"
            >
              <Icons.List />
            </button>
          </div>

          {/* Add button */}
          <button
            style={styles.addButton}
            onClick={() => {
              setShowImportModal(true);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.primary;
            }}
          >
            <Icons.Plus />
            Ajouter
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        {/* Search */}
        <div style={styles.searchBox}>
          <div style={styles.searchIcon}>
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom ou tags..."
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

        {/* Bouton Filtres avec badge compteur */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative' as const }}>
            <button
              style={{
                ...styles.button,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.tertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.secondary;
              }}
            >
              <Icons.Filter />
              Filtres
              {activeFiltersCount > 0 && (
                <span
                  style={{
                    padding: '0.125rem 0.375rem',
                    backgroundColor: theme.accent.primary,
                    color: '#FFFFFF',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    lineHeight: 1,
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}
              <Icons.ChevronDown />
            </button>

            {showFilterDropdown && (
              <VaultFilterDropdown
              availableYears={availableYears}
              availableMonths={availableMonths}
              availableCategories={availableCategories}
              availableTags={availableTags}
              currentFilters={{
                years: selectedYears,
                months: selectedMonths,
                categories: selectedCategories,
                tags: selectedTags,
                favoritesOnly: favoritesOnly,
              }}
              onApplyFilters={handleApplyFilters}
              onClose={() => setShowFilterDropdown(false)}
            />
          )}
          </div>

          {/* Bouton Effacer (visible seulement si filtres actifs) */}
          {activeFiltersCount > 0 && (
            <button
              style={{
                ...styles.button,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                border: `1px solid ${theme.border.default}`,
                color: theme.text.secondary,
              }}
              onClick={handleClearAllFilters}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
                e.currentTarget.style.borderColor = theme.semantic.error;
                e.currentTarget.style.color = theme.semantic.error;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = theme.border.default;
                e.currentTarget.style.color = theme.text.secondary;
              }}
              title="Effacer tous les filtres"
            >
              <Icons.X />
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Documents */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: theme.text.tertiary }}>
          Chargement...
        </div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: theme.text.tertiary }}>
          Aucun document trouvé
        </div>
      ) : viewMode === 'grid' ? (
        <div style={styles.gridContainer}>
          {documents.map((doc) => (
            <VaultDocumentCard
              key={doc.id}
              document={doc}
              onPreview={() => setPreviewDocId(doc.id)}
              onDelete={() => handleDelete(doc.id)}
              onToggleFavorite={() => handleToggleFavorite(doc.id, doc.is_favorite)}
              onDownload={() => handleDownload(doc.id)}
              onUpdate={(updates) => handleUpdate(doc.id, updates)}
            />
          ))}
        </div>
      ) : (
        <VaultDocumentList
          documents={documents}
          onPreview={(id) => setPreviewDocId(id)}
          onDelete={handleDelete}
          onToggleFavorite={(id, isFav) => handleToggleFavorite(id, isFav)}
          onDownload={handleDownload}
          onUpdate={handleUpdate}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <VaultImportModal
          currentCount={documentCount}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* Preview Modal */}
      {previewDocId && (
        <VaultPreviewModal
          documentId={previewDocId}
          onClose={() => setPreviewDocId(null)}
        />
      )}
    </div>
  );
};
