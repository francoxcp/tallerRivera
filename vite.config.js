import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Permite acceso desde cualquier dispositivo en la red
    open: true,
  },
  build: {
    sourcemap: false, // Desactiva sourcemaps en producción
    minify: 'esbuild', // Cambiado de terser a esbuild (más rápido y no requiere dependencia extra)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumenta el límite de advertencia
    cssCodeSplit: true, // Divide CSS en chunks
    assetsInlineLimit: 4096, // Inline assets pequeños (4kb)
  },
});
