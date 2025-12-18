// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Global CSS
  css: ['~/assets/css/global.css'],
  
  // Configure dev server to listen on PORT from Aspire
  devServer: {
    port: parseInt(process.env.PORT || '3000')
  },

  // Configure Vite dev proxy for API calls
  vite: {
    server: {
      proxy: {
        '/api': {
          target: process.env.APISERVICENUXTJS_HTTPS || process.env.APISERVICENUXTJS_HTTP || 'http://localhost:5199',
          changeOrigin: true,
          secure: false
        }
      }
    }
  },

  // Configure for static site generation
  ssr: false,
  
  // Build output directory
  nitro: {
    output: {
      dir: '.output',
      publicDir: '.output/public'
    }
  }
})
