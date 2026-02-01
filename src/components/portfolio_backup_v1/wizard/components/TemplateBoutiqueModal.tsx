import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { useTheme } from '../../../../ThemeContext';
import { CalmModal } from '../../../ui/CalmModal';
import { useToast } from '../../../ui/NotificationToast';
import { getBoutiqueTemplates, purchaseTemplate, getTemplatePrice } from '../../../../services/templateService';
import type { Template } from '../../../../services/templateService';
import { TemplateGrid } from './TemplateGrid';
import { TemplatePreviewModal } from './TemplatePreviewModal';

interface TemplateBoutiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
  isPremiumUser?: boolean;
}

export const TemplateBoutiqueModal: React.FC<TemplateBoutiqueModalProps> = ({
  isOpen,
  onClose,
  onPurchaseSuccess,
  isPremiumUser = false,
}) => {
  const { theme, mode } = useTheme();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBoutiqueTemplates();
    }
  }, [isOpen]);

  const loadBoutiqueTemplates = async () => {
    setIsLoading(true);
    try {
      const boutiqueTemplates = await getBoutiqueTemplates();
      setTemplates(boutiqueTemplates);
    } catch (error) {
      console.error('Error loading boutique templates:', error);
      toast.error('Erreur', 'Impossible de charger les templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (template: Template) => {
    if (isPurchasing) return;

    const price = isPremiumUser && template.price > 0 ? template.price * 0.7 : template.price;
    const confirmation = confirm(
      `Acheter "${template.name}" pour ${price.toFixed(2)}€ ?\n\n${
        isPremiumUser ? '✨ Prix Premium : -30% appliqué' : ''
      }`
    );

    if (!confirmation) return;

    setIsPurchasing(true);
    try {
      const result = await purchaseTemplate(template.id, price, isPremiumUser);

      if (result.success) {
        toast.success('Achat réussi', `${template.name} est maintenant disponible !`);
        onPurchaseSuccess();
        onClose();
      } else {
        toast.error('Erreur', result.error || "Échec de l'achat");
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error('Erreur', error.message || "Échec de l'achat");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      <CalmModal isOpen={isOpen} onClose={onClose}>
        <div style={{ width: '90vw', maxWidth: '1400px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: `1px solid ${theme.border.light}`,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: theme.text.primary,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <ShoppingCart size={28} />
                Boutique de Templates
              </h3>
              <p style={{ fontSize: '0.95rem', color: theme.text.secondary }}>
                Découvrez nos templates premium pour un portfolio unique
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: theme.text.secondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Premium Banner */}
          {isPremiumUser && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: `linear-gradient(135deg, ${theme.accent.primary}20 0%, ${theme.accent.secondary}20 100%)`,
                border: `1px solid ${theme.accent.primary}40`,
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <Sparkles size={24} color={theme.accent.primary} />
              <div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: theme.text.primary,
                    marginBottom: '0.25rem',
                  }}
                >
                  Abonné Premium
                </div>
                <div style={{ fontSize: '0.85rem', color: theme.text.secondary }}>
                  Bénéficiez de -30% sur tous les templates (4,99€ → 3,49€)
                </div>
              </div>
            </motion.div>
          )}

          {/* Templates Grid */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '0.5rem',
            }}
          >
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
                selectedTemplateId={selectedTemplate?.id || null}
                onSelectTemplate={(template) => {
                  setSelectedTemplate(template);
                  handlePurchase(template);
                }}
                onPreviewTemplate={setPreviewTemplate}
                isPremiumUser={isPremiumUser}
                emptyMessage="Aucun template premium disponible pour le moment"
              />
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${theme.border.light}`,
            }}
          >
            <div style={{ fontSize: '0.85rem', color: theme.text.secondary }}>
              {templates.length} template{templates.length > 1 ? 's' : ''} disponible{templates.length > 1 ? 's' : ''}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: `1px solid ${theme.border.default}`,
                background: 'transparent',
                color: theme.text.primary,
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              Fermer
            </motion.button>
          </div>
        </div>
      </CalmModal>

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(template) => {
          setPreviewTemplate(null);
          setSelectedTemplate(template);
          handlePurchase(template);
        }}
      />
    </>
  );
};
