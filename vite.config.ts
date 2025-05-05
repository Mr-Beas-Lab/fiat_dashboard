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
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'output.css';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    // Disable HMR in production
    hmr: process.env.NODE_ENV === 'development' ? {
      protocol: 'wss',
      host: 'wam.mrbeas.net',
      clientPort: 443
    } : false
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'wam.mrbeas.net',
      'localhost',
      'dashboard',  
      '127.0.0.1'
    ],
    // Add these headers to ensure proper proxy handling
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
});
