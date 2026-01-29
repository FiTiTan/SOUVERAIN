/**
 * SOUVERAIN V17 - OnboardingSlide
 * Template réutilisable pour les slides du carousel d'onboarding
 */

import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';

export type SlideData = {
  id: number;
  icon: ReactNode;
  color: string;
  title: string;
  subtitle: string;
  description: string | ReactNode;
  animation?: string;
};

interface OnboardingSlideProps {
  slide: SlideData;
  isActive: boolean;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ slide, isActive }) => {
  const { theme } = useTheme();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      padding: '1rem',
      opacity: isActive ? 1 : 0,
      transform: isActive ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity ${transitions.normal}, transform ${transitions.normal}`,
    },
    iconWrapper: {
      width: '100px',
      height: '100px',
      margin: '0 auto 1.5rem',
      borderRadius: borderRadius['2xl'],
      background: `linear-gradient(135deg, ${slide.color}15, ${slide.color}05)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      animation: slide.animation || 'none',
      flexShrink: 0,
    },
    iconInner: {
      color: slide.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.75rem',
      lineHeight: typography.lineHeight.tight,
    },
    subtitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.medium,
      color: slide.color,
      marginBottom: '1.5rem',
      lineHeight: typography.lineHeight.normal,
    },
    description: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
      maxWidth: '440px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <div style={styles.iconInner}>
          {slide.icon}
        </div>
      </div>

      <h1 style={styles.title}>{slide.title}</h1>
      <h2 style={styles.subtitle}>{slide.subtitle}</h2>

      {typeof slide.description === 'string' ? (
        <p style={styles.description}>{slide.description}</p>
      ) : (
        <div style={styles.description}>{slide.description}</div>
      )}
    </div>
  );
};
