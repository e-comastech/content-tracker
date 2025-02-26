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
        app: resolve(__dirname, 'cct/index.html'),
      },
      output: {
        dir: 'dist',
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'app' ? 'cct/[name]-[hash].js' : '[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('/');
          const type = info[0];
          if (type === 'cct') {
            return 'cct/assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
});
