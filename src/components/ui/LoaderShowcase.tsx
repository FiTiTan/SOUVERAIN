import React from 'react';
import { useTheme } from '../../ThemeContext';

// 1. Orbital Rings - Style Apple/Microsoft
export const OrbitalLoader: React.FC<{ size?: number }> = ({ size = 60 }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            border: `3px solid ${theme.accent.primary}`,
            borderRadius: '50%',
            borderTopColor: 'transparent',
            animation: `spin-${i} ${1.5 + i * 0.3}s linear infinite`,
            transform: `rotate(${i * 45}deg)`
          }}
        />
      ))}
      <style>{`
        @keyframes spin-0 { to { transform: rotate(405deg); } }
        @keyframes spin-1 { to { transform: rotate(450deg); } }
        @keyframes spin-2 { to { transform: rotate(495deg); } }
      `}</style>
    </div>
  );
};

// 2. Morphing Shape - Carré ↔ Cercle
export const MorphingLoader: React.FC<{ size?: number }> = ({ size = 60 }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      width: size,
      height: size,
      background: `linear-gradient(45deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
      animation: 'morph 2s ease-in-out infinite'
    }}>
      <style>{`
        @keyframes morph {
          0%, 100% {
            border-radius: 10%;
            transform: rotate(0deg);
          }
          25% {
            border-radius: 50%;
          }
          50% {
            border-radius: 10%;
            transform: rotate(180deg);
          }
          75% {
            border-radius: 50%;
          }
        }
      `}</style>
    </div>
  );
};

// 3. Liquid Wave
export const LiquidLoader: React.FC<{ size?: number }> = ({ size = 60 }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: size }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '100%',
            background: theme.accent.primary,
            borderRadius: '4px',
            animation: `wave ${1.2}s ease-in-out ${i * 0.1}s infinite`
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

// 4. Audio Bars
export const AudioBarsLoader: React.FC<{ size?: number }> = ({ size = 60 }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: size }}>
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <div
          key={i}
          style={{
            width: '4px',
            background: `linear-gradient(to top, ${theme.accent.primary}, ${theme.accent.tertiary})`,
            borderRadius: '2px',
            animation: `audio ${0.8}s ease-in-out ${i * 0.08}s infinite alternate`
          }}
        />
      ))}
      <style>{`
        @keyframes audio {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

// 5. Gradient Ring - Style iOS
export const GradientRingLoader: React.FC<{ size?: number }> = ({ size = 60 }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `conic-gradient(from 0deg, ${theme.accent.primary} 0%, transparent 100%)`,
      animation: 'spin-ring 1s linear infinite',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        inset: '8px',
        borderRadius: '50%',
        background: theme.bg.primary
      }} />
      <style>{`
        @keyframes spin-ring {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// 6. Pulse Dots Grid
export const PulseGridLoader: React.FC<{ size?: number }> = ({ size = 60 }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      width: size,
      height: size
    }}>
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: '50%',
            background: theme.accent.primary,
            animation: `pulse-grid ${1.5}s ease-in-out ${i * 0.1}s infinite`
          }}
        />
      ))}
      <style>{`
        @keyframes pulse-grid {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// Showcase Component
export const LoaderShowcase: React.FC = () => {
  const { theme } = useTheme();
  
  const loaders = [
    { name: 'Orbital Rings', component: <OrbitalLoader /> },
    { name: 'Morphing Shape', component: <MorphingLoader /> },
    { name: 'Liquid Wave', component: <LiquidLoader /> },
    { name: 'Audio Bars', component: <AudioBarsLoader /> },
    { name: 'Gradient Ring', component: <GradientRingLoader /> },
    { name: 'Pulse Grid', component: <PulseGridLoader /> }
  ];
  
  return (
    <div style={{
      padding: '3rem',
      background: theme.bg.primary,
      minHeight: '100vh'
    }}>
      <h1 style={{ color: theme.text.primary, marginBottom: '3rem', textAlign: 'center' }}>
        Loader Styles
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {loaders.map((loader, i) => (
          <div
            key={i}
            style={{
              background: theme.bg.secondary,
              border: `1px solid ${theme.border.default}`,
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {loader.component}
            </div>
            <h3 style={{
              color: theme.text.primary,
              fontSize: '1rem',
              fontWeight: 600,
              margin: 0
            }}>
              {loader.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};
