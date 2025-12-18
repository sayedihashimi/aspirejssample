import { defineConfig } from 'astro/config';

const apiUrl = process.env.APISERVICEASTRO_HTTPS || process.env.APISERVICEASTRO_HTTP;
const port = parseInt(process.env.PORT, 10);

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    server: {
      port: (!isNaN(port) && port > 0) ? port : 4321,
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
