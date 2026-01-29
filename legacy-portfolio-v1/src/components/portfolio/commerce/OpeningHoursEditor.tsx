/**
 * SOUVERAIN - OpeningHoursEditor
 * Éditeur d'horaires d'ouverture pour les commerces
 */

import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../../design-system';
import type { OpeningHours, DaySchedule, TimeSlot, DayOfWeek } from '../../../types/commerce';
import { DAY_ORDER, DAY_LABELS } from '../../../types/commerce';

// ============================================================
// TYPES
// ============================================================

interface OpeningHoursEditorProps {
  value: OpeningHours;
  onChange: (hours: OpeningHours) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const OpeningHoursEditor: React.FC<OpeningHoursEditorProps> = ({
  value,
  onChange,
}) => {
  const { theme } = useTheme();

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    dayRow: {
      display: 'grid',
      gridTemplateColumns: '120px auto 100px',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.md,
    },
    dayLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    slotsContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
    },
    slotRow: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    timeInput: {
      padding: spacing[2],
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.sm,
      width: '90px',
      textAlign: 'center' as const,
    },
    separator: {
      color: theme.text.tertiary,
      fontSize: typography.fontSize.sm,
    },
    toggleButton: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    toggleOpen: {
      backgroundColor: theme.semantic.success,
      color: '#FFFFFF',
    },
    toggleClosed: {
      backgroundColor: theme.border.default,
      color: theme.text.secondary,
    },
    addSlotButton: {
      padding: spacing[1],
      fontSize: typography.fontSize.sm,
      color: theme.accent.primary,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
    removeSlotButton: {
      padding: spacing[1],
      fontSize: typography.fontSize.base,
      color: theme.text.tertiary,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      lineHeight: 1,
    },
    copyButton: {
      marginTop: spacing[3],
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      color: theme.accent.primary,
      backgroundColor: 'transparent',
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    closedLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
      fontStyle: 'italic',
    },
  };

  // Handlers
  const handleToggleOpen = (day: DayOfWeek) => {
    const schedule = value[day];
    const newSchedule: DaySchedule = {
      isOpen: !schedule.isOpen,
      slots: schedule.isOpen ? [] : [{ open: '09:00', close: '18:00' }],
    };
    onChange({ ...value, [day]: newSchedule });
  };

  const handleSlotChange = (
    day: DayOfWeek,
    slotIndex: number,
    field: 'open' | 'close',
    newValue: string
  ) => {
    const schedule = value[day];
    const newSlots = [...schedule.slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: newValue };
    onChange({ ...value, [day]: { ...schedule, slots: newSlots } });
  };

  const handleAddSlot = (day: DayOfWeek) => {
    const schedule = value[day];
    const lastSlot = schedule.slots[schedule.slots.length - 1];
    const newSlot: TimeSlot = {
      open: lastSlot ? lastSlot.close : '14:00',
      close: '18:00',
    };
    onChange({
      ...value,
      [day]: { ...schedule, slots: [...schedule.slots, newSlot] },
    });
  };

  const handleRemoveSlot = (day: DayOfWeek, slotIndex: number) => {
    const schedule = value[day];
    if (schedule.slots.length <= 1) return;
    const newSlots = schedule.slots.filter((_, i) => i !== slotIndex);
    onChange({ ...value, [day]: { ...schedule, slots: newSlots } });
  };

  const handleCopyToAll = (sourceDay: DayOfWeek) => {
    const sourceSchedule = value[sourceDay];
    const newHours = { ...value };
    DAY_ORDER.forEach((day) => {
      newHours[day] = { ...sourceSchedule };
    });
    onChange(newHours);
  };

  return (
    <div style={styles.container}>
      {DAY_ORDER.map((day) => {
        const schedule = value[day];

        return (
          <div key={day} style={styles.dayRow}>
            {/* Jour */}
            <span style={styles.dayLabel}>{DAY_LABELS[day]}</span>

            {/* Créneaux */}
            <div style={styles.slotsContainer}>
              {schedule.isOpen ? (
                <>
                  {schedule.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} style={styles.slotRow}>
                      <input
                        type="time"
                        value={slot.open}
                        onChange={(e) =>
                          handleSlotChange(day, slotIndex, 'open', e.target.value)
                        }
                        style={styles.timeInput}
                      />
                      <span style={styles.separator}>à</span>
                      <input
                        type="time"
                        value={slot.close}
                        onChange={(e) =>
                          handleSlotChange(day, slotIndex, 'close', e.target.value)
                        }
                        style={styles.timeInput}
                      />
                      {schedule.slots.length > 1 && (
                        <button
                          type="button"
                          style={styles.removeSlotButton}
                          onClick={() => handleRemoveSlot(day, slotIndex)}
                          title="Supprimer ce créneau"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    style={styles.addSlotButton}
                    onClick={() => handleAddSlot(day)}
                  >
                    + Ajouter un créneau
                  </button>
                </>
              ) : (
                <span style={styles.closedLabel}>Fermé</span>
              )}
            </div>

            {/* Toggle ouvert/fermé */}
            <button
              type="button"
              style={{
                ...styles.toggleButton,
                ...(schedule.isOpen ? styles.toggleOpen : styles.toggleClosed),
              }}
              onClick={() => handleToggleOpen(day)}
            >
              {schedule.isOpen ? 'Ouvert' : 'Fermé'}
            </button>
          </div>
        );
      })}

      {/* Bouton copier à tous les jours */}
      <button
        type="button"
        style={styles.copyButton}
        onClick={() => handleCopyToAll('monday')}
      >
        Appliquer les horaires du lundi à tous les jours
      </button>
    </div>
  );
};

export default OpeningHoursEditor;
