import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'landing/index.html'),
        app: resolve(__dirname, 'index.html'),
      },
      output: {
        dir: 'dist',
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'app' ? 'app/[name]-[hash].js' : 'landing/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          return assetInfo.name === 'app' ? 'app/assets/[name]-[hash][extname]' : 'landing/assets/[name]-[hash][extname]';
        }
      }
    }
  },
});
