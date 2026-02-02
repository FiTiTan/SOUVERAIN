/**
 * Jauge de score circulaire avec animation
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number; // Diamètre en px
  label?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 180, label = 'Score global' }) => {
  const { theme } = useTheme();
  
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Couleur selon le score
  const getColor = (s: number) => {
    if (s >= 80) return '#10B981'; // Vert
    if (s >= 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Rouge
  };

  const color = getColor(score);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.bg.tertiary}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
          }}
        />
        
        {/* Score text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          style={{
            fontSize: '3rem',
            fontWeight: 700,
            fill: theme.text.primary,
          }}
        >
          {score}
        </text>
      </svg>
      
      <div style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: theme.text.secondary,
        textAlign: 'center',
      }}>
        {label}
      </div>
    </div>
  );
};
