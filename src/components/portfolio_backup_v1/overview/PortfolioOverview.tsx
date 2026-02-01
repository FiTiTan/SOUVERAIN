import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';

interface PortfolioOverviewProps {
  portfolioId: string;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolioId }) => {
  const { theme } = useTheme();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch portfolio
        // @ts-ignore
        const portfolioResult = await window.electron.portfolio.getAll();
        if (portfolioResult.success) {
          const current = portfolioResult.portfolios.find((p: any) => p.id === portfolioId);
          setPortfolio(current);
        }

        // Fetch projects (highlights only)
        // @ts-ignore
        const projectsResult = await window.electron.invoke('db-get-projects', portfolioId);
        if (projectsResult.success) {
          const highlights = projectsResult.projects.filter((p: any) => p.is_highlight);
          setProjects(highlights.slice(0, 6)); // Max 6 highlights
        }

        // Fetch accounts
        // @ts-ignore
        const accountsResult = await window.electron.invoke('db-get-external-accounts', portfolioId);
        if (accountsResult.success) {
          setAccounts(accountsResult.accounts);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [portfolioId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: theme.text.secondary 
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      height: '100%', 
      overflow: 'auto',
      backgroundColor: theme.bg.primary 
    }}>
      {/* Hero Section */}
      <div style={{
        backgroundColor: theme.bg.secondary,
        borderRadius: '16px',
        padding: '3rem',
        marginBottom: '2rem',
        border: `1px solid ${theme.border.light}`,
        textAlign: 'center'
      }}>
        <h1 style={{ 
          margin: '0 0 1rem 0', 
          fontSize: '2.5rem', 
          fontWeight: 700,
          color: theme.text.primary 
        }}>
          {portfolio?.authorName || portfolio?.title || 'Mon Portfolio'}
        </h1>
        <p style={{ 
          margin: '0 0 1.5rem 0', 
          fontSize: '1.25rem',
          color: theme.text.secondary,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {portfolio?.tagline || portfolio?.authorBio || 'Bienvenue sur mon portfolio professionnel'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: `${theme.accent.primary}15`,
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: theme.accent.primary
          }}>
            {projects.length} Projets Highlights
          </div>
          <div style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: `${theme.accent.primary}15`,
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: theme.accent.primary
          }}>
            {accounts.length} Comptes Externes
          </div>
        </div>
      </div>

      {/* Projects Highlights */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            fontSize: '1.75rem', 
            fontWeight: 600,
            color: theme.text.primary 
          }}>
            Projets Mis en Avant
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  backgroundColor: theme.bg.secondary,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: `1px solid ${theme.border.light}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '100%',
                  height: '150px',
                  backgroundColor: theme.bg.tertiary,
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>
                  🚀
                </div>
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.25rem', 
                  fontWeight: 600,
                  color: theme.text.primary 
                }}>
                  {project.title}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem',
                  color: theme.text.secondary,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {project.brief_text || project.description || 'Aucune description'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Accounts */}
      {accounts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            fontSize: '1.75rem', 
            fontWeight: 600,
            color: theme.text.primary 
          }}>
            Mes Comptes Externes
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            {accounts.map((account) => (
              <a
                key={account.id}
                href={account.account_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: theme.bg.secondary,
                  borderRadius: '8px',
                  padding: '1rem',
                  border: `1px solid ${theme.border.light}`,
                  textDecoration: 'none',
                  color: theme.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.muted;
                  e.currentTarget.style.borderColor = theme.accent.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.secondary;
                  e.currentTarget.style.borderColor = theme.border.light;
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🌐</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {account.platform_type}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: theme.text.tertiary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {account.account_url}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && accounts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: theme.bg.secondary,
          borderRadius: '12px',
          border: `2px dashed ${theme.border.light}`
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.5rem', 
            fontWeight: 600,
            color: theme.text.primary 
          }}>
            Votre portfolio est vide
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '1rem',
            color: theme.text.secondary 
          }}>
            Commencez par créer des projets et ajouter des comptes externes pour enrichir votre portfolio.
          </p>
        </div>
      )}
    </div>
  );
};
