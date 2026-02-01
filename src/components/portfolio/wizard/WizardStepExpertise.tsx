/**
 * SOUVERAIN - Wizard Step 2: Expertise
 * Services + proposition de valeur avec suggestions IA
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps, Service } from '../types';
import { detectContext } from '../../../config/portfolioLabels';

export const WizardStepExpertise: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestedServices, setSuggestedServices] = useState<Service[]>([]);

  // Générer des suggestions basées sur le contexte détecté
  useEffect(() => {
    generateSuggestions();
  }, [formData.profileContext]);

  const generateSuggestions = () => {
    // Suggestions basiques selon le contexte
    // TODO: Améliorer avec IA pour suggestions plus contextuelles
    const context = formData.profileContext || detectContext(
      formData.profileType,
      formData.services.map(s => s.title)
    );

    let suggestions: Service[] = [];

    switch (context) {
      case 'tech':
        suggestions = [
          { title: 'Développement web', description: 'Création d\'applications web modernes et performantes', suggested: true },
          { title: 'Conseil technique', description: 'Accompagnement sur vos choix d\'architecture et de technologie', suggested: true },
          { title: 'Formation', description: 'Transmission de compétences techniques à vos équipes', suggested: true },
        ];
        break;
      case 'service':
        suggestions = [
          { title: 'Conseil personnalisé', description: 'Accompagnement sur-mesure adapté à vos besoins', suggested: true },
          { title: 'Expertise juridique', description: 'Analyse et conseil en droit des affaires', suggested: true },
          { title: 'Gestion de projet', description: 'Pilotage et coordination de vos projets', suggested: true },
        ];
        break;
      case 'food':
        suggestions = [
          { title: 'Cuisine traditionnelle', description: 'Plats authentiques préparés avec des produits frais', suggested: true },
          { title: 'Service traiteur', description: 'Prestations pour vos événements professionnels et privés', suggested: true },
          { title: 'Livraison à domicile', description: 'Recevez nos plats chez vous', suggested: true },
        ];
        break;
      case 'artisan':
        suggestions = [
          { title: 'Intervention rapide', description: 'Dépannage et réparation dans les meilleurs délais', suggested: true },
          { title: 'Installation complète', description: 'Pose et mise en service de vos équipements', suggested: true },
          { title: 'Entretien régulier', description: 'Maintenance préventive pour garantir la durabilité', suggested: true },
        ];
        break;
      case 'retail':
        suggestions = [
          { title: 'Vente en boutique', description: 'Large sélection de produits de qualité', suggested: true },
          { title: 'Conseil personnalisé', description: 'Expertise pour vous guider dans vos choix', suggested: true },
          { title: 'Commande en ligne', description: 'Service de click & collect disponible', suggested: true },
        ];
        break;
      case 'junior':
        suggestions = [
          { title: 'Stage / Alternance', description: 'Disponible pour une mission en entreprise', suggested: true },
          { title: 'Projets personnels', description: 'Réalisations académiques et side-projects', suggested: true },
          { title: 'Apprentissage continu', description: 'Formation permanente aux nouvelles technologies', suggested: true },
        ];
        break;
      default:
        suggestions = [
          { title: 'Service 1', description: 'Décrivez votre premier service', suggested: true },
          { title: 'Service 2', description: 'Décrivez votre deuxième service', suggested: true },
          { title: 'Service 3', description: 'Décrivez votre troisième service', suggested: true },
        ];
    }

    setSuggestedServices(suggestions);
  };

  const handleToggleService = (index: number) => {
    const service = suggestedServices[index];
    const exists = formData.services.find(s => s.title === service.title);

    if (exists) {
      // Retirer
      onUpdate({
        services: formData.services.filter(s => s.title !== service.title),
      });
    } else {
      // Ajouter
      onUpdate({
        services: [...formData.services, service],
      });
    }
  };

  const handleServiceChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...formData.services];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ services: updated });
  };

  const handleAddService = () => {
    onUpdate({
      services: [...formData.services, { title: '', description: '', suggested: false }],
    });
  };

  const handleRemoveService = (index: number) => {
    const updated = formData.services.filter((_, i) => i !== index);
    onUpdate({ services: updated });
  };

  const isServiceSelected = (title: string) => {
    return formData.services.some(s => s.title === title);
  };

  const canProceed = formData.services.length >= 1 && formData.valueProp.trim().length > 0;

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
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

  const sectionStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary,
    marginBottom: '1rem',
  };

  const suggestionCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: '1.5rem',
    border: `2px solid ${selected ? theme.accent.primary : theme.border.default}`,
    borderRadius: borderRadius.lg,
    backgroundColor: selected ? theme.accent.muted : theme.bg.secondary,
    cursor: 'pointer',
    transition: transitions.fast,
    marginBottom: '1rem',
  });

  const serviceCardStyle: React.CSSProperties = {
    padding: '1.5rem',
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.bg.secondary,
    marginBottom: '1rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: typography.fontSize.base,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.md,
    backgroundColor: theme.bg.primary,
    color: theme.text.primary,
    transition: transitions.fast,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  };

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.accent.primary,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: theme.text.secondary,
          border: `1px solid ${theme.border.default}`,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: theme.semantic.error,
          color: '#FFFFFF',
        };
    }
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: `1px solid ${theme.border.light}`,
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>STEP 2 : EXPERTISE</h1>
        <p style={subtitleStyle}>Que faites-vous ? Quels services proposez-vous ?</p>
      </div>

      {/* Suggestions */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>💡 Suggestions basées sur votre profil :</h2>
        {suggestedServices.map((service, index) => {
          const selected = isServiceSelected(service.title);
          return (
            <div
              key={index}
              style={suggestionCardStyle(selected)}
              onClick={() => handleToggleService(index)}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>
                  {selected ? '☑️' : '☐'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: '0.5rem' }}>
                    {service.title}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
                    {service.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Services sélectionnés / édition */}
      {formData.services.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Vos services ({formData.services.length}) :</h2>
          {formData.services.map((service, index) => (
            <div key={index} style={serviceCardStyle}>
              <div style={{ marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                  placeholder="Titre du service"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <textarea
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  placeholder="Description du service (15-30 mots)"
                  style={textareaStyle}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleRemoveService(index)}
                  style={buttonStyle('danger')}
                >
                  🗑️ Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ajouter un service */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={handleAddService} style={buttonStyle('secondary')}>
          + Ajouter un service personnalisé
        </button>
      </div>

      {/* Proposition de valeur */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Proposition de valeur :</h2>
        <p style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginBottom: '1rem' }}>
          En une phrase, qu'est-ce qui vous différencie ?
        </p>
        <textarea
          value={formData.valueProp}
          onChange={(e) => onUpdate({ valueProp: e.target.value })}
          placeholder="Ex: Je transforme vos idées en applications web performantes et élégantes"
          style={textareaStyle}
        />
      </div>

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
          Suivant →
        </button>
      </div>
    </div>
  );
};
