import express from 'express';
import jwt from 'jsonwebtoken';
import { validateUserInput, rateLimitValidation, sanitizeInput } from '../middleware/validation.js';
import { authRateLimit } from '../middleware/security.js';
import { csrfProtectionMiddleware } from '../middleware/csrfProtection.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for security');
}

// ==========================================
// AUTHENTICATION MIGRATION NOTICE
// ==========================================
// 
// As of the latest update, authentication is handled entirely by Firebase/Firestore.
// The MongoDB User model is NO LONGER used for authentication.
//
// Authentication Flow:
// 1. Frontend uses Firebase Authentication (src/contexts/FirebaseAuthContext.tsx)
// 2. User data is stored in Firestore 'users' collection
// 3. Backend APIs verify Firebase tokens using Firebase Admin SDK
//
// MongoDB is ONLY used for:
// - ScamReports
// - Posts/Comments (Community features)
// - Topics
// - AnalyzerHistory
// - Other business data
//
// DO NOT use these endpoints for user registration or login:
// - POST /api/auth/register (DEPRECATED - use Firebase)
// - POST /api/auth/login (DEPRECATED - use Firebase)
//
// Use these endpoints instead (via frontend):
// - Firebase: createUserWithEmailAndPassword()
// - Firebase: signInWithEmailAndPassword()
// - Firestore: users collection
//
// ==========================================

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth route is working', 
    timestamp: new Date().toISOString(),
    note: 'Authentication is now handled by Firebase/Firestore'
  });
});

// DEPRECATED: Registration endpoint
// This is kept for backward compatibility but should NOT be used
router.post('/register', authRateLimit, csrfProtectionMiddleware, sanitizeInput, async (req, res) => {
  return res.status(410).json({ 
    error: 'This endpoint is deprecated',
    message: 'User registration is now handled by Firebase Authentication',
    instructions: 'Please use Firebase Auth instead of this endpoint'
  });
});

// DEPRECATED: Login endpoint  
// This is kept for backward compatibility but should NOT be used
router.post('/login', authRateLimit, csrfProtectionMiddleware, sanitizeInput, async (req, res) => {
  return res.status(410).json({ 
    error: 'This endpoint is deprecated',
    message: 'User login is now handled by Firebase Authentication',
    instructions: 'Please use Firebase Auth instead of this endpoint'
  });
});

// Verify token endpoint - can be used for Firebase token verification in future
router.get('/verify', async (req, res) => {
  // This endpoint can be used to verify Firebase tokens
  // Implementation depends on Firebase Admin SDK integration
  return res.status(200).json({ 
    message: 'Token verification endpoint',
    note: 'Implement Firebase token verification here'
  });
});

// Middleware to authenticate token - can be adapted for Firebase tokens
function authenticateToken(req, res, next) {
  // This should verify Firebase ID tokens instead of JWT
  // Use Firebase Admin SDK to verify tokens
  return res.status(501).json({ 
    error: 'Token authentication not implemented',
    message: 'Use Firebase Admin SDK to verify Firebase ID tokens'
  });
}

export default router;
export { authenticateToken };
