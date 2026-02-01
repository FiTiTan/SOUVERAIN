import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../../ThemeContext';
import { PortfolioLanding } from './PortfolioLanding';
import { MasterPortfolioView } from './master/MasterPortfolioView';
import { PortfolioSelector } from './master/PortfolioSelector';
import { PortfolioWizard } from './wizard/PortfolioWizard';
import { PortfolioWizardV2 } from './wizard/PortfolioWizardV2';
import { PortfolioFinalPreview } from './master/PortfolioFinalPreview';
import { MediathequeView } from './mediatheque/MediathequeView';
import { ProjectHub } from './projects/ProjectHub';
import { ConfigView } from './config/ConfigView';
import { IntentionForm } from './intention/IntentionForm';
import { EditablePreviewScreen } from './EditablePreviewScreen';
import {
    hasCompletedIntention,
    saveIntention,
    type IntentionFormData
} from '../../services/intentionService';
import { renderPortfolioHTML, savePortfolioToDB } from '../../services/portfolioRenderService';
import type { PortfolioFormData } from './wizard/types';
import { useToast } from '../ui/NotificationToast';
import { AnalysisAnimation } from '../AnalysisAnimation';
import { ModernLoader } from '../ui/ModernLoader';

type PortfolioView = 'landing' | 'mpf' | 'projects' | 'mediatheque' | 'config';
type MPFScreen = 'selector' | 'wizard' | 'generating' | 'editable-preview' | 'preview' | 'mpf-view';

/**
 * Convert File objects in media array to data URLs
 */
async function convertMediaToDataURLs(data: PortfolioFormData): Promise<PortfolioFormData> {
    if (!data.media || data.media.length === 0) {
        return data;
    }

    const convertedMedia = await Promise.all(
        data.media.map(async (item: any) => {
            // Si c'est déjà un objet Media avec url (déjà cropé et converti), on le garde tel quel
            if (item && typeof item === 'object' && 'url' in item && typeof item.url === 'string') {
                return item;
            }

            // Si c'est un File, on le convertit en data URL (fallback, normalement déjà converti par le tagging)
            if (item instanceof File) {
                return new Promise<{url: string, alt?: string}>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve({
                            url: reader.result as string,
                            alt: item.name
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(item);
                });
            }

            // Sinon on retourne tel quel
            return item;
        })
    );

    return {
        ...data,
        media: convertedMedia
    };
}

