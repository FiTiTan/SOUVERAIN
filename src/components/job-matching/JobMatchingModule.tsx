import React, { useState } from 'react';
import { JobMatchingHub } from './JobMatchingHub';
import { JobOfferInput } from './JobOfferInput';
import { ProfileSelector } from './ProfileSelector';
import { MatchingAnalysis } from './MatchingAnalysis';
import { MatchingResult } from './MatchingResult';
import { type JobOffer, type CVProfile, type MatchingResult as MatchingResultType } from '../../services/jobMatchingService';

type Step = 'hub' | 'input' | 'selector' | 'analysis' | 'result';

export const JobMatchingModule: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('hub');
  const [jobOffer, setJobOffer] = useState<Partial<JobOffer> | null>(null);
  const [cvProfile, setCvProfile] = useState<CVProfile | null>(null);
  const [matchingResult, setMatchingResult] = useState<MatchingResultType | null>(null);
  const [portfolioId] = useState('default_portfolio'); // TODO: Get from context

  const handleStartNewMatching = () => {
    setCurrentStep('input');
    setJobOffer(null);
    setCvProfile(null);
    setMatchingResult(null);
  };

  const handleJobOfferNext = (offer: Partial<JobOffer>) => {
    setJobOffer(offer);
    setCurrentStep('selector');
  };

  const handleProfileSelected = (profile: CVProfile) => {
    setCvProfile(profile);
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = async (result: MatchingResultType) => {
    setMatchingResult(result);

    // Save to database
    try {
      // @ts-ignore
      await window.electron.invoke('db-save-matching-result', result);
    } catch (error) {
      console.error('Error saving matching result:', error);
    }

    setCurrentStep('result');
  };

  const handleAnalysisError = (error: string) => {
    alert(error);
    setCurrentStep('hub');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'hub':
        return (
          <JobMatchingHub
            onStartNewMatching={handleStartNewMatching}
            onViewHistory={() => {
              // TODO: Implement history view
              console.log('View history not yet implemented');
            }}
          />
        );

      case 'input':
        return (
          <JobOfferInput
            onNext={handleJobOfferNext}
            onBack={() => setCurrentStep('hub')}
          />
        );

      case 'selector':
        return jobOffer ? (
          <ProfileSelector
            jobOffer={jobOffer}
            onNext={handleProfileSelected}
            onBack={() => setCurrentStep('input')}
          />
        ) : null;

      case 'analysis':
        return jobOffer && cvProfile ? (
          <MatchingAnalysis
            jobOffer={jobOffer}
            cvProfile={cvProfile}
            portfolioId={portfolioId}
            onComplete={handleAnalysisComplete}
            onError={handleAnalysisError}
          />
        ) : null;

      case 'result':
        return matchingResult && jobOffer ? (
          <MatchingResult
            result={matchingResult}
            jobTitle={`${jobOffer.title} @ ${jobOffer.company}`}
            onNewAnalysis={handleStartNewMatching}
            onBack={() => setCurrentStep('hub')}
          />
        ) : null;

      default:
        return null;
    }
  };

  return <div>{renderStep()}</div>;
};
