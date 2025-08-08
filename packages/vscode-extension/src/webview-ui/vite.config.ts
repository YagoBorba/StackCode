// packages/vscode-extension/src/webview-ui/vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname), 
  
  // Configuração do CSS com PostCSS
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js'),
  },

  plugins: [react()],
  
  build: {
    outDir: path.resolve(__dirname, '..', '..', 'dist', 'webview-ui'),
    manifest: true,
    rollupOptions: {
      // ...
    },
  },
});