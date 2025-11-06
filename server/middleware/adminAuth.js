import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify if user is authenticated
export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned', reason: user.banReason });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify if user is admin
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isAdmin && user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned', reason: user.banReason });
    }

    req.user = user;
    req.isAdmin = true;
    req.isSuperAdmin = user.role === 'superadmin';
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify if user is moderator or higher
export const verifyModerator = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const allowedRoles = ['moderator', 'admin', 'superadmin'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Moderator access required' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned', reason: user.banReason });
    }

    req.user = user;
    req.isModerator = true;
    req.isAdmin = user.role === 'admin' || user.role === 'superadmin';
    req.isSuperAdmin = user.role === 'superadmin';
    next();
  } catch (error) {
    console.error('Moderator verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify if user is super admin
export const verifySuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    req.user = user;
    req.isSuperAdmin = true;
    next();
  } catch (error) {
    console.error('Super admin verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
