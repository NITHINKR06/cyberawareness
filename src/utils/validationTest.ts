/**
 * Frontend Validation Testing Utilities
 * Tests all client-side validation rules
 */

// Test data for frontend validation
export const testData = {
  usernames: {
    valid: ['john_doe', 'user123', 'test-user', 'admin', 'a1b2c3'],
    invalid: ['ab', 'a'.repeat(31), 'user@domain', '-user', 'user-', '_user', 'user_']
  },
  emails: {
    valid: ['user@example.com', 'test.email@domain.co.uk', 'user+tag@example.org'],
    invalid: ['invalid-email', '@domain.com', 'user@', 'user..name@domain.com']
  },
  passwords: {
    valid: ['Password123!', 'MyStr0ng#Pass', 'SecureP@ssw0rd'],
    invalid: ['123456', 'password', 'PASSWORD', 'Password', 'Password123']
  },
  urls: {
    valid: ['https://example.com', 'http://test.org', 'https://subdomain.example.com/path'],
    invalid: ['not-a-url', 'ftp://example.com', 'example.com']
  }
};

// Frontend validation functions (matching server-side rules)
export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
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
    errors
  };
};

export const validateEmail = (email: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    errors.push('Please enter a valid email address');
  }
  
  if (trimmed.length > 254) {
    errors.push('Email address is too long');
  }
  
  if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    errors.push('Email address contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[]; strength: any } => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors, strength: { level: 0, description: 'Very Weak' } };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password');
  }
  
  // Check password strength
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
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
    errors.push('Password must contain at least one special character');
  }
  
  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

export const validateUrl = (url: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!url || typeof url !== 'string') {
    errors.push('URL is required');
    return { isValid: false, errors };
  }
  
  const trimmed = url.trim();
  
  if (!/^https?:\/\/.+/.test(trimmed)) {
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
    errors
  };
};

// Calculate password strength
function calculatePasswordStrength(password: string) {
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

// Test runner for frontend validation
export const runFrontendValidationTests = () => {
  console.log('🧪 Running Frontend Validation Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test username validation
  console.log('🔍 Testing Username Validation...');
  testData.usernames.valid.forEach(username => {
    const result = validateUsername(username);
    if (result.isValid) {
      passed++;
      console.log(`✅ Valid username: "${username}"`);
    } else {
      failed++;
      console.log(`❌ Valid username failed: "${username}" - ${result.errors.join(', ')}`);
    }
  });
  
  testData.usernames.invalid.forEach(username => {
    const result = validateUsername(username);
    if (!result.isValid) {
      passed++;
      console.log(`✅ Invalid username rejected: "${username}"`);
    } else {
      failed++;
      console.log(`❌ Invalid username accepted: "${username}"`);
    }
  });
  
  // Test email validation
  console.log('\n📧 Testing Email Validation...');
  testData.emails.valid.forEach(email => {
    const result = validateEmail(email);
    if (result.isValid) {
      passed++;
      console.log(`✅ Valid email: "${email}"`);
    } else {
      failed++;
      console.log(`❌ Valid email failed: "${email}" - ${result.errors.join(', ')}`);
    }
  });
  
  testData.emails.invalid.forEach(email => {
    const result = validateEmail(email);
    if (!result.isValid) {
      passed++;
      console.log(`✅ Invalid email rejected: "${email}"`);
    } else {
      failed++;
      console.log(`❌ Invalid email accepted: "${email}"`);
    }
  });
  
  // Test password validation
  console.log('\n🔐 Testing Password Validation...');
  testData.passwords.valid.forEach(password => {
    const result = validatePassword(password);
    if (result.isValid) {
      passed++;
      console.log(`✅ Valid password: "${password}" (Strength: ${result.strength.description})`);
    } else {
      failed++;
      console.log(`❌ Valid password failed: "${password}" - ${result.errors.join(', ')}`);
    }
  });
  
  testData.passwords.invalid.forEach(password => {
    const result = validatePassword(password);
    if (!result.isValid) {
      passed++;
      console.log(`✅ Invalid password rejected: "${password}"`);
    } else {
      failed++;
      console.log(`❌ Invalid password accepted: "${password}"`);
    }
  });
  
  // Test URL validation
  console.log('\n🌐 Testing URL Validation...');
  testData.urls.valid.forEach(url => {
    const result = validateUrl(url);
    if (result.isValid) {
      passed++;
      console.log(`✅ Valid URL: "${url}"`);
    } else {
      failed++;
      console.log(`❌ Valid URL failed: "${url}" - ${result.errors.join(', ')}`);
    }
  });
  
  testData.urls.invalid.forEach(url => {
    const result = validateUrl(url);
    if (!result.isValid) {
      passed++;
      console.log(`✅ Invalid URL rejected: "${url}"`);
    } else {
      failed++;
      console.log(`❌ Invalid URL accepted: "${url}"`);
    }
  });
  
  // Print summary
  console.log('\n📊 Frontend Validation Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  const successRate = (passed / (passed + failed)) * 100;
  console.log(`🎯 Success Rate: ${successRate.toFixed(1)}%`);
  
  return { passed, failed, successRate };
};

// Real-time validation helper for forms
export const createFormValidator = () => {
  return {
    validateField: (fieldName: string, value: string) => {
      switch (fieldName) {
        case 'username':
          return validateUsername(value);
        case 'email':
          return validateEmail(value);
        case 'password':
          return validatePassword(value);
        case 'url':
          return validateUrl(value);
        default:
          return { isValid: true, errors: [] };
      }
    },
    
    validateForm: (formData: Record<string, string>) => {
      const errors: Record<string, string[]> = {};
      let isValid = true;
      
      Object.entries(formData).forEach(([field, value]) => {
        const validation = createFormValidator().validateField(field, value);
        if (!validation.isValid) {
          errors[field] = validation.errors;
          isValid = false;
        }
      });
      
      return { isValid, errors };
    }
  };
};

export default {
  validateUsername,
  validateEmail,
  validatePassword,
  validateUrl,
  runFrontendValidationTests,
  createFormValidator
};
