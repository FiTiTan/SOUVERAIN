import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { PortfolioAIChat } from '../ai/PortfolioAIChat';
import { PreviewPortfolio } from '../preview/PreviewPortfolio';

interface MasterPortfolioViewProps {
  onBack: () => void;
  portfolioId: string;
}

export const MasterPortfolioView: React.FC<MasterPortfolioViewProps> = ({ onBack, portfolioId }) => {
  const { theme } = useTheme();
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // @ts-ignore
        const result = await window.electron.portfolio.getAll();
        if (result.success) {
          const current = result.portfolios.find((p: any) => p.id === portfolioId);
          setPortfolio(current);
          
          if (current?.content_json) {
            try {
                const parsed = JSON.parse(current.content_json);
                setGeneratedContent(parsed);
            } catch (e) {
                console.error('Failed to parse content_json', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [portfolioId]);

  const hasData = portfolio?.authorName || portfolio?.authorBio || portfolio?.contact_email;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme.bg.primary
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: theme.text.secondary }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg.primary
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
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
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
            margin: 0,
            flex: '1 1 auto',
            textAlign: 'center'
          }}>
            ✨ Portfolio Maître
          </h1>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {hasData && (
              <button
                onClick={() => setShowPreview(true)}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: theme.bg.tertiary,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.default}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.accent.primary;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.border.default;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                👁️ Aperçu
              </button>
            )}
            <button
              onClick={() => setShowAIChat(true)}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: theme.accent.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              💬 {hasData ? 'Modifier' : 'Personnaliser'} avec l'IA
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {!hasData && !generatedContent ? (
          /* Empty State - No data yet */
          <div style={{
            padding: '3rem',
            backgroundColor: theme.bg.secondary,
            borderRadius: '12px',
            border: `2px dashed ${theme.border.light}`,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              ✨
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '0.75rem'
            }}>
              Créez Votre Portfolio Maître
            </h2>
            <p style={{
              fontSize: '1rem',
              color: theme.text.secondary,
              marginBottom: '2rem',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Utilisez notre chat IA conversationnel pour construire votre profil professionnel en quelques minutes
            </p>
            <button
              onClick={() => setShowAIChat(true)}
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: theme.accent.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Commencer →
            </button>
          </div>
        ) : (
          /* Data Display */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* GENERATED CONTENT VIEW */}
            {generatedContent && (
                <>
                    {/* Hero Section */}
                    <div style={{
                        backgroundColor: theme.bg.secondary,
                        borderRadius: '12px',
                        padding: '2rem',
                        border: `1px solid ${theme.border.light}`
                        }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: theme.text.primary,
                            marginBottom: '0.5rem'
                        }}>
                            {generatedContent.hero?.title || portfolio.authorName || 'Sans Titre'}
                        </h2>
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 500,
                            color: theme.accent.primary,
                            marginBottom: '1rem'
                        }}>
                            {generatedContent.hero?.tagline || portfolio.tagline}
                        </h3>
                        <p style={{
                            fontSize: '1.1rem',
                            color: theme.text.secondary,
                            lineHeight: '1.6'
                        }}>
                            {generatedContent.hero?.bio || portfolio.authorBio}
                        </p>
                    </div>

                    {/* Sections Grid */}
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {/* About / Skills */}
                        {generatedContent.about && (
                            <div style={{
                                backgroundColor: theme.bg.secondary,
                                borderRadius: '12px',
                                padding: '1.5rem',
                                border: `1px solid ${theme.border.light}`
                            }}>
                                <h4 style={{ color: theme.text.primary, marginBottom: '1rem' }}>À Propos</h4>
                                <div style={{ fontSize: '0.95rem', color: theme.text.secondary, whiteSpace: 'pre-line' }}>
                                    {generatedContent.about.headline}
                                </div>
                            </div>
                        )}
                        
                        {/* Practical Info */}
                        {generatedContent.contact && (
                            <div style={{
                                backgroundColor: theme.bg.secondary,
                                borderRadius: '12px',
                                padding: '1.5rem',
                                border: `1px solid ${theme.border.light}`
                            }}>
                                <h4 style={{ color: theme.text.primary, marginBottom: '1rem' }}>Contact</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: theme.text.secondary }}>
                                    <li>📧 {generatedContent.contact.email}</li>
                                    <li>📱 {generatedContent.contact.phone}</li>
                                    <li>📍 {generatedContent.hero?.location}</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* LEGACY VIEW (Fallback if no generated content) */}
            {!generatedContent && hasData && (
                <div style={{
                backgroundColor: theme.bg.secondary,
                borderRadius: '12px',
                padding: '2rem',
                border: `1px solid ${theme.border.light}`
                }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: theme.text.primary,
                    marginBottom: '0.5rem'
                }}>
                    {portfolio.authorName || 'Nom non défini'}
                </h2>
                {portfolio.authorBio && (
                    <p style={{
                    fontSize: '1.1rem',
                    color: theme.text.secondary,
                    marginBottom: '1rem',
                    lineHeight: '1.6'
                    }}>
                    {portfolio.authorBio}
                    </p>
                )}
                </div>
            )}


            {/* CTA to Edit */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: `${theme.accent.primary}08`,
              border: `1px solid ${theme.accent.primary}33`,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.95rem',
                color: theme.text.secondary,
                marginBottom: '1rem'
              }}>
                Besoin de modifier ou d'enrichir vos informations ?
              </p>
              <button
                onClick={() => setShowAIChat(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: theme.accent.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                💬 Utiliser le Chat IA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <PortfolioAIChat 
          portfolioId={portfolioId}
          onComplete={() => {
            setShowAIChat(false);
            // Reload portfolio data
            window.location.reload();
          }}
          onClose={() => setShowAIChat(false)} 
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <PreviewPortfolio 
          portfolioId={portfolioId}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
