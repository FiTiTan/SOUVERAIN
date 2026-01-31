import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { typography } from '../../../design-system';

interface Portfolio {
  id: string;
  name: string;
  updated_at: string;
  thumbnail?: string;
  status?: 'draft' | 'published';
}

interface PortfolioSelectorProps {
  onSelect: (portfolioId: string) => void;
  onCreate: () => void;
}

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Briefcase: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Folder: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Plus: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Lock: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Trash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Cross: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
};

// ============================================================
// CALM PORTFOLIO CARD
// ============================================================

const CalmPortfolioCard: React.FC<{
  portfolio: Portfolio;
  onSelect: () => void;
  onView: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ portfolio, onSelect, onView, onExport, onDelete }) => {
  const { theme, mode } = useTheme();

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} sem`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  // Theme based on ID hash or random logic could be nice, but defaulting to Blue for now like generic card
  // Using the same structure as CalmCard in CVChoice
  const currentTheme = {
    bg: mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
    iconBg: '#3B82F6',
    shadow: 'rgba(59, 130, 246, 0.15)'
  };

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        flex: 1,
        minWidth: '280px',
        maxWidth: '320px', // Exact match with CVChoice
        height: '360px', // Standard Height
        background: mode === 'dark' 
          ? 'rgba(30, 30, 35, 0.6)' 
          : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px', // Exact match
        padding: '2.5rem 2rem', // Exact match
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}`,
        boxShadow: `0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        // Removed fixed height to match CVChoice fluidity
      }}
    >
      {/* Halo de couleur subtil en fond - Exact match */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '200px',
        background: currentTheme.iconBg,
        opacity: 0.05,
        filter: 'blur(50px)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      {/* Delete Button (Top Right Cross) */}
      <motion.button
        onClick={onDelete}
        initial={{ opacity: 0.4 }}
        whileHover={{ opacity: 1, scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'transparent',
          color: theme.text.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.2s'
        }}
      >
        <Icons.Cross />
      </motion.button>

      {/* Status Badge (Moved to Top Left) */}
      {portfolio.status === 'published' && (
        <div style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#10B981',
          boxShadow: '0 0 10px #10B98188',
          zIndex: 2
        }} title="En ligne" />
      )}

      {/* Thumbnail / Icon - Exact match dimensions & shadow */}
      <motion.div 
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: portfolio.thumbnail 
            ? `url(${portfolio.thumbnail}) center/cover`
            : `linear-gradient(135deg, ${currentTheme.iconBg}, ${currentTheme.iconBg}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          color: '#FFFFFF',
          fontSize: portfolio.thumbnail ? '0' : '2rem',
          boxShadow: `0 10px 20px -5px ${currentTheme.shadow}`,
          zIndex: 1
        }}
        whileHover={{ rotate: 5, scale: 1.1 }}
      >
        {!portfolio.thumbnail && <Icons.Briefcase />}
      </motion.div>

      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: theme.text.primary,
        marginBottom: '0.75rem',
        zIndex: 1
      }}>
        {portfolio.name}
      </h3>

      <p style={{
        fontSize: typography.fontSize.sm,
        color: theme.text.tertiary,
        marginBottom: '1rem',
        zIndex: 1
      }}>
        Modifié {formatDate(portfolio.updated_at)}
      </p>
    </motion.div>
  );
};

// ============================================================
// NEW PORTFOLIO CARD
// ============================================================

