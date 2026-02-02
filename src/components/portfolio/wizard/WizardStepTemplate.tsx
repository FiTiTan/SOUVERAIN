/**
 * SOUVERAIN - Wizard Step 4: Template
 * Sélection du style visuel avec système complet (tabs, preview, boutique)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps } from '../types';
import { getFreeTemplates, getOwnedTemplates } from '../../../services/templateService';
import type { Template } from '../../../services/templateService';
import { TemplateGrid } from './template-components/TemplateGrid';
import { TemplatePreviewModal } from './template-components/TemplatePreviewModal';
import { TemplateBoutiqueModal } from './template-components/TemplateBoutiqueModal';

type TemplateTab = 'free' | 'owned';

export const WizardStepTemplate: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme, mode } = useTheme();

  const [activeTab, setActiveTab] = useState<TemplateTab>('free');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isBoutiqueModalOpen, setIsBoutiqueModalOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [activeTab]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      let loadedTemplates: Template[] = [];

      switch (activeTab) {
        case 'free':
          loadedTemplates = await getFreeTemplates();
          break;
        case 'owned':
          loadedTemplates = await getOwnedTemplates();
          break;
      }

      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    onUpdate({ templateId: template.id });
  };

  const handleBoutiquePurchaseSuccess = () => {
    if (activeTab === 'owned') {
      loadTemplates();
    }
  };

  const canProceed = !!formData.templateId;

  const freeCount = templates.filter(t => t.category === 'free').length;
  const ownedCount = templates.filter(t => t.is_owned === 1).length;

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    color: theme.text.secondary,
  };

  const tabsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '0.75rem 2rem',
    borderRadius: borderRadius.lg,
    border: `2px solid ${isActive ? '#3A3A3A' : theme.border.default}`,
    background: isActive
      ? mode === 'dark'
        ? 'rgba(58, 58, 58, 0.2)'
        : 'rgba(58, 58, 58, 0.1)'
      : theme.bg.secondary,
    color: isActive ? '#3A3A3A' : theme.text.primary,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    transition: transitions.fast,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  const countBadgeStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: typography.fontSize.xs,
    padding: '0.15rem 0.5rem',
    borderRadius: borderRadius.sm,
    background: isActive ? '#3A3A3A' : theme.bg.tertiary,
    color: isActive ? '#ffffff' : theme.text.secondary,
  });

  const boutiqueButtonStyle: React.CSSProperties = {
    padding: '0.75rem 2rem',
    borderRadius: borderRadius.lg,
    border: 'none',
    background: `linear-gradient(135deg, #3A3A3A 0%, #1A1A1A 100%)`,
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    transition: transitions.fast,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  };

  const selectedInfoStyle: React.CSSProperties = {
    padding: '1rem 1.5rem',
    borderRadius: borderRadius.lg,
    background: mode === 'dark'
      ? 'rgba(34, 197, 94, 0.1)'
      : 'rgba(34, 197, 94, 0.05)',
    border: `1px solid ${theme.semantic.success}40`,
    textAlign: 'center',
    color: theme.text.primary,
    fontSize: typography.fontSize.sm,
    marginBottom: '2rem',
  };

  const loaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    color: theme.text.secondary,
  };

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        backgroundColor: '#3A3A3A',
        color: '#FFFFFF',
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: theme.text.secondary,
        border: `1px solid ${theme.border.default}`,
      };
    }
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '2rem',
    marginTop: '3rem',
    borderTop: `1px solid ${theme.border.light}`,
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>ÉTAPE 4 : CHOISISSEZ VOTRE STYLE</h1>
        <p style={subtitleStyle}>Sélectionnez un template pour votre portfolio</p>
      </div>

      {/* Tabs */}
      <div style={tabsContainerStyle}>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('free')}
          style={tabButtonStyle(activeTab === 'free')}
        >
          Gratuits
          <span style={countBadgeStyle(activeTab === 'free')}>
            {freeCount}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('owned')}
          style={tabButtonStyle(activeTab === 'owned')}
        >
          Mes achats
          <span style={countBadgeStyle(activeTab === 'owned')}>
            {ownedCount}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsBoutiqueModalOpen(true)}
          style={boutiqueButtonStyle}
        >
          <ShoppingBag size={18} />
          Boutique
        </motion.button>
      </div>

      {/* Selected Template Info */}
      {formData.templateId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={selectedInfoStyle}
        >
          Template sélectionné :{' '}
          <strong>
            {templates.find(t => t.id === formData.templateId)?.name || formData.templateId}
          </strong>
        </motion.div>
      )}

      {/* Templates Grid */}
      <div>
        {isLoading ? (
          <div style={loaderStyle}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${theme.border.default}`,
                borderTopColor: '#3A3A3A',
                borderRadius: '50%',
              }}
            />
          </div>
        ) : (
          <TemplateGrid
            templates={templates}
            selectedTemplateId={formData.templateId}
            onSelectTemplate={handleSelectTemplate}
            onPreviewTemplate={setPreviewTemplate}
            isPremiumUser={false}
            emptyMessage={
              activeTab === 'owned'
                ? 'Aucun template acheté. Visitez la boutique !'
                : 'Aucun template disponible'
            }
          />
        )}
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={handleSelectTemplate}
      />

      {/* Boutique Modal */}
      <TemplateBoutiqueModal
        isOpen={isBoutiqueModalOpen}
        onClose={() => setIsBoutiqueModalOpen(false)}
        onPurchaseSuccess={handleBoutiquePurchaseSuccess}
        isPremiumUser={false}
      />

      {/* Footer avec navigation */}
      <div style={footerStyle}>
        <button onClick={onBack} style={buttonStyle('secondary')}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            ...buttonStyle('primary'),
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          Générer →
        </button>
      </div>
    </div>
  );
};
