import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { TargetIcon, EditIcon, MapPinIcon, ImageIcon, BriefcaseIcon, PaletteIcon, RocketIcon, FolderIcon } from '../../../icons';

interface PortfolioData {
  intentions: {
    portfolioTarget: string;
    keyPriorities: string[];
    practicalInfo: string[];
  };
  projects: {
    selectedIds: string[];
    linkedInData?: { profileUrl?: string; rawContent?: string };
    notionData?: { content?: string; fileName?: string };
  };
  media: {
    files: Array<{ name: string; type: string }>;
  };
  style: string;
}

interface GenerationRecapProps {
  data: PortfolioData;
  onGenerate: () => void;
  onBack: () => void;
  onEditTarget?: () => void; // Edit portfolio type (step 1)
  onEditPriorities?: () => void; // Edit priorities (step 2)
  onEditPracticalInfo?: () => void; // Edit practical info (step 3)
  onEditProjects?: () => void;
  onEditMedia?: () => void;
  onEditStyle?: () => void;
  onRestart?: () => void;
}

const TARGET_LABELS: Record<string, string> = {
  personal: 'Personnel / Freelance',
  company: 'Entreprise',
  shop: 'Boutique / Commerce',
  restaurant: 'Restaurant / Café',
  cabinet: 'Cabinet professionnel',
  health: 'Praticien santé',
  artistic: 'Projet artistique',
  other: 'Autre',
};

const PRIORITY_LABELS: Record<string, string> = {
  attract_clients: 'Attirer des clients',
  show_expertise: 'Montrer expertise',
  showcase_work: 'Mettre en avant réalisations',
  easy_contact: 'Faciliter contact',
  show_pricing: 'Afficher tarifs',
  build_trust: 'Inspirer confiance',
  seo: 'Visibilité Google',
};

const INFO_LABELS: Record<string, string> = {
  hours: 'Horaires',
  address: 'Adresse',
  phone: 'Téléphone',
  email: 'Email',
  pricing: 'Tarifs',
  booking: 'RDV',
  socials: 'Réseaux sociaux',
  none: 'Aucune',
};

const STYLE_LABELS: Record<string, string> = {
  moderne: 'Moderne',
  classique: 'Classique',
  authentique: 'Authentique',
  artistique: 'Artistique',
  vitrine: 'Vitrine',
  formel: 'Formel',
};

