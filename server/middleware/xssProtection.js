/**
 * XSS Protection Middleware
 * Sanitizes user input to prevent Cross-Site Scripting attacks
 */

import DOMPurify from 'isomorphic-dompurify';

// XSS patterns to detect and block
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi,
  /<link\b[^>]*>/gi,
  /<meta\b[^>]*>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi
];

// Check for XSS patterns in text
function detectXSS(input) {
  if (typeof input !== 'string') {
    return { safe: true, violations: [] };
  }

  const violations = [];
  
  for (const pattern of XSS_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      violations.push({
        pattern: pattern.source,
        matches: matches.map(m => m.substring(0, 50) + (m.length > 50 ? '...' : '')),
        severity: 'high'
      });
    }
  }

  return {
    safe: violations.length === 0,
    violations
  };
}

// Recursively sanitize objects
function sanitizeObject(obj, options = {}) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      const cleanKey = sanitizeString(key, { ...options, isKey: true });
      sanitized[cleanKey] = sanitizeObject(value, options);
    }
    return sanitized;
  }

  return obj;
}

// Sanitize a string using DOMPurify
function sanitizeString(input, options = {}) {
  if (typeof input !== 'string') {
    return input;
  }

  const sanitizeOptions = {
    ALLOWED_TAGS: options.allowTags || [],
    ALLOWED_ATTR: options.allowAttributes || [],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false
  };

  // For keys, be more restrictive
  if (options.isKey) {
    sanitizeOptions.ALLOWED_TAGS = [];
    sanitizeOptions.ALLOWED_ATTR = [];
  }

  // Use DOMPurify to sanitize
  let sanitized = DOMPurify.sanitize(input, sanitizeOptions);

  // Additional manual sanitization for extra security
  sanitized = sanitized
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:text\/html/gi, '') // Remove data URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<script/gi, '&lt;script') // Escape script tags
    .replace(/<\/script>/gi, '&lt;/script&gt;') // Escape closing script tags
    .trim();

  return sanitized;
}

// Main XSS protection middleware
export const preventXSS = (options = {}) => {
  return (req, res, next) => {
    try {
      // Check for XSS in request body
      if (req.body) {
        const bodyCheck = detectXSS(JSON.stringify(req.body));
        if (!bodyCheck.safe) {
          console.warn('XSS attempt detected in request body:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            violations: bodyCheck.violations
          });

          return res.status(400).json({
            error: 'Potentially malicious content detected',
            code: 'XSS_DETECTED'
          });
        }

        // Sanitize request body - create new object instead of reassigning
        const sanitizedBody = sanitizeObject(req.body, options);
        // Use Object.defineProperty to safely update the body
        Object.defineProperty(req, 'body', {
          value: sanitizedBody,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      // Check for XSS in query parameters
      if (req.query && Object.keys(req.query).length > 0) {
        const queryString = new URLSearchParams(req.query).toString();
        const queryCheck = detectXSS(queryString);
        if (!queryCheck.safe) {
          console.warn('XSS attempt detected in query parameters:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            violations: queryCheck.violations
          });

          return res.status(400).json({
            error: 'Potentially malicious content detected',
            code: 'XSS_DETECTED'
          });
        }

        // Sanitize query parameters - create new object instead of reassigning
        const sanitizedQuery = sanitizeObject(req.query, options);
        // Use Object.defineProperty to safely update the query
        Object.defineProperty(req, 'query', {
          value: sanitizedQuery,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      // Check for XSS in route parameters
      if (req.params && Object.keys(req.params).length > 0) {
        const paramsCheck = detectXSS(JSON.stringify(req.params));
        if (!paramsCheck.safe) {
          console.warn('XSS attempt detected in route parameters:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            violations: paramsCheck.violations
          });

          return res.status(400).json({
            error: 'Potentially malicious content detected',
            code: 'XSS_DETECTED'
          });
        }

        // Sanitize route parameters - create new object instead of reassigning
        const sanitizedParams = sanitizeObject(req.params, options);
        // Use Object.defineProperty to safely update the params
        Object.defineProperty(req, 'params', {
          value: sanitizedParams,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      next();
    } catch (error) {
      console.error('XSS protection error:', error);
      return res.status(500).json({
        error: 'Request validation failed',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

// Content Security Policy headers
export const setCSPHeaders = (req, res, next) => {
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-inline and unsafe-eval should be removed in production
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openai.com https://api.huggingface.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspHeader);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

// Sanitization utility functions
export const sanitizeHtml = (html, options = {}) => {
  return sanitizeString(html, {
    allowTags: options.allowTags || ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowAttributes: options.allowAttributes || ['class', 'id']
  });
};

export const sanitizeText = (text) => {
  return sanitizeString(text, { allowTags: [], allowAttributes: [] });
};

export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  
  // Basic URL validation and sanitization
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

export default {
  preventXSS,
  setCSPHeaders,
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  detectXSS,
  sanitizeObject
};
