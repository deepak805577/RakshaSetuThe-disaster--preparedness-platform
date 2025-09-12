const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all /api requests to the backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control'
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy Error');
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxying ${req.method} ${req.url} to backend`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Proxy response: ${proxyRes.statusCode} for ${req.url}`);
        // Add CORS headers to all responses
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control';
      }
    })
  );

  // Proxy /socket.io requests for websocket
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      ws: true, // enable websocket proxy
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
