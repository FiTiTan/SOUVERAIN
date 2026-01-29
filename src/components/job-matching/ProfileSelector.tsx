import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { type JobOffer, type CVProfile } from '../../services/jobMatchingService';

interface ProfileSelectorProps {
  jobOffer: Partial<JobOffer>;
  onNext: (cvProfile: CVProfile) => void;
  onBack: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  jobOffer,
  onNext,
  onBack
}) => {
  const { theme, mode } = useTheme();
  const [cvList, setCvList] = useState<CVProfile[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      // @ts-ignore
      const cvs = await window.electron.invoke('db-get-all-cvs');

      // Convertir le format si nécessaire
      const formattedCvs: CVProfile[] = cvs?.map((cv: any) => ({
        id: cv.id,
        name: cv.name || 'CV sans nom',
        skills: cv.skills || [],
        experiences: cv.experiences || [],
        education: cv.education || [],
        rawContent: cv.rawContent
      })) || [];

      setCvList(formattedCvs);
    } catch (error) {
      console.error('Error loading CVs:', error);
      setCvList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    const selectedCv = cvList.find(cv => cv.id === selectedCvId);
    if (selectedCv) {
      onNext(selectedCv);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: theme.text.secondary,
          fontSize: '1rem',
          cursor: 'pointer',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ← Retour
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: theme.text.primary,
          marginBottom: '0.5rem'
        }}>
          Sélectionner votre CV
        </h1>
        <p style={{
          fontSize: '1rem',
          color: theme.text.secondary,
          marginBottom: '1rem'
        }}>
          Offre : {jobOffer.title} - {jobOffer.company}
        </p>
        <p style={{
          fontSize: '1rem',
          color: theme.text.tertiary,
          marginBottom: '2rem'
        }}>
          Quel CV voulez-vous comparer ?
        </p>

        {/* CV List */}
        <div style={{
          background: mode === 'dark'
            ? 'rgba(30, 41, 59, 0.6)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: `1px solid ${theme.border.light}`,
          padding: '1.5rem'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: theme.text.tertiary }}>
              Chargement des CV...
            </div>
          ) : cvList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: theme.text.tertiary, marginBottom: '1rem' }}>
                Aucun CV trouvé
              </p>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: theme.accent.primary,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Créer un CV →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cvList.map((cv) => (
                <div
                  key={cv.id}
                  onClick={() => setSelectedCvId(cv.id)}
                  style={{
                    padding: '1.25rem',
                    background: selectedCvId === cv.id
                      ? `${theme.accent.primary}15`
                      : theme.bg.secondary,
                    border: `2px solid ${selectedCvId === cv.id ? theme.accent.primary : theme.border.default}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCvId !== cv.id) {
                      e.currentTarget.style.borderColor = theme.border.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCvId !== cv.id) {
                      e.currentTarget.style.borderColor = theme.border.default;
                    }
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${selectedCvId === cv.id ? theme.accent.primary : theme.border.default}`,
                    background: selectedCvId === cv.id ? theme.accent.primary : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {selectedCvId === cv.id && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ffffff'
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: theme.text.primary,
                      marginBottom: '0.25rem'
                    }}>
                      {cv.name}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: theme.text.tertiary
                    }}>
                      {cv.skills?.length || 0} compétences · Mis à jour {formatDate((cv as any).updatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cvList.length > 0 && (
            <button
              onClick={handleAnalyze}
              disabled={!selectedCvId}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '1rem',
                background: selectedCvId ? theme.accent.primary : theme.bg.tertiary,
                color: selectedCvId ? '#ffffff' : theme.text.tertiary,
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: selectedCvId ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s, box-shadow 0.2s',
                opacity: selectedCvId ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (selectedCvId) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Lancer l'analyse →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
