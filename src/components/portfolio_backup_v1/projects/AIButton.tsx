import React from 'react';
import { useTheme } from '../../../ThemeContext';

interface AIButtonProps {
    onClick: () => void;
    loading?: boolean;
    label?: string;
    variant?: 'sparkle' | 'anonymize' | 'tag';
    disabled?: boolean;
}

const Icons = {
    Sparkle: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
    ),
    Shield: () => (
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2"/>
    ),
    Tag: () => (
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" fill="none" stroke="currentColor" strokeWidth="2"/>
    )
};

export const AIButton: React.FC<AIButtonProps> = ({ onClick, loading, label = 'IA', variant = 'sparkle', disabled }) => {
    const { theme } = useTheme();

    const getIcon = () => {
        switch (variant) {
            case 'anonymize': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                   <Icons.Shield />
                </svg>
            );
            case 'tag': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <Icons.Tag />
                    <circle cx="7" cy="7" r="2" fill="currentColor"/>
                </svg>
            );
            default: return <Icons.Sparkle />;
        }
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: variant === 'anonymize' 
                    ? `linear-gradient(135deg, ${theme.bg.tertiary} 0%, ${theme.bg.secondary} 100%)`
                    : `linear-gradient(135deg, ${theme.accent.secondary} 0%, ${theme.accent.primary} 100%)`,
                border: 'none',
                color: variant === 'anonymize' ? theme.text.primary : '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                animation: loading ? 'pulse 1.5s infinite' : 'none'
            }}
            title={variant === 'anonymize' ? "Anonymiser le contenu (Local IA)" : "Générer avec l'IA"}
        >
            {loading ? (
                <span style={{ display: 'block', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
            ) : (
                getIcon()
            )}
            <span>{label}</span>
        </button>
    );
};
