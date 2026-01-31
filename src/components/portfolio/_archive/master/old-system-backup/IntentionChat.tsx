import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { GlassInput } from '../../ui/GlassForms';
import { TargetIcons, PriorityIcons, PracticalIcons } from './IntentionIcons';

interface IntentionData {
  portfolioTarget: string;
  portfolioTargetOther?: string;
  keyPriorities: string[];
  keyPriorityOther?: string;
  practicalInfo: string[];
}

interface IntentionChatProps {
  onComplete: (data: IntentionData) => void;
  onBack: () => void;
  initialData?: IntentionData; 
  startingStep?: 1 | 2 | 3;
}

const TARGET_OPTIONS = [
  { id: 'personal', icon: TargetIcons.personal, label: 'Moi-même', desc: 'Personnel / Freelance' },
  { id: 'company', icon: TargetIcons.company, label: 'Une entreprise', desc: '' },
  { id: 'shop', icon: TargetIcons.shop, label: 'Une boutique', desc: 'Commerce local' },
  { id: 'restaurant', icon: TargetIcons.restaurant, label: 'Un restaurant', desc: 'Café / Bar' },
  { id: 'cabinet', icon: TargetIcons.cabinet, label: 'Un cabinet', desc: 'Avocat, notaire...' },
  { id: 'health', icon: TargetIcons.health, label: 'Un praticien', desc: 'Santé / Bien-être' },
  { id: 'artistic', icon: TargetIcons.artistic, label: 'Un projet artistique', desc: '' },
  { id: 'other', icon: TargetIcons.other, label: 'Autre', desc: 'Préciser' },
];

const PRIORITY_OPTIONS = [
  { id: 'attract_clients', icon: PriorityIcons.attract_clients, label: 'Attirer de nouveaux clients' },
  { id: 'show_expertise', icon: PriorityIcons.show_expertise, label: 'Montrer mon expertise' },
  { id: 'showcase_work', icon: PriorityIcons.showcase_work, label: 'Mettre en avant mes réalisations' },
  { id: 'easy_contact', icon: PriorityIcons.easy_contact, label: 'Faciliter la prise de contact' },
  { id: 'show_pricing', icon: PriorityIcons.show_pricing, label: 'Afficher mes tarifs' },
  { id: 'build_trust', icon: PriorityIcons.build_trust, label: 'Inspirer confiance' },
  { id: 'seo', icon: PriorityIcons.seo, label: 'Être trouvé sur Google' },
  { id: 'other', icon: PriorityIcons.other, label: 'Autre' },
];

const PRACTICAL_INFO_OPTIONS = [
  { id: 'hours', icon: PracticalIcons.hours, label: "Horaires d'ouverture" },
  { id: 'address', icon: PracticalIcons.address, label: 'Adresse / localisation' },
  { id: 'phone', icon: PracticalIcons.phone, label: 'Téléphone' },
  { id: 'email', icon: PracticalIcons.email, label: 'Email de contact' },
  { id: 'pricing', icon: PracticalIcons.pricing, label: 'Tarifs / grille tarifaire' },
  { id: 'booking', icon: PracticalIcons.booking, label: 'Prise de rendez-vous' },
  { id: 'socials', icon: PracticalIcons.socials, label: 'Réseaux sociaux' },
  { id: 'none', icon: PracticalIcons.none, label: 'Aucune information pratique' },
];

