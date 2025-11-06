/**
 * CSRF Protection Middleware
 * Implements Cross-Site Request Forgery protection
 */

import csrf from 'csurf';
import crypto from 'crypto';

// Custom CSRF implementation (since csurf is deprecated)
class CSRFProtection {
  constructor(options = {}) {
    this.options = {
      cookie: options.cookie || false,
      ignoreMethods: options.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'],
      ...options
    };
    this.tokens = new Map(); // In production, use Redis or database
  }

  // Generate a secure random token
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create a secret for the session
  createSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Get or create CSRF token for session
  getToken(req) {
    if (!req.session) {
      throw new Error('CSRF protection requires session middleware');
    }

    // Get or create secret for this session
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = this.createSecret();
    }

    // Generate token based on session secret
    const token = crypto
      .createHmac('sha256', req.session.csrfSecret)
      .update(req.sessionID || 'default')
      .digest('hex');

    return token;
  }

  // Verify CSRF token
  verifyToken(req, token) {
    if (!req.session) {
      return false;
    }

    const expectedToken = this.getToken(req);
    return crypto.timingSafeEqual(
      Buffer.from(token || '', 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  }

  // Main CSRF protection middleware
  middleware() {
    return (req, res, next) => {
      // Skip CSRF check for ignored methods
      if (this.options.ignoreMethods.includes(req.method)) {
        return next();
      }

      // Skip CSRF check for API routes with proper authentication
      if (req.path.startsWith('/api/') && req.headers.authorization) {
        return next();
      }

      try {
        // Get token from header or body
        const token = req.headers['x-csrf-token'] || 
                     req.headers['csrf-token'] || 
                     req.body?._csrf ||
                     req.query?._csrf;

        // Verify token
        if (!token || !this.verifyToken(req, token)) {
          console.warn('CSRF token validation failed:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
          });

          return res.status(403).json({
            error: 'Invalid CSRF token',
            code: 'CSRF_TOKEN_INVALID'
          });
        }

        next();
      } catch (error) {
        console.error('CSRF protection error:', error);
        return res.status(500).json({
          error: 'CSRF validation failed',
          code: 'CSRF_ERROR'
        });
      }
    };
  }

  // Middleware to generate and attach CSRF token to requests
  tokenMiddleware() {
    return (req, res, next) => {
      if (req.session) {
        // Generate and attach token to request
        req.csrfToken = () => this.getToken(req);
        
        // Make token available to templates
        res.locals.csrfToken = req.csrfToken();
      }
      next();
    };
  }

  // Middleware to provide CSRF token via API
  apiTokenMiddleware() {
    return (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        const token = req.csrfToken ? req.csrfToken() : this.getToken(req);
        res.setHeader('X-CSRF-Token', token);
      }
      next();
    };
  }
}

// Create CSRF protection instance
const csrfProtection = new CSRFProtection({
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Export middleware functions
export const csrfProtectionMiddleware = csrfProtection.middleware();
export const csrfTokenMiddleware = csrfProtection.tokenMiddleware();
export const csrfApiTokenMiddleware = csrfProtection.apiTokenMiddleware();

// API endpoint to get CSRF token
export const getCSRFToken = (req, res) => {
  try {
    const token = req.csrfToken ? req.csrfToken() : csrfProtection.getToken(req);
    res.json({
      csrfToken: token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    res.status(500).json({
      error: 'Failed to generate CSRF token',
      code: 'CSRF_TOKEN_ERROR'
    });
  }
};

// Utility function to verify CSRF token manually
export const verifyCSRFToken = (req, token) => {
  return csrfProtection.verifyToken(req, token);
};

// Utility function to generate CSRF token manually
export const generateCSRFToken = (req) => {
  return csrfProtection.getToken(req);
};

// Enhanced CSRF protection with additional security measures
export const enhancedCSRFProtection = (req, res, next) => {
  // Check Origin header for same-origin requests
  const origin = req.get('Origin') || req.get('Referer');
  const host = req.get('Host');
  
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        console.warn('CSRF: Origin mismatch detected:', {
          origin: origin,
          host: host,
          ip: req.ip
        });
        
        return res.status(403).json({
          error: 'Cross-origin request blocked',
          code: 'CORS_VIOLATION'
        });
      }
    } catch (error) {
      console.warn('CSRF: Invalid origin header:', origin);
    }
  }

  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-cluster-client-ip'
  ];

  for (const header of suspiciousHeaders) {
    if (req.get(header) && !req.get('X-Forwarded-Proto')) {
      console.warn('CSRF: Suspicious proxy headers detected:', {
        header: header,
        value: req.get(header),
        ip: req.ip
      });
    }
  }

  // Apply standard CSRF protection
  return csrfProtectionMiddleware(req, res, next);
};

export default {
  csrfProtectionMiddleware,
  csrfTokenMiddleware,
  csrfApiTokenMiddleware,
  getCSRFToken,
  verifyCSRFToken,
  generateCSRFToken,
  enhancedCSRFProtection
};
