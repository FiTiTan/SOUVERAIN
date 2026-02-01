import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { typography } from '../../../design-system';
import { PortfolioAIChat } from '../ai/PortfolioAIChat';
import { PreviewPortfolio } from '../preview/PreviewPortfolio';

interface MasterPortfolioViewProps {
  onBack: () => void;
  portfolioId: string;
}

// Icons for the sections
const Icons = {
  Identity: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  About: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Contact: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Edit: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
};

// Internal Calm Card Component for Sections
const CalmSectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  colorTheme: 'blue' | 'teal' | 'purple' | 'pink';
}> = ({ title, icon, children, colorTheme }) => {
  const { theme, mode } = useTheme();

  const colors = {
    blue: { iconBg: '#3B82F6', shadow: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.25)' },
    teal: { iconBg: '#14B8A6', shadow: 'rgba(20, 184, 166, 0.4)', glow: 'rgba(20, 184, 166, 0.25)' },
    purple: { iconBg: '#8B5CF6', shadow: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.25)' },
    pink: { iconBg: '#EC4899', shadow: 'rgba(236, 72, 153, 0.4)', glow: 'rgba(236, 72, 153, 0.25)' }
  };

  const currentColors = colors[colorTheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover="hover"
      variants={{
        hover: {
          y: -4,
          boxShadow: `
            0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'},
            0 20px 60px -20px ${currentColors.shadow}
          `
        }
      }}
      style={{
        background: mode === 'dark' ? 'rgba(30, 30, 35, 0.6)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        padding: '2.5rem',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}`,
        boxShadow: `0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '360px' // Standard Height
      }}
    >
      {/* Icon Circle */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${currentColors.iconBg}, ${currentColors.iconBg})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        color: '#FFFFFF',
        boxShadow: `0 10px 20px -5px ${mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
      }}>
        {icon}
      </div>

      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: theme.text.primary,
        marginBottom: '1rem'
      }}>
        {title}
      </h3>

      <div style={{ width: '100%', color: theme.text.secondary }}>
        {children}
      </div>
    </motion.div>
  );
};

export const MasterPortfolioView: React.FC<MasterPortfolioViewProps> = ({ onBack, portfolioId }) => {
  const { theme, mode } = useTheme();
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
        background: mode === 'dark' 
          ? 'linear-gradient(to bottom right, #0f1729, #1e293b)' 
          : 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
      }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      padding: '2rem'
    }}>
      {/* Header Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto 4rem auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '16px',
            color: theme.text.secondary,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-4px)';
            e.currentTarget.style.color = theme.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.color = theme.text.secondary;
          }}
        >
          <Icons.ArrowLeft />
          Retour
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {hasData && (
             <button
             onClick={() => setShowPreview(true)}
             style={{
               display: 'flex',
               alignItems: 'center',
               gap: '0.5rem',
               padding: '0.75rem 1.5rem',
               backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
               color: theme.text.primary,
               border: 'none',
               borderRadius: '16px',
               fontSize: '0.95rem',
               fontWeight: 600,
               cursor: 'pointer',
               backdropFilter: 'blur(10px)',
               transition: 'all 0.2s'
             }}
             onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
             onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
           >
             <Icons.Eye />
             Aperçu
           </button>
          )}

          <button
            onClick={() => setShowAIChat(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3B82F6', // Blue theme
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Icons.Edit />
            {hasData ? 'Éditer avec IA' : 'Créer avec IA'}
          </button>
        </div>
      </motion.div>

      {/* Page Title (Mascot Space) */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
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
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 200,
            color: theme.text.primary,
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            fontFamily: typography.fontFamily.sans
          }}>
            {generatedContent?.hero?.title || portfolio?.authorName || 'Portfolio Maître'}
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: theme.text.tertiary,
            fontWeight: 300,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
             {generatedContent?.hero?.tagline || portfolio?.tagline || 'Gérez votre identité professionnelle centrale.'}
          </p>
        </motion.div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch'
        }}>
          
          {/* Identity Card */}
          <CalmSectionCard 
            title="Identité" 
            icon={<Icons.Identity />} 
            colorTheme="blue"
          >
            {generatedContent?.hero ? (
               <div style={{ lineHeight: '1.6' }}>
                 <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>"{generatedContent.hero.bio}"</p>
                 <p style={{ color: theme.text.tertiary }}>📍 {generatedContent.hero.location}</p>
               </div>
            ) : (
               <p style={{ opacity: 0.6 }}>Aucune information d'identité définie.</p>
            )}
          </CalmSectionCard>

          {/* About Card */}
          <CalmSectionCard 
            title="À Propos" 
            icon={<Icons.About />} 
            colorTheme="teal"
          >
            {generatedContent?.about ? (
               <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.95rem' }}>
                 {generatedContent.about.headline}
               </div>
            ) : (
               <p style={{ opacity: 0.6 }}>Aucune description professionnelle.</p>
            )}
          </CalmSectionCard>

          {/* Contact Card */}
          <CalmSectionCard 
            title="Contact" 
            icon={<Icons.Contact />} 
            colorTheme="purple"
          >
            {generatedContent?.contact ? (
               <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
                 <li>📧 {generatedContent.contact.email}</li>
                 <li>📱 {generatedContent.contact.phone}</li>
                 {portfolio?.linkedin_url && <li>🔗 LinkedIn</li>}
               </ul>
            ) : (
               <p style={{ opacity: 0.6 }}>Aucune coordonnée renseignée.</p>
            )}
          </CalmSectionCard>

        </div>
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <PortfolioAIChat 
          portfolioId={portfolioId}
          onComplete={() => {
            setShowAIChat(false);
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

