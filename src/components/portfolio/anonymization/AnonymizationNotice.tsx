import React from 'react';
import { useTheme } from '../../../ThemeContext';

interface AnonymizationNoticeProps {
    onContinue: () => void;
}

export const AnonymizationNotice: React.FC<AnonymizationNoticeProps> = ({ onContinue }) => {
    const { theme } = useTheme();

    return (
        <div style={{
            padding: '2rem',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: `1px solid ${theme.status?.success || '#10b981'}`,
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '2rem auto',
            textAlign: 'center'
        }}>
            <div style={{ 
                width: '48px', height: '48px', 
                backgroundColor: theme.status?.success || '#10b981', 
                borderRadius: '50%', 
                margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white'
            }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            </div>

            <h2 style={{ color: theme.text.primary, marginBottom: '1rem' }}>Vos données sont protégées</h2>
            
            <p style={{ color: theme.text.secondary, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Avant d'analyser votre projet, SOUVERAIN <strong>anonymise automatiquement</strong> toutes les informations sensibles (Noms, Clients, Adresses, Prix).
            </p>

            <div style={{ 
                textAlign: 'left', 
                backgroundColor: theme.bg.secondary, 
                padding: '1rem', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                color: theme.text.secondary,
                marginBottom: '2rem'
            }}>
                <div>🔒 <strong>L'IA ne voit que :</strong> [CLIENT_A], [CONTACT_B]...</div>
                <div>💾 <strong>Vos données réelles :</strong> Restent stockées uniquement sur votre machine.</div>
            </div>

            <button
                onClick={onContinue}
                style={{
                    backgroundColor: theme.status?.success || '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                Continuer en toute sécurité
            </button>
        </div>
    );
};
