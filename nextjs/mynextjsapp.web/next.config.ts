import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: isDev ? undefined : 'export',
  distDir: 'out',
  ...(isDev && {
    async rewrites() {
      const apiUrl = process.env.APISERVICENEXTJS_HTTPS || process.env.APISERVICENEXTJS_HTTP;
      if (!apiUrl) {
        console.warn('API service URL not found. API proxy will not work.');
        return [];
      }
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;
