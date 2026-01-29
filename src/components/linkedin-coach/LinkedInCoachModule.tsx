import React, { useState } from 'react';
import { LinkedInCoachHub } from './LinkedInCoachHub';
import { ProfileImport } from './ProfileImport';
import { ProfileAnalysis } from './ProfileAnalysis';
import { ProfileScorecard } from './ProfileScorecard';
import { SectionDetail } from './SectionDetail';
import { ContentSuggestions } from './ContentSuggestions';
import { type LinkedInProfile, type ProfileAnalysis as ProfileAnalysisType, type SectionScore } from '../../services/linkedinCoachService';

type Step = 'hub' | 'import' | 'analysis' | 'scorecard' | 'section-detail' | 'content-gen';

export const LinkedInCoachModule: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('hub');
  const [profile, setProfile] = useState<Partial<LinkedInProfile> | null>(null);
  const [analysis, setAnalysis] = useState<ProfileAnalysisType | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionScore | null>(null);
  const [portfolioId] = useState('default_portfolio'); // TODO: Get from context

  const handleProfileImport = (importedProfile: Partial<LinkedInProfile>) => {
    setProfile(importedProfile);
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = async (analysisResult: ProfileAnalysisType) => {
    setAnalysis(analysisResult);

    // Save to database
    try {
      // @ts-ignore
      await window.electron.invoke('db-save-linkedin-analysis', analysisResult);
    } catch (error) {
      console.error('Error saving analysis:', error);
    }

    setCurrentStep('scorecard');
  };

  const handleAnalysisError = (error: string) => {
    alert(error);
    setCurrentStep('hub');
  };

  const handleSectionClick = (sectionName: string) => {
    const section = analysis?.sections.find(s => s.name === sectionName);
    if (section) {
      setSelectedSection(section);
      setCurrentStep('section-detail');
    }
  };

  const handleCopySuggestion = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion);
    alert('Suggestion copiée !');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'hub':
        return (
          <LinkedInCoachHub
            onAnalyzeProfile={() => setCurrentStep('import')}
            onGenerateContent={() => setCurrentStep('content-gen')}
          />
        );

      case 'import':
        return (
          <ProfileImport
            onNext={handleProfileImport}
            onBack={() => setCurrentStep('hub')}
          />
        );

      case 'analysis':
        return profile ? (
          <ProfileAnalysis
            profile={profile}
            portfolioId={portfolioId}
            onComplete={handleAnalysisComplete}
            onError={handleAnalysisError}
          />
        ) : null;

      case 'scorecard':
        return analysis ? (
          <ProfileScorecard
            analysis={analysis}
            onSectionClick={handleSectionClick}
            onBack={() => setCurrentStep('hub')}
          />
        ) : null;

      case 'section-detail':
        return selectedSection && analysis ? (
          <SectionDetail
            section={selectedSection}
            suggestions={
              selectedSection.name === 'Headline'
                ? analysis.suggestions.headline
                : selectedSection.name === 'About (Résumé)'
                ? analysis.suggestions.about
                : []
            }
            onBack={() => setCurrentStep('scorecard')}
            onCopySuggestion={handleCopySuggestion}
          />
        ) : null;

      case 'content-gen':
        return profile ? (
          <ContentSuggestions
            profile={profile}
            portfolioId={portfolioId}
            onBack={() => setCurrentStep('hub')}
          />
        ) : (
          <ContentSuggestions
            profile={{ id: 'temp', rawContent: '', createdAt: new Date().toISOString() }}
            portfolioId={portfolioId}
            onBack={() => setCurrentStep('hub')}
          />
        );

      default:
        return null;
    }
  };

  return <div>{renderStep()}</div>;
};
