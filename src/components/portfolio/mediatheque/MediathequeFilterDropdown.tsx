import React from 'react';
import { useTheme } from '../../../ThemeContext';

interface MediathequeFilterDropdownProps {
    filterType: string;
    sortBy: string;
    onFilterChange: (type: string) => void;
    onSortChange: (sort: string) => void;
    onClose: () => void;
    onReset: () => void;
}

const Icons = {
    X: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
};

export const MediathequeFilterDropdown: React.FC<MediathequeFilterDropdownProps> = ({
    filterType,
    sortBy,
    onFilterChange,
    onSortChange,
    onClose,
    onReset
}) => {
    const { theme } = useTheme();

    const styles = {
        overlay: {
            position: 'fixed' as const,
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999,
        },
        dropdown: {
            position: 'absolute' as const,
            top: '3.5rem',
            right: '0',
            width: '300px',
            backgroundColor: theme.bg.secondary,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            padding: '1.5rem',
            zIndex: 1000,
        },
        section: { marginBottom: '1.5rem' },
        label: {
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: theme.text.secondary,
            marginBottom: '0.75rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
        },
        optionGroup: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.5rem',
        },
        option: (isActive: boolean) => ({
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isActive ? theme.accent.primary + '20' : 'transparent',
            color: isActive ? theme.accent.primary : theme.text.primary,
            border: `1px solid ${isActive ? theme.accent.primary : 'transparent'}`,
            transition: 'all 0.2s',
        }),
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
        },
        title: {
            margin: 0,
            fontSize: '1.1rem',
            color: theme.text.primary,
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: theme.text.secondary,
            cursor: 'pointer',
            padding: '4px',
        },
        footer: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: `1px solid ${theme.border}`,
        },
        resetBtn: {
            background: 'transparent',
            border: 'none',
            color: theme.text.tertiary,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textDecoration: 'underline',
        }
    };

    return (
        <>
            <div style={styles.overlay} onClick={onClose} />
            <div style={styles.dropdown}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Filtres & Tri</h3>
                    <button style={styles.closeBtn} onClick={onClose}><Icons.X /></button>
                </div>

                {/* Filter Type */}
                <div style={styles.section}>
                    <span style={styles.label}>Type de fichier</span>
                    <div style={styles.optionGroup}>
                        {[
                            { val: 'all', label: 'Tout voir' },
                            { val: 'image', label: 'Images' },
                            { val: 'video', label: 'Vidéos' },
                            { val: 'pdf', label: 'Documents PDF' }
                        ].map(opt => (
                            <div 
                                key={opt.val}
                                style={styles.option(filterType === opt.val)}
                                onClick={() => onFilterChange(opt.val)}
                            >
                                <span>{opt.label}</span>
                                {filterType === opt.val && <span>✓</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sort By */}
                <div style={styles.section}>
                    <span style={styles.label}>Trier par</span>
                    <div style={styles.optionGroup}>
                        {[
                            { val: 'date_desc', label: 'Date (Récent → Ancien)' },
                            { val: 'date_asc', label: 'Date (Ancien → Récent)' },
                            { val: 'size_desc', label: 'Poids (Lourd → Léger)' },
                            { val: 'size_asc', label: 'Poids (Léger → Lourd)' },
                            { val: 'type', label: 'Type' }
                        ].map(opt => (
                            <div 
                                key={opt.val}
                                style={styles.option(sortBy === opt.val)}
                                onClick={() => onSortChange(opt.val)}
                            >
                                <span>{opt.label}</span>
                                {sortBy === opt.val && <span>✓</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.footer}>
                     <button style={styles.resetBtn} onClick={onReset}>Réinitialiser</button>
                     <button 
                        onClick={onClose}
                        style={{
                            background: theme.accent.primary,
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                     >
                        Voir les résultats
                     </button>
                </div>

            </div>
        </>
    );
};
