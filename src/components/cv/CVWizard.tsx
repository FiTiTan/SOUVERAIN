/**
 * SOUVERAIN - CV Wizard
 * Le nouveau "Assistant de création" avec design Calm & Glassmorphism.
 * Remplace ScratchQuestionnaire.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import { GlassInput, GlassSelect, GlassTextArea } from '../ui/GlassForms';

// ============================================================
// TYPES
// ============================================================

export interface WizardData {
  // Étape 1: Identité
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;

  // Étape 2: Objectif
  targetJob: string;
  targetSector: string;
  careerLevel: 'junior' | 'confirme' | 'senior' | '';

  // Étape 3: Formation
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;

  // Étape 4: Expérience
  experiences: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;

  // Étape 5: Compétences
  skills: string[];
  languages: Array<{ name: string; level: string }>;

  // Étape 6: Extras
  linkedin: string;
  portfolio: string;
  hobbies: string;
}

interface CVWizardProps {
  onBack: () => void;
  onComplete: (data: WizardData) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ============================================================
// UI HELPERS (Local)
// ============================================================

const WizardHeader: React.FC<{ 
  current: number; 
  total: number; 
  title: string; 
  onBack: () => void;
}> = ({ current, total, title, onBack }) => {
  const { theme } = useTheme();
  const progress = (current / total) * 100;

  return (
    <div style={{ paddingBottom: '2rem' }}>
       <button 
         onClick={onBack}
         style={{
            background: 'none',
            border: 'none',
            color: theme.text.tertiary,
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: 0
         }}
       >
         ← Retour au choix
       </button>
       
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
          <div>
              <span style={{ 
                  fontSize: typography.fontSize.sm, 
                  color: theme.accent.primary, 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
              }}>
                  Étape {current}/{total}
              </span>
              <h1 style={{
                  fontSize: typography.fontSize['3xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: theme.text.primary,
                  margin: '0.25rem 0 0 0',
                  letterSpacing: '-0.02em'
              }}>
                  {title}
              </h1>
          </div>
       </div>

       {/* Progress Bar */}
       <div style={{
           width: '100%',
           height: '6px',
           backgroundColor: theme.bg.tertiary,
           borderRadius: borderRadius.full,
           overflow: 'hidden'
       }}>
           <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ type: 'spring', stiffness: 50, damping: 20 }}
               style={{
                   height: '100%',
                   backgroundColor: theme.accent.primary,
               }}
           />
       </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const CVWizard: React.FC<CVWizardProps> = ({ onBack, onComplete }) => {
  const { theme, mode } = useTheme();
  const [step, setStep] = useState<WizardStep>(1);

  // Form State
  const [data, setData] = useState<WizardData>({
    firstName: '', lastName: '', email: '', phone: '', location: '',
    targetJob: '', targetSector: '', careerLevel: '',
    education: [], experiences: [], skills: [], languages: [],
    linkedin: '', portfolio: '', hobbies: ''
  });
  
  // Temp states for lists
  const [tempSkill, setTempSkill] = useState('');
  const [tempLang, setTempLang] = useState({ name: '', level: 'intermediaire' });

  // Helper to update fields
  const update = (field: keyof WizardData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Array Helpers
  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setData(prev => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { position: '', company: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setData(prev => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiences: updated };
    });
  };

  const addSkill = () => {
    if (tempSkill.trim()) {
      setData(prev => ({ ...prev, skills: [...prev.skills, tempSkill.trim()] }));
      setTempSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const addLanguage = () => {
    if (tempLang.name.trim()) {
      setData(prev => ({ ...prev, languages: [...prev.languages, { ...tempLang }] }));
      setTempLang({ name: '', level: 'intermediaire' });
    }
  };

  const removeLanguage = (index: number) => {
    setData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }));
  };

  const stepsInfo = {
      1: { title: "Qui êtes-vous ?", validate: () => data.firstName && data.lastName },
      2: { title: "Votre Objectif", validate: () => data.targetJob && data.targetSector },
      3: { title: "Formation", validate: () => true }, // Optional logic can be stricter
      4: { title: "Expérience", validate: () => true },
      5: { title: "Compétences", validate: () => true },
      6: { title: "Extras", validate: () => true },
      7: { title: "C'est tout bon ?", validate: () => true },
  };

  const currentInfo = stepsInfo[step];

  const handleNext = () => {
      if (step < 7) setStep(prev => (prev + 1) as WizardStep);
      else onComplete(data);
  };

  const handlePrev = () => {
      if (step > 1) setStep(prev => (prev - 1) as WizardStep);
      else onBack();
  };

  return (
    <div style={{
       maxWidth: '800px',
       margin: '0 auto',
       padding: '2rem',
       minHeight: '100%',
       display: 'flex',
       flexDirection: 'column',
       overflowX: 'hidden'
    }}>
       <WizardHeader 
          current={step} 
          total={7} 
          title={currentInfo.title} 
          onBack={onBack}
       />

       {/* Glass Content Area */}
       <motion.div
         layout
         style={{
             backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
             backdropFilter: 'blur(12px)',
             border: `1px solid ${theme.border.light}`,
             borderRadius: borderRadius['2xl'],
             padding: '2rem',
             flex: 1,
             display: 'flex',
             flexDirection: 'column',
             boxShadow: theme.shadow.lg,
             position: 'relative',
             overflow: 'hidden'
         }}
       >
         <AnimatePresence mode="wait">
             <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1 }}
             >
                {/* STEP 1: IDENTITÉ */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <GlassInput
                         label="Prénom"
                         placeholder="Jean"
                         value={data.firstName}
                         onChange={(e) => update('firstName', e.target.value)}
                         required
                         autoFocus
                       />
                       <GlassInput
                         label="Nom"
                         placeholder="Dupont"
                         value={data.lastName}
                         onChange={(e) => update('lastName', e.target.value)}
                         required
                       />
                     </div>
                     <GlassInput
                       label="Email"
                       type="email"
                       placeholder="jean.dupont@example.com"
                       value={data.email}
                       onChange={(e) => update('email', e.target.value)}
                       required
                     />
                     <GlassInput
                       label="Téléphone"
                       type="tel"
                       placeholder="06 12 34 56 78"
                       value={data.phone}
                       onChange={(e) => update('phone', e.target.value)}
                     />
                     <GlassInput
                       label="Localisation"
                       placeholder="Paris, France"
                       value={data.location}
                       onChange={(e) => update('location', e.target.value)}
                     />
                  </motion.div>
                )}

                {/* STEP 2: OBJECTIF */}
                {step === 2 && (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                   >
                      <GlassInput
                        label="Poste visé"
                        placeholder="Ex: Développeur Full Stack, Chef de projet..."
                        value={data.targetJob}
                        onChange={(e) => update('targetJob', e.target.value)}
                        required
                        autoFocus
                      />
                      <GlassInput
                        label="Secteur d'activité"
                        placeholder="Ex: Tech, Finance, Santé..."
                        value={data.targetSector}
                        onChange={(e) => update('targetSector', e.target.value)}
                        required
                      />
                      <GlassSelect
                        label="Niveau d'expérience"
                        value={data.careerLevel}
                        onChange={(e) => update('careerLevel', e.target.value)}
                        options={[
                          { value: 'junior', label: 'Junior (0-2 ans)' },
                          { value: 'confirme', label: 'Confirmé (3-5 ans)' },
                          { value: 'senior', label: 'Senior (5+ ans)' },
                        ]}
                        required
                      />
                   </motion.div>
                )}
                {/* STEP 3: FORMATION */}
                {step === 3 && (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                   >
                      {data.education.map((edu, idx) => (
                        <div key={idx} style={{ 
                            marginBottom: '1.5rem', 
                            padding: '1.5rem', 
                            background: theme.bg.secondary, 
                            borderRadius: borderRadius.xl,
                            border: `1px solid ${theme.border.light}`
                        }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                              <h4 style={{ margin: 0, fontSize: typography.fontSize.sm, color: theme.text.secondary }}>Formation #{idx + 1}</h4>
                              <button onClick={() => removeEducation(idx)} style={{ border: 'none', background: 'none', color: theme.semantic.error, cursor: 'pointer' }}>
                                 Supprimer
                              </button>
                           </div>
                           <GlassInput
                             label="Diplôme"
                             placeholder="Ex: Master Informatique"
                             value={edu.degree}
                             onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                             required
                           />
                           <GlassInput
                             label="École / Université"
                             placeholder="Ex: Université Paris-Saclay"
                             value={edu.school}
                             onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                             required
                           />
                           <GlassInput
                             label="Année d'obtention"
                             placeholder="Ex: 2023"
                             value={edu.year}
                             onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                           />
                        </div>
                      ))}
                      <button 
                        onClick={addEducation}
                        style={{
                           width: '100%',
                           padding: '1rem',
                           border: `1px dashed ${theme.border.default}`,
                           background: theme.bg.tertiary,
                           color: theme.text.secondary,
                           borderRadius: borderRadius.lg,
                           cursor: 'pointer',
                           fontWeight: 500,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           gap: '0.5rem'
                        }}
                      >
                         + Ajouter une formation
                      </button>
                   </motion.div>
                )}

                {/* STEP 4: EXPÉRIENCE */}
                {step === 4 && (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                   >
                      {data.experiences.map((exp, idx) => (
                        <div key={idx} style={{ 
                            marginBottom: '1.5rem', 
                            padding: '1.5rem', 
                            background: theme.bg.secondary, 
                            borderRadius: borderRadius.xl,
                            border: `1px solid ${theme.border.light}`
                        }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                              <h4 style={{ margin: 0, fontSize: typography.fontSize.sm, color: theme.text.secondary }}>Expérience #{idx + 1}</h4>
                              <button onClick={() => removeExperience(idx)} style={{ border: 'none', background: 'none', color: theme.semantic.error, cursor: 'pointer' }}>
                                 Supprimer
                              </button>
                           </div>
                           <GlassInput
                             label="Poste"
                             placeholder="Ex: Développeur Front-End"
                             value={exp.position}
                             onChange={(e) => updateExperience(idx, 'position', e.target.value)}
                           />
                           <GlassInput
                             label="Entreprise"
                             placeholder="Ex: Startup Tech"
                             value={exp.company}
                             onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                           />
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                               <GlassInput
                                 label="Date de début"
                                 placeholder="Ex: Jan 2022"
                                 value={exp.startDate}
                                 onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                               />
                               <GlassInput
                                 label="Date de fin"
                                 placeholder="Ex: Présent"
                                 value={exp.endDate}
                                 onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                               />
                           </div>
                           <GlassTextArea
                             label="Description"
                             placeholder="Décrivez vos missions principales..."
                             value={exp.description}
                             onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                             rows={3}
                           />
                        </div>
                      ))}
                      <button 
                        onClick={addExperience}
                        style={{
                           width: '100%',
                           padding: '1rem',
                           border: `1px dashed ${theme.border.default}`,
                           background: theme.bg.tertiary,
                           color: theme.text.secondary,
                           borderRadius: borderRadius.lg,
                           cursor: 'pointer',
                           fontWeight: 500,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           gap: '0.5rem'
                        }}
                      >
                         + Ajouter une expérience
                      </button>
                   </motion.div>
                )}
                {/* STEP 5: COMPÉTENCES */}
                {step === 5 && (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                   >
                      <h3 style={{ fontSize: typography.fontSize.lg, marginBottom: '1rem', color: theme.text.primary }}>Compétences Techniques</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                         <GlassInput
                           label=""
                           placeholder="Ex: React, Node.js, Gestion de projet..."
                           value={tempSkill}
                           onChange={(e) => setTempSkill(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                           style={{ marginBottom: 0, flex: 1 }}
                         />
                         <button 
                           onClick={addSkill}
                           style={{
                              padding: '0 1.5rem',
                              borderRadius: borderRadius.lg,
                              background: theme.accent.primary,
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600,
                              marginTop: '0.5rem' // Align with input
                           }}
                         >
                            Ajouter
                         </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                         {data.skills.map((skill, idx) => (
                            <div key={idx} style={{
                               padding: '0.5rem 1rem',
                               background: theme.bg.tertiary,
                               borderRadius: borderRadius.full,
                               fontSize: typography.fontSize.sm,
                               color: theme.text.primary,
                               display: 'flex',
                               alignItems: 'center',
                               gap: '0.5rem',
                               border: `1px solid ${theme.border.light}`
                            }}>
                               {skill}
                               <button 
                                 onClick={() => removeSkill(idx)}
                                 style={{ border: 'none', background: 'none', cursor: 'pointer', color: theme.text.tertiary, display: 'flex', padding: 0 }}
                               >
                                  ×
                               </button>
                            </div>
                         ))}
                         {data.skills.length === 0 && <span style={{ color: theme.text.tertiary, fontSize: typography.fontSize.sm }}>Aucune compétence ajoutée</span>}
                      </div>

                      <h3 style={{ fontSize: typography.fontSize.lg, marginBottom: '1rem', color: theme.text.primary }}>Langues</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                         <div style={{ flex: 1 }}>
                             <GlassInput
                               label="" // Hidden label
                               placeholder="Ex: Anglais"
                               value={tempLang.name}
                               onChange={(e) => setTempLang(prev => ({ ...prev, name: e.target.value }))}
                               style={{ marginBottom: 0 }}
                             />
                         </div>
                         <div style={{ width: '150px' }}>
                             <GlassSelect
                               label="" // Hidden label
                               options={[
                                   { value: 'debutant', label: 'Débutant' },
                                   { value: 'intermediaire', label: 'Intermédiaire' },
                                   { value: 'courant', label: 'Courant' },
                                   { value: 'bilingue', label: 'Bilingue / Natif' }
                               ]}
                               value={tempLang.level}
                               onChange={(e) => setTempLang(prev => ({ ...prev, level: e.target.value }))}
                               style={{ marginBottom: 0 }}
                             />
                         </div>
                         <button 
                           onClick={addLanguage}
                           style={{
                              padding: '0 1.5rem',
                              borderRadius: borderRadius.lg,
                              background: theme.bg.tertiary,
                              color: theme.text.primary,
                              border: `1px solid ${theme.border.default}`,
                              cursor: 'pointer',
                              fontWeight: 600,
                              marginTop: '0.2rem',
                              height: '46px' // Match input height approx
                           }}
                         >
                            Ajouter
                         </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                         {data.languages.map((lang, idx) => (
                            <div key={idx} style={{
                               padding: '0.5rem 1rem',
                               background: theme.bg.tertiary,
                               borderRadius: borderRadius.full,
                               fontSize: typography.fontSize.sm,
                               color: theme.text.primary,
                               display: 'flex',
                               alignItems: 'center',
                               gap: '0.5rem',
                               border: `1px solid ${theme.border.light}`
                            }}>
                               <span>{lang.name} <span style={{ opacity: 0.6 }}>({lang.level})</span></span>
                               <button 
                                 onClick={() => removeLanguage(idx)}
                                 style={{ border: 'none', background: 'none', cursor: 'pointer', color: theme.text.tertiary, display: 'flex', padding: 0 }}
                               >
                                  ×
                               </button>
                            </div>
                         ))}
                      </div>
                   </motion.div>
                )}

                {/* STEP 6: EXTRAS */}
                {step === 6 && (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                   >
                      <GlassInput
                        label="Lien LinkedIn"
                        placeholder="https://linkedin.com/in/..."
                        value={data.linkedin}
                        onChange={(e) => update('linkedin', e.target.value)}
                      />
                      <GlassInput
                        label="Lien Portfolio / Site Web"
                        placeholder="https://mon-portfolio.com"
                        value={data.portfolio}
                        onChange={(e) => update('portfolio', e.target.value)}
                      />
                      <GlassTextArea
                        label="Centres d'intérêt / Hobbies"
                        placeholder="Ex: Photographie, Marathon, Échecs..."
                        value={data.hobbies}
                        onChange={(e) => update('hobbies', e.target.value)}
                        rows={3}
                      />
                   </motion.div>
                )}

                {/* STEP 7: RÉCAPITULATIF */}
                {step === 7 && (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     style={{ textAlign: 'center' }}
                   >
                      <div style={{ marginBottom: '2rem' }}>
                          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                          <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: theme.text.primary, marginBottom: '0.5rem' }}>
                              Tout est prêt !
                          </h2>
                          <p style={{ color: theme.text.secondary }}>
                              Notre IA va maintenant analyser vos informations pour générer votre CV optimisé.
                          </p>
                      </div>

                      <div style={{ textAlign: 'left', background: theme.bg.secondary, padding: '1.5rem', borderRadius: borderRadius.xl, border: `1px solid ${theme.border.light}` }}>
                          <h4 style={{ margin: '0 0 1rem 0', color: theme.text.secondary, textTransform: 'uppercase', fontSize: typography.fontSize.xs, letterSpacing: '0.05em' }}>Résumé</h4>
                          
                          <div style={{ display: 'grid', gap: '0.5rem', fontSize: typography.fontSize.sm }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: theme.text.tertiary }}>Identité</span>
                                  <span style={{ fontWeight: 500, color: theme.text.primary }}>{data.firstName} {data.lastName}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: theme.text.tertiary }}>Objectif</span>
                                  <span style={{ fontWeight: 500, color: theme.text.primary }}>{data.targetJob}</span>
                              </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: theme.text.tertiary }}>Sections</span>
                                  <span style={{ fontWeight: 500, color: theme.text.primary }}>
                                      {data.education.length} Formations, {data.experiences.length} Exp., {data.skills.length} Compétences
                                  </span>
                              </div>
                          </div>
                      </div>
                   </motion.div>
                )}
             </motion.div>
         </AnimatePresence>

         {/* Footer Actions */}
         <div style={{ 
             display: 'flex', 
             justifyContent: 'space-between', 
             marginTop: '3rem',
             paddingTop: '1.5rem',
             borderTop: `1px solid ${theme.border.light}`
         }}>
             <button
               onClick={handlePrev}
               style={{
                   padding: '0.75rem 1.5rem',
                   borderRadius: borderRadius.lg,
                   border: `1px solid ${theme.border.default}`,
                   background: theme.bg.primary,
                   color: theme.text.secondary,
                   cursor: 'pointer',
                   fontSize: typography.fontSize.sm,
                   fontWeight: 600
               }}
             >
                 Précédent
             </button>

             <button
               onClick={handleNext}
               disabled={!currentInfo.validate()}
               style={{
                   padding: '0.75rem 2rem',
                   borderRadius: borderRadius.lg,
                   border: 'none',
                   background: theme.accent.primary,
                   color: '#fff',
                   cursor: 'pointer',
                   fontSize: typography.fontSize.sm,
                   fontWeight: 600,
                   opacity: currentInfo.validate() ? 1 : 0.5,
                   pointerEvents: currentInfo.validate() ? 'auto' : 'none'
               }}
             >
                 {step === 7 ? 'Terminer' : 'Continuer'}
             </button>
         </div>

       </motion.div>
    </div>
  );
};
