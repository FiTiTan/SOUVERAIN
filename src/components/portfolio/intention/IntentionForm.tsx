import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { 
  type IntentionFormData, 
  INTENTION_OPTIONS,
  saveIntention 
} from '../../../services/intentionService';

interface IntentionFormProps {
  portfolioId: string;
  onComplete: (data: IntentionFormData) => void;
  onSkip: () => void;
  initialData?: IntentionFormData | null;
}

export const IntentionForm: React.FC<IntentionFormProps> = ({
  portfolioId,
  onComplete,
  onSkip,
  initialData
}) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [formData, setFormData] = useState<IntentionFormData>(
    initialData || {
      objective: '',
      targetAudience: '',
      contentType: [],
      desiredTone: '',
      sector: ''
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => (prev + 1) as typeof step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as typeof step);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await saveIntention(portfolioId, formData);
      onComplete(formData);
    } catch (error) {
      console.error('Failed to save intention:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.objective !== '';
      case 2: return formData.targetAudience !== '';
      case 3: return formData.contentType.length > 0;
      case 4: return formData.desiredTone !== '';
      case 5: return formData.sector !== '';
      default: return false;
    }
  };

  const toggleContentType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      contentType: prev.contentType.includes(id)
        ? prev.contentType.filter(t => t !== id)
        : [...prev.contentType, id]
    }));
  };

  const buttonStyle = (isSelected: boolean) => ({
    padding: '1rem',
    borderRadius: '12px',
    border: `2px solid ${isSelected ? theme.accent.primary : theme.border.light}`,
    backgroundColor: isSelected ? `${theme.accent.primary}15` : theme.bg.secondary,
    color: theme.text.primary,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: isSelected ? 600 : 400
  });

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: theme.bg.secondary,
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: `1px solid ${theme.border.light}`
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem',
          borderBottom: `1px solid ${theme.border.light}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: theme.text.primary }}>
              Personnalisez votre portfolio
            </h2>
            {step === 1 && (
              <button
                onClick={onSkip}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.text.tertiary,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Passer cette étape
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                style={{
                  height: '6px',
                  flex: 1,
                  borderRadius: '3px',
                  backgroundColor: s <= step ? theme.accent.primary : theme.border.light,
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', minHeight: '400px' }}>
          {/* Step 1: Objectif */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                  Quel est votre objectif principal ?
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: theme.text.tertiary }}>
                  Cela nous aidera à adapter l'expérience
                </p>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {INTENTION_OPTIONS.objectives.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, objective: option.id })}
                    style={buttonStyle(formData.objective === option.id)}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                  Qui est votre audience cible ?
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: theme.text.tertiary }}>
                  À qui s'adresse votre portfolio
                </p>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {INTENTION_OPTIONS.audiences.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, targetAudience: option.id })}
                    style={buttonStyle(formData.targetAudience === option.id)}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Type de contenu */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                  Quel type de contenu présentez-vous ?
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: theme.text.tertiary }}>
                  Vous pouvez sélectionner plusieurs options
                </p>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {INTENTION_OPTIONS.contentTypes.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleContentType(option.id)}
                    style={buttonStyle(formData.contentType.includes(option.id))}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                    <span style={{ flex: 1 }}>{option.label}</span>
                    {formData.contentType.includes(option.id) && (
                      <span style={{ color: theme.accent.primary, fontSize: '1.2rem' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Ton */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                  Quel ton souhaitez-vous adopter ?
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: theme.text.tertiary }}>
                  Comment voulez-vous être perçu
                </p>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {INTENTION_OPTIONS.tones.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, desiredTone: option.id })}
                    style={buttonStyle(formData.desiredTone === option.id)}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Secteur */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                  Dans quel secteur travaillez-vous ?
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: theme.text.tertiary }}>
                  Dernière question !
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {INTENTION_OPTIONS.sectors.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, sector: option.id })}
                    style={buttonStyle(formData.sector === option.id)}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                    <span style={{ fontSize: '0.9rem' }}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: `1px solid ${theme.border.light}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handleBack}
            disabled={step === 1}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: step === 1 ? theme.text.tertiary : theme.text.primary,
              cursor: step === 1 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 500,
              opacity: step === 1 ? 0.5 : 1
            }}
          >
            ← Retour
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: canProceed() ? theme.accent.primary : theme.border.light,
                color: canProceed() ? '#fff' : theme.text.tertiary,
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed() || isSaving}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: canProceed() && !isSaving ? '#10b981' : theme.border.light,
                color: canProceed() && !isSaving ? '#fff' : theme.text.tertiary,
                cursor: canProceed() && !isSaving ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {isSaving ? 'Sauvegarde...' : 'Terminer ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
