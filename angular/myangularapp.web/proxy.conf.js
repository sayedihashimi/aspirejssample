module.exports = {
  "/api": {
    target:
      process.env["APISERVICE_HTTPS"] ||
      process.env["APISERVICE_HTTP"],
    secure: process.env["NODE_ENV"] !== "development",
    pathRewrite: {
      "^/api": "",
    },
    changeOrigin: true
  },
};
