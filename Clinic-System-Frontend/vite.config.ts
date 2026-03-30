import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8000,
    watch: {
      usePolling: false, // Set to true only if hot reload doesn't work
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      'axios',
      'chart.js',
      'react-chartjs-2',
      'jwt-decode',
      'lucide-react',
      'react-icons',
    ],
    exclude: ['@ant-design/v5-patch-for-react-19'],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})
