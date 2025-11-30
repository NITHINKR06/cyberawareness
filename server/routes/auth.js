import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
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

// Middleware to authenticate token - adapted for Firebase tokens
// This middleware finds or creates a MongoDB User from Firebase UID
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required', message: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required', message: 'No token provided in authorization header' });
    }

    // For now, we treat the token as the Firebase UID
    // In production, you should verify the Firebase ID token using Firebase Admin SDK
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // const firebaseUid = decodedToken.uid;
    
    // TEMPORARY: Use token directly as Firebase UID (basic validation)
    // This is NOT secure for production - implement proper Firebase Admin SDK verification
    if (token.length < 20 || token.length > 1000) {
      return res.status(401).json({ error: 'Invalid token format', message: 'Token length validation failed' });
    }

    const firebaseUid = token;

    // Find or create MongoDB User from Firebase UID
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      // If user doesn't exist, create a placeholder user
      // In production, you should get user details from Firebase Auth
      try {
        user = new User({
          username: `user_${firebaseUid.substring(0, 8)}`, // Generate a username
          email: `${firebaseUid}@firebase.local`, // Placeholder email
          firebaseUid: firebaseUid,
          // No password required for Firebase users
        });
        
        await user.save();
        console.log(`Created new MongoDB user for Firebase UID: ${firebaseUid.substring(0, 8)}...`);
      } catch (createError) {
        console.error('Error creating user:', createError);
        // If creation fails (e.g., duplicate username), try to find again
        user = await User.findOne({ firebaseUid });
        if (!user) {
          throw createError;
        }
      }
    }

    // Set userId for use in routes (MongoDB ObjectId)
    req.userId = user._id;
    req.firebaseUserId = firebaseUid;
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed', 
      message: error.message || 'Failed to authenticate user'
    });
  }
}

export default router;
export { authenticateToken };
