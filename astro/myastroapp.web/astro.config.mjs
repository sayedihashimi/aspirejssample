import { defineConfig } from 'astro/config';

const apiUrl = process.env.APISERVICEASTRO_HTTPS || process.env.APISERVICEASTRO_HTTP;

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    server: {
      port: parseInt(process.env.PORT) || 4321,
      proxy: apiUrl ? {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        }
      } : undefined
    }
  }
});
