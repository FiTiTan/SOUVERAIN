/**
 * SOUVERAIN - Theme Context
 * Gestion du dark mode avec persistance
 * Optimized: Split state and actions to prevent unnecessary re-renders
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { theme as themeConfig } from './design-system';

type ThemeMode = 'light' | 'dark';

// Split contexts: state vs actions
interface ThemeStateContextType {
  mode: ThemeMode;
  theme: typeof themeConfig.light;
}

interface ThemeActionsContextType {
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeStateContext = createContext<ThemeStateContextType | undefined>(undefined);
const ThemeActionsContext = createContext<ThemeActionsContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Récupérer depuis localStorage ou préférence système
    const saved = localStorage.getItem('souverain-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('souverain-theme', mode);
    // Appliquer la classe sur le document
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  // Memoize actions - never change
  const actions = useMemo(() => ({
    toggleTheme: () => setMode(prev => prev === 'light' ? 'dark' : 'light'),
    setTheme: (newMode: ThemeMode) => setMode(newMode),
  }), []);

  // Memoize state - only changes when mode changes
  const state = useMemo(() => ({
    mode,
    theme: mode === 'dark' ? themeConfig.dark : themeConfig.light
  }), [mode]);

  return (
    <ThemeActionsContext.Provider value={actions}>
      <ThemeStateContext.Provider value={state}>
        {children}
      </ThemeStateContext.Provider>
    </ThemeActionsContext.Provider>
  );
};

// Hook for components that only need theme values (re-renders on theme change)
export const useThemeState = (): ThemeStateContextType => {
  const context = useContext(ThemeStateContext);
  if (!context) {
    throw new Error('useThemeState must be used within a ThemeProvider');
  }
  return context;
};

// Hook for components that only need actions (never re-renders!)
export const useThemeActions = (): ThemeActionsContextType => {
  const context = useContext(ThemeActionsContext);
  if (!context) {
    throw new Error('useThemeActions must be used within a ThemeProvider');
  }
  return context;
};

// Backward compatibility: combined hook (use when you need both)
export const useTheme = () => {
  const state = useThemeState();
  const actions = useThemeActions();
  return { ...state, ...actions };
};
