/**
 * SOUVERAIN - Keyboard Shortcuts Hook
 * Gestion des raccourcis clavier multi-plateforme
 */

import { useEffect } from 'react';

interface UseKeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
}

/**
 * Hook pour gérer les raccourcis clavier
 * Supporte Ctrl (Windows/Linux) et Cmd (Mac)
 */
export const useKeyboardShortcut = (
  options: UseKeyboardShortcutOptions,
  callback: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

      // Vérifier la touche principale
      if (event.key.toLowerCase() !== options.key.toLowerCase()) return;

      // Vérifier les modificateurs
      const ctrlPressed = options.ctrl && (isMac ? event.metaKey : event.ctrlKey);
      const cmdPressed = options.cmd && event.metaKey;
      const shiftPressed = options.shift ? event.shiftKey : true;
      const altPressed = options.alt ? event.altKey : true;

      // Si ctrl OU cmd est requis (pour compatibilité cross-platform)
      const modifierMatch = options.ctrl || options.cmd
        ? (isMac ? event.metaKey : event.ctrlKey)
        : true;

      if (modifierMatch && shiftPressed && altPressed) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options.key, options.ctrl, options.cmd, options.shift, options.alt, callback, enabled]);
};

/**
 * Hook simplifié pour Ctrl/Cmd + Key
 */
export const useCtrlKey = (key: string, callback: () => void, enabled: boolean = true) => {
  useKeyboardShortcut({ key, ctrl: true, cmd: true }, callback, enabled);
};

/**
 * Hook pour détecter la touche Escape
 */
export const useEscapeKey = (callback: () => void, enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback, enabled]);
};
