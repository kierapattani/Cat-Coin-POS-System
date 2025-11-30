import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { BASE_PATH } from './src/config'

export default defineConfig({
  plugins: [react()],
  base: BASE_PATH,
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
