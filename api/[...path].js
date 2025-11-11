// Vercel serverless function - catch-all route for all /api/* requests
// This file handles all API routes using Express
// Using [...path].js creates a catch-all route that matches /api/*

import app from '../server/server.js';

// Export the Express app directly
// Vercel will call this serverless function for any /api/* route
// The req.url will contain the full path (e.g., /api/health, /api/auth/login, etc.)
export default app;

