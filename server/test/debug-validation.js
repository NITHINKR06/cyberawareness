#!/usr/bin/env node

/**
 * Debug Validation Script
 * Tests all validation rules and security measures
 */

import { validateUserInput } from '../middleware/validation.js';
import { performance } from 'perf_hooks';

// Test data for validation
const testData = {
  usernames: {
    valid: [
      'john_doe',
      'user123',
      'test-user',
      'admin',
      'a1b2c3',
      'valid_user',
      'user-name'
    ],
    invalid: [
      '',
      'ab',
      'a'.repeat(31),
      'user@domain',
      '-user',
      'user-',
      '_user',
      'user_',
      'user name',
      'user@domain.com',
      'user<script>',
      'user\nname',
      'user\ttab'
    ]
  },
  emails: {
    valid: [
      'user@example.com',
      'test.email@domain.co.uk',
      'user+tag@example.org',
      'user123@test-domain.com',
      'admin@company.com'
    ],
    invalid: [
      '',
      'invalid-email',
      '@domain.com',
      'user@',
      'user..name@domain.com',
      '.user@domain.com',
      'user@domain.com.',
      'user@domain',
      'user name@domain.com',
      'user@domain .com'
    ]
  },
  passwords: {
    valid: [
      'Password123!',
      'MyStr0ng#Pass',
      'SecureP@ssw0rd',
      'ComplexP@ss1!',
      'Test123$Pass'
    ],
    invalid: [
      '',
      '123456',
      'password',
      'PASSWORD',
      'Password',
      'Password123',
      'password123!',
      'PASSWORD123!',
      'Password!',
      '12345678',
      'abcdefgh',
      'ABCDEFGH',
      'Password123!'.repeat(10) // Too long
    ]
  },
  urls: {
    valid: [
      'https://example.com',
      'http://test.org',
      'https://subdomain.example.com/path',
      'https://example.com:8080/path?query=value',
      'https://www.google.com'
    ],
    invalid: [
      '',
      'not-a-url',
      'ftp://example.com',
      'example.com',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>'
    ],
    suspicious: [
      'https://bit.ly/short',
      'https://tinyurl.com/abc123',
      'https://goo.gl/xyz',
      'https://ow.ly/def456'
    ]
  },
  maliciousInputs: [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(1)">',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<svg onload="alert(1)"></svg>',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '${7*7}',
    '{{7*7}}',
    '{{constructor.constructor("alert(1)")()}}'
  ]
};

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to run tests
function runTest(testName, testFn) {
  try {
    const result = testFn();
    if (result) {
      results.passed++;
      console.log(`✅ ${testName}`);
    } else {
      results.failed++;
      console.log(`❌ ${testName}`);
    }
  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    console.log(`💥 ${testName} - Error: ${error.message}`);
  }
}

// Username validation tests
function testUsernameValidation() {
  console.log('\n🔍 Testing Username Validation...');
  
  // Test valid usernames
  testData.usernames.valid.forEach(username => {
    runTest(`Valid username: "${username}"`, () => {
      const result = validateUserInput.username(username);
      return result.isValid && result.errors.length === 0;
    });
  });
  
  // Test invalid usernames
  testData.usernames.invalid.forEach(username => {
    runTest(`Invalid username: "${username}"`, () => {
      const result = validateUserInput.username(username);
      return !result.isValid && result.errors.length > 0;
    });
  });
}

// Email validation tests
function testEmailValidation() {
  console.log('\n📧 Testing Email Validation...');
  
  // Test valid emails
  testData.emails.valid.forEach(email => {
    runTest(`Valid email: "${email}"`, () => {
      const result = validateUserInput.email(email);
      return result.isValid && result.errors.length === 0;
    });
  });
  
  // Test invalid emails
  testData.emails.invalid.forEach(email => {
    runTest(`Invalid email: "${email}"`, () => {
      const result = validateUserInput.email(email);
      return !result.isValid && result.errors.length > 0;
    });
  });
}