export const GenerationRecap: React.FC<GenerationRecapProps> = ({
  data,
  onGenerate,
  onBack,
  onEditTarget,
  onEditPriorities,
  onEditPracticalInfo,
  onEditProjects,
  onEditMedia,
  onEditStyle,
  onRestart,
}) => {
  const { theme } = useTheme();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const mediaStats = {
    images: data.media.files.filter(f => f.type === 'image').length,
    videos: data.media.files.filter(f => f.type === 'video').length,
    pdfs: data.media.files.filter(f => f.type === 'pdf').length,
    docs: data.media.files.filter(f => f.type === 'document').length,
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerate();
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.bg.primary,
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <button
          onClick={onBack}
          disabled={isGenerating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: isGenerating ? theme.text.tertiary : theme.text.secondary,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            padding: '0.5rem',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.color = theme.text.primary;
            }
          }}
          onMouseLeave={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.color = theme.text.secondary!;
            }
          }}
        >
          ← Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onRestart && (
            <button
              onClick={onRestart}
              disabled={isGenerating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'transparent',
                border: `1px solid ${theme.border.default}`,
                borderRadius: '8px',
                color: '#DC2626',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                  e.currentTarget.style.borderColor = '#DC2626';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = theme.border.default!;
                }
              }}
            >
              🔄 Recommencer
            </button>
          )}
          <span style={{
            fontSize: '0.875rem',
            color: theme.text.tertiary
          }}>
            Prêt à générer !
          </span>
        </div>
      </div>

      {/* Content with scroll */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#D1FAE5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <span style={{ fontSize: '2rem' }}>🎉</span>
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: theme.text.primary,
              margin: '0 0 0.5rem 0'
            }}>
              Votre portfolio est prêt à être généré
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: theme.text.secondary,
              margin: 0
            }}>
              Vérifiez le récapitulatif avant de lancer la génération
            </p>
          </div>

          {/* Recap card */}
          <div style={{
            backgroundColor: theme.bg.secondary,
            borderRadius: '16px',
            border: `1px solid ${theme.border.default}`,
            overflow: 'hidden',
            marginBottom: '1.5rem'
          }}>
            
            {/* Type */}
            <RecapItem
              icon={<TargetIcon size={20} color="#3B82F6" />}
              iconBg="#DBEAFE"
              iconColor="#3B82F6"
              label="Type de portfolio"
              value={TARGET_LABELS[data.intentions.portfolioTarget] || data.intentions.portfolioTarget}
              theme={theme}
              onEdit={onEditTarget}
            />

            {/* Priorités */}
            <RecapItem
              icon={<EditIcon size={20} color="#A855F7" />}
              iconBg="#F3E8FF"
              iconColor="#A855F7"
              label="Priorités"
              value={data.intentions.keyPriorities.map(p => PRIORITY_LABELS[p] || p).join(', ')}
              theme={theme}
              isLast={false}
              onEdit={onEditPriorities}
            />

            {/* Infos pratiques */}
            <RecapItem
              icon={<MapPinIcon size={20} color="#10B981" />}
              iconBg="#D1FAE5"
              iconColor="#10B981"
              label="Informations pratiques"
              value={data.intentions.practicalInfo.map(i => INFO_LABELS[i] || i).join(', ')}
              theme={theme}
              isLast={false}
              onEdit={onEditPracticalInfo}
            />

            {/* Projets */}
            <RecapItem
              icon={<FolderIcon size={20} color="#F97316" />}
              iconBg="#FED7AA"
              iconColor="#F97316"
              label="Projets"
              value={`${data.projects?.selectedIds?.length || 0} projet${(data.projects?.selectedIds?.length || 0) > 1 ? 's' : ''} sélectionné${(data.projects?.selectedIds?.length || 0) > 1 ? 's' : ''}`}
              theme={theme}
              isLast={false}
              onEdit={onEditProjects}
            />

            {/* Médias */}
            <RecapItem
              icon={<ImageIcon size={20} color="#EC4899" />}
              iconBg="#FCE7F3"
              iconColor="#EC4899"
              label="Médias"
              value={[
                mediaStats.images > 0 && `${mediaStats.images} image${mediaStats.images > 1 ? 's' : ''}`,
                mediaStats.videos > 0 && `${mediaStats.videos} vidéo${mediaStats.videos > 1 ? 's' : ''}`,
                mediaStats.pdfs > 0 && `${mediaStats.pdfs} PDF`,
                mediaStats.docs > 0 && `${mediaStats.docs} document${mediaStats.docs > 1 ? 's' : ''}`,
              ].filter(Boolean).join(', ') || 'Aucun média'}
              theme={theme}
              isLast={!(data.projects.linkedInData?.profileUrl || data.projects.linkedInData?.rawContent)}
              onEdit={onEditMedia}
            />

            {/* LinkedIn (conditionnel) */}
            {(data.projects.linkedInData?.profileUrl || data.projects.linkedInData?.rawContent) && (
              <RecapItem
                icon={<BriefcaseIcon size={20} color="#FFFFFF" />}
                iconBg="#3B82F6"
                iconColor="#FFFFFF"
                label="LinkedIn"
                value="Profil importé ✓"
                theme={theme}
                isLast={false}
                onEdit={onEditProjects}
              />
            )}

            {/* Style */}
            <RecapItem
              icon={<PaletteIcon size={20} color="#6366F1" />}
              iconBg="#E0E7FF"
              iconColor="#6366F1"
              label="Style choisi"
              value={STYLE_LABELS[data.style] || data.style}
              theme={theme}
              isLast={true}
              onEdit={onEditStyle}
            />
          </div>

          {/* Security alert */}
          <div style={{
            backgroundColor: '#D1FAE5',
            border: '1px solid #A7F3D0',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{
                fontSize: '1.25rem',
                flexShrink: 0,
                marginTop: '0.125rem'
              }}>
                🔒
              </span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontWeight: 600,
                  color: '#065F46',
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.95rem'
                }}>
                  Protection des données
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#047857',
                  margin: '0 0 0.75rem 0',
                  lineHeight: 1.5
                }}>
                  Vos données seront anonymisées localement avant traitement par l'IA.
                  Aucune donnée n'est envoyée vers le cloud.
                </p>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={hasAccepted}
                    onChange={e => setHasAccepted(e.target.checked)}
                    disabled={isGenerating}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: isGenerating ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#065F46',
                    fontWeight: 500
                  }}>
                    J'ai compris
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!hasAccepted || isGenerating}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: hasAccepted && !isGenerating ? theme.accent.primary : '#D1D5DB',
              color: hasAccepted && !isGenerating ? '#FFFFFF' : '#9CA3AF',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: hasAccepted && !isGenerating ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              outline: 'none',
              boxShadow: hasAccepted && !isGenerating ? `0 4px 12px ${theme.accent.primary}40` : 'none'
            }}
            onMouseEnter={(e) => {
              if (hasAccepted && !isGenerating) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${theme.accent.primary}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (hasAccepted && !isGenerating) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.accent.primary}40`;
              }
            }}
          >
            {isGenerating ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #FFFFFF',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <RocketIcon size={20} color="#FFFFFF" />
                <span>Générer mon portfolio</span>
              </>
            )}
          </button>

          {/* CSS Animation for spinner */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

// Helper component for recap items
const RecapItem: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  theme: any;
  isLast?: boolean;
  onEdit?: () => void;
}> = ({ icon, iconBg, iconColor, label, value, theme, isLast = false, onEdit }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderBottom: isLast ? 'none' : `1px solid ${theme.border.light}`
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      backgroundColor: iconBg,
      color: iconColor,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{
        fontSize: '0.75rem',
        color: theme.text.tertiary,
        margin: 0
      }}>
        {label}
      </p>
      <p style={{
        fontWeight: 500,
        color: theme.text.primary,
        margin: '0.25rem 0 0 0',
        fontSize: '0.875rem'
      }}>
        {value}
      </p>
    </div>
    {onEdit && (
      <button
        onClick={onEdit}
        style={{
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: theme.accent.primary,
          backgroundColor: 'transparent',
          border: `1px solid ${theme.border.default}`,
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          outline: 'none',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${theme.accent.primary}11`;
          e.currentTarget.style.borderColor = theme.accent.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = theme.border.default!;
        }}
      >
        Modifier
      </button>
    )}
  </div>
);

export default GenerationRecap;
