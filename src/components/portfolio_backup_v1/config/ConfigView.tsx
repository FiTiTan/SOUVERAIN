import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { AccountsModule } from '../accounts/AccountsModule';

interface ConfigViewProps {
  onBack: () => void;
}

// Style palettes definition (same as in stylePalettes.ts)
const STYLE_PALETTES = [
  {
    id: 'moderne',
    name: 'Moderne',
    description: 'Design épuré et minimaliste pour un impact visuel fort',
    emoji: '✨',
    colors: { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981' }
  },
  {
    id: 'classique',
    name: 'Classique',
    description: 'Élégance intemporelle avec typographie raffinée',
    emoji: '🎩',
    colors: { primary: '#1E293B', secondary: '#64748B', accent: '#0F172A' }
  },
  {
    id: 'authentique',
    name: 'Authentique',
    description: 'Chaleur et proximité avec une touche artisanale',
    emoji: '🌿',
    colors: { primary: '#92400E', secondary: '#F59E0B', accent: '#065F46' }
  },
  {
    id: 'artistique',
    name: 'Artistique',
    description: 'Créativité et audace pour les profils créatifs',
    emoji: '🎨',
    colors: { primary: '#EC4899', secondary: '#8B5CF6', accent: '#F59E0B' }
  },
  {
    id: 'vitrine',
    name: 'Vitrine',
    description: 'Mise en valeur maximale du contenu visuel',
    emoji: '📸',
    colors: { primary: '#0EA5E9', secondary: '#6366F1', accent: '#14B8A6' }
  },
  {
    id: 'formel',
    name: 'Formel',
    description: 'Professionnalisme et sérieux pour le corporate',
    emoji: '💼',
    colors: { primary: '#0F172A', secondary: '#475569', accent: '#334155' }
  }
];

export const ConfigView: React.FC<ConfigViewProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'styles' | 'settings'>('accounts');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // @ts-ignore
        const result = await window.electron.portfolio.getAll();
        if (result.success && result.portfolios.length > 0) {
          const primary = result.portfolios.find((p: any) => p.is_primary) || result.portfolios[0];
          setPortfolioId(primary.id);
          setSelectedPalette(primary.style_preference || null);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      }
    };

    fetchPortfolio();
  }, []);

  const handlePaletteSelect = async (paletteId: string) => {
    setSelectedPalette(paletteId);
    // TODO: Save to DB
    console.log('Selected palette:', paletteId);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem',
        borderBottom: `1px solid ${theme.border.light}`,
        backgroundColor: theme.bg.secondary
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Back button */}
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.border.default}`,
              borderRadius: '8px',
              color: theme.text.secondary,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.accent.primary;
              e.currentTarget.style.color = theme.accent.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border.default;
              e.currentTarget.style.color = theme.text.secondary;
            }}
          >
            ← Retour
          </button>

          {/* Title */}
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: theme.text.primary,
            margin: 0
          }}>
            ⚙️ Configuration
          </h1>

          <div style={{ width: '120px' }} /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.5rem 2rem 0'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: `2px solid ${theme.border.light}`
        }}>
          <button
            onClick={() => setActiveTab('accounts')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'accounts' ? `3px solid ${theme.accent.primary}` : '3px solid transparent',
              color: activeTab === 'accounts' ? theme.text.primary : theme.text.secondary,
              fontSize: '0.95rem',
              fontWeight: activeTab === 'accounts' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            🌐 Comptes Externes
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'styles' ? `3px solid ${theme.accent.primary}` : '3px solid transparent',
              color: activeTab === 'styles' ? theme.text.primary : theme.text.secondary,
              fontSize: '0.95rem',
              fontWeight: activeTab === 'styles' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            🎨 Templates de Style
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'settings' ? `3px solid ${theme.accent.primary}` : '3px solid transparent',
              color: activeTab === 'settings' ? theme.text.primary : theme.text.secondary,
              fontSize: '0.95rem',
              fontWeight: activeTab === 'settings' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            ⚙️ Paramètres
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Accounts Tab */}
        {activeTab === 'accounts' && portfolioId && (
          <div>
            <p style={{
              fontSize: '1rem',
              color: theme.text.secondary,
              marginBottom: '1.5rem'
            }}>
              Liez vos comptes professionnels (LinkedIn, GitHub, Behance, etc.) pour enrichir votre portfolio
            </p>
            <AccountsModule />
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div>
            <p style={{
              fontSize: '1rem',
              color: theme.text.secondary,
              marginBottom: '1.5rem'
            }}>
              Choisissez le style visuel de votre portfolio exporté
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {STYLE_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => handlePaletteSelect(palette.id)}
                  style={{
                    position: 'relative',
                    padding: '1.5rem',
                    backgroundColor: theme.bg.secondary,
                    border: selectedPalette === palette.id 
                      ? `3px solid ${theme.accent.primary}`
                      : `1px solid ${theme.border.default}`,
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPalette !== palette.id) {
                      e.currentTarget.style.borderColor = theme.border.default;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPalette !== palette.id) {
                      e.currentTarget.style.borderColor = theme.border.default;
                    }
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {selectedPalette === palette.id && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: theme.accent.primary,
                      color: '#fff',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      ✓
                    </div>
                  )}
                  <div style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    {palette.emoji}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: theme.text.primary,
                    marginBottom: '0.5rem'
                  }}>
                    {palette.name}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: theme.text.secondary,
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {palette.description}
                  </p>
                  {/* Color preview */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '32px',
                      backgroundColor: palette.colors.primary,
                      borderRadius: '6px'
                    }} />
                    <div style={{
                      flex: 1,
                      height: '32px',
                      backgroundColor: palette.colors.secondary,
                      borderRadius: '6px'
                    }} />
                    <div style={{
                      flex: 1,
                      height: '32px',
                      backgroundColor: palette.colors.accent,
                      borderRadius: '6px'
                    }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '1rem'
            }}>
              Paramètres Globaux
            </h2>
            <div style={{
              padding: '2rem',
              backgroundColor: theme.bg.secondary,
              borderRadius: '12px',
              border: `1px solid ${theme.border.light}`,
              textAlign: 'center',
              color: theme.text.tertiary
            }}>
              <p>Fonctionnalités à venir</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
