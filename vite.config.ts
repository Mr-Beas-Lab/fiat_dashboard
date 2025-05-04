import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      host: 'wam.mrbeas.net',
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: ['wam.mrbeas.net'],
  },
});
