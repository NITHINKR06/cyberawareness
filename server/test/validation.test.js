import { validateUserInput } from '../middleware/validation.js';
import { describe, it, expect } from 'vitest';

describe('User Input Validation', () => {
  describe('Username Validation', () => {
    it('should accept valid usernames', () => {
      const validUsernames = [
        'john_doe',
        'user123',
        'test-user',
        'admin',
        'a1b2c3'
      ];
      
      validUsernames.forEach(username => {
        const result = validateUserInput.username(username);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
    
    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        { input: '', expected: 'Username is required' },
        { input: 'ab', expected: 'Username must be at least 3 characters long' },
        { input: 'a'.repeat(31), expected: 'Username must be no more than 30 characters long' },
        { input: 'user@domain', expected: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { input: '-user', expected: 'Username cannot start or end with a hyphen' },
        { input: 'user-', expected: 'Username cannot start or end with a hyphen' },
        { input: '_user', expected: 'Username cannot start or end with an underscore' },
        { input: 'user_', expected: 'Username cannot start or end with an underscore' }
      ];
      
      invalidUsernames.forEach(({ input, expected }) => {
        const result = validateUserInput.username(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expected);
      });
    });
  });
  
  describe('Email Validation', () => {
    it('should accept valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];
      
      validEmails.forEach(email => {
        const result = validateUserInput.email(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
    
    it('should reject invalid emails', () => {
      const invalidEmails = [
        { input: '', expected: 'Email is required' },
        { input: 'invalid-email', expected: 'Please enter a valid email address' },
        { input: '@domain.com', expected: 'Please enter a valid email address' },
        { input: 'user@', expected: 'Please enter a valid email address' },
        { input: 'user..name@domain.com', expected: 'Email address contains invalid characters' },
        { input: '.user@domain.com', expected: 'Email address contains invalid characters' },
        { input: 'user@domain.com.', expected: 'Email address contains invalid characters' }
      ];
      
      invalidEmails.forEach(({ input, expected }) => {
        const result = validateUserInput.email(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expected);
      });
    });
  });
  
  describe('Password Validation', () => {
    it('should accept strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MyStr0ng#Pass',
        'SecureP@ssw0rd',
        'ComplexP@ss1!'
      ];
      
      strongPasswords.forEach(password => {
        const result = validateUserInput.password(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.strength.level).toBeGreaterThanOrEqual(3);
      });
    });
    
    it('should reject weak passwords', () => {
      const weakPasswords = [
        { input: '', expected: 'Password is required' },
        { input: '123456', expected: 'Password must be at least 8 characters long' },
        { input: 'password', expected: 'Password must contain at least one uppercase letter' },
        { input: 'PASSWORD', expected: 'Password must contain at least one lowercase letter' },
        { input: 'Password', expected: 'Password must contain at least one number' },
        { input: 'Password123', expected: 'Password must contain at least one special character' },
        { input: 'Password123!', expected: 'Password is too common, please choose a stronger password' }
      ];
      
      weakPasswords.forEach(({ input, expected }) => {
        const result = validateUserInput.password(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expected);
      });
    });
    
    it('should calculate password strength correctly', () => {
      const testCases = [
        { password: '123456', expectedLevel: 0 },
        { password: 'password', expectedLevel: 1 },
        { password: 'Password', expectedLevel: 2 },
        { password: 'Password123', expectedLevel: 3 },
        { password: 'Password123!', expectedLevel: 4 },
        { password: 'MyStr0ng#Pass!', expectedLevel: 5 }
      ];
      
      testCases.forEach(({ password, expectedLevel }) => {
        const result = validateUserInput.password(password);
        expect(result.strength.level).toBe(expectedLevel);
      });
    });
  });
  
  describe('URL Validation', () => {
    it('should accept valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://subdomain.example.com/path',
        'https://example.com:8080/path?query=value'
      ];
      
      validUrls.forEach(url => {
        const result = validateUserInput.url(url);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
    
    it('should reject invalid URLs', () => {
      const invalidUrls = [
        { input: '', expected: 'URL is required' },
        { input: 'not-a-url', expected: 'Please enter a valid URL starting with http:// or https://' },
        { input: 'ftp://example.com', expected: 'Please enter a valid URL starting with http:// or https://' },
        { input: 'example.com', expected: 'Please enter a valid URL starting with http:// or https://' }
      ];
      
      invalidUrls.forEach(({ input, expected }) => {
        const result = validateUserInput.url(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expected);
      });
    });
    
    it('should warn about suspicious URLs', () => {
      const suspiciousUrls = [
        'https://bit.ly/short',
        'https://tinyurl.com/abc123',
        'https://goo.gl/xyz'
      ];
      
      suspiciousUrls.forEach(url => {
        const result = validateUserInput.url(url);
        expect(result.isValid).toBe(true);
        expect(result.errors).toContain('Warning: This appears to be a shortened URL. Proceed with caution.');
      });
    });
  });
  
  describe('Text Sanitization', () => {
    it('should sanitize dangerous HTML', () => {
      const dangerousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<svg onload="alert(1)"></svg>'
      ];
      
      dangerousInputs.forEach(input => {
        const sanitized = validateUserInput.sanitizeText(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('javascript:');
      });
    });
    
    it('should preserve safe text', () => {
      const safeInputs = [
        'Hello, world!',
        'This is a normal message.',
        'Numbers: 123, 456, 789',
        'Special chars: @#$%^&*()'
      ];
      
      safeInputs.forEach(input => {
        const sanitized = validateUserInput.sanitizeText(input);
        expect(sanitized).toBe(input);
      });
    });
    
    it('should limit text length', () => {
      const longText = 'a'.repeat(15000);
      const sanitized = validateUserInput.sanitizeText(longText);
      expect(sanitized.length).toBeLessThanOrEqual(10000);
    });
  });
});

// Performance tests
describe('Validation Performance', () => {
  it('should validate inputs quickly', () => {
    const start = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      validateUserInput.username('testuser' + i);
      validateUserInput.email('test' + i + '@example.com');
      validateUserInput.password('Password123!' + i);
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
  });
});