const NewPortfolioCard: React.FC<{
  onClick: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled }) => {
  const { theme, mode } = useTheme();

  return (
    <motion.div
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { y: -8, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        flex: 1,
        minWidth: '280px',
        maxWidth: '320px',
        background: 'transparent',
        borderRadius: '32px',
        border: `2px dashed ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // justifyContent: 'center', // Removed to align top with other cards
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '2.5rem 2rem',
        opacity: disabled ? 0.6 : 1,
        // Removed fixed height to match CVChoice fluidity
      }}
    >
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        color: theme.text.secondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem', // Updated to match CalmPortfolioCard (was 1rem)
        transition: 'all 0.3s'
      }}>
        {disabled ? <Icons.Lock /> : <Icons.Plus />}
      </div>
      
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.medium,
        color: theme.text.secondary,
        marginBottom: '0.75rem' // Updated to match CalmPortfolioCard (was 0.5rem)
      }}>
        Nouveau Portfolio
      </h3>
      
      {disabled && (
        <span style={{
          fontSize: '0.75rem',
          color: '#F59E0B',
          fontWeight: 600,
          backgroundColor: '#F59E0B22',
          padding: '4px 12px',
          borderRadius: '12px'
        }}>
          Premium Requis
        </span>
      )}
    </motion.div>
  );
};

// ============================================================
// PORTFOLIO SELECTOR SCREEN
// ============================================================

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({
  onSelect,
  onView,
  onExport,
  onCreate,
}) => {
  const { theme, mode } = useTheme();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
    checkPremiumStatus();
  }, []);

  const loadPortfolios = async () => {
    try {
      // @ts-ignore
      const result = await window.electron.invoke('db-get-all-portfolios');
      setPortfolios(result || []);
    } catch (error) {
      console.error('Erreur chargement portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      // @ts-ignore
      const status = await window.electron.invoke('get-premium-status');
      setIsPremium(status?.isPremium || false);
    } catch {
      setIsPremium(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, portfolioId: string, portfolioName: string) => {
    e.stopPropagation();
    
    if (confirm(`Voulez-vous vraiment supprimer le portfolio "${portfolioName}" ?\n\nCette action est irréversible.`)) {
      try {
        // @ts-ignore
        const result = await window.electron.invoke('db-delete-portfolio', portfolioId);
        if (result.success) {
          await loadPortfolios();
        } else {
          alert('Erreur lors de la suppression du portfolio');
        }
      } catch (error) {
        console.error('Failed to delete portfolio:', error);
        alert('Erreur lors de la suppression du portfolio');
      }
    }
  };

  const canCreateNew = isPremium || portfolios.length === 0;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4rem 2rem',
      background: 'transparent',
    }}>
      
      {/* Header Calm */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          minHeight: '20vh', // Standard Mascot Space
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <span style={{
          display: 'block',
          marginBottom: '1rem',
          color: theme.text.tertiary
        }}>
          <Icons.Sparkles />
        </span>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 200,
          color: theme.text.primary,
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          fontFamily: typography.fontFamily.sans
        }}>
          Portfolio Maître
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: theme.text.tertiary,
          fontWeight: 300,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Gérez vos vitrines professionnelles en toute sérénité.
        </p>
      </motion.div>

      {/* Grid */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px'
      }}>
        <AnimatePresence>
          {isLoading ? (
            // Skeleton Loading
            [1, 2].map(i => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  height: '350px',
                  width: '300px',
                  borderRadius: '32px',
                  backgroundColor: theme.bg.tertiary,
                  opacity: 0.5
                }} 
              />
            ))
          ) : (
            <>
              {portfolios.map(portfolio => (
                <CalmPortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onSelect={() => onSelect(portfolio.id)}
                  onView={(e) => { e.stopPropagation(); onView(portfolio.id); }}
                  onExport={(e) => { e.stopPropagation(); onExport(portfolio.id); }}
                  onDelete={(e) => handleDelete(e, portfolio.id, portfolio.name)}
                />
              ))}

              <NewPortfolioCard 
                onClick={onCreate}
                disabled={!canCreateNew}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: theme.text.tertiary,
          marginTop: '4rem'
        }}
      >
        {isPremium ? (
          <span style={{ color: '#F59E0B' }}>✨ Premium actif — Portfolios illimités</span>
        ) : (
          <span>
            Version gratuite : 1 portfolio maximum
          </span>
        )}
      </motion.p>
    </div>
  );
};

export default PortfolioSelector;

