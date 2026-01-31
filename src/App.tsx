/**
 * SOUVERAIN V17 - App
 * Interface Coach CV Premium
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { ToastProvider } from './components/ui/NotificationToast';
import { typography, borderRadius, transitions } from './design-system';
import {
  BentoBox,
  BentoCard,
  SectionHeader,
  Divider,
  Tag
} from './components/ui';
import {
  DiagnosticCard,
  ScoreCard,
  ExperienceCard,
  ATSTable,
  ActionCard,
  ReformulationCard
} from './components/ReportComponents';
import AnalysisAnimation from './components/AnalysisAnimation';
import { Shell } from './components/Shell';
import { CVChoice } from './components/CVChoice';
import { CVWizard } from './components/cv/CVWizard';
import { LinkedInImportModal } from './components/LinkedInImportModal';
import { OnboardingCarousel } from './components/OnboardingCarousel';
import { parseReport, isValidReport } from './reportParser';
import type { ParsedReport } from './reportParser';
import { detectAndAnonymize, deanonymize } from './services/anonymizationService';
import { webLlamaService } from './services/webLlamaService';


// ============================================================
// TYPES
// ============================================================

type CVView = 'choice' | 'upload' | 'loaded' | 'report' | 'scratch' | 'linkedin';


// ============================================================
// ICONS
// ============================================================

const Icons = {
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Loader: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),
};

import { SplashScreenModern } from './components/SplashScreenModern';

// ============================================================
// MAIN APP CONTENT
// ============================================================

const AppContent: React.FC = () => {
  const { theme, mode, toggleTheme } = useTheme();

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  // Pré-chargement du moteur IA Local (WebLLM)
  useEffect(() => {
    webLlamaService.initialize().catch(err => console.warn('[App] Background AI load:', err));
  }, []);

  // Track app readiness (mark ready after initial render + theme loaded)
  useEffect(() => {
    // Wait for theme to be stable and DOM to be ready
    const readyTimer = setTimeout(() => {
      setIsAppReady(true);
      console.log('[App] App is ready to display');
    }, 1000); // Small delay to ensure everything is mounted

    return () => clearTimeout(readyTimer);
  }, [theme]);





  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    const completed = localStorage.getItem('souverain_onboarding_completed');
    return completed !== 'true';
  });

  // CV Analysis state (simplified - only CV Coach)
  const [cvView, setCvView] = useState<CVView>('choice');
  const [cvFile, setCvFile] = useState<{ text: string; filename: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<'reading' | 'anonymizing' | 'analyzing' | 'complete'>('reading');
  const [anonymizationStats, setAnonymizationStats] = useState<any>(null);
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ latency: number; masked: number } | null>(null);

  // LinkedIn import state
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Handle show tutorial (from help button)
  const handleShowTutorial = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  // Handle path selection
  const handleSelectPath = useCallback((path: 'existing' | 'scratch' | 'linkedin') => {
    if (path === 'existing') {
      setCvView('upload');
    } else if (path === 'scratch') {
      setCvView('scratch');
    } else if (path === 'linkedin') {
      setShowLinkedInModal(true);
    }
  }, []);

  // Handle questionnaire completion
  const handleQuestionnaireComplete = useCallback((data: any) => {
    // Generate CV text from questionnaire data
    const cvText = generateCVFromQuestionnaire(data);

    // Set as current CV file
    setCvFile({
      text: cvText,
      filename: `CV_${data.firstName}_${data.lastName}.txt`
    });

    // Move to loaded state
    setCvView('loaded');
  }, []);

  // Handle LinkedIn import
  const handleLinkedInImport = useCallback(async (url: string) => {
    try {
      const result = await window.electron.importLinkedIn(url);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'import LinkedIn');
      }

      // Generate CV text from LinkedIn data
      const cvText = generateCVFromLinkedIn(result.data);

      // Set as current CV file
      setCvFile({
        text: cvText,
        filename: `CV_LinkedIn_${result.data.firstName}_${result.data.lastName}.txt`
      });

      // Close modal and move to loaded state
      setShowLinkedInModal(false);
      setCvView('loaded');

    } catch (error: any) {
      throw error; // Re-throw pour que le modal gère l'erreur
    }
  }, []);

  // Generate CV text from LinkedIn data
  const generateCVFromLinkedIn = (data: any): string => {
    let cv = '';

    // Header
    cv += `${data.firstName} ${data.lastName}\n`;
    if (data.headline) cv += `${data.headline}\n`;
    if (data.location) cv += `Localisation: ${data.location}\n`;
    cv += '\n';

    // Summary
    if (data.summary) {
      cv += '=== PROFIL PROFESSIONNEL ===\n';
      cv += `${data.summary}\n\n`;
    }

    // Expérience professionnelle
    if (data.experiences && data.experiences.length > 0) {
      cv += '=== EXPÉRIENCE PROFESSIONNELLE ===\n';
      data.experiences.forEach((exp: any) => {
        cv += `${exp.title}\n`;
        cv += `${exp.company}`;
        if (exp.startDate || exp.endDate) {
          cv += ` | ${exp.startDate || '?'} - ${exp.endDate || 'Présent'}`;
        }
        cv += '\n';
        if (exp.description) {
          cv += `${exp.description}\n`;
        }
        cv += '\n';
      });
    }

    // Formation
    if (data.education && data.education.length > 0) {
      cv += '=== FORMATION ===\n';
      data.education.forEach((edu: any) => {
        if (edu.degree) cv += `${edu.degree}`;
        if (edu.fieldOfStudy) cv += ` - ${edu.fieldOfStudy}`;
        cv += '\n';
        cv += `${edu.school}`;
        if (edu.year) cv += ` - ${edu.year}`;
        cv += '\n\n';
      });
    }

    // Compétences
    if (data.skills && data.skills.length > 0) {
      cv += '=== COMPÉTENCES ===\n';
      cv += data.skills.join(' • ') + '\n\n';
    }

    // Langues
    if (data.languages && data.languages.length > 0) {
      cv += '=== LANGUES ===\n';
      cv += data.languages.join(', ') + '\n';
    }

    return cv;
  };

  // Generate CV text from questionnaire data
  const generateCVFromQuestionnaire = (data: any): string => {
    let cv = '';

    // Header
    cv += `${data.firstName} ${data.lastName}\n`;
    if (data.email) cv += `Email: ${data.email}\n`;
    if (data.phone) cv += `Téléphone: ${data.phone}\n`;
    if (data.location) cv += `Localisation: ${data.location}\n`;
    if (data.linkedin) cv += `LinkedIn: ${data.linkedin}\n`;
    if (data.portfolio) cv += `Portfolio: ${data.portfolio}\n`;
    cv += '\n';

    // Objectif professionnel
    cv += '=== OBJECTIF PROFESSIONNEL ===\n';
    cv += `${data.targetJob} - ${data.targetSector}\n`;
    cv += `Niveau: ${data.careerLevel}\n\n`;

    // Formation
    if (data.education.length > 0) {
      cv += '=== FORMATION ===\n';
      data.education.forEach((edu: any) => {
        cv += `${edu.degree}\n`;
        cv += `${edu.school}`;
        if (edu.year) cv += ` - ${edu.year}`;
        cv += '\n\n';
      });
    }

    // Expérience professionnelle
    if (data.experiences.length > 0) {
      cv += '=== EXPÉRIENCE PROFESSIONNELLE ===\n';
      data.experiences.forEach((exp: any) => {
        cv += `${exp.position}\n`;
        cv += `${exp.company}`;
        if (exp.startDate || exp.endDate) {
          cv += ` | ${exp.startDate || '?'} - ${exp.endDate || 'Présent'}`;
        }
        cv += '\n';
        if (exp.description) {
          cv += `${exp.description}\n`;
        }
        cv += '\n';
      });
    }

    // Compétences
    if (data.skills.length > 0) {
      cv += '=== COMPÉTENCES TECHNIQUES ===\n';
      cv += data.skills.join(' • ') + '\n\n';
    }

    // Langues
    if (data.languages.length > 0) {
      cv += '=== LANGUES ===\n';
      data.languages.forEach((lang: any) => {
        cv += `${lang.name}: ${lang.level}\n`;
      });
      cv += '\n';
    }

    // Centres d'intérêt
    if (data.hobbies) {
      cv += '=== CENTRES D\'INTÉRÊT ===\n';
      cv += `${data.hobbies}\n`;
    }

    return cv;
  };

  // Import CV
  const handleImport = useCallback(async () => {
    try {
      const result = await window.electron.importCV();
      if (result?.text) {
        setCvFile({ text: result.text, filename: result.filename });
        setCvView('loaded');
        setReport(null);
        setError(null);
      }
    } catch (err) {
      setError('Erreur lors de l\'import du fichier');
    }
  }, []);

  // Analyze CV
  const handleAnalyze = useCallback(async () => {
    if (!cvFile) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisPhase('reading');
    setAnonymizationStats(null);

    try {
      // Phase 1: Reading
      await new Promise(resolve => setTimeout(resolve, 800));

      // Phase 2: Anonymizing (Backend BERT Optimized)
      setAnalysisPhase('anonymizing');
      
      // On laisse le backend gérer l'anonymisation avec le moteur BERT amélioré (Regex Socials + ORG kept)
      // C'est instantané et conforme RGPD "Pseudonymisation"

      // Phase 3: Analyzing
      await new Promise(resolve => setTimeout(resolve, 800)); // Petit délai UX
      setAnalysisPhase('analyzing');

      // Appel Backend Standard (skipAnonymization: false par défaut)
      const result = await window.electron.analyzeCV({
        cvText: cvFile.text,
        filename: cvFile.filename
      });

      if (result.success) {
        // Wait a bit more to show the analyzing phase
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Phase 4: Complete
        setAnalysisPhase('complete');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Le backend a déjà dé-anonymisé le résultat
        const finalText = result.result; 

        // Mise à jour des stats d'anonymisation pour l'UI
        if (result.anonymizationStats) {
             setAnonymizationStats({
                 totalMasked: result.anonymizationStats.totalMasked,
                 byType: result.anonymizationStats.byType
             });
        }

        const parsed = parseReport(finalText);
        setReport(parsed);
        setCvView('report');
        setStats({
          latency: result.latency,
          masked: result.anonymizationStats?.totalMasked || 0
        });
      } else {
        setError(result.error || 'Erreur lors de l\'analyse');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Erreur inattendue');
    } finally {
      setIsAnalyzing(false);
      setAnalysisPhase('reading');
    }
  }, [cvFile]);

  // Reset to choice view
  const handleReset = useCallback(() => {
    setCvView('choice');
    setCvFile(null);
    setReport(null);
    setStats(null);
    setError(null);
  }, []);

  // ============================================================
  // STYLES
  // ============================================================

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      fontFamily: typography.fontFamily.sans,
    },
    main: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      minHeight: 'calc(100vh - 70px)',
    },
    uploadBox: {
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center' as const,
    },
    iconBox: {
      width: '80px',
      height: '80px',
      margin: '0 auto 1.5rem',
      borderRadius: borderRadius.xl,
      backgroundColor: theme.accent.muted,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.accent.primary,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: '0.75rem',
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      marginBottom: '2rem',
      lineHeight: typography.lineHeight.relaxed,
    },
    uploadButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 2rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.xl,
      cursor: 'pointer',
      transition: transitions.fast,
      boxShadow: theme.shadow.md,
    },
    hint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      marginTop: '1rem',
    },
    privacyBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      padding: '0.5rem 1rem',
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.full,
      color: theme.text.tertiary,
      fontSize: typography.fontSize.xs,
    },
    fileCard: {
      padding: '1.5rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.xl,
      border: `1px solid ${theme.border.light}`,
      marginBottom: '1.5rem',
    },
    fileIcon: {
      width: '48px',
      height: '48px',
      margin: '0 auto 1rem',
      borderRadius: borderRadius.lg,
      backgroundColor: theme.semantic.successBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.semantic.success,
    },
    errorBox: {
      padding: '1rem',
      backgroundColor: theme.semantic.errorBg,
      borderRadius: borderRadius.lg,
      color: theme.semantic.error,
      fontSize: typography.fontSize.sm,
      marginBottom: '1.5rem',
    },
    buttonGroup: { 
      display: 'flex', 
      gap: '1rem', 
      justifyContent: 'center' 
    },
    secondaryButton: {
      padding: '0.875rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: 'transparent',
      color: theme.text.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
    },
    themeButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    primaryButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.875rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
    },
  };

  // ============================================================
  // RENDER CV COACH CONTENT
  // ============================================================

  const renderCVContent = () => {
    if (showSplash) {
      return <SplashScreenModern onComplete={() => setShowSplash(false)} isAppReady={isAppReady} />;
    }

    // Choice state
    if (cvView === 'choice') {
      return <CVChoice onSelectPath={handleSelectPath} />;
    }

    // Scratch state
    if (cvView === 'scratch') {
      return (
        <CVWizard
          onBack={() => setCvView('choice')}
          onComplete={handleQuestionnaireComplete}
        />
      );
    }

    // Upload state
    if (cvView === 'upload') {
      return (
        <div style={styles.main}>
          <div style={styles.uploadBox}>
            <div style={styles.iconBox}>
              <Icons.FileText />
            </div>
            <h1 style={styles.title}>Analyse ton CV</h1>
            <p style={styles.subtitle}>
              Obtiens une analyse détaillée de ton CV avec des recommandations concrètes pour l'améliorer.
            </p>
            <button onClick={handleImport} style={styles.uploadButton}>
              <Icons.Upload />
              Charger mon CV
            </button>
            <p style={styles.hint}>Formats acceptés : PDF, TXT</p>
          </div>
        </div>
      );
    }

    // File loaded state
    if (cvView === 'loaded') {
      return (
        <div style={styles.main}>
          <div style={styles.uploadBox}>
            <div style={styles.fileCard}>
              <div style={styles.fileIcon}>
                <Icons.FileText />
              </div>
              <p style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: theme.text.primary, marginBottom: '0.25rem' }}>
                {cvFile?.filename}
              </p>
              <p style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
                {cvFile?.text.length.toLocaleString()} caractères
              </p>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.buttonGroup}>
              <button onClick={() => { setCvFile(null); setCvView('upload'); setError(null); }} style={styles.secondaryButton}>
                Changer de fichier
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                style={{ ...styles.primaryButton, opacity: isAnalyzing ? 0.7 : 1, cursor: isAnalyzing ? 'wait' : 'pointer' }}
              >
                {isAnalyzing ? (
                  <>
                    <Icons.Loader />
                    Analyse en cours...
                  </>
                ) : (
                  'Lancer l\'analyse'
                )}
              </button>
            </div>
          </div>

          {/* Animation d'analyse */}
          <AnalysisAnimation
            isActive={isAnalyzing}
            currentPhase={analysisPhase}
            anonymizationStats={anonymizationStats}
          />
        </div>
      );
    }

    // Report state
    if (cvView === 'report' && report) {
      return (
        <div style={styles.container}>
          <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border.light}`, backgroundColor: theme.bg.primary, position: 'sticky' as const, top: 0, zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {stats && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Tag variant="default" size="sm">⏱ {(stats.latency / 1000).toFixed(1)}s</Tag>
                  <Tag variant="success" size="sm">🔒 {stats.masked} protégées</Tag>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={handleReset} style={styles.secondaryButton}>
                Nouveau CV
              </button>
              <button onClick={toggleTheme} style={{ ...styles.themeButton, padding: '0.5rem' }}>
                {mode === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
              </button>
            </div>
          </header>

          <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {isValidReport(report) ? (
              <>
                {/* Diagnostic + Score */}
                <BentoBox columns={3} gap="1.5rem">
                  <DiagnosticCard
                    metier={report.diagnostic.metier}
                    secteur={report.diagnostic.secteur}
                    niveau={report.diagnostic.niveau}
                    experience={report.diagnostic.experience}
                    pointFort={report.diagnostic.pointFort}
                    axeAmelioration={report.diagnostic.axeAmelioration}
                  />
                  <ScoreCard
                    globalScore={report.score.global}
                    details={{
                      impact: report.score.impact,
                      lisibilite: report.score.lisibilite,
                      optimisation: report.score.optimisation,
                    }}
                  />
                </BentoBox>

                <Divider margin="2rem 0" />

                {/* Expériences */}
                <section style={{ marginBottom: '2rem' }}>
                  <SectionHeader
                    title="Analyse des expériences"
                    subtitle={`${report.experiences.length} expérience${report.experiences.length > 1 ? 's' : ''} analysée${report.experiences.length > 1 ? 's' : ''}`}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {report.experiences.map((exp: any, idx: number) => (
                      <ExperienceCard
                        key={idx}
                        company={exp.company}
                        poste={exp.poste}
                        dates={exp.dates}
                        pertinence={exp.pertinence}
                        pointsForts={exp.pointsForts}
                        pointsFaibles={exp.pointsFaibles}
                        verdict={exp.verdict}
                      />
                    ))}
                  </div>
                </section>

                <Divider margin="2rem 0" />

                {/* ATS */}
                <section style={{ marginBottom: '2rem' }}>
                  <ATSTable
                    secteur={report.ats.secteur}
                    sousSpecialite={report.ats.sousSpecialite}
                    present={report.ats.present}
                    missing={report.ats.missing}
                  />
                </section>

                <Divider margin="2rem 0" />

                {/* Reformulations */}
                {report.reformulations.length > 0 && (
                  <section style={{ marginBottom: '2rem' }}>
                    <SectionHeader title="Reformulations suggérées" subtitle="Améliore l'impact de tes phrases" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {report.reformulations.map((ref: any, idx: number) => (
                        <ReformulationCard key={idx} index={idx + 1} before={ref.before} after={ref.after} gain={ref.gain} />
                      ))}
                    </div>
                  </section>
                )}

                <Divider margin="2rem 0" />

                {/* Actions */}
                {report.actions.length > 0 && (
                  <section style={{ marginBottom: '2rem' }}>
                    <SectionHeader title="Plan d'action" subtitle="3 priorités pour améliorer ton CV" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {report.actions.map((action: any, idx: number) => (
                        <ActionCard
                          key={idx}
                          priority={action.priority}
                          title={action.title}
                          description={action.description}
                          impact={action.impact}
                          duration={action.duration}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Conclusion */}
                {report.conclusion && (
                  <section style={{
                    padding: '2rem',
                    backgroundColor: theme.bg.secondary,
                    borderRadius: borderRadius.xl,
                    border: `1px solid ${theme.border.light}`,
                    textAlign: 'center',
                  }}>
                    <p style={{
                      fontSize: typography.fontSize.lg,
                      color: theme.text.primary,
                      lineHeight: typography.lineHeight.relaxed,
                      maxWidth: '800px',
                      margin: '0 auto',
                    }}>
                      {report.conclusion}
                    </p>
                  </section>
                )}
              </>
            ) : (
              <BentoCard padding="2rem">
                <SectionHeader title="Résultat de l'analyse" />
                <pre style={{
                  fontSize: typography.fontSize.sm,
                  color: theme.text.secondary,
                  whiteSpace: 'pre-wrap',
                  fontFamily: typography.fontFamily.mono,
                }}>
                  {report?.raw || 'Aucun résultat'}
                </pre>
              </BentoCard>
            )}
          </main>
        </div>
      );
    }

    return null;
  };

  // --- BREADCRUMB LOGIC ---
  const getPageTitle = (view: CVView): string | null => {
      const titles: Record<CVView, string> = {
          choice: 'Accueil',
          upload: 'Analyse Rapide',
          scratch: 'Création Assistant',
          linkedin: 'Import LinkedIn',
          loaded: 'Prêt à analyser',
          report: 'Rapport d\'analyse'
      };
      return titles[view] || null;
  };

  const pageTitle = getPageTitle(cvView);

  // ============================================================
  // RENDER WITH SHELL
  // ============================================================

  return (
    <>
      {/* Onboarding overlay */}
      {showOnboarding && <OnboardingCarousel onComplete={handleOnboardingComplete} />}

      {/* LinkedIn Import Modal */}
      <LinkedInImportModal
        isOpen={showLinkedInModal}
        onClose={() => setShowLinkedInModal(false)}
        onImport={handleLinkedInImport}
      />

      {/* Main app */}
      <Shell 
        onShowTutorial={handleShowTutorial} 
        pageTitle={pageTitle}
        onResetModule={() => setCvView('choice')}
      >
        {renderCVContent()}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </Shell>
    </>
  );
};

// ============================================================
// ELECTRON TYPES
// ============================================================

declare global {
  interface Window {
    electron: {
      getSystemStatus: () => Promise<any>;
      analyzeCV: (params: { cvText: string; filename: string }) => Promise<any>;
      importCV: () => Promise<{ text: string; filename: string; charCount: number } | null>;
      importLinkedIn: (url: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      saveToVault: (data: any) => Promise<any>;
      loadHistory: () => Promise<any[]>;
      savePDF: (buffer: ArrayBuffer) => Promise<any>;
    };
  }
}

// ============================================================
// APP WITH THEME PROVIDER
// ============================================================

const App: React.FC = () => (
  <ThemeProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </ThemeProvider>
);

export default App;
