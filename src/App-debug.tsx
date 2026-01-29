/**
 * SOUVERAIN V17 - App (Debug Version)
 */

import React, { useState } from 'react';

// Test simple sans les composants complexes
const App: React.FC = () => {
  const [count, setCount] = useState(0);
  
  console.log('[APP] Render - count:', count);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1A1A1A' }}>
        SOUVERAIN
      </h1>
      <p style={{ color: '#4A4A4A', marginBottom: '2rem' }}>
        Test de rendu React - Count: {count}
      </p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#2563EB',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Incrémenter
      </button>
    </div>
  );
};

export default App;
