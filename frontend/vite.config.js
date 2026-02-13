import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
      '/llm': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
      '/executions': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
      '/database': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
      '/image': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
      '/pipelines': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
      '/run': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
    },
  },
})
