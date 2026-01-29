/**
 * SOUVERAIN - NotificationToast
 * Système de notifications toast élégant
 * Remplace les alerts natives pour une meilleure UX
 */

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../design-system';

// ============================================================
// TYPES
// ============================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ============================================================
// CONTEXT
// ============================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// ============================================================
// PROVIDER
// ============================================================

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const duration = toast.duration || 3000;

    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 5000 });
  };

  const warning = (title: string, message?: string) => {
    showToast({ type: 'warning', title, message, duration: 4000 });
  };

  const info = (title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  };

  const value: ToastContextValue = {
    showToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ============================================================
// TOAST CONTAINER
// ============================================================

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const { theme } = useTheme();

  const styles = {
    container: {
      position: 'fixed' as const,
      top: spacing[6],
      right: spacing[6],
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
      maxWidth: '400px',
    },
  };

  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// ============================================================
// TOAST ITEM
// ============================================================

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const { theme } = useTheme();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: theme.semantic.successMuted,
          borderColor: theme.semantic.success,
          icon: '✓',
          iconColor: theme.semantic.success,
        };
      case 'error':
        return {
          backgroundColor: theme.semantic.errorMuted,
          borderColor: theme.semantic.error,
          icon: '✕',
          iconColor: theme.semantic.error,
        };
      case 'warning':
        return {
          backgroundColor: theme.semantic.warningMuted,
          borderColor: theme.semantic.warning,
          icon: '⚠',
          iconColor: theme.semantic.warning,
        };
      case 'info':
        return {
          backgroundColor: theme.semantic.infoMuted,
          borderColor: theme.semantic.info,
          icon: 'ℹ',
          iconColor: theme.semantic.info,
        };
      default:
        return {
          backgroundColor: theme.bg.secondary,
          borderColor: theme.border.default,
          icon: '•',
          iconColor: theme.text.primary,
        };
    }
  };

  const toastStyle = getToastStyle();

  const styles = {
    toast: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing[3],
      padding: spacing[4],
      backgroundColor: toastStyle.backgroundColor,
      border: `2px solid ${toastStyle.borderColor}`,
      borderRadius: borderRadius.lg,
      boxShadow: theme.shadow.lg,
      minWidth: '300px',
      maxWidth: '400px',
      animation: isExiting ? 'slideOut 0.3s ease-out' : 'slideIn 0.3s ease-out',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
      transition: 'opacity 0.3s, transform 0.3s',
    },
    icon: {
      width: '24px',
      height: '24px',
      borderRadius: borderRadius.full,
      backgroundColor: theme.bg.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typography.fontSize.sm,
      color: toastStyle.iconColor,
      fontWeight: typography.fontWeight.bold,
      flexShrink: 0,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: toast.message ? spacing[1] : 0,
    },
    message: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
      lineHeight: 1.4,
    },
    closeButton: {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: theme.text.tertiary,
      fontSize: typography.fontSize.sm,
      transition: transitions.fast,
      background: 'none',
      border: 'none',
      padding: 0,
    },
  };

  return (
    <div style={styles.toast}>
      <div style={styles.icon}>{toastStyle.icon}</div>
      <div style={styles.content}>
        <div style={styles.title}>{toast.title}</div>
        {toast.message && <div style={styles.message}>{toast.message}</div>}
      </div>
      <button
        type="button"
        style={styles.closeButton}
        onClick={handleClose}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = theme.text.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.text.tertiary;
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default { ToastProvider, useToast };
