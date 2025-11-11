// Serverless adapter for Vercel
// This file allows your Express server to work with Vercel's serverless functions

import app from '../server/server.js';

// Vercel serverless function handler
// Export the Express app - Vercel will call it as a serverless function
// The rewrite in vercel.json sends /api/* requests here
// We need to handle the path correctly since Vercel rewrites to /api/serverless
export default function handler(req, res) {
  // When Vercel rewrites /api/health to /api/serverless, 
  // the req.url might be /api/serverless instead of /api/health
  // We need to restore the original path from the rewrite
  // Vercel stores the original path, but we can get it from the request
  // Actually, Vercel should preserve the original URL in req.url during rewrites
  // But to be safe, we'll check and fix if needed
  
  // Log for debugging
  console.log('Serverless function called:', {
    url: req.url,
    method: req.method,
    originalUrl: req.originalUrl,
    path: req.path,
    headers: req.headers
  });
  
  // If the URL starts with /api/serverless, we need to get the original path
  // Vercel should preserve it, but if not, we'll extract it
  if (req.url && req.url.startsWith('/api/serverless')) {
    // Try to get the original path from various sources
    const originalPath = req.headers['x-vercel-rewrite'] || 
                        req.headers['x-invoke-path'] ||
                        req.originalUrl ||
                        req.url.replace('/api/serverless', '/api');
    req.url = originalPath.startsWith('/api') ? originalPath : `/api${originalPath}`;
  }
  
  // Handle the request with Express app
  return app(req, res);
}
