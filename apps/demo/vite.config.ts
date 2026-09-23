import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sysflow/core/dist/style.css': resolve(__dirname, '../../packages/core/src/styles/sysflow.css'),
      '@sysflow/core': resolve(__dirname, '../../packages/core/src')
    }
  }
});
