import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Bloque sur 5173. Si c'est pris, il s'arrête au lieu de changer.
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // AI modules (lazy loaded - only if user enables offline mode)
          'ai-workers': ['@huggingface/transformers'],
          
          // PDF processing
          'pdf-processing': ['pdfjs-dist', 'pdf-lib', 'pdf-parse'],
          
          // Image processing (native modules)
          'image-processing': ['sharp'],
          
          // UI framework
          'ui-framework': ['react', 'react-dom'],
          'ui-animations': ['framer-motion'],
          
          // Utilities
          'utilities': ['uuid'],
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000, // Warn on chunks >1MB
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
    ],
    // Exclude heavy modules from pre-bundling
    exclude: [
      '@mlc-ai/web-llm', // Too large, lazy load only if needed
    ]
  }
})