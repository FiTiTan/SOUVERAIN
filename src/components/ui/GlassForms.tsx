import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';

// ============================================================
// BASE STYLES & TYPES
// ============================================================

interface BaseFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
}

interface GlassInputProps extends BaseFieldProps, React.InputHTMLAttributes<HTMLInputElement> {}
interface GlassTextAreaProps extends BaseFieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
interface GlassSelectProps extends BaseFieldProps, React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

// ============================================================
// COMPONENTS
// ============================================================

export const GlassInput: React.FC<GlassInputProps> = ({ label, error, required, style, ...props }) => {
  const { theme } = useTheme();

  return (
    <div style={{ marginBottom: '1.25rem', ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: theme.text.primary,
          marginBottom: '0.5rem',
          marginLeft: '4px'
        }}>
          {label} {required && <span style={{ color: theme.semantic.error }}>*</span>}
        </label>
      )}
      <input
        {...props}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          fontSize: typography.fontSize.sm,
          color: theme.text.primary,
          backgroundColor: theme.bg.secondary,
          border: `1px solid ${error ? theme.semantic.error : theme.border.default}`,
          borderRadius: borderRadius.lg, // 12px usually
          outline: 'none',
          transition: transitions.fast,
          // Subtle shadow/glass effect can be added here if needed
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.accent.primary;
          e.currentTarget.style.backgroundColor = theme.bg.primary;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? theme.semantic.error : theme.border.default;
          e.currentTarget.style.backgroundColor = theme.bg.secondary;
          props.onBlur?.(e);
        }}
      />
      {error && (
        <span style={{ display: 'block', marginTop: '0.25rem', color: theme.semantic.error, fontSize: typography.fontSize.xs, marginLeft: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export const GlassTextArea: React.FC<GlassTextAreaProps> = ({ label, error, required, style, rows = 4, ...props }) => {
  const { theme } = useTheme();

  return (
    <div style={{ marginBottom: '1.25rem', ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: theme.text.primary,
          marginBottom: '0.5rem',
          marginLeft: '4px'
        }}>
          {label} {required && <span style={{ color: theme.semantic.error }}>*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        {...props}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          fontSize: typography.fontSize.sm,
          color: theme.text.primary,
          backgroundColor: theme.bg.secondary,
          border: `1px solid ${error ? theme.semantic.error : theme.border.default}`,
          borderRadius: borderRadius.lg,
          outline: 'none',
          fontFamily: typography.fontFamily.sans,
          resize: 'vertical',
          transition: transitions.fast,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.accent.primary;
          e.currentTarget.style.backgroundColor = theme.bg.primary;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? theme.semantic.error : theme.border.default;
          e.currentTarget.style.backgroundColor = theme.bg.secondary;
          props.onBlur?.(e);
        }}
      />
      {error && (
        <span style={{ display: 'block', marginTop: '0.25rem', color: theme.semantic.error, fontSize: typography.fontSize.xs, marginLeft: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export const GlassSelect: React.FC<GlassSelectProps> = ({ label, error, required, options, style, ...props }) => {
  const { theme } = useTheme();

  return (
    <div style={{ marginBottom: '1.25rem', ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: theme.text.primary,
          marginBottom: '0.5rem',
          marginLeft: '4px'
        }}>
          {label} {required && <span style={{ color: theme.semantic.error }}>*</span>}
        </label>
      )}
      <select
        {...props}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          fontSize: typography.fontSize.sm,
          color: theme.text.primary,
          backgroundColor: theme.bg.secondary,
          border: `1px solid ${error ? theme.semantic.error : theme.border.default}`,
          borderRadius: borderRadius.lg,
          outline: 'none',
          cursor: 'pointer',
          transition: transitions.fast,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.accent.primary;
          e.currentTarget.style.backgroundColor = theme.bg.primary;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? theme.semantic.error : theme.border.default;
          e.currentTarget.style.backgroundColor = theme.bg.secondary;
          props.onBlur?.(e);
        }}
      >
        <option value="">Sélectionner...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ display: 'block', marginTop: '0.25rem', color: theme.semantic.error, fontSize: typography.fontSize.xs, marginLeft: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
