import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { X, Monitor, Tablet, Smartphone, Maximize2 } from 'lucide-react';

interface PreviewFrameProps {
  htmlContent: string;
  title: string;
  onClose: () => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES = {
  desktop: { width: 1280, height: 800, radius: '0' },
  tablet: { width: 768, height: 1024, radius: '12px' },
  mobile: { width: 375, height: 667, radius: '24px' }
};

export const PreviewFrame: React.FC<PreviewFrameProps> = ({
  htmlContent,
  title,
  onClose
}) => {
  const { mode } = useTheme();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  const currentSize = DEVICE_SIZES[device];
  const scale = isFullscreen ? 1 : Math.min(1, (window.innerWidth - 100) / currentSize.width);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center ${
        mode === 'dark' ? 'bg-[#1A1A1C] border-[#333]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <div className="flex items-center gap-2 text-sm opacity-60">
            <span>{currentSize.width}×{currentSize.height}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className={`flex gap-1 p-1 rounded-lg ${
            mode === 'dark' ? 'bg-[#252528]' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded transition-colors ${
                device === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : mode === 'dark'
                  ? 'hover:bg-[#333] text-gray-400'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded transition-colors ${
                device === 'tablet'
                  ? 'bg-blue-600 text-white'
                  : mode === 'dark'
                  ? 'hover:bg-[#333] text-gray-400'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded transition-colors ${
                device === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : mode === 'dark'
                  ? 'hover:bg-[#333] text-gray-400'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-lg transition-colors ${
              mode === 'dark'
                ? 'hover:bg-[#333] text-gray-400'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Plein écran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              mode === 'dark'
                ? 'hover:bg-red-900/20 text-red-400'
                : 'hover:bg-red-100 text-red-600'
            }`}
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          style={{
            width: currentSize.width,
            height: currentSize.height,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'all 0.3s ease'
          }}
        >
          <iframe
            ref={iframeRef}
            title={title}
            className="w-full h-full bg-white shadow-2xl"
            style={{
              borderRadius: currentSize.radius,
              border: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};
