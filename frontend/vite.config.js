import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/products':  { target: 'http://localhost:3001', changeOrigin: true },
      '/api/orders':    { target: 'http://localhost:3002', changeOrigin: true },
      '/api/inventory': { target: 'http://localhost:3003', changeOrigin: true },
      '/api/users':     { target: 'http://localhost:3004', changeOrigin: true },
      '/api/payments':  { target: 'http://localhost:3005', changeOrigin: true },
      '/api/listings':  { target: 'http://localhost:3006', changeOrigin: true },
    },
  },
});
