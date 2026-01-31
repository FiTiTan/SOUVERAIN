import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, Tablet, Smartphone, Download, Save } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';
import { useToast } from '../../ui/NotificationToast';

interface PortfolioFinalPreviewProps {
  html: string;
  portfolioData: any;
  onModify: () => void;  // Retour au récap
  onSave: () => void;    // Sauvegarde et redirection
}

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

export const PortfolioFinalPreview: React.FC<PortfolioFinalPreviewProps> = ({
  html,
  portfolioData,
  onModify,
  onSave,
}) => {
  const { theme } = useTheme();
  const { success, error } = useToast();
  const [device, setDevice] = useState<Device>('desktop');
  const [isSaving, setIsSaving] = useState(false);

  const currentSize = DEVICE_SIZES[device];
  const scale = device === 'desktop' ? 0.5 : device === 'tablet' ? 0.6 : 0.75;

  const handleExportPDF = async () => {
    try {
      // Pour V1, on exporte en HTML
      // @ts-ignore
      await window.electron.invoke('export-portfolio-html', {
        html,
        filename: `${portfolioData.name || 'portfolio'}.html`,
      });
      success('Exporté !', 'Le fichier a été téléchargé');
    } catch (err) {
      error('Erreur', "L'export a échoué");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // @ts-ignore
      await window.electron.invoke('save-generated-portfolio', {
        ...portfolioData,
        generatedHTML: html,
        status: 'generated',
        generatedAt: new Date().toISOString(),
      });
      success('Enregistré !', 'Votre portfolio est accessible dans la liste');
      onSave();
    } catch (err) {
      error('Erreur', "L'enregistrement a échoué");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.border.light}`,
        backgroundColor: theme.bg.secondary,
      }}>
        <button
          onClick={onModify}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.text.secondary,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          <ArrowLeft size={18} />
          Modifier le récap
        </button>

        <span style={{ color: theme.text.primary, fontWeight: 600 }}>
          Preview de votre portfolio
        </span>

        <div style={{ width: '150px' }} /> {/* Spacer */}
      </div>

      {/* Device Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '16px',
        backgroundColor: theme.bg.secondary,
      }}>
        {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: device === d ? theme.accent.primary : theme.bg.tertiary,
              color: device === d ? '#fff' : theme.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {d === 'desktop' && <Monitor size={16} />}
            {d === 'tablet' && <Tablet size={16} />}
            {d === 'mobile' && <Smartphone size={16} />}
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Preview Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: theme.bg.tertiary,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: currentSize.width * scale,
            height: currentSize.height * scale,
            backgroundColor: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }}
        >
          <iframe
            srcDoc={html}
            title="Portfolio Preview"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              border: 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </motion.div>
      </div>

      {/* Footer Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
        borderTop: `1px solid ${theme.border.light}`,
        backgroundColor: theme.bg.secondary,
      }}>
        <button
          onClick={onModify}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: `1px solid ${theme.border.default}`,
            backgroundColor: 'transparent',
            color: theme.text.primary,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          ← Modifier le récap
        </button>

        <button
          onClick={handleExportPDF}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: `1px solid ${theme.border.default}`,
            backgroundColor: 'transparent',
            color: theme.text.primary,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Download size={18} />
          Exporter
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '12px 32px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: theme.accent.primary,
            color: '#fff',
            cursor: isSaving ? 'wait' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          <Save size={18} />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};

export default PortfolioFinalPreview;
