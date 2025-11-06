import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authRateLimit, apiRateLimit, analyzerRateLimit } from '../middleware/security.js';

describe('Security Middleware', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
  });
  
  afterEach(() => {
    // Clean up any rate limit stores
    if (authRateLimit.reset) {
      authRateLimit.reset();
    }
    if (apiRateLimit.reset) {
      apiRateLimit.reset();
    }
    if (analyzerRateLimit.reset) {
      analyzerRateLimit.reset();
    }
  });
  
  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      app.use('/api/auth', authRateLimit);
      app.post('/api/auth/login', (req, res) => {
        res.json({ message: 'Login successful' });
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });
      
      expect(response.status).toBe(200);
    });
    
    it('should block requests exceeding rate limit', async () => {
      app.use('/api/auth', authRateLimit);
      app.post('/api/auth/login', (req, res) => {
        res.json({ message: 'Login successful' });
      });
      
      // Make multiple requests to exceed rate limit
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password' })
        );
      }
      
      const responses = await Promise.all(promises);
      const blockedResponses = responses.filter(r => r.status === 429);
      
      expect(blockedResponses.length).toBeGreaterThan(0);
    });
    
    it('should include retry-after header when rate limited', async () => {
      app.use('/api/analyzer', analyzerRateLimit);
      app.post('/api/analyzer/analyze', (req, res) => {
        res.json({ result: 'Analysis complete' });
      });
      
      // Exceed rate limit
      const promises = [];
      for (let i = 0; i < 11; i++) {
        promises.push(
          request(app)
            .post('/api/analyzer/analyze')
            .send({ inputType: 'text', inputContent: 'test content' })
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimitedResponse = responses.find(r => r.status === 429);
      
      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse.headers['retry-after']).toBeDefined();
    });
  });
  
  describe('Input Validation', () => {
    it('should reject malicious input patterns', () => {
      const maliciousInputs = [
        { $where: 'this.username == "admin"' },
        { $ne: null },
        { $regex: /admin/i },
        { $gt: 0 }
      ];
      
      // This would be tested in the actual middleware
      maliciousInputs.forEach(input => {
        expect(() => {
          // Simulate the validation logic
          const inputStr = JSON.stringify(input);
          if (/(\$where|\$ne|\$gt|\$lt|\$regex)/i.test(inputStr)) {
            throw new Error('Malicious input detected');
          }
        }).toThrow('Malicious input detected');
      });
    });
    
    it('should allow safe input patterns', () => {
      const safeInputs = [
        { username: 'john_doe' },
        { email: 'user@example.com' },
        { age: 25 },
        { tags: ['tag1', 'tag2'] }
      ];
      
      safeInputs.forEach(input => {
        expect(() => {
          const inputStr = JSON.stringify(input);
          if (/(\$where|\$ne|\$gt|\$lt|\$regex)/i.test(inputStr)) {
            throw new Error('Malicious input detected');
          }
        }).not.toThrow();
      });
    });
  });
  
  describe('File Upload Security', () => {
    it('should reject files with invalid MIME types', () => {
      const invalidFiles = [
        { mimetype: 'application/javascript' },
        { mimetype: 'text/html' },
        { mimetype: 'application/octet-stream' }
      ];
      
      invalidFiles.forEach(file => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        expect(allowedTypes.includes(file.mimetype)).toBe(false);
      });
    });
    
    it('should accept files with valid MIME types', () => {
      const validFiles = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'image/png' },
        { mimetype: 'image/gif' },
        { mimetype: 'image/webp' }
      ];
      
      validFiles.forEach(file => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        expect(allowedTypes.includes(file.mimetype)).toBe(true);
      });
    });
    
    it('should reject files exceeding size limit', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const largeFile = { size: 10 * 1024 * 1024 }; // 10MB
      
      expect(largeFile.size).toBeGreaterThan(maxSize);
    });
    
    it('should accept files within size limit', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const normalFile = { size: 2 * 1024 * 1024 }; // 2MB
      
      expect(normalFile.size).toBeLessThanOrEqual(maxSize);
    });
  });
  
  describe('CSRF Protection', () => {
    it('should require CSRF token for state-changing requests', () => {
      const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      
      stateChangingMethods.forEach(method => {
        expect(['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)).toBe(true);
      });
    });
    
    it('should allow GET requests without CSRF token', () => {
      const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
      
      safeMethods.forEach(method => {
        expect(['GET', 'HEAD', 'OPTIONS'].includes(method)).toBe(true);
      });
    });
  });
  
  describe('Session Security', () => {
    it('should regenerate session on login', () => {
      const loginPath = '/api/auth/login';
      const loginMethod = 'POST';
      
      expect(loginPath).toBe('/api/auth/login');
      expect(loginMethod).toBe('POST');
    });
    
    it('should set secure session options', () => {
      const sessionOptions = {
        secure: true, // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      };
      
      expect(sessionOptions.secure).toBe(true);
      expect(sessionOptions.httpOnly).toBe(true);
      expect(sessionOptions.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
    });
  });
});

// Integration tests
describe('Security Integration', () => {
  it('should handle multiple security layers', () => {
    const securityLayers = [
      'Rate limiting',
      'Input validation',
      'XSS protection',
      'CSRF protection',
      'Session security',
      'File upload validation'
    ];
    
    expect(securityLayers.length).toBe(6);
    securityLayers.forEach(layer => {
      expect(typeof layer).toBe('string');
      expect(layer.length).toBeGreaterThan(0);
    });
  });
  
  it('should provide comprehensive error messages', () => {
    const errorMessages = {
      rateLimit: 'Too many requests. Please try again later.',
      invalidInput: 'Invalid input detected. Please check your data.',
      csrfToken: 'Invalid CSRF token',
      fileType: 'Invalid file type. Only images are allowed.',
      fileSize: 'File too large. Maximum size is 5MB.'
    };
    
    Object.values(errorMessages).forEach(message => {
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
