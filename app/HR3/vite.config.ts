import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/HR3/',
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: [
      'exudative-closely-annetta.ngrok-free.dev',
      'localhost',
      '127.0.0.1'
    ],
    hmr: {
      // Disable WebSocket for ngrok - use polling instead
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5174,
    },
    watch: {
      // Use polling for file watching (works better with network shares/ngrok)
      usePolling: true,
      interval: 1000
    },
    proxy: {
      // Handle /api requests
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Handle /HR3/api requests (rewrite to /api)
      '/HR3/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/HR3\/api/, '/api'),
      }
    }
  }
})
