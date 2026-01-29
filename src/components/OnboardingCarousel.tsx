/**
 * SOUVERAIN V17 - OnboardingCarousel
 * Carousel d'onboarding avec 7 slides (slide Privacy obligatoire)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { OnboardingSlide } from './OnboardingSlide';
import type { SlideData } from './OnboardingSlide';
import { typography, borderRadius, transitions, zIndex } from '../design-system';

// ============================================================
// ICONS
// ============================================================

const OnboardingIcons = {
  Logo: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 8L8 20v24c0 15.5 10.5 24 24 24s24-8.5 24-24V20L32 8z" opacity="0.9" />
      <circle cx="32" cy="32" r="12" fill="white" opacity="0.3" />
    </svg>
  ),
  FileText: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Target: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" strokeWidth="1" />
    </svg>
  ),
  LinkedIn: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Lock: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  Eye: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Shield: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ============================================================
// PRIVACY SLIDE CONTENT
// ============================================================

// Header Privacy (fixe)
const PrivacyHeader: React.FC<{ theme: any }> = ({ theme }) => (
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
const PrivacyFeatures: React.FC<{ theme: any; type: 'local' | 'rgpd' | 'anonymization' }> = ({ theme, type }) => {
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
      textAlign: 'center' as const, // CENTRÉ comme les autres slides
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
            fontSize: typography.fontSize.base, // Comme les autres slides
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

// ============================================================
// SLIDES DATA
// ============================================================

const createSlides = (theme: any): SlideData[] => [
  {
    id: 1,
    icon: <OnboardingIcons.Logo />,
    color: theme.accent.primary,
    title: 'Bienvenue sur SOUVERAIN',
    subtitle: 'Votre carrière. Vos règles.',
    description: 'Découvrez votre nouvelle boîte à outils pour piloter votre carrière. Prenez 30 secondes pour explorer les fonctionnalités.',
    animation: 'fadeInScale 0.6s ease-out',
  },
  {
    id: 2,
    icon: <OnboardingIcons.FileText />,
    color: '#9333EA',
    title: 'CV Coach',
    subtitle: 'Votre CV, analysé et optimisé par l\'IA',
    description: 'Importez votre CV et recevez une analyse détaillée : scoring, points forts, axes d\'amélioration et reformulations concrètes.',
    animation: 'pulseScan 2s ease-in-out infinite',
  },
  {
    id: 3,
    icon: <OnboardingIcons.Briefcase />,
    color: '#2563EB',
    title: 'Portfolio',
    subtitle: 'Votre vitrine professionnelle',
    description: 'Créez un portfolio qui met en valeur vos réalisations. Partagez-le en un clic avec les recruteurs.',
    animation: 'stackDocuments 2s ease-in-out infinite',
  },
  {
    id: 4,
    icon: <OnboardingIcons.Target />,
    color: '#EA580C',
    title: 'Job Match',
    subtitle: 'Les postes faits pour vous',
    description: 'Découvrez les opportunités qui correspondent vraiment à votre profil. Fini les candidatures dans le vide.',
    animation: 'targetArrow 2s ease-in-out infinite',
  },
  {
    id: 5,
    icon: <OnboardingIcons.LinkedIn />,
    color: '#0077B5',
    title: 'LinkedIn Boost',
    subtitle: 'Optimisez votre présence en ligne',
    description: 'Améliorez votre profil LinkedIn avec des suggestions personnalisées. Rendez-vous visible auprès des recruteurs.',
    animation: 'sparkles 2s ease-in-out infinite',
  },
  {
    id: 6,
    icon: <OnboardingIcons.Lock />,
    color: '#16A34A',
    title: 'Coffre-Fort',
    subtitle: 'Vos documents en sécurité absolue',
    description: 'Stockez vos CV, lettres de motivation et documents sensibles. Chiffrement AES-256, tout reste sur votre appareil.',
    animation: 'lockClose 1.5s ease-in-out',
  },
];

// ============================================================
// ONBOARDING CAROUSEL COMPONENT
// ============================================================

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = createSlides(theme);
  const isPrivacySlide = currentSlide >= 6 && currentSlide <= 8; // Slides 7, 8 et 9 (index 6, 7, 8)
  const totalSlides = 9; // 6 feature slides + 3 privacy slides

  // Handle slide change with direction
  const changeSlide = useCallback((newIndex: number) => {
    if (newIndex === currentSlide || isTransitioning) return;

    setIsTransitioning(true);
    setDirection(newIndex > currentSlide ? 'next' : 'prev');
    setPreviousSlide(currentSlide);
    setCurrentSlide(newIndex); // Update immediately for proper animation

    setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // Match animation duration
  }, [currentSlide, isTransitioning]);

  // Handle next slide
  const handleNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      changeSlide(currentSlide + 1);
    } else {
      // Complete onboarding and save to localStorage
      localStorage.setItem('souverain_onboarding_completed', 'true');
      onComplete();
    }
  }, [currentSlide, onComplete, changeSlide]);

  // Handle skip (go to next slide, not complete)
  const handleSkip = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      changeSlide(currentSlide + 1);
    }
  }, [currentSlide, changeSlide]);

  // Handle close (X button)
  const handleClose = useCallback(() => {
    // Sur les slides Privacy, ne PAS marquer l'onboarding comme complété
    // L'utilisateur devra repasser par le tuto au prochain lancement
    if (!isPrivacySlide) {
      localStorage.setItem('souverain_onboarding_completed', 'true');
    }
    onComplete();
  }, [isPrivacySlide, onComplete]);

  // Handle dot click
  const handleDotClick = useCallback((index: number) => {
    changeSlide(index);
  }, [changeSlide]);

  // Prevent body scroll when onboarding is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle swipe gestures
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    let isHandlingSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (isHandlingSwipe || isTransitioning) return;
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isHandlingSwipe || isTransitioning) return;
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold && !isHandlingSwipe) {
        isHandlingSwipe = true;
        if (diff > 0) {
          // Swipe left - next slide
          handleNext();
        } else {
          // Swipe right - previous slide
          if (currentSlide > 0) {
            changeSlide(currentSlide - 1);
          }
        }
        setTimeout(() => {
          isHandlingSwipe = false;
        }, 400);
      }
    };

    // Mouse wheel for desktop (throttled)
    let wheelTimeout: NodeJS.Timeout;
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      if (isHandlingSwipe || isTransitioning) return;

      const now = Date.now();
      // Réduire l'inertie : au moins 600ms entre chaque slide change
      if (now - lastWheelTime < 600) return;

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
        lastWheelTime = now;
        if (e.deltaX > 30) {
          handleNext();
        } else if (e.deltaX < -30 && currentSlide > 0) {
          changeSlide(currentSlide - 1);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentSlide, handleNext, changeSlide, isTransitioning]);

  // Handle keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSlide > 0) {
          changeSlide(currentSlide - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide, handleNext, changeSlide, isTransitioning]);

  // ============================================================
  // STYLES
  // ============================================================

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: `${theme.bg.primary}F0`,
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.modal,
      padding: '1rem',
    },
    modal: {
      position: 'relative' as const,
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius['2xl'],
      boxShadow: theme.shadow.xl,
      border: `1px solid ${theme.border.light}`,
      maxWidth: '560px',
      width: '100%',
      height: 'auto',
      maxHeight: '95vh',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    modalInner: {
      padding: '2.5rem 1.5rem 1.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      flex: 1,
      minHeight: 0,
    },
    closeButton: {
      position: 'absolute' as const,
      top: '1rem',
      right: '1rem',
      width: '36px',
      height: '36px',
      display: 'flex', // Toujours visible, même sur Privacy slides
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      color: theme.text.tertiary,
      transition: transitions.fast,
      padding: '0.5rem',
    },
    closeIcon: {
      pointerEvents: 'none' as const,
    },
    slideContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      overflow: 'hidden',
      minHeight: '320px',
    },
    slideWrapper: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      willChange: 'transform, opacity',
    },
    dotsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      marginBottom: '2rem',
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      transition: transitions.fast,
    },
    buttonsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
    },
    navArrows: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    arrowButton: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    skipButton: {
      display: isPrivacySlide ? 'none' : 'block',
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: 'transparent',
      color: theme.text.tertiary,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    startButton: {
      display: isPrivacySlide ? 'flex' : 'none',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.text.primary, // Noir au lieu de bleu
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      boxShadow: theme.shadow.md,
      marginLeft: 'auto',
    },
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalInner}>
          {/* Close button */}
          <button
            onClick={handleClose}
            style={styles.closeButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.text.tertiary;
            }}
          >
            <div style={styles.closeIcon}>
              <OnboardingIcons.X />
            </div>
          </button>

          {/* Slide content with transition */}
          <div style={styles.slideContainer}>
            {/* Déterminer si on doit utiliser le header fixe ou le slide complet */}
            {/* Header fixe SEULEMENT si on navigue ENTRE slides Privacy (6↔7, 7↔8, etc.) */}
            {isPrivacySlide && previousSlide >= 6 && previousSlide <= 8 ? (
              // Mode header fixe: on navigue entre slides Privacy
              <div style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto',
                padding: '1rem',
              }}>
                {/* Header Privacy FIXE */}
                <PrivacyHeader theme={theme} />

                {/* Container pour les features qui slide */}
                <div style={{
                  position: 'relative' as const,
                  width: '100%',
                  minHeight: '120px',
                  overflow: 'hidden',
                }}>
                  {/* Previous features (exiting) */}
                  {isTransitioning && (
                    <div
                      className={`privacy-features-exit privacy-features-${direction}`}
                      style={{
                        position: 'absolute' as const,
                        top: 0,
                        left: 0,
                        right: 0,
                        willChange: 'transform, opacity',
                      }}
                    >
                      <PrivacyFeatures
                        theme={theme}
                        type={previousSlide === 6 ? 'local' : previousSlide === 7 ? 'rgpd' : 'anonymization'}
                      />
                    </div>
                  )}

                  {/* Current features (entering) */}
                  <div
                    className={`privacy-features-enter privacy-features-${direction} ${isTransitioning ? 'entering' : ''}`}
                    style={{
                      position: isTransitioning ? 'absolute' as const : 'relative' as const,
                      top: 0,
                      left: 0,
                      right: 0,
                      willChange: 'transform, opacity',
                    }}
                  >
                    <PrivacyFeatures
                      theme={theme}
                      type={currentSlide === 6 ? 'local' : currentSlide === 7 ? 'rgpd' : 'anonymization'}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Mode slide complet: transition normale ou entrée/sortie de Privacy
              <>
                {/* Previous slide (exiting) */}
                {isTransitioning && (
                  <div
                    className={`slide-exit slide-${direction}`}
                    style={styles.slideWrapper}
                  >
                    {previousSlide < 6 ? (
                      <OnboardingSlide slide={slides[previousSlide]} isActive={true} />
                    ) : (
                      // Privacy slide complète en sortie
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '500px',
                        margin: '0 auto',
                        padding: '1rem',
                      }}>
                        <PrivacyHeader theme={theme} />
                        <PrivacyFeatures
                          theme={theme}
                          type={previousSlide === 6 ? 'local' : previousSlide === 7 ? 'rgpd' : 'anonymization'}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Current slide (entering) */}
                <div
                  className={`slide-enter slide-${direction} ${isTransitioning ? 'entering' : ''}`}
                  style={styles.slideWrapper}
                >
                  {currentSlide < 6 ? (
                    <OnboardingSlide slide={slides[currentSlide]} isActive={true} />
                  ) : (
                    // Privacy slide complète en entrée
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      maxWidth: '500px',
                      margin: '0 auto',
                      padding: '1rem',
                    }}>
                      <PrivacyHeader theme={theme} />
                      <PrivacyFeatures
                        theme={theme}
                        type={currentSlide === 6 ? 'local' : currentSlide === 7 ? 'rgpd' : 'anonymization'}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Dots navigation */}
          <div style={styles.dotsContainer}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                disabled={isTransitioning}
                style={{
                  ...styles.dot,
                  backgroundColor: index === currentSlide ? theme.text.primary : theme.border.default,
                  transform: index === currentSlide ? 'scale(1.2)' : 'scale(1)',
                  cursor: isTransitioning ? 'wait' : 'pointer',
                }}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div style={styles.buttonsContainer}>
            <button
              onClick={handleSkip}
              disabled={isTransitioning}
              style={{
                ...styles.skipButton,
                cursor: isTransitioning ? 'wait' : 'pointer',
                opacity: isTransitioning ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isTransitioning) e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.text.tertiary;
              }}
            >
              Passer
            </button>

            {/* Start button (Privacy slide only) */}
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              style={{
                ...styles.startButton,
                cursor: isTransitioning ? 'wait' : 'pointer',
                opacity: isTransitioning ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isTransitioning) e.currentTarget.style.backgroundColor = theme.text.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.text.primary;
              }}
            >
              Commencer
              <OnboardingIcons.ArrowRight />
            </button>

            {/* Navigation arrows (non-privacy slides) */}
            {!isPrivacySlide && (
              <div style={styles.navArrows}>
                <button
                  onClick={() => changeSlide(currentSlide - 1)}
                  disabled={isTransitioning || currentSlide === 0}
                  style={{
                    ...styles.arrowButton,
                    cursor: isTransitioning || currentSlide === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentSlide === 0 ? 0.3 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isTransitioning && currentSlide > 0) {
                      e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                      e.currentTarget.style.borderColor = theme.border.default;
                      e.currentTarget.style.color = theme.text.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = theme.border.light;
                    e.currentTarget.style.color = theme.text.secondary;
                  }}
                  title="Précédent"
                >
                  <OnboardingIcons.ArrowLeft />
                </button>

                <button
                  onClick={handleNext}
                  disabled={isTransitioning}
                  style={{
                    ...styles.arrowButton,
                    cursor: isTransitioning ? 'wait' : 'pointer',
                    opacity: isTransitioning ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isTransitioning) {
                      e.currentTarget.style.backgroundColor = theme.text.primary;
                      e.currentTarget.style.borderColor = theme.text.primary;
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = theme.border.light;
                    e.currentTarget.style.color = theme.text.secondary;
                  }}
                  title="Suivant"
                >
                  <OnboardingIcons.ArrowRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        /* Slide transitions - entrée et sortie simultanées */
        .slide-exit,
        .slide-enter {
          transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 400ms cubic-bezier(0.4, 0, 0.2, 1);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Slide actuel (position normale) */
        .slide-enter {
          transform: translateX(0);
          opacity: 1;
          z-index: 2;
        }

        /* Direction NEXT (vers la droite) */
        /* Nouveau slide entre par la droite */
        .slide-enter.slide-next.entering {
          transform: translateX(100%);
          opacity: 0;
          animation: slideInFromRight 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Ancien slide sort par la gauche */
        .slide-exit.slide-next {
          transform: translateX(0);
          opacity: 1;
          animation: slideOutToLeft 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          z-index: 1;
        }

        /* Direction PREV (vers la gauche) */
        /* Nouveau slide entre par la gauche */
        .slide-enter.slide-prev.entering {
          transform: translateX(-100%);
          opacity: 0;
          animation: slideInFromLeft 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Ancien slide sort par la droite */
        .slide-exit.slide-prev {
          transform: translateX(0);
          opacity: 1;
          animation: slideOutToRight 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          z-index: 1;
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutToLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutToRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* ============================================ */
        /* Animations spécifiques pour Privacy Features */
        /* ============================================ */

        .privacy-features-exit,
        .privacy-features-enter {
          transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 400ms cubic-bezier(0.4, 0, 0.2, 1);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .privacy-features-enter {
          transform: translateX(0);
          opacity: 1;
          z-index: 2;
        }

        /* Direction NEXT pour les features */
        .privacy-features-enter.privacy-features-next.entering {
          transform: translateX(100%);
          opacity: 0;
          animation: slideInFromRight 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .privacy-features-exit.privacy-features-next {
          transform: translateX(0);
          opacity: 1;
          animation: slideOutToLeft 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          z-index: 1;
        }

        /* Direction PREV pour les features */
        .privacy-features-enter.privacy-features-prev.entering {
          transform: translateX(-100%);
          opacity: 0;
          animation: slideInFromLeft 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .privacy-features-exit.privacy-features-prev {
          transform: translateX(0);
          opacity: 1;
          animation: slideOutToRight 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          z-index: 1;
        }

        /* Icon animations */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulseScan {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes stackDocuments {
          0%, 100% {
            transform: translateY(0);
          }
          33% {
            transform: translateY(-4px);
          }
          66% {
            transform: translateY(-8px);
          }
        }

        @keyframes targetArrow {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(5deg) scale(1.05);
          }
        }

        @keyframes sparkles {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.1) rotate(5deg);
            filter: brightness(1.2);
          }
        }

        @keyframes lockClose {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-5deg);
          }
        }

        @keyframes blinkEye {
          0%, 90%, 100% {
            opacity: 1;
          }
          95% {
            opacity: 0.3;
          }
        }

        @keyframes pulseShield {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        /* Responsive adjustments */
        @media (max-height: 700px) {
          .slide-enter h1,
          .slide-exit h1 {
            font-size: 1.5rem !important;
            margin-bottom: 0.5rem !important;
          }
          .slide-enter h2,
          .slide-exit h2 {
            font-size: 1rem !important;
            margin-bottom: 1rem !important;
          }
          .slide-enter p,
          .slide-exit p {
            font-size: 0.875rem !important;
          }
        }

        /* Responsive pour petite largeur */
        @media (max-width: 480px) {
          .slide-enter h1,
          .slide-exit h1 {
            font-size: 1.5rem !important;
          }
          .slide-enter h2,
          .slide-exit h2 {
            font-size: 1rem !important;
          }
          .slide-enter p,
          .slide-exit p {
            font-size: 0.875rem !important;
          }
        }

        /* Responsive pour très petite fenêtre (hauteur + largeur) */
        @media (max-height: 600px), (max-width: 400px) {
          .slide-enter h1,
          .slide-exit h1 {
            font-size: 1.25rem !important;
            margin-bottom: 0.375rem !important;
          }
          .slide-enter h2,
          .slide-exit h2 {
            font-size: 0.875rem !important;
            margin-bottom: 0.75rem !important;
          }
          .slide-enter p,
          .slide-exit p {
            font-size: 0.75rem !important;
            line-height: 1.3 !important;
          }
        }
      `}</style>
    </div>
  );
};
