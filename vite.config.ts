import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/cct/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        landing: './public/index.html'
      },
      output: {
        dir: 'dist'
      }
    }
  },
});
