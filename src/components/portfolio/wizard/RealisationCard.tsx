/**
 * SOUVERAIN - Realisation Card Component
 * Card éditable pour une réalisation/projet
 */

import React from 'react';
import type { Realisation } from '../types';

interface RealisationCardProps {
  realisation: Realisation;
  onUpdate: (updates: Partial<Realisation>) => void;
  onDelete: () => void;
}

export const RealisationCard: React.FC<RealisationCardProps> = ({
  realisation,
  onUpdate,
  onDelete,
}) => {
  return (
    <div>
      <h4>{realisation.title}</h4>
      {/* TODO: Implémenter */}
    </div>
  );
};
