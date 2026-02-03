import React from 'react';

interface AiSparkleIconProps {
  className?: string;
  size?: number;
}

export const AiSparkleIcon: React.FC<AiSparkleIconProps> = ({ 
  className = '', 
  size = 16 
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ai-sparkle-icon ${className}`}
      width={size}
      height={size}
    >
      {/* Étoile principale */}
      <path d="M11 5L12.5 9.5L17 11L12.5 12.5L11 17L9.5 12.5L5 11L9.5 9.5L11 5Z" />
      {/* Petite étoile haut droite */}
      <path d="M18 3L18.7 5.3L21 6L18.7 6.7L18 9L17.3 6.7L15 6L17.3 5.3L18 3Z" />
      {/* Petite étoile bas droite */}
      <path d="M18 15L18.7 17.3L21 18L18.7 18.7L18 21L17.3 18.7L15 18L17.3 17.3L18 15Z" />
    </svg>
  );
};

export default AiSparkleIcon;
