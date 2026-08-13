import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // 所有和风天气请求都转发给本地代理 server.js（默认 8787）
      '/api/qw': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/healthz': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pinyin-vendor': ['pinyin-pro'],
        },
      },
    },
  },
})
