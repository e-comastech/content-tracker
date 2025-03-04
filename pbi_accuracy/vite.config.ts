import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pbi_accuracy/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: '../dist/pbi_accuracy',
    emptyOutDir: true,
    // Optimize build settings to reduce memory usage
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
          lucide: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5174, // Different port from CCT app
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});