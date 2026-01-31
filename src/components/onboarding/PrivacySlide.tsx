/**
 * Privacy Slide Components
 * Extracted from OnboardingCarousel for better code splitting
 */

import React from 'react';
import { typography, borderRadius } from '../../design-system';
import { OnboardingIcons } from './OnboardingIcons';

// Header Privacy (fixe)
export const PrivacyHeader: React.FC<{ theme: any }> = ({ theme }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    width: '100%',
  }}>
    {/* Icône Eye principale - même taille que les autres slides */}
    <div style={{
      width: '100px',
      height: '100px',
      margin: '0 auto 1.5rem',
      borderRadius: borderRadius['2xl'],
      background: `linear-gradient(135deg, ${theme.semantic.success}15, ${theme.semantic.success}05)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      animation: 'blinkEye 3s ease-in-out infinite',
      flexShrink: 0,
    }}>
      <div style={{
        color: theme.semantic.success,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <OnboardingIcons.Eye />
      </div>
    </div>

    {/* Titre */}
    <h1 style={{
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.5rem',
      lineHeight: typography.lineHeight.tight,
    }}>
      Vos données vous appartiennent
    </h1>

    {/* Sous-titre */}
    <h2 style={{
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.medium,
      color: theme.semantic.success,
      marginBottom: '2.5rem',
      lineHeight: typography.lineHeight.normal,
    }}>
      Privacy by Design
    </h2>
  </div>
);

// Features Privacy (qui slide)
export const PrivacyFeatures: React.FC<{ theme: any; type: 'local' | 'rgpd' | 'anonymization' }> = ({ theme, type }) => {
  const features = type === 'local'
    ? [
        {
          title: 'Traitement 100% local',
          desc: 'Vos documents restent sur votre appareil',
        },
      ]
    : type === 'rgpd'
    ? [
        {
          title: 'Conformité RGPD',
          desc: 'Aucune donnée vendue, jamais',
        },
      ]
    : [
        {
          title: 'Anonymisation automatique',
          desc: 'Vos infos personnelles sont masquées AVANT tout envoi vers l\'IA',
        },
      ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
      width: '100%',
      maxWidth: '420px',
      margin: '0 auto',
      textAlign: 'center' as const,
    }}>
      {features.map((feature, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {/* Bouclier centré */}
          <div style={{
            color: theme.semantic.success,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.25rem',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          {/* Titre - même taille que les autres slides */}
          <p style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            marginBottom: '0.25rem',
            lineHeight: typography.lineHeight.tight,
          }}>
            {feature.title}
          </p>

          {/* Description - même taille que les autres slides */}
          <p style={{
            fontSize: typography.fontSize.sm,
            color: theme.text.secondary,
            lineHeight: typography.lineHeight.normal,
            maxWidth: '380px',
          }}>
            {feature.desc}
          </p>
        </div>
      ))}
    </div>
  );
};
