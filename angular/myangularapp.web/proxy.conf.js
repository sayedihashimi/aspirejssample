module.exports = {
  "/api": {
    target:
      process.env["APISERVICEANGULAR_HTTPS"] ||
      process.env["APISERVICEANGULAR_HTTP"],
    secure: process.env["NODE_ENV"] !== "development",
    pathRewrite: {
      "^/api": "",
    },
    changeOrigin: true
  },
};
