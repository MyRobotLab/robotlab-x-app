const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy HTTP requests to a local server running on port 3001
  app.use('/api/service', createProxyMiddleware({
    target: 'http://localhost:8888',
    changeOrigin: true,
    ws: true
  }));

  // Proxy WebSocket connections to a remote server running on port 8080
  app.use('/api/messages', createProxyMiddleware({
    target: 'ws://localhost:8888/api/messages',
    changeOrigin: true,
    ws: true
  }));
};
