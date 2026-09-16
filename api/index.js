import app from '../app.js';

export default function handler(req, res) {
  // Restore original request URL if rewritten by Vercel serverless engine
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-invoke-path'] || req.headers['x-forwarded-uri'];
  if (matchedPath && (req.url === '/api/index.js' || req.url.startsWith('/api/index.js'))) {
    req.url = matchedPath;
  } else if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  }

  return app(req, res);
}
