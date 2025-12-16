const target = process.env.APISERVICE_HTTPS || process.env.APISERVICE_HTTP;

const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: target,
    secure: false,
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;
