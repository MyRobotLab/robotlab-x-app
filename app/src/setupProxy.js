const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = function (app) {
  app.use(
    "/api/service",
    createProxyMiddleware({
      // target: "http://localhost:8888",
      target: "https://localhost:8443",
      changeOrigin: true,
      // ws: true,
      secure: false,
    })
  )
  app.use(
    "/offer",
    createProxyMiddleware({
      target: "http://localhost:8080", // webcam.py
      changeOrigin: true,
      // ws: true,
      secure: false,
    })
  )
  // Proxy WebSocket connections to a remote server running on port 8080
  // app.use(
  //   "/api/messages/*",
  //   createProxyMiddleware({
  //     target: "wss://localhost:8443/api/messages",
  //     // target: "ws://localhost:8443/api/messages",
  //     changeOrigin: true,
  //     ws: true,
  //     secure: false,
  //     logLevel: "debug",
  //   })
  // )

  // dumb "hot swap" dev server related
  // app.use(
  //   "/ws",
  //   createProxyMiddleware({
  //     target: "wss://localhost:8443/api/messages",
  //     // target: "ws://localhost:8443/api/messages",
  //     changeOrigin: true,
  //     ws: true,
  //     secure: false,
  //     logLevel: "debug",
  //   })
  // )
}