export const IntentionChat: React.FC<IntentionChatProps> = ({
  onComplete,
  onBack,
  initialData,
  startingStep = 1,
}) => {
  const { theme, mode } = useTheme();
  const [step, setStep] = useState(startingStep);
  
  const [data, setData] = useState<IntentionData>(initialData || {
    portfolioTarget: '',
    portfolioTargetOther: '',
    keyPriorities: [],
    keyPriorityOther: '',
    practicalInfo: [],
  });

  const totalSteps = 3;
  const isEditMode = initialData !== undefined;

  // Handlers
  const handleTargetSelect = (targetId: string) => setData(prev => ({ ...prev, portfolioTarget: targetId }));
  
  const togglePriority = (priorityId: string) => {
    setData(prev => ({
      ...prev,
      keyPriorities: prev.keyPriorities.includes(priorityId)
        ? prev.keyPriorities.filter(p => p !== priorityId)
        : [...prev.keyPriorities, priorityId],
    }));
  };

  const togglePracticalInfo = (infoId: string) => {
    if (infoId === 'none') {
      setData(prev => ({ ...prev, practicalInfo: ['none'] }));
      return;
    }
    setData(prev => ({
      ...prev,
      practicalInfo: prev.practicalInfo.includes('none')
        ? [infoId]
        : prev.practicalInfo.includes(infoId)
          ? prev.practicalInfo.filter(i => i !== infoId)
          : [...prev.practicalInfo, infoId],
    }));
  };

  const canContinue = () => {
    switch (step) {
      case 1: return data.portfolioTarget !== '';
      case 2: return data.keyPriorities.length > 0;
      case 3: return data.practicalInfo.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (isEditMode) { onComplete(data); return; }
    if (step < totalSteps) setStep((step + 1) as 1 | 2 | 3);
    else onComplete(data);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
    else onBack();
  };

  // Render Helpers
  const renderOptionGrid = (options: any[], selectedIds: string | string[], onSelect: (id: string) => void, type: 'single' | 'multiple') => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem'
    }}>
        {options.map(opt => {
            const isSelected = type === 'single' 
                ? selectedIds === opt.id 
                : (selectedIds as string[]).includes(opt.id);
            
            return (
                <motion.button
                    key={opt.id}
                    layout
                    onClick={() => onSelect(opt.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem 1rem',
                        background: isSelected 
                            ? theme.accent.primary 
                            : (mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)'),
                        border: `1px solid ${isSelected ? theme.accent.primary : theme.border.default}`,
                        borderRadius: '20px',
                        color: isSelected ? '#fff' : theme.text.primary,
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: isSelected 
                            ? `0 10px 20px -5px ${theme.accent.primary}66`
                            : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{opt.icon}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{opt.label}</span>
                    {opt.desc && <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>{opt.desc}</span>}
                </motion.button>
            )
        })}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
       {/* Header (20vh) */}
       <div style={{ 
           minHeight: '20vh', 
           display: 'flex', 
           flexDirection: 'column',
           justifyContent: 'center',
           alignItems: 'center',
           textAlign: 'center',
           marginBottom: '1rem'
       }}>
           <button
            onClick={handleBack}
            style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              background: 'none',
              border: 'none',
              color: theme.text.secondary,
              cursor: 'pointer',
              fontSize: '0.95rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem'
            }}
           >
             ← Retour
           </button>

           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
             >
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '24px',
                    background: theme.accent.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    boxShadow: `0 10px 30px -10px ${theme.accent.primary}`,
                    margin: '0 auto 1.5rem auto',
                    color: '#fff' 
                }}>
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><path d="M9 12h6"/><path d="M15 16h.01"/><path d="M8.5 16h.01"/></svg>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: theme.text.primary, marginBottom: '0.5rem' }}>
                    {step === 1 && "Pour qui créez-vous ce portfolio ?"}
                    {step === 2 && "Votre priorité absolue ?"}
                    {step === 3 && "Infos pratiques à afficher"}
                </h1>
                <p style={{ fontSize: '1.1rem', color: theme.text.secondary }}>
                    {step === 1 && "Cela m'aide à adapter le ton et la structure."}
                    {step === 2 && "Je mettrai l'accent sur ces éléments."}
                    {step === 3 && "Dernière étape avant l'analyse !"}
                </p>
             </motion.div>
           </AnimatePresence>
       </div>

       {/* Content Glass Container */}
       <div style={{
           maxWidth: '900px',
           width: '100%',
           margin: '0 auto',
           flex: 1
       }}>
           <AnimatePresence mode="wait">
               <motion.div
                 key={step}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3 }}
               >
                   {step === 1 && (
                       <>
                           {renderOptionGrid(TARGET_OPTIONS, data.portfolioTarget, handleTargetSelect, 'single')}
                           {data.portfolioTarget === 'other' && (
                               <div style={{ marginTop: '1.5rem' }}>
                                   <GlassInput 
                                      label="Précisez" 
                                      value={data.portfolioTargetOther || ''} 
                                      onChange={(e) => setData(prev => ({ ...prev, portfolioTargetOther: e.target.value }))}
                                      autoFocus
                                   />
                               </div>
                           )}
                       </>
                   )}

                   {step === 2 && (
                       <>
                           {renderOptionGrid(PRIORITY_OPTIONS, data.keyPriorities, togglePriority, 'multiple')}
                           {data.keyPriorities.includes('other') && (
                               <div style={{ marginTop: '1.5rem' }}>
                                    <GlassInput 
                                      label="Précisez votre priorité" 
                                      value={data.keyPriorityOther || ''} 
                                      onChange={(e) => setData(prev => ({ ...prev, keyPriorityOther: e.target.value }))}
                                      autoFocus
                                   />
                               </div>
                           )}
                       </>
                   )}

                   {step === 3 && renderOptionGrid(PRACTICAL_INFO_OPTIONS, data.practicalInfo, togglePracticalInfo, 'multiple')}

               </motion.div>
           </AnimatePresence>

           <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
               <button
                  onClick={handleNext}
                  disabled={!canContinue()}
                  style={{
                      padding: '1rem 3rem',
                      borderRadius: '16px',
                      border: 'none',
                      background: canContinue() ? theme.accent.primary : theme.bg.tertiary,
                      color: canContinue() ? '#fff' : theme.text.tertiary,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      cursor: canContinue() ? 'pointer' : 'not-allowed',
                      boxShadow: canContinue() ? `0 10px 20px -5px ${theme.accent.primary}66` : 'none',
                      transition: 'all 0.3s ease'
                  }}
               >
                   {isEditMode ? 'Terminer' : (step === 3 ? 'Lancer l\'analyse ✨' : 'Continuer')}
               </button>
           </div>
       </div>
    </div>
  );
};
