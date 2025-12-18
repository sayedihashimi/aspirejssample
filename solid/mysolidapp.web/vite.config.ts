import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
    port: parseInt(process.env.PORT || '5173'),
    proxy: {
      '/api': {
        target: process.env.APISERVICESOLID_HTTPS || process.env.APISERVICESOLID_HTTP,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  }
})
