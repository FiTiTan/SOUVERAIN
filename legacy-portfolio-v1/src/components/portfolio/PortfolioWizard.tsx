/**
 * SOUVERAIN - PortfolioWizard
 * Wizard de création de portfolio universel
 * Étapes : Mode → Secteur → Template → Profil → Import → Preview
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { ModeSelector } from './ModeSelector';
import { SectorSelector } from './SectorSelector';
import { FileUploader, type UploadedFile } from './FileUploader';
import { ElementClassificationView, type PortfolioElement } from './ElementClassificationView';
import { ProjectGrouper, type Project } from './ProjectGrouper';
import { getSectorById, type PortfolioMode } from '../../types/sectors';
import { getTemplatesByMode, getDefaultTemplate, type TemplateConfig } from '../../config/templates';

// ============================================================
// TYPES
// ============================================================

type WizardStep = 'mode' | 'sector' | 'template' | 'profile' | 'import' | 'classify' | 'group' | 'preview';

interface WizardState {
  portfolioId: string;
  mode: PortfolioMode | null;
  sector: string | null;
  template: string | null;
  title: string;
  tagline: string;
  uploadedFiles: UploadedFile[];
  classifiedElements: PortfolioElement[];
  projects: Project[];
}

interface PortfolioWizardProps {
  onClose: () => void;
  onComplete: (data: WizardState) => void;
}

// ============================================================
// WIZARD STEPS CONFIG
// ============================================================

const STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: 'mode', label: 'Mode', icon: '1' },
  { id: 'sector', label: 'Secteur', icon: '2' },
  { id: 'template', label: 'Template', icon: '3' },
  { id: 'profile', label: 'Profil', icon: '4' },
  { id: 'import', label: 'Import', icon: '5' },
  { id: 'classify', label: 'Classification', icon: '6' },
  { id: 'group', label: 'Projets', icon: '7' },
  { id: 'preview', label: 'Aperçu', icon: '8' },
];

// ============================================================
// COMPONENT
// ============================================================

export const PortfolioWizard: React.FC<PortfolioWizardProps> = ({
  onClose,
  onComplete,
}) => {
  const { theme } = useTheme();

  // State
  const [currentStep, setCurrentStep] = useState<WizardStep>('mode');
  const [portfolioId] = useState<string>(`portfolio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const [wizardState, setWizardState] = useState<WizardState>({
    portfolioId,
    mode: null,
    sector: null,
    template: null,
    title: '',
    tagline: '',
    uploadedFiles: [],
    classifiedElements: [],
    projects: [],
  });

  // Current step index
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // Créer le portfolio en BDD dès que mode et secteur sont définis (AVANT l'import!)
  useEffect(() => {
    const createPortfolioInDB = async () => {
      // FIX BUG 1: Créer le portfolio dès qu'on a mode + secteur (pas besoin d'attendre template)
      // Cela permet d'avoir un portfolio_id valide AVANT l'import de fichiers
      if (wizardState.mode && wizardState.sector) {
        try {
          console.log('[Wizard] Tentative création portfolio...', {
            portfolioId,
            mode: wizardState.mode,
            sector: wizardState.sector,
            template: wizardState.template || 'modern', // template par défaut
          });

          // Vérifier si le portfolio existe déjà
          const existing = await window.electron.portfolioV2.getById(portfolioId);
          console.log('[Wizard] Portfolio existant?', existing ? 'OUI' : 'NON');

          if (!existing) {
            console.log('[Wizard] 🔵 Création portfolio en BDD:', portfolioId);
            const result = await window.electron.portfolioV2.create({
              id: portfolioId,
              userId: 'default',
              mode: wizardState.mode,
              sector: wizardState.sector,
              template: wizardState.template || 'modern', // template par défaut, sera mis à jour plus tard
              title: wizardState.title || 'Portfolio en cours',
              tagline: wizardState.tagline || '',
              anonymizationLevel: 'none',
              isPrimary: false,
            });
            console.log('[Wizard] ✅ Résultat création:', result);

            if (!result.success) {
              console.error('[Wizard] ❌ Échec création portfolio:', result.error);
            }
          } else {
            console.log('[Wizard] ⚠️ Portfolio déjà existant, skip création');
          }
        } catch (error) {
          console.error('[Wizard] ❌ Erreur création portfolio:', error);
        }
      } else {
        console.log('[Wizard] Conditions non remplies:', {
          mode: wizardState.mode,
          sector: wizardState.sector,
        });
      }
    };

    createPortfolioInDB();
  }, [wizardState.mode, wizardState.sector, portfolioId]); // FIX: Retirer template des dépendances

  // Navigation handlers
  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 'mode':
        return wizardState.mode !== null;
      case 'sector':
        return wizardState.sector !== null;
      case 'template':
        return wizardState.template !== null;
      case 'profile':
        return wizardState.title.trim().length > 0;
      case 'import':
        return true; // Import est optionnel
      case 'classify':
        return true; // Classification est optionnelle
      case 'group':
        return true; // Groupement est optionnel
      case 'preview':
        return true;
      default:
        return false;
    }
  }, [currentStep, wizardState]);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    } else {
      // Fin du wizard
      onComplete(wizardState);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  // Update handlers
  const handleModeSelect = (mode: PortfolioMode) => {
    setWizardState((prev) => ({
      ...prev,
      mode,
      sector: null, // Reset sector when mode changes
      template: null,
    }));
  };

  const handleSectorSelect = (sectorId: string) => {
    const sector = getSectorById(sectorId);
    const defaultTemplate = wizardState.mode
      ? getDefaultTemplate(wizardState.mode, sectorId)
      : null;

    setWizardState((prev) => ({
      ...prev,
      sector: sectorId,
      template: defaultTemplate?.id || null,
      title: sector?.label || '',
    }));
  };

  const handleTemplateSelect = async (templateId: string) => {
    setWizardState((prev) => ({
      ...prev,
      template: templateId,
    }));

    // FIX BUG 1: Mettre à jour le template dans la BDD immédiatement
    try {
      console.log('[Wizard] Mise à jour template:', templateId);
      const result = await window.electron.portfolioV2.update(portfolioId, {
        template: templateId,
      });
      console.log('[Wizard] Résultat mise à jour template:', result);
    } catch (error) {
      console.error('[Wizard] Erreur mise à jour template:', error);
    }
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setWizardState((prev) => ({
      ...prev,
      uploadedFiles: files,
    }));
  };

  const handleElementsClassified = (elements: PortfolioElement[]) => {
    setWizardState((prev) => ({
      ...prev,
      classifiedElements: elements,
    }));
    // Passer automatiquement à l'étape suivante
    goToNextStep();
  };

  const handleProjectsGrouped = (projects: Project[]) => {
    setWizardState((prev) => ({
      ...prev,
      projects,
    }));
    // Passer automatiquement à l'étape suivante
    goToNextStep();
  };

  // Styles
  const styles = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    container: {
      width: '95vw',
      maxWidth: '1000px',
      maxHeight: '90vh',
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.xl,
      boxShadow: theme.shadow.xl,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${theme.border.light}`,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    closeButton: {
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      color: theme.text.secondary,
      fontSize: typography.fontSize.xl,
      transition: transitions.fast,
    },
    stepper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
      backgroundColor: theme.bg.secondary,
      borderBottom: `1px solid ${theme.border.light}`,
      gap: spacing[2],
    },
    stepItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    stepCircle: {
      width: '32px',
      height: '32px',
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      transition: transitions.fast,
    },
    stepCircleActive: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    stepCircleCompleted: {
      backgroundColor: theme.semantic.success,
      color: '#FFFFFF',
    },
    stepCircleInactive: {
      backgroundColor: theme.bg.tertiary,
      color: theme.text.tertiary,
    },
    stepLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      display: 'none', // Hidden on mobile, could be shown on larger screens
    },
    stepConnector: {
      width: '24px',
      height: '2px',
      backgroundColor: theme.border.light,
    },
    stepConnectorCompleted: {
      backgroundColor: theme.semantic.success,
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: spacing[6],
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderTop: `1px solid ${theme.border.light}`,
      backgroundColor: theme.bg.secondary,
    },
    footerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    footerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
    },
    button: {
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    buttonPrimaryDisabled: {
      backgroundColor: theme.border.default,
      color: theme.text.muted,
      cursor: 'not-allowed',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: theme.text.secondary,
      border: `1px solid ${theme.border.default}`,
    },
    stepInfo: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
    },
    // Template selection styles
    templateGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: spacing[4],
    },
    templateCard: {
      border: `2px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: transitions.normal,
    },
    templateCardSelected: {
      borderColor: theme.accent.primary,
    },
    templatePreview: {
      height: '160px',
      backgroundColor: theme.bg.tertiary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.text.tertiary,
      fontSize: typography.fontSize['2xl'],
    },
    templateInfo: {
      padding: spacing[4],
    },
    templateName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[1],
    },
    templateDescription: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
    },
    templateBadge: {
      display: 'inline-block',
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.sm,
      marginTop: spacing[2],
    },
    templateBadgeFree: {
      backgroundColor: theme.semantic.successBg,
      color: theme.semantic.success,
    },
    templateBadgePremium: {
      backgroundColor: theme.accent.muted,
      color: theme.accent.primary,
    },
    // Profile form styles
    formGroup: {
      marginBottom: spacing[4],
    },
    formLabel: {
      display: 'block',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    formInput: {
      width: '100%',
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      outline: 'none',
      transition: transitions.fast,
    },
    formTextarea: {
      width: '100%',
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '100px',
    },
    formHint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      marginTop: spacing[1],
    },
  };

  // Render step circle
  const renderStepCircle = (step: typeof STEPS[number], index: number) => {
    const isCompleted = index < currentStepIndex;
    const isActive = step.id === currentStep;

    let circleStyle = styles.stepCircle;
    if (isCompleted) {
      circleStyle = { ...circleStyle, ...styles.stepCircleCompleted };
    } else if (isActive) {
      circleStyle = { ...circleStyle, ...styles.stepCircleActive };
    } else {
      circleStyle = { ...circleStyle, ...styles.stepCircleInactive };
    }

    return (
      <div key={step.id} style={styles.stepItem}>
        <div style={circleStyle}>
          {isCompleted ? '✓' : step.icon}
        </div>
        {index < STEPS.length - 1 && (
          <div
            style={{
              ...styles.stepConnector,
              ...(isCompleted ? styles.stepConnectorCompleted : {}),
            }}
          />
        )}
      </div>
    );
  };

  // Render template selector
  const renderTemplateSelector = () => {
    if (!wizardState.mode) return null;

    const templates = getTemplatesByMode(wizardState.mode);

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: spacing[6] }}>
          <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: theme.text.primary, marginBottom: spacing[2] }}>
            Choisissez votre template
          </h2>
          <p style={{ fontSize: typography.fontSize.base, color: theme.text.secondary }}>
            Sélectionnez un design qui correspond à votre image professionnelle.
          </p>
        </div>

        <div style={styles.templateGrid}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                ...styles.templateCard,
                ...(wizardState.template === template.id ? styles.templateCardSelected : {}),
              }}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div style={styles.templatePreview}>
                📄
              </div>
              <div style={styles.templateInfo}>
                <h4 style={styles.templateName}>{template.name}</h4>
                <p style={styles.templateDescription}>{template.description}</p>
                <span
                  style={{
                    ...styles.templateBadge,
                    ...(template.tier === 'free' ? styles.templateBadgeFree : styles.templateBadgePremium),
                  }}
                >
                  {template.tier === 'free' ? 'Gratuit' : 'Premium'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render profile form
  const renderProfileForm = () => {
    const sector = wizardState.sector ? getSectorById(wizardState.sector) : null;

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: spacing[6] }}>
          <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: theme.text.primary, marginBottom: spacing[2] }}>
            Informations de base
          </h2>
          <p style={{ fontSize: typography.fontSize.base, color: theme.text.secondary }}>
            Ces informations apparaîtront sur votre portfolio.
          </p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>
            Titre du portfolio *
          </label>
          <input
            type="text"
            value={wizardState.title}
            onChange={(e) => setWizardState((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={sector ? `Ex: ${sector.label} - Votre nom` : 'Titre de votre portfolio'}
            style={styles.formInput}
          />
          <p style={styles.formHint}>Le titre principal qui apparaîtra sur votre portfolio.</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>
            Tagline / Slogan
          </label>
          <input
            type="text"
            value={wizardState.tagline}
            onChange={(e) => setWizardState((prev) => ({ ...prev, tagline: e.target.value }))}
            placeholder="Ex: Plus de 10 ans d'expérience à votre service"
            style={styles.formInput}
          />
          <p style={styles.formHint}>Une phrase courte qui résume votre activité ou valeur ajoutée.</p>
        </div>
      </div>
    );
  };

  // Render import step (placeholder)
  const renderImportStep = () => {
    return (
      <div style={{ padding: spacing[6], maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: spacing[6] }}>
          <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: theme.text.primary, marginBottom: spacing[2] }}>
            Importez vos réalisations
          </h2>
          <p style={{ fontSize: typography.fontSize.base, color: theme.text.secondary }}>
            Ajoutez vos photos, PDF, vidéos et autres fichiers. Vous pourrez les classer en projets à l'étape suivante.
          </p>
        </div>

        <FileUploader
          portfolioId={portfolioId}
          onFilesUploaded={handleFilesUploaded}
          maxFiles={50}
          maxSizePerFile={100 * 1024 * 1024}
        />

        <div style={{
          marginTop: spacing[6],
          padding: spacing[4],
          backgroundColor: theme.semantic.infoBg,
          borderRadius: borderRadius.lg,
          color: theme.semantic.info,
          fontSize: typography.fontSize.sm,
          textAlign: 'center',
        }}>
          💡 Cette étape est optionnelle. Vous pourrez ajouter vos fichiers plus tard depuis l'éditeur de portfolio.
        </div>
      </div>
    );
  };

  // Render classification step
  const renderClassifyStep = () => {
    return (
      <ElementClassificationView
        portfolioId={portfolioId}
        onElementsClassified={handleElementsClassified}
      />
    );
  };

  // Render grouping step
  const renderGroupStep = () => {
    return (
      <ProjectGrouper
        portfolioId={portfolioId}
        elements={wizardState.classifiedElements}
        onComplete={handleProjectsGrouped}
      />
    );
  };

  // Render preview step (placeholder)
  const renderPreviewStep = () => {
    const sector = wizardState.sector ? getSectorById(wizardState.sector) : null;

    return (
      <div style={{ textAlign: 'center', padding: spacing[8] }}>
        <div style={{ fontSize: '4rem', marginBottom: spacing[4] }}>✨</div>
        <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: theme.text.primary, marginBottom: spacing[2] }}>
          Votre portfolio est prêt !
        </h2>
        <p style={{ fontSize: typography.fontSize.base, color: theme.text.secondary, marginBottom: spacing[6] }}>
          Récapitulatif de votre configuration
        </p>

        <div style={{
          backgroundColor: theme.bg.secondary,
          borderRadius: borderRadius.lg,
          padding: spacing[6],
          maxWidth: '400px',
          margin: '0 auto',
          textAlign: 'left',
        }}>
          <div style={{ marginBottom: spacing[3] }}>
            <span style={{ color: theme.text.tertiary, fontSize: typography.fontSize.sm }}>Mode</span>
            <p style={{ fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
              {wizardState.mode === 'independant' ? '👤 Indépendant' : '🏪 Commerce'}
            </p>
          </div>
          <div style={{ marginBottom: spacing[3] }}>
            <span style={{ color: theme.text.tertiary, fontSize: typography.fontSize.sm }}>Secteur</span>
            <p style={{ fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
              {sector?.icon} {sector?.label}
            </p>
          </div>
          <div style={{ marginBottom: spacing[3] }}>
            <span style={{ color: theme.text.tertiary, fontSize: typography.fontSize.sm }}>Titre</span>
            <p style={{ fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
              {wizardState.title || '-'}
            </p>
          </div>
          {wizardState.tagline && (
            <div style={{ marginBottom: spacing[3] }}>
              <span style={{ color: theme.text.tertiary, fontSize: typography.fontSize.sm }}>Tagline</span>
              <p style={{ fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
                {wizardState.tagline}
              </p>
            </div>
          )}
          <div style={{ marginBottom: spacing[3] }}>
            <span style={{ color: theme.text.tertiary, fontSize: typography.fontSize.sm }}>Éléments</span>
            <p style={{ fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
              {wizardState.classifiedElements.length} élément{wizardState.classifiedElements.length > 1 ? 's' : ''} importé{wizardState.classifiedElements.length > 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <span style={{ color: theme.text.tertiary, fontSize: typography.fontSize.sm }}>Projets</span>
            <p style={{ fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
              {wizardState.projects.length} projet{wizardState.projects.length > 1 ? 's' : ''} créé{wizardState.projects.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render content based on current step
  const renderContent = () => {
    switch (currentStep) {
      case 'mode':
        return (
          <ModeSelector
            selectedMode={wizardState.mode}
            onSelect={handleModeSelect}
          />
        );
      case 'sector':
        return wizardState.mode ? (
          <SectorSelector
            mode={wizardState.mode}
            selectedSector={wizardState.sector}
            onSelect={handleSectorSelect}
          />
        ) : null;
      case 'template':
        return renderTemplateSelector();
      case 'profile':
        return renderProfileForm();
      case 'import':
        return renderImportStep();
      case 'classify':
        return renderClassifyStep();
      case 'group':
        return renderGroupStep();
      case 'preview':
        return renderPreviewStep();
      default:
        return null;
    }
  };

  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Créer un portfolio</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Stepper */}
        <div style={styles.stepper}>
          {STEPS.map((step, index) => renderStepCircle(step, index))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {renderContent()}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerLeft}>
            <span style={styles.stepInfo}>
              Étape {currentStepIndex + 1} sur {STEPS.length}
            </span>
          </div>
          <div style={styles.footerRight}>
            {currentStepIndex > 0 && (
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={goToPreviousStep}
              >
                Retour
              </button>
            )}
            <button
              style={{
                ...styles.button,
                ...(canGoNext() ? styles.buttonPrimary : styles.buttonPrimaryDisabled),
              }}
              onClick={goToNextStep}
              disabled={!canGoNext()}
            >
              {isLastStep ? 'Créer le portfolio' : 'Continuer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioWizard;
