import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server:{
      port: parseInt(env.VITE_PORT),
      proxy: {
        // "apiservice" is the name of the API in AppHost.cs.
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