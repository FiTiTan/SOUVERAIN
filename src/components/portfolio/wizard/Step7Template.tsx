import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';
import { useToast } from '../../ui/NotificationToast';
import { getFreeTemplates, getOwnedTemplates, filterTemplates } from '../../../services/templateService';
import type { Template } from '../../../services/templateService';
import { TemplateGrid } from './components/TemplateGrid';
import { TemplatePreviewModal } from './components/TemplatePreviewModal';
import { TemplateBoutiqueModal } from './components/TemplateBoutiqueModal';

interface Step7TemplateProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  isPremiumUser?: boolean;
}

type TemplateTab = 'free' | 'owned' | 'boutique';

export const Step7Template: React.FC<Step7TemplateProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  isPremiumUser = false,
}) => {
  const { theme, mode } = useTheme();
  const { toast } = useToast();

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
        case 'boutique':
          // Boutique is handled by modal
          break;
      }

      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Erreur', 'Impossible de charger les templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template.id);
  };

  const handleOpenBoutique = () => {
    setIsBoutiqueModalOpen(true);
  };

  const handleBoutiquePurchaseSuccess = () => {
    // Reload owned templates after purchase
    if (activeTab === 'owned') {
      loadTemplates();
    }
  };

  const tabs: { id: TemplateTab; label: string; count?: number }[] = [
    { id: 'free', label: 'Gratuits', count: templates.filter(t => t.category === 'free').length },
    { id: 'owned', label: 'Mes achats', count: templates.filter(t => t.is_owned === 1).length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 300,
            color: theme.text.primary,
            marginBottom: '0.5rem',
          }}
        >
          Choisissez votre style
        </h2>
        <p style={{ color: theme.text.secondary, fontSize: '0.95rem' }}>
          Sélectionnez un template pour votre portfolio
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '12px',
              border: `2px solid ${
                activeTab === tab.id ? theme.accent.primary : theme.border.default
              }`,
              background:
                activeTab === tab.id
                  ? mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(99, 102, 241, 0.1)'
                  : mode === 'dark'
                  ? 'rgba(30, 41, 59, 0.6)'
                  : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              color: activeTab === tab.id ? theme.accent.primary : theme.text.primary,
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.85rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '8px',
                  background: activeTab === tab.id ? theme.accent.primary : theme.bg.tertiary,
                  color: activeTab === tab.id ? '#ffffff' : theme.text.secondary,
                }}
              >
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}

        {/* Boutique Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenBoutique}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${theme.accent.primary} 0%, ${theme.accent.secondary} 100%)`,
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `0 4px 12px ${theme.accent.primary}40`,
          }}
        >
          <ShoppingBag size={18} />
          Boutique
        </motion.button>
      </div>

      {/* Selected Template Display */}
      {selectedTemplateId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            background: mode === 'dark'
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(34, 197, 94, 0.05)',
            border: `1px solid ${theme.semantic.success}40`,
            textAlign: 'center',
            color: theme.text.primary,
            fontSize: '0.95rem',
          }}
        >
          Template sélectionné :{' '}
          <strong>
            {templates.find(t => t.id === selectedTemplateId)?.name || selectedTemplateId}
          </strong>
        </motion.div>
      )}

      {/* Templates Grid */}
      <div>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem',
              color: theme.text.secondary,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${theme.border.default}`,
                borderTopColor: theme.accent.primary,
                borderRadius: '50%',
              }}
            />
          </div>
        ) : (
          <TemplateGrid
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            onPreviewTemplate={setPreviewTemplate}
            isPremiumUser={isPremiumUser}
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
        isPremiumUser={isPremiumUser}
      />
    </motion.div>
  );
};