// Password validation tests
function testPasswordValidation() {
  console.log('\n🔐 Testing Password Validation...');
  
  // Test valid passwords
  testData.passwords.valid.forEach(password => {
    runTest(`Valid password: "${password}"`, () => {
      const result = validateUserInput.password(password);
      return result.isValid && result.errors.length === 0;
    });
  });
  
  // Test invalid passwords
  testData.passwords.invalid.forEach(password => {
    runTest(`Invalid password: "${password}"`, () => {
      const result = validateUserInput.password(password);
      return !result.isValid && result.errors.length > 0;
    });
  });
  
  // Test password strength calculation
  testData.passwords.valid.forEach(password => {
    runTest(`Password strength for: "${password}"`, () => {
      const result = validateUserInput.password(password);
      return result.strength && result.strength.level >= 3;
    });
  });
}

// URL validation tests
function testUrlValidation() {
  console.log('\n🌐 Testing URL Validation...');
  
  // Test valid URLs
  testData.urls.valid.forEach(url => {
    runTest(`Valid URL: "${url}"`, () => {
      const result = validateUserInput.url(url);
      return result.isValid && result.errors.length === 0;
    });
  });
  
  // Test invalid URLs
  testData.urls.invalid.forEach(url => {
    runTest(`Invalid URL: "${url}"`, () => {
      const result = validateUserInput.url(url);
      return !result.isValid && result.errors.length > 0;
    });
  });
  
  // Test suspicious URLs
  testData.urls.suspicious.forEach(url => {
    runTest(`Suspicious URL: "${url}"`, () => {
      const result = validateUserInput.url(url);
      return result.isValid && result.errors.some(error => 
        error.includes('shortened URL')
      );
    });
  });
}

// XSS prevention tests
function testXssPrevention() {
  console.log('\n🛡️ Testing XSS Prevention...');
  
  testData.maliciousInputs.forEach(input => {
    runTest(`XSS prevention: "${input.substring(0, 30)}..."`, () => {
      const sanitized = validateUserInput.sanitizeText(input);
      return !sanitized.includes('<script>') && 
             !sanitized.includes('javascript:') &&
             !sanitized.includes('onerror') &&
             !sanitized.includes('onload');
    });
  });
}

// Performance tests
function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  const iterations = 1000;
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    validateUserInput.username('testuser' + i);
    validateUserInput.email('test' + i + '@example.com');
    validateUserInput.password('Password123!' + i);
    validateUserInput.url('https://example.com/' + i);
  }
  
  const end = performance.now();
  const duration = end - start;
  
  runTest(`Performance: ${iterations} validations in ${duration.toFixed(2)}ms`, () => {
    return duration < 1000; // Should complete in under 1 second
  });
}

// Edge case tests
function testEdgeCases() {
  console.log('\n🔬 Testing Edge Cases...');
  
  // Test null/undefined inputs
  runTest('Null username handling', () => {
    const result = validateUserInput.username(null);
    return !result.isValid && result.errors.includes('Username is required');
  });
  
  runTest('Undefined email handling', () => {
    const result = validateUserInput.email(undefined);
    return !result.isValid && result.errors.includes('Email is required');
  });
  
  // Test very long inputs
  runTest('Very long username handling', () => {
    const longUsername = 'a'.repeat(1000);
    const result = validateUserInput.username(longUsername);
    return !result.isValid && result.errors.some(error => 
      error.includes('no more than 30 characters')
    );
  });
  
  // Test special characters
  runTest('Special characters in username', () => {
    const result = validateUserInput.username('user@#$%');
    return !result.isValid && result.errors.some(error => 
      error.includes('only contain letters, numbers, underscores, and hyphens')
    );
  });
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Validation Debug Tests...\n');
  
  const startTime = performance.now();
  
  testUsernameValidation();
  testEmailValidation();
  testPasswordValidation();
  testUrlValidation();
  testXssPrevention();
  testPerformance();
  testEdgeCases();
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`💥 Errors: ${results.errors.length}`);
  console.log(`⏱️ Total Time: ${totalTime.toFixed(2)}ms`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:');
    results.errors.forEach(({ test, error }) => {
      console.log(`  - ${test}: ${error}`);
    });
  }
  
  const successRate = (results.passed / (results.passed + results.failed)) * 100;
  console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 95) {
    console.log('🎉 Excellent! Validation system is working well.');
  } else if (successRate >= 80) {
    console.log('⚠️ Good, but some issues need attention.');
  } else {
    console.log('🚨 Critical issues detected! Please review the validation system.');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testData };
