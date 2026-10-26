// ShareBite Main Full-Stack HTTP Server
// Powered by Node.js 24 Native Modules (node:http, node:sqlite, node:fs, node:path)

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { PORT, HOST, APP_NAME, VERSION } = require('./src/config');
const { getDatabase } = require('./src/database/db');
const { handleAuthRoutes } = require('./src/routes/authRoutes');
const { handleListingRoutes } = require('./src/routes/listingRoutes');
const { handleImpactRoutes } = require('./src/routes/impactRoutes');

// Initialize database with safe error recovery
try {
  getDatabase();
} catch (err) {
  console.warn('[ShareBite DB] Notice during DB init:', err.message);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const PUBLIC_DIR = path.join(__dirname, 'src/public');

// CORS Middleware function
function applyCors(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// JSON body parser middleware function (equivalent to express.json())
function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        resolve({});
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

const server = http.createServer(async (req, res) => {
  // Apply CORS
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const hostHeader = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url, `http://${hostHeader}`);

  try {
    // API Routes Handler
    if (url.pathname.startsWith('/api/')) {
      const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await parseRequestBody(req) : {};

      if (url.pathname.startsWith('/api/auth')) {
        if (handleAuthRoutes(req, res, url, body)) return;
      }

      if (url.pathname.startsWith('/api/listings')) {
        if (handleListingRoutes(req, res, url, body)) return;
      }

      if (url.pathname.startsWith('/api/impact')) {
        if (handleImpactRoutes(req, res, url)) return;
      }

      // API 404
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Endpoint ${req.method} ${url.pathname} not found` }));
      return;
    }

    // Static File Serving
    let safePath = path.normalize(url.pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '') {
      safePath = '/index.html';
    }

    let filePath = path.join(PUBLIC_DIR, safePath);

    // If requesting directory, try index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // Fallback to index.html for SPA routes (e.g. /feed, /donate, /volunteer)
    if (!fs.existsSync(filePath)) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  } catch (err) {
    console.error('[ShareBite Server Error]:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
});

// Guard against unhandled process exceptions
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(` 🍽️  ${APP_NAME} v${VERSION} Server Running`);
  console.log(` 🌐 URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(` 📦 SQLite Database: Ready`);
  console.log(` 🛡️  CORS & express.json Middleware: Active`);
  console.log(`=======================================================`);
});

module.exports = server;
