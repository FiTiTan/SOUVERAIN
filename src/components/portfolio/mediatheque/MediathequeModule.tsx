import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../../ThemeContext';
import { useMediatheque, type MediathequeItem } from '../../../hooks/useMediatheque';
import { MediathequeGrid } from './MediathequeGrid';
import { AssetPreviewModal } from './AssetPreviewModal';
import { MediathequeFilterDropdown } from './MediathequeFilterDropdown';

const Icons = {
    Search: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    Filter: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    Plus: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
};

export const MediathequeModule: React.FC = () => {
    const { theme } = useTheme();
    const [activePortfolioId, setActivePortfolioId] = useState<string | undefined>(undefined);
    
    // Filters & Sort State
    const [filterType, setFilterType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('date_desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Preview State
    const [previewId, setPreviewId] = useState<string | null>(null);

    // Resolve Active Portfolio
    useEffect(() => {
        const fetchPortfolios = async () => {
            try {
                // @ts-ignore
                const result = await window.electron.portfolio.getAll();
                if (result.success && result.portfolios.length > 0) {
                    const primary = result.portfolios.find((p: any) => p.is_primary) || result.portfolios[0];
                    setActivePortfolioId(primary.id);
                }
            } catch (e) {
                console.error("Failed to fetch portfolios", e);
            }
        };
        fetchPortfolios();
    }, []);

    // @ts-ignore
    const { items, loading, error, deleteItem, importFiles, addDroppedFiles } = useMediatheque(activePortfolioId);

    // Derived State: Filtered & Sorted Items
    const processedItems = useMemo(() => {
        let res = [...items];

        // Filter
        if (filterType !== 'all') {
            res = res.filter(i => i.file_type === filterType);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(i => i.original_filename.toLowerCase().includes(q));
        }

        // Sort
        res.sort((a, b) => {
            const dateA = new Date((a as any).created_at || a.createdAt).getTime();
            const dateB = new Date((b as any).created_at || b.createdAt).getTime();
            const sizeA = (a as any).file_size || a.fileSize || 0;
            const sizeB = (b as any).file_size || b.fileSize || 0;
            const typeA = (a.file_type || (a as any).format || '').toLowerCase();
            const typeB = (b.file_type || (b as any).format || '').toLowerCase();

            if (sortBy === 'date_desc') return dateB - dateA;
            if (sortBy === 'date_asc') return dateA - dateB;
            if (sortBy === 'size_desc') return sizeB - sizeA;
            if (sortBy === 'size_asc') return sizeA - sizeB;
            if (sortBy === 'type') return typeA.localeCompare(typeB);
            return 0;
        });

        return res;
    }, [items, filterType, sortBy, searchQuery]);

    // Drag & Drop Handlers
    const [isDragging, setIsDragging] = useState(false);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
             setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            // @ts-ignore
            await addDroppedFiles(files);
        }
    };

    // Actions
    const handleImportClick = async () => {
        if (!activePortfolioId) return;
        // @ts-ignore
        const result = await importFiles();
        if (result && !result.success && !result.cancelled) {
            alert(`Erreur import: ${result.error}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce média ?")) {
            await deleteItem(id);
        }
    };

    // Preview Navigation
    const currentPreviewIndex = processedItems.findIndex(i => i.id === previewId);
    const hasNext = currentPreviewIndex !== -1 && currentPreviewIndex < processedItems.length - 1;
    const hasPrev = currentPreviewIndex !== -1 && currentPreviewIndex > 0;

    const handleNext = () => {
        if (hasNext) setPreviewId(processedItems[currentPreviewIndex + 1].id);
    };

    const handlePrev = () => {
        if (hasPrev) setPreviewId(processedItems[currentPreviewIndex - 1].id);
    };

    const activeFiltersCount = (filterType !== 'all' ? 1 : 0) + (sortBy !== 'date_desc' ? 1 : 0);

    return (
        <div 
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
                padding: '2rem', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%'
            }}
        >
            {/* Drag Overlay */}
            {isDragging && (
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: `4px dashed ${theme.accent.primary}`,
                    zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none', 
                    backdropFilter: 'blur(2px)'
                }}>
                    <h2 style={{ color: theme.accent.primary, fontSize: '2rem' }}>Déposez vos fichiers ici</h2>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: theme.text.primary, margin: 0, fontSize: '1.8rem' }}>Médiathèque</h1>
                    <p style={{ color: theme.text.secondary, margin: '0.5rem 0 0' }}>
                        Gérez vos assets ({items.length} éléments)
                    </p>
                </div>
                
                <button
                    onClick={handleImportClick}
                    disabled={!activePortfolioId}
                    style={{
                        backgroundColor: theme.accent.primary,
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: activePortfolioId ? 'pointer' : 'not-allowed',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        opacity: activePortfolioId ? 1 : 0.5,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    }}
                >
                    <Icons.Plus />
                    <span>Ajouter Média</span>
                </button>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ 
                    flex: 1, 
                    position: 'relative', 
                    maxWidth: '400px',
                    display: 'flex', alignItems: 'center'
                }}>
                    <div style={{ position: 'absolute', left: '12px', color: theme.text.tertiary }}>
                        <Icons.Search />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border}`,
                            backgroundColor: theme.bg.secondary,
                            color: theme.text.primary,
                            outline: 'none',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <button 
                         onClick={() => setShowFilters(!showFilters)}
                         style={{
                             display: 'flex',
                             alignItems: 'center',
                             gap: '0.5rem',
                             padding: '10px 16px',
                             borderRadius: '8px',
                             border: `1px solid ${theme.border}`,
                             backgroundColor: showFilters ? theme.bg.tertiary : theme.bg.secondary,
                             color: theme.text.primary,
                             cursor: 'pointer',
                             fontWeight: 500,
                             transition: 'all 0.2s'
                         }}
                    >
                        <Icons.Filter />
                        <span>Filtres</span>
                        {activeFiltersCount > 0 && (
                            <span style={{
                                backgroundColor: theme.accent.primary,
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px', height: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {showFilters && (
                        <MediathequeFilterDropdown 
                            filterType={filterType}
                            sortBy={sortBy}
                            onFilterChange={setFilterType}
                            onSortChange={setSortBy}
                            onClose={() => setShowFilters(false)}
                            onReset={() => {
                                setFilterType('all');
                                setSortBy('date_desc');
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    color: '#ef4444'
                }}>
                    {error}
                </div>
            )}

             {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <MediathequeGrid 
                    items={processedItems} 
                    onDelete={handleDelete} 
                    onSelect={(item) => setPreviewId(item.id)}
                    selectedIds={[]}
                    isSelectionMode={false}
                    loading={loading}
                />
            </div>

            {/* Preview Modal */}
            <AssetPreviewModal 
                isOpen={!!previewId}
                onClose={() => setPreviewId(null)}
                asset={processedItems.find(i => i.id === previewId) || null}
                onNext={handleNext}
                onPrev={handlePrev}
                hasNext={hasNext}
                hasPrev={hasPrev}
            />
        </div>
    );
};
