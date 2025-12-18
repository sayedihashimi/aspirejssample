import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig(({ mode }) => {

  return {
    plugins: [svelte()],
    server:{
      port: parseInt(process.env.PORT) || 5173,
      proxy: {
        '/api': {
          target: process.env.APISERVICESVELTE_HTTPS || process.env.APISERVICESVELTE_HTTP,
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
