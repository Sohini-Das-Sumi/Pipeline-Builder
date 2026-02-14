const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Pipeline parse endpoint - forward to Node.js backend on port 5001
  app.use(
    '/pipelines',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      logLevel: 'debug',
      timeout: 120000,
      proxyTimeout: 120000,
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to /pipelines:', req.url);
        console.log('Proxy target: http://localhost:5001');
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /pipelines:', err);
        if (!res.headersSent) {
          res.status(503).json({
            error: 'Backend service unavailable',
            message: 'The backend server is not running or unreachable. Please ensure the backend is started.'
          });
        }
      }
    })
  );

  // More specific routes must come before general ones
  app.use(
    '/api/llm',
    createProxyMiddleware({
      target: 'http://localhost:8003',
      changeOrigin: true,
      logLevel: 'debug',
      timeout: 120000, // 2 minutes timeout for requests
      proxyTimeout: 120000, // 2 minutes timeout for proxy
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to /api/llm:', req.url);
        console.log('Proxy target: http://localhost:8003');
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
      target: 'http://localhost:8003',
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
      target: 'http://localhost:8003',
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
      target: 'http://localhost:8003',
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
      target: 'http://localhost:8003',
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
      target: 'http://localhost:8003',
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
