import React from 'react';
import { PortfolioGitHubImport } from './PortfolioGitHubImport';
import { PortfolioLocalImport } from './PortfolioLocalImport';

interface PortfolioImportModalProps {
  source: 'github' | 'local';
  onClose: () => void;
  onSuccess: (projects: any[]) => void;
}

export const PortfolioImportModal: React.FC<PortfolioImportModalProps> = ({
  source,
  onClose,
  onSuccess
}) => {
  if (source === 'github') {
    return <PortfolioGitHubImport onClose={onClose} onSuccess={onSuccess} />;
  }

  if (source === 'local') {
    return <PortfolioLocalImport onClose={onClose} onSuccess={onSuccess} />;
  }

  return null;
};
