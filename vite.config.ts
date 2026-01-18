import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Bloque sur 5173. Si c'est pris, il s'arrête au lieu de changer.
  }
})