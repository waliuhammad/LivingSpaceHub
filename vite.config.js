import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Site is served from the domain root (e.g. https://livingspacehub.com/).
  // If you deploy into a subfolder, change this to '/subfolder/'.
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    // The Firebase SDK (Auth + Firestore) is one ~600 kB chunk (~150 kB gzipped) shared by every page.
    chunkSizeWarningLimit: 700,
  },
})
