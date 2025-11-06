/**
 * NoSQL Injection Prevention Middleware
 * Protects against MongoDB injection attacks
 */

// Dangerous MongoDB operators that could be used for injection
const DANGEROUS_OPERATORS = [
  '$where', '$ne', '$gt', '$lt', '$gte', '$lte', '$regex', '$exists', 
  '$in', '$nin', '$all', '$size', '$elemMatch', '$not', '$or', '$and',
  '$nor', '$type', '$mod', '$text', '$geoWithin', '$geoIntersects',
  '$near', '$nearSphere', '$center', '$centerSphere', '$box', '$polygon'
];

// Function to recursively check objects for dangerous operators
function checkForDangerousOperators(obj, path = '') {
  if (obj === null || obj === undefined) {
    return { safe: true, violations: [] };
  }

  if (typeof obj === 'object') {
    // Check if it's an array
    if (Array.isArray(obj)) {
      const violations = [];
      for (let i = 0; i < obj.length; i++) {
        const result = checkForDangerousOperators(obj[i], `${path}[${i}]`);
        violations.push(...result.violations);
      }
      return { safe: violations.length === 0, violations };
    }

    // Check object keys for dangerous operators
    const violations = [];
    for (const key in obj) {
      if (DANGEROUS_OPERATORS.includes(key)) {
        violations.push({
          path: path ? `${path}.${key}` : key,
          operator: key,
          value: obj[key],
          severity: 'high'
        });
      } else {
        const result = checkForDangerousOperators(obj[key], path ? `${path}.${key}` : key);
        violations.push(...result.violations);
      }
    }
    return { safe: violations.length === 0, violations };
  }

  // Check string values for potential injection patterns
  if (typeof obj === 'string') {
    const violations = [];
    
    // Check for JavaScript code patterns
    const jsPatterns = [
      /javascript:/i,
      /<script/i,
      /on\w+\s*=/i,
      /function\s*\(/i,
      /eval\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i
    ];

    for (const pattern of jsPatterns) {
      if (pattern.test(obj)) {
        violations.push({
          path: path,
          operator: 'javascript_injection',
          value: obj.substring(0, 100) + (obj.length > 100 ? '...' : ''),
          severity: 'high'
        });
      }
    }

    // Check for MongoDB query injection patterns
    const mongoPatterns = [
      /\$where/i,
      /\$ne/i,
      /\$regex/i,
      /db\./i,
      /\.find\s*\(/i,
      /\.aggregate\s*\(/i
    ];

    for (const pattern of mongoPatterns) {
      if (pattern.test(obj)) {
        violations.push({
          path: path,
          operator: 'mongo_injection',
          value: obj.substring(0, 100) + (obj.length > 100 ? '...' : ''),
          severity: 'high'
        });
      }
    }

    return { safe: violations.length === 0, violations };
  }

  return { safe: true, violations: [] };
}

// Main NoSQL injection prevention middleware
export const preventNoSQLInjection = (req, res, next) => {
  try {
    const violations = [];

    // Check request body
    if (req.body && typeof req.body === 'object') {
      const bodyCheck = checkForDangerousOperators(req.body, 'body');
      violations.push(...bodyCheck.violations);
    }

    // Check query parameters
    if (req.query && typeof req.query === 'object') {
      const queryCheck = checkForDangerousOperators(req.query, 'query');
      violations.push(...queryCheck.violations);
    }

    // Check route parameters
    if (req.params && typeof req.params === 'object') {
      const paramsCheck = checkForDangerousOperators(req.params, 'params');
      violations.push(...paramsCheck.violations);
    }

    // If violations found, block the request
    if (violations.length > 0) {
      console.warn('NoSQL injection attempt detected:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        violations: violations.map(v => ({
          path: v.path,
          operator: v.operator,
          severity: v.severity
        }))
      });

      return res.status(400).json({
        error: 'Invalid request data detected',
        code: 'INVALID_INPUT'
      });
    }

    next();
  } catch (error) {
    console.error('NoSQL injection prevention error:', error);
    return res.status(500).json({
      error: 'Request validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
};

// Sanitization function for user input
export const sanitizeUserInput = (input) => {
  if (typeof input === 'string') {
    // Remove or escape dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/\$/g, '') // Remove dollar signs (MongoDB operators)
      .replace(/\./g, '') // Remove dots (MongoDB field access)
      .trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize key
      const cleanKey = sanitizeUserInput(key);
      // Sanitize value
      sanitized[cleanKey] = sanitizeUserInput(value);
    }
    return sanitized;
  }
  
  return input;
};

export default {
  preventNoSQLInjection,
  sanitizeUserInput,
  checkForDangerousOperators
};
