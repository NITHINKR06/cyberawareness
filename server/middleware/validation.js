// Import validation packages with fallbacks
let validator, DOMPurify;

try {
  validator = (await import('validator')).default;
} catch (error) {
  console.warn('Validator not available, using basic validation');
  validator = null;
}

try {
  DOMPurify = (await import('isomorphic-dompurify')).default;
} catch (error) {
  console.warn('DOMPurify not available, using basic sanitization');
  DOMPurify = null;
}

// Enhanced validation middleware
export const validateUserInput = {
  // Username validation
  username: (username) => {
    const errors = [];
    
    if (!username || typeof username !== 'string') {
      errors.push('Username is required');
      return { isValid: false, errors };
    }
    
    const trimmed = username.trim();
    
    if (trimmed.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (trimmed.length > 30) {
      errors.push('Username must be no more than 30 characters long');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }
    
    if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
      errors.push('Username cannot start or end with a hyphen');
    }
    
    if (trimmed.startsWith('_') || trimmed.endsWith('_')) {
      errors.push('Username cannot start or end with an underscore');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: trimmed
    };
  },

  // Email validation
  email: (email) => {
    const errors = [];
    
    if (!email || typeof email !== 'string') {
      errors.push('Email is required');
      return { isValid: false, errors };
    }
    
    const trimmed = email.trim().toLowerCase();
    
    // Use validator if available, otherwise use basic regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = validator ? validator.isEmail(trimmed) : emailRegex.test(trimmed);
    
    if (!isValidEmail) {
      errors.push('Please enter a valid email address');
    }
    
    if (trimmed.length > 254) {
      errors.push('Email address is too long');
    }
    
    // Check for suspicious patterns
    if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
      errors.push('Email address contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: trimmed
    };
  },

  // Enhanced password validation
  password: (password) => {
    const errors = [];
    
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    // Enhanced length requirements
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password is too long (maximum 128 characters)');
    }
    
    // Expanded list of common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'password1', 'qwerty123', '12345678', 'password1234',
      'admin123', 'root', 'toor', 'pass', 'test', 'guest',
      'user', 'demo', 'sample', 'example', 'default'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a stronger password');
    }
    
    // Check for personal information patterns
    const personalPatterns = [
      /(.)\1{3,}/, // 4+ consecutive identical characters
      /123456/, // Sequential numbers
      /abcdef/i, // Sequential letters
      /qwerty/i, // Keyboard patterns
      /asdfgh/i, // Keyboard patterns
      /zxcvbn/i, // Keyboard patterns
      /password/i, // Contains "password"
      /admin/i, // Contains "admin"
      /login/i, // Contains "login"
      /user/i // Contains "user"
    ];
    
    for (const pattern of personalPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns that are easy to guess');
        break;
      }
    }
    
    // Enhanced character requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_+=\-\[\]\\|;':",./<>?]/.test(password);
    const hasUnicodeChar = /[^\x00-\x7F]/.test(password); // Non-ASCII characters
    
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>_+-=[]\\|;\':",./<>?)');
    }
    
    // Check for character diversity
    const uniqueChars = new Set(password).size;
    if (uniqueChars < 6) {
      errors.push('Password must contain at least 6 different characters');
    }
    
    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain more than 2 consecutive identical characters');
    }
    
    // Check for common substitutions that are still weak
    const weakSubstitutions = [
      /p@ssw0rd/i,
      /@dm1n/i,
      /p@ss/i,
      /h3ll0/i,
      /w0rld/i
    ];
    
    for (const pattern of weakSubstitutions) {
      if (pattern.test(password)) {
        errors.push('Password uses common character substitutions that are still weak');
        break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: calculatePasswordStrength(password),
      hasUnicode: hasUnicodeChar
    };
  },

  // Text input sanitization
  sanitizeText: (text) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    let sanitized = text;
    
    if (DOMPurify) {
      // Remove potential XSS attacks using DOMPurify
      sanitized = DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    } else {
      // Basic sanitization without DOMPurify
      sanitized = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<[^>]*>/g, '');
    }
    
    // Trim and limit length
    return sanitized.trim().substring(0, 10000);
  },

  // URL validation
  url: (url) => {
    const errors = [];
    
    if (!url || typeof url !== 'string') {
      errors.push('URL is required');
      return { isValid: false, errors };
    }
    
    const trimmed = url.trim();
    
    // Use validator if available, otherwise use basic regex
    const urlRegex = /^https?:\/\/.+/;
    const isValidUrl = validator ? validator.isURL(trimmed, { 
      protocols: ['http', 'https'],
      require_protocol: true 
    }) : urlRegex.test(trimmed);
    
    if (!isValidUrl) {
      errors.push('Please enter a valid URL starting with http:// or https://');
    }
    
    if (trimmed.length > 2048) {
      errors.push('URL is too long');
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /bit\.ly/i, /tinyurl\.com/i, /goo\.gl/i, /ow\.ly/i,
      /is\.gd/i, /t\.co/i, /buff\.ly/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
      errors.push('Warning: This appears to be a shortened URL. Proceed with caution.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: trimmed
    };
  }
};

// Calculate password strength score
function calculatePasswordStrength(password) {
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 1;
  if (/123|abc|qwe/i.test(password)) score -= 1;
  
  const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const level = Math.min(Math.max(score, 0), 5);
  
  return {
    score,
    level,
    description: strengthLevels[level]
  };
}

// Rate limiting for validation attempts
const validationAttempts = new Map();

export const rateLimitValidation = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;
  
  if (!validationAttempts.has(ip)) {
    validationAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }
  
  const attempts = validationAttempts.get(ip);
  
  if (now - attempts.firstAttempt > windowMs) {
    validationAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }
  
  if (attempts.count >= maxAttempts) {
    return res.status(429).json({
      error: 'Too many validation attempts. Please try again later.',
      retryAfter: Math.ceil((attempts.firstAttempt + windowMs - now) / 1000)
    });
  }
  
  attempts.count++;
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = validateUserInput.sanitizeText(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) {
    sanitizeObject(req.body);
  }
  
  if (req.query) {
    sanitizeObject(req.query);
  }
  
  next();
};

export default validateUserInput;
