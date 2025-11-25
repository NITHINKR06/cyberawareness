import { v4 as uuidv4 } from 'uuid';

// Import security packages with fallbacks
let helmet, rateLimit;

try {
  helmet = (await import('helmet')).default;
} catch (error) {
  console.warn('Helmet not available, using basic security headers');
  helmet = null;
}

try {
  rateLimit = (await import('express-rate-limit')).default;
} catch (error) {
  console.warn('Express-rate-limit not available, using basic rate limiting');
  rateLimit = null;
}

// Security headers middleware
export const securityHeaders = helmet ? helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}) : (req, res, next) => {
  // Basic security headers without helmet
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Enhanced rate limiting for different endpoints
export const createRateLimit = (windowMs, max, message, options = {}) => {
  if (!rateLimit) {
    // Basic rate limiting without express-rate-limit
    const attempts = new Map();
    
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      if (!attempts.has(ip)) {
        attempts.set(ip, { count: 1, firstAttempt: now });
        return next();
      }
      
      const attempt = attempts.get(ip);
      
      if (now - attempt.firstAttempt > windowMs) {
        attempts.set(ip, { count: 1, firstAttempt: now });
        return next();
      }
      
      if (attempt.count >= max) {
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil((attempt.firstAttempt + windowMs - now) / 1000)
        });
      }
      
      attempt.count++;
      next();
    };
  }
  
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: options.skip || ((req) => {
      // Skip rate limiting for localhost in development
      return process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1';
    }),
    keyGenerator: options.keyGenerator || ((req) => {
      // Use IP + User-Agent for more granular rate limiting
      return `${req.ip}-${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`;
    }),
    handler: (req, res, next, options) => {
      console.warn('Rate limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        limit: options.limit,
        windowMs: options.windowMs
      });

      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(options.windowMs / 1000),
        limit: options.limit,
        remaining: options.remaining
      });
    },
  });
};

// Specific rate limits with enhanced security
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts. Please try again later.',
  {
    keyGenerator: ((req) => `${req.ip}-auth`),
    skip: false // Always apply to auth endpoints
  }
);

export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many API requests. Please try again later.',
  {
    keyGenerator: ((req) => `${req.ip}-api`)
  }
);

export const analyzerRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 requests
  'Too many analysis requests. Please wait before trying again.',
  {
    keyGenerator: ((req) => `${req.ip}-analyzer`)
  }
);

// Stricter rate limiting for URL analyzer (requires authentication)
export const urlAnalyzerRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  5, // 5 requests per minute (stricter than text analyzer)
  'Too many URL analysis requests. Please wait before trying again.',
  {
    keyGenerator: ((req) => {
      // Use user ID if authenticated, otherwise IP
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token && token.length >= 20) {
        return `${token}-url-analyzer`; // Per-user rate limiting
      }
      return `${req.ip}-url-analyzer`; // Per-IP rate limiting for unauthenticated
    })
  }
);

// Strict rate limiting for sensitive endpoints
export const strictRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  3, // 3 attempts
  'Too many attempts. Please wait before trying again.',
  {
    keyGenerator: ((req) => `${req.ip}-strict`),
    skip: false
  }
);

// File upload rate limiting
export const uploadRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads
  'Too many file uploads. Please wait before trying again.',
  {
    keyGenerator: ((req) => `${req.ip}-upload`)
  }
);

// Admin endpoint rate limiting
export const adminRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // 20 requests
  'Too many admin requests. Please try again later.',
  {
    keyGenerator: ((req) => `${req.ip}-admin`)
  }
);

// CSRF protection
export const csrfProtection = (req, res, next) => {
  // Generate CSRF token for GET requests
  if (req.method === 'GET') {
    req.csrfToken = () => uuidv4();
    res.locals.csrfToken = req.csrfToken();
  }
  
  // Verify CSRF token for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  
  next();
};

// Session security
export const secureSession = (req, res, next) => {
  // Regenerate session ID on login
  if (req.path === '/api/auth/login' && req.method === 'POST') {
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      next();
    });
  } else {
    next();
  }
};

// Request logging for security monitoring
export const securityLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      sessionId: req.session?.sessionId
    };
    
    // Log suspicious activity
    if (res.statusCode >= 400) {
      console.warn('Suspicious activity detected:', logData);
    }
    
    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', logData);
    }
  });
  
  next();
};

// Input validation for file uploads
export const validateFileUpload = (req, res, next) => {
  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      });
    }
    
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB.'
      });
    }
    
    // Check for malicious file content
    const buffer = req.file.buffer;
    const fileHeader = buffer.toString('hex', 0, 4);
    
    // Check for common image file signatures
    const validSignatures = [
      'ffd8ffe0', // JPEG
      'ffd8ffe1', // JPEG
      'ffd8ffe2', // JPEG
      '89504e47', // PNG
      '47494638', // GIF
      '52494646'  // WebP
    ];
    
    if (!validSignatures.some(sig => fileHeader.startsWith(sig))) {
      return res.status(400).json({
        error: 'Invalid file format. File may be corrupted or malicious.'
      });
    }
  }
  
  next();
};

// SQL injection prevention (for MongoDB, but good practice)
export const preventInjection = (req, res, next) => {
  const dangerousPatterns = [
    /(\$where|\$ne|\$gt|\$lt|\$regex)/i,
    /javascript:/i,
    /<script/i,
    /on\w+\s*=/i
  ];
  
  const checkObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (dangerousPatterns.some(pattern => pattern.test(obj[key]))) {
          return false;
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (!checkObject(obj[key])) {
          return false;
        }
      }
    }
    return true;
  };
  
  if (req.body && !checkObject(req.body)) {
    return res.status(400).json({
      error: 'Invalid input detected. Please check your data.'
    });
  }
  
  if (req.query && !checkObject(req.query)) {
    return res.status(400).json({
      error: 'Invalid query parameters detected.'
    });
  }
  
  next();
};

export default {
  securityHeaders,
  authRateLimit,
  apiRateLimit,
  analyzerRateLimit,
  csrfProtection,
  secureSession,
  securityLogger,
  validateFileUpload,
  preventInjection
};
