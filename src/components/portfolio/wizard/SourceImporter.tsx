/**
 * SOUVERAIN - Source Importer Component
 * Composant unifié pour import URL/fichier (LinkedIn, site web, PDF, etc.)
 */

import React from 'react';
import type { ImportSource, ProfileType } from '../types';

interface SourceImporterProps {
  profileType: ProfileType;
  onImport: (source: ImportSource) => Promise<void>;
}

export const SourceImporter: React.FC<SourceImporterProps> = ({
  profileType,
  onImport,
}) => {
  return (
    <div>
      <h3>Source Importer</h3>
      {/* TODO: Implémenter */}
    </div>
  );
};
