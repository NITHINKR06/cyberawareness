// Serverless adapter for Vercel
// This file allows your Express server to work with Vercel's serverless functions

const app = require('../server/server.js');

// Export the Express app for Vercel to use
module.exports = app;

// For local development, this file won't be used
// Your regular server.js will handle local development
