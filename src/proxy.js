const { createProxyMiddleware } = require('http-proxy-middleware')

const apiProxy = createProxyMiddleware('/api', {
  target: 'http://localhost:8888/api',
  changeOrigin: true,
  ws: true
  // other options can go here
})

module.exports = apiProxy
