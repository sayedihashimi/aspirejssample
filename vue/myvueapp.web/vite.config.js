import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {

  return {
    plugins: [vue()],
    server:{
      port: parseInt(process.env.PORT) || 5173,
      proxy: {
        '/api': {
          target: process.env.APISERVICEVUE_HTTPS || process.env.APISERVICEVUE_HTTP,
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