export const PortfolioHub: React.FC = () => {
    const { theme } = useTheme();
    const toast = useToast();
    const [currentView, setCurrentView] = useState<PortfolioView>('landing');
    const [mpfScreen, setMpfScreen] = useState<MPFScreen>('selector');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
    const [portfolioId, setPortfolioId] = useState<string | null>(null);
    const [projectCount, setProjectCount] = useState(0);
    const [mediaCount, setMediaCount] = useState(0);
    const [isPremium, setIsPremium] = useState(false);

    // New wizard data
    const [wizardData, setWizardData] = useState<PortfolioFormData | null>(null);
    const [generatedHTML, setGeneratedHTML] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Fetch portfolio ID and counts
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            console.log('[PortfolioHub] Starting data fetch...');
            try {
                // @ts-ignore
                const portfolioResult = await window.electron.portfolio.getAll();
                console.log('[PortfolioHub] Portfolio result:', portfolioResult);

                if (!isMounted) return;

                if (portfolioResult && portfolioResult.success && portfolioResult.portfolios.length > 0) {
                    const primary = portfolioResult.portfolios.find((p: any) => p.is_primary) || portfolioResult.portfolios[0];
                    setPortfolioId(primary.id);
                    console.log('[PortfolioHub] Primary portfolio ID:', primary.id);

                    // Fetch project count for the primary portfolio
                    // @ts-ignore
                    const projectsResult = await window.electron.portfolio.getAllProjects(primary.id);
                    if (isMounted && projectsResult && projectsResult.success) {
                        setProjectCount(projectsResult.projects.length);
                    }

                    // Fetch media count for the primary portfolio
                    // @ts-ignore
                    const mediaResult = await window.electron.mediatheque.getAll(primary.id);
                    if (isMounted && mediaResult) {
                        setMediaCount(mediaResult.length || 0);
                    }
                    
                    // Force hasCompletedOnboarding to be checked
                    if (isMounted) {
                        setHasCompletedOnboarding(null);
                    }
                } else {
                    // No portfolio found - trigger onboarding flow
                    console.log('[PortfolioHub] No portfolio found, initializing onboarding flow');
                    setPortfolioId(null);
                    setHasCompletedOnboarding(false);
                }
            } catch (e) {
                console.error("[PortfolioHub] Failed to fetch portfolio data:", e);
                if (isMounted) {
                    setHasCompletedOnboarding(false);
                }
            }
        };
        
        // Timeout de sécurité : 5 secondes max
        const timeout = setTimeout(() => {
            if (isMounted) {
                console.warn('[PortfolioHub] Fetch timeout - forcing completion');
                setHasCompletedOnboarding(false);
            }
        }, 5000);
        
        fetchData().finally(() => clearTimeout(timeout));
        
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, []);

    // Check premium status
    useEffect(() => {
        let isMounted = true;
        
        const checkPremium = async () => {
            console.log('[PortfolioHub] Checking premium status...');
            try {
                // @ts-ignore
                const status = await window.electron.invoke('get-premium-status');
                if (isMounted) {
                    console.log('[PortfolioHub] Premium status:', status);
                    setIsPremium(status?.isPremium || false);
                }
            } catch (e) {
                console.error("[PortfolioHub] Failed to check premium status:", e);
                if (isMounted) {
                    setIsPremium(false);
                }
            }
        };
        
        // Timeout de sécurité : 2 secondes max
        const timeout = setTimeout(() => {
            if (isMounted) {
                console.warn('[PortfolioHub] Premium check timeout');
                setIsPremium(false);
            }
        }, 2000);
        
        checkPremium().finally(() => clearTimeout(timeout));
        
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, []);

    // Check onboarding status
    useEffect(() => {
        let isMounted = true;
        
        const checkOnboarding = async () => {
            console.log('[PortfolioHub] Checking onboarding for portfolioId:', portfolioId);
            
            if (!portfolioId) {
                console.log('[PortfolioHub] No portfolio ID - skipping onboarding');
                if (isMounted) {
                    setHasCompletedOnboarding(false);
                }
                return;
            }

            try {
                const completed = await hasCompletedIntention(portfolioId);
                console.log('[PortfolioHub] Onboarding completed:', completed);
                if (isMounted) {
                    setHasCompletedOnboarding(completed);
                }
            } catch (error) {
                console.error('[PortfolioHub] Error checking onboarding:', error);
                // En cas d'erreur, considérer comme non complété
                if (isMounted) {
                    setHasCompletedOnboarding(false);
                }
            }
        };
        
        // Timeout de sécurité : 1.5 secondes max (réduit pour réactivité)
        const timeout = setTimeout(() => {
            if (isMounted) {
                console.warn('[PortfolioHub] Onboarding check timeout - forcing false');
                setHasCompletedOnboarding(false);
            }
        }, 1500);
        
        checkOnboarding().finally(() => {
            if (isMounted) {
                clearTimeout(timeout);
            }
        });
        
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [portfolioId]);

    // Memoized styles
    const containerStyle = useMemo(() => ({
        height: '100vh',
        overflow: 'hidden' as const,
        backgroundColor: theme.bg.primary
    }), [theme]);

    const loadingContainerStyle = useMemo(() => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: theme.bg.primary
    }), [theme]);

    const onboardingOverlayStyle = useMemo(() => ({
        position: 'fixed' as const,
        inset: 0,
        zIndex: 50,
        backgroundColor: theme.bg.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
    }), [theme]);

    // Handler: Portfolio selected from selector
    const handlePortfolioSelect = useCallback((id: string) => {
        setPortfolioId(id);
        setMpfScreen('mpf-view');
    }, []);

    // Handler: Wizard completed - generate HTML
    const handleWizardComplete = useCallback(async (data: PortfolioFormData) => {
        console.log('[PortfolioHub] ========== WIZARD COMPLETE ==========');
        console.log('[PortfolioHub] Full data:', data);
        console.log('[PortfolioHub] uploadedFiles:', data.uploadedFiles);
        console.log('[PortfolioHub] uploadedFiles count:', data.uploadedFiles?.length || 0);
        console.log('[PortfolioHub] media:', data.media);
        console.log('[PortfolioHub] media count:', data.media?.length || 0);
        console.log('[PortfolioHub] ====================================');
        
        setWizardData(data);
        setMpfScreen('generating');
        setIsGenerating(true);

        try {
            // Wait for animation
            await new Promise(r => setTimeout(r, 2000));

            // Convert File objects to data URLs for media
            console.log('[PortfolioHub] Converting media to data URLs...');
            const convertedData = await convertMediaToDataURLs(data);
            console.log('[PortfolioHub] Converted media:', convertedData.media);

            // Generate HTML from template
            if (!convertedData.selectedTemplateId) {
                throw new Error('No template selected');
            }

            const result = await renderPortfolioHTML({
                formData: convertedData,
                templateId: convertedData.selectedTemplateId,
            });

            // Vérifier le résultat
            console.log('[PortfolioHub] 🔍 CHECKING RESULT:', result);
            console.log('[PortfolioHub] typeof result:', typeof result);
            console.log('[PortfolioHub] result?.success:', result?.success);
            console.log('[PortfolioHub] result?.html length:', result?.html?.length);
            
            if (!result) {
                console.error('[PortfolioHub] ❌ Result is null/undefined');
                throw new Error('Aucun résultat de génération');
            }

            // Si c'est directement le HTML (string)
            if (typeof result === 'string') {
                console.log('[PortfolioHub] ✅ Result is string, length:', result.length);
                setGeneratedHTML(result);
                setIsGenerating(false);
                setMpfScreen('editable-preview'); // Passer à l'écran éditable
                toast.success('Succès', 'Portfolio généré avec succès !');
                return;
            }

            // Si c'est un objet { success, html }
            if (result.success && result.html) {
                console.log('[PortfolioHub] ✅ Result is object with success=true and html');
                setGeneratedHTML(result.html);
                setIsGenerating(false);
                setMpfScreen('editable-preview'); // Passer à l'écran éditable
                toast.success('Succès', 'Portfolio généré avec succès !');

                // Save en background (non bloquant)
                savePortfolioToDB(portfolioId || '', result.html, data).catch(err => {
                    console.warn('[PortfolioHub] Save failed:', err);
                });
                return;
            }

            // Erreur de génération
            console.error('[PortfolioHub] ❌ Result exists but invalid:', result);
            throw new Error(result?.error || 'Erreur de génération');

        } catch (error: any) {
            console.error('[PortfolioHub] Generation error:', error);
            setIsGenerating(false);
            toast.error('Erreur', error?.message || 'La génération a échoué');
            setMpfScreen('wizard');
        }
    }, [portfolioId, toast]);

    // Handler: Save from preview
    const handleSavePortfolio = useCallback(() => {
        toast.success('Succès', 'Portfolio sauvegardé !');
        setMpfScreen('selector');
        setCurrentView('landing');
    }, [toast]);

    // Handler: Back from editable preview
    const handleEditablePreviewBack = useCallback(() => {
        setMpfScreen('wizard');
    }, []);

    // Handler: Export from editable preview
    const handleEditablePreviewExport = useCallback((html: string) => {
        setGeneratedHTML(html);
        setMpfScreen('preview');
        toast.success('Succès', 'Portfolio personnalisé ! Vous pouvez maintenant l\'exporter.');
    }, [toast]);

    // Handler: View existing portfolio
    const handleViewPortfolio = useCallback(async (id: string) => {
        try {
            // @ts-ignore
            const portfolio = await window.electron.invoke('portfolio-v2-get-by-id', id);
            if (portfolio && portfolio.content) {
                setPortfolioId(id);
                setGeneratedHTML(portfolio.content);
                setMpfScreen('preview');
            } else {
                toast.warning('Attention', 'Ce portfolio ne contient pas de données générées.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erreur', 'Impossible de charger le portfolio');
        }
    }, [toast]);

    // Handler: Export portfolio
    const handleExportPortfolio = useCallback(async (id: string) => {
         try {
            // @ts-ignore
            const portfolio = await window.electron.invoke('portfolio-v2-get-by-id', id);
            if (portfolio && portfolio.content) {
                 // @ts-ignore
                 await window.electron.invoke('export-portfolio-html', {
                    html: portfolio.content,
                    filename: `${portfolio.name || 'portfolio'}.html`
                 });
                 toast.success('Succès', 'Portfolio exporté !');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erreur', "Erreur lors de l'export");
        }
    }, [toast]);

    // Loading state
    if (hasCompletedOnboarding === null) {
        return (
            <div style={loadingContainerStyle}>
                <ModernLoader message="Initialisation..." size="large" />
            </div>
        );
    }

    // Onboarding overlay
    if (showOnboarding && portfolioId) {
        return (
            <div style={onboardingOverlayStyle}>
                <IntentionForm
                    portfolioId={portfolioId}
                    onComplete={async (data: IntentionFormData) => {
                        await saveIntention(portfolioId, data);
                        setShowOnboarding(false);
                        setHasCompletedOnboarding(true);
                    }}
                    onSkip={() => {
                        setShowOnboarding(false);
                        setHasCompletedOnboarding(true);
                    }}
                />
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {currentView === 'landing' && (
                <PortfolioLanding
                    onNavigate={setCurrentView}
                    projectCount={projectCount}
                    mediaCount={mediaCount}
                />
            )}

            {currentView === 'mpf' && (
                <>
                    {mpfScreen === 'selector' && (
                        <PortfolioSelector
                            onSelect={handlePortfolioSelect}
                            onView={handleViewPortfolio}
                            onExport={handleExportPortfolio}
                            onCreate={() => setMpfScreen('wizard')}
                        />
                    )}

                    {mpfScreen === 'wizard' && (
                        <PortfolioWizardV2
                            onComplete={(data) => {
                                // Convertir les données V2 vers l'ancien format pour compatibilité
                                const legacyData: PortfolioFormData = {
                                    firstName: data.name.split(' ')[0] || data.name,
                                    lastName: data.name.split(' ').slice(1).join(' ') || '',
                                    title: data.title || '',
                                    tagline: data.tagline,
                                    email: data.email || '',
                                    phone: data.phone || '',
                                    socialLinks: data.socialLinks,
                                    bio: data.valueProp,
                                    aboutText: data.valueProp,
                                    services: data.services.map(s => ({ title: s.title, description: s.description })),
                                    media: [],
                                    projects: data.realisations,
                                    templateId: data.templateId,
                                };
                                handleWizardComplete(legacyData);
                            }}
                            onCancel={() => setMpfScreen('selector')}
                        />
                        
                        // Ancien wizard (backup):
                        // <PortfolioWizard
                        //     onComplete={handleWizardComplete}
                        //     onCancel={() => setMpfScreen('selector')}
                        // />
                    )}

                    {mpfScreen === 'generating' && (
                        <AnalysisAnimation
                            isActive={isGenerating}
                            currentPhase="analyzing"
                            customSteps={[
                                { id: 'reading', label: 'Validation des données' },
                                { id: 'anonymizing', label: 'Chargement du template' },
                                { id: 'analyzing', label: 'Génération du HTML' },
                                { id: 'complete', label: 'Finalisation' }
                            ]}
                        />
                    )}

                    {mpfScreen === 'editable-preview' && generatedHTML && wizardData && (
                        <EditablePreviewScreen
                            portfolioData={{
                                firstName: wizardData.name?.split(' ')[0] || '',
                                lastName: wizardData.name?.split(' ').slice(1).join(' ') || '',
                                title: wizardData.tagline || '',
                                bio: wizardData.valueProp,
                                aboutText: wizardData.valueProp,
                                projects: wizardData.projects || [],
                            }}
                            initialHtml={generatedHTML}
                            onBack={handleEditablePreviewBack}
                            onExport={handleEditablePreviewExport}
                        />
                    )}

                    {mpfScreen === 'preview' && generatedHTML && (
                        <PortfolioFinalPreview
                            html={generatedHTML}
                            portfolioData={{
                                id: portfolioId,
                                name: wizardData?.name || 'Mon Portfolio',
                                portfolioId: portfolioId
                            }}
                            onModify={() => setMpfScreen('wizard')}
                            onSave={handleSavePortfolio}
                        />
                    )}

                    {mpfScreen === 'mpf-view' && portfolioId && (
                        <MasterPortfolioView
                            portfolioId={portfolioId}
                            onBack={() => {
                                setMpfScreen('selector');
                                setCurrentView('landing');
                            }}
                        />
                    )}
                </>
            )}

            {currentView === 'projects' && (
                <div style={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
                    <ProjectHub onBack={() => setCurrentView('landing')} />
                </div>
            )}

            {currentView === 'mediatheque' && (
                <div style={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
                    <MediathequeView onBack={() => setCurrentView('landing')} />
                </div>
            )}

            {currentView === 'config' && (
                <ConfigView onBack={() => setCurrentView('landing')} />
            )}
        </div>
    );
};
