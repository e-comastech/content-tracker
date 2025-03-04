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
        dashboard: resolve(__dirname, 'dashboard/index.html'),
        cct: resolve(__dirname, 'cct/index.html'),
      },
      output: {
        dir: 'dist',
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'cct') return 'cct/[name]-[hash].js';
          if (chunkInfo.name === 'dashboard') return 'dashboard/[name]-[hash].js';
          return '[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const info = assetInfo.name.split('/');
          const type = info[0];
          if (type === 'cct') {
            return 'cct/assets/[name]-[hash][extname]';
          }
          if (type === 'dashboard') {
            return 'dashboard/assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
});
