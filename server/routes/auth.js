import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ScamReport from '../models/ScamReport.js';
import AnalyzerHistory from '../models/AnalyzerHistory.js';
import { validateUserInput, rateLimitValidation, sanitizeInput } from '../middleware/validation.js';
import { authRateLimit } from '../middleware/security.js';
import { csrfProtectionMiddleware } from '../middleware/csrfProtection.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for security');
}

// Register
router.post('/register', authRateLimit, csrfProtectionMiddleware, sanitizeInput, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    const usernameValidation = validateUserInput.username(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ 
        error: 'Username validation failed',
        details: usernameValidation.errors
      });
    }

    const emailValidation = validateUserInput.email(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        error: 'Email validation failed',
        details: emailValidation.errors
      });
    }

    const passwordValidation = validateUserInput.password(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Password validation failed',
        details: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: emailValidation.sanitized }, { username: usernameValidation.sanitized }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Create new user with sanitized data
    const user = new User({
      username: usernameValidation.sanitized,
      email: emailValidation.sanitized,
      password
    });

    // Link anonymous session if exists
    if (req.session.sessionId) {
      user.linkedSessions.push(req.session.sessionId);
    }

    await user.save();

    // Link anonymous activities to user
    if (req.session.sessionId) {
      await linkAnonymousActivities(user._id, req.session.sessionId);
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working', timestamp: new Date().toISOString() });
});

// Login
router.post('/login', authRateLimit, csrfProtectionMiddleware, sanitizeInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailValidation = validateUserInput.email(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: emailValidation.errors
      });
    }

    // Clean email (remove any whitespace)
    const cleanEmail = emailValidation.sanitized;

    // Find user - explicitly select password field
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password.trim());
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update streak - but don't fail if it errors
    try {
      user.updateStreak();
      
      // Link anonymous session if exists - but don't fail if it errors
      if (req.session && req.session.sessionId && !user.linkedSessions.includes(req.session.sessionId)) {
        user.linkedSessions.push(req.session.sessionId);
        await linkAnonymousActivities(user._id, req.session.sessionId);
      }
      
      await user.save();
    } catch (saveError) {
      console.error('Error updating user data:', saveError);
      // Continue with login even if these updates fail
    }

    // Generate token with admin info
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        isAdmin: user.isAdmin || false,
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        isAdmin: user.isAdmin || false,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// Link anonymous activities to user
async function linkAnonymousActivities(userId, sessionId) {
  try {
    // Update scam reports
    await ScamReport.updateMany(
      { sessionId, userId: null },
      { userId }
    );

    // Update analyzer history
    await AnalyzerHistory.updateMany(
      { sessionId, userId: null },
      { userId }
    );

    // Successfully linked anonymous activities to user
  } catch (error) {
    console.error('Error linking anonymous activities:', error);
  }
}

// Verify token middleware
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        isAdmin: user.isAdmin || false,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, sanitizeInput, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate username if being changed
    if (username && username !== user.username) {
      const usernameValidation = validateUserInput.username(username);
      if (!usernameValidation.isValid) {
        return res.status(400).json({ 
          error: 'Username validation failed',
          details: usernameValidation.errors
        });
      }

      const existingUser = await User.findOne({ 
        username: usernameValidation.sanitized, 
        _id: { $ne: user._id } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = usernameValidation.sanitized;
    }

    // Validate email if being changed
    if (email && email !== user.email) {
      const emailValidation = validateUserInput.email(email);
      if (!emailValidation.isValid) {
        return res.status(400).json({ 
          error: 'Email validation failed',
          details: emailValidation.errors
        });
      }

      const existingUser = await User.findOne({ 
        email: emailValidation.sanitized, 
        _id: { $ne: user._id } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = emailValidation.sanitized;
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }

      // Validate new password
      const passwordValidation = validateUserInput.password(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: 'Password validation failed',
          details: passwordValidation.errors,
          strength: passwordValidation.strength
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // Clear session
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.isAdmin = decoded.isAdmin || false;
    req.role = decoded.role || 'user';
    next();
  });
}

export default router;
export { authenticateToken };
