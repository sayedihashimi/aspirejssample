import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

  return {
    plugins: [react()],
    server:{
      proxy: {
        '/api': {
          target: process.env.APISERVICE_HTTPS || process.env.APISERVICE_HTTP,
          changeOrigin: true,
          secure: false
        }
      }
    },
    build:{
      outDir: 'dist',
      rollupOptions: {
        input: './index.html'
      }
    }
  }
})