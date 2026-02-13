const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // More specific routes must come before general ones
  app.use(
    '/api/llm',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8003',
      changeOrigin: true,
      logLevel: 'debug',
      timeout: 120000, // 2 minutes timeout for requests
      proxyTimeout: 120000, // 2 minutes timeout for proxy
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to /api/llm:', req.url);
        console.log('Proxy target: http://127.0.0.1:8003');
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /api/llm:', err);
        // Return a more informative error response
        if (!res.headersSent) {
          res.status(503).json({
            error: 'Backend service unavailable',
            message: 'The backend server is not running or unreachable. Please ensure the backend is started.'
          });
        }
      }
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8003',
      changeOrigin: true,
      logLevel: 'debug',
      timeout: 120000, // 2 minutes timeout for requests
      proxyTimeout: 120000, // 2 minutes timeout for proxy
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to /api:', req.url);
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /api:', err);
        // Return a more informative error response
        if (!res.headersSent) {
          res.status(503).json({
            error: 'Backend service unavailable',
            message: 'The backend server is not running or unreachable. Please ensure the backend is started.'
          });
        }
      }
    })
  );

  app.use(
    '/executions',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8003',
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to /executions:', req.url);
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /executions:', err);
      }
    })
  );

  app.use(
    '/database',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8003',
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to /database:', req.url);
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /database:', err);
      }
    })
  );

  app.use(
    '/image',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8003',
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to /image:', req.url);
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /image:', err);
      }
    })
  );

  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8003',
      changeOrigin: true,
      ws: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying WebSocket request to /ws:', req.url);
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /ws:', err);
      }
    })
  );
};
