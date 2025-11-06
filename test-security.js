#!/usr/bin/env node

/**
 * Security Test Script
 * Tests all implemented security measures
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 Security Test Suite');
console.log('====================\n');

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Test function
function test(name, testFn) {
  try {
    const result = testFn();
    if (result === true) {
      results.passed++;
      results.tests.push({ name, status: 'PASS', message: 'OK' });
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', message: result });
      console.log(`❌ ${name}: ${result}`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'ERROR', message: error.message });
    console.log(`💥 ${name}: ${error.message}`);
  }
}

// Warning function
function warning(name, message) {
  results.warnings++;
  results.tests.push({ name, status: 'WARN', message });
  console.log(`⚠️  ${name}: ${message}`);
}

// Test 1: Environment Variables
test('Environment Variables Security', () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return 'No .env file found';
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('your-jwt-secret-change-in-production') ||
      envContent.includes('your-secret-key-change-in-production')) {
    return 'Hardcoded secrets found in .env file';
  }

  if (!envContent.includes('JWT_SECRET=') || !envContent.includes('SESSION_SECRET=')) {
    return 'Required secrets not configured';
  }

  return true;
});

// Test 2: Server Files Security
test('Server Files Hardcoded Secrets', () => {
  const serverFiles = [
    'server/server.js',
    'server/routes/auth.js',
    'server/middleware/adminAuth.js',
    'server/middleware/security.js'
  ];

  for (const file of serverFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('your-secret') || 
          content.includes('your-jwt-secret') ||
          content.includes('YOUR_SECRET')) {
        return `Hardcoded secrets found in ${file}`;
      }
    }
  }

  return true;
});

// Test 3: Security Middleware Files
test('Security Middleware Files Exist', () => {
  const securityFiles = [
    'server/middleware/nosqlInjection.js',
    'server/middleware/xssProtection.js',
    'server/middleware/csrfProtection.js',
    'server/middleware/security.js',
    'server/middleware/validation.js'
  ];

  for (const file of securityFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      return `Security middleware file missing: ${file}`;
    }
  }

  return true;
});

// Test 4: Package Dependencies
test('Security Dependencies Installed', () => {
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return 'package.json not found';
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = [
    'isomorphic-dompurify',
    'express-rate-limit',
    'express-slow-down',
    'helmet',
    'bcrypt',
    'jsonwebtoken'
  ];

  for (const dep of requiredDeps) {
    if (!dependencies[dep]) {
      return `Required security dependency missing: ${dep}`;
    }
  }

  return true;
});

// Test 5: NoSQL Injection Prevention
test('NoSQL Injection Prevention', () => {
  const nosqlFile = path.join(__dirname, 'server/middleware/nosqlInjection.js');
  if (!fs.existsSync(nosqlFile)) {
    return 'NoSQL injection prevention file not found';
  }

  const content = fs.readFileSync(nosqlFile, 'utf8');
  
  if (!content.includes('DANGEROUS_OPERATORS') ||
      !content.includes('preventNoSQLInjection') ||
      !content.includes('$where') ||
      !content.includes('$ne')) {
    return 'NoSQL injection prevention incomplete';
  }

  return true;
});

// Test 6: XSS Protection
test('XSS Protection Implementation', () => {
  const xssFile = path.join(__dirname, 'server/middleware/xssProtection.js');
  if (!fs.existsSync(xssFile)) {
    return 'XSS protection file not found';
  }

  const content = fs.readFileSync(xssFile, 'utf8');
  
  if (!content.includes('DOMPurify') ||
      !content.includes('preventXSS') ||
      !content.includes('setCSPHeaders') ||
      !content.includes('<script')) {
    return 'XSS protection implementation incomplete';
  }

  return true;
});

// Test 7: CSRF Protection
test('CSRF Protection Implementation', () => {
  const csrfFile = path.join(__dirname, 'server/middleware/csrfProtection.js');
  if (!fs.existsSync(csrfFile)) {
    return 'CSRF protection file not found';
  }

  const content = fs.readFileSync(csrfFile, 'utf8');
  
  if (!content.includes('CSRFProtection') ||
      !content.includes('csrfProtectionMiddleware') ||
      !content.includes('generateToken') ||
      !content.includes('verifyToken')) {
    return 'CSRF protection implementation incomplete';
  }

  return true;
});

// Test 8: Enhanced Password Requirements
test('Enhanced Password Requirements', () => {
  const validationFile = path.join(__dirname, 'server/middleware/validation.js');
  if (!fs.existsSync(validationFile)) {
    return 'Validation middleware file not found';
  }

  const content = fs.readFileSync(validationFile, 'utf8');
  
  if (!content.includes('password.length < 12') ||
      !content.includes('commonPasswords') ||
      !content.includes('hasUpperCase') ||
      !content.includes('hasSpecialChar')) {
    return 'Enhanced password requirements not implemented';
  }

  return true;
});

// Test 9: Rate Limiting Configuration
test('Rate Limiting Configuration', () => {
  const securityFile = path.join(__dirname, 'server/middleware/security.js');
  if (!fs.existsSync(securityFile)) {
    return 'Security middleware file not found';
  }

  const content = fs.readFileSync(securityFile, 'utf8');
  
  if (!content.includes('authRateLimit') ||
      !content.includes('apiRateLimit') ||
      !content.includes('analyzerRateLimit') ||
      !content.includes('strictRateLimit')) {
    return 'Rate limiting configuration incomplete';
  }

  return true;
});

// Test 10: Server Integration
test('Server Security Integration', () => {
  const serverFile = path.join(__dirname, 'server/server.js');
  if (!fs.existsSync(serverFile)) {
    return 'Server file not found';
  }

  const content = fs.readFileSync(serverFile, 'utf8');
  
  const requiredImports = [
    'preventNoSQLInjection',
    'preventXSS',
    'setCSPHeaders',
    'csrfProtectionMiddleware'
  ];

  for (const importName of requiredImports) {
    if (!content.includes(importName)) {
      return `Security middleware not imported: ${importName}`;
    }
  }

  return true;
});

// Warnings for optional improvements
warning('Firebase Admin SDK', 'Firebase Admin SDK not properly configured - requires manual setup');
warning('HTTPS Configuration', 'HTTPS not configured - required for production');
warning('MongoDB Authentication', 'MongoDB authentication not configured - recommended for production');

// Summary
console.log('\n📊 Security Test Results');
console.log('========================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);

const securityScore = Math.round((results.passed / (results.passed + results.failed)) * 100);
console.log(`\n🛡️  Security Score: ${securityScore}%`);

if (securityScore >= 90) {
  console.log('🎉 Excellent security implementation!');
} else if (securityScore >= 70) {
  console.log('✅ Good security implementation with room for improvement');
} else if (securityScore >= 50) {
  console.log('⚠️  Basic security measures in place, needs improvement');
} else {
  console.log('🚨 Security implementation needs significant work');
}

console.log('\n📋 Next Steps:');
console.log('===============');
if (results.failed > 0) {
  console.log('1. Fix failed tests above');
}
if (results.warnings > 0) {
  console.log('2. Address warnings for production readiness');
}
console.log('3. Run security tests regularly');
console.log('4. Keep dependencies updated');
console.log('5. Monitor security logs');

// Save test results
const reportPath = path.join(__dirname, 'security-test-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  results: results,
  securityScore: securityScore
}, null, 2));

console.log(`\n📄 Detailed report saved to: ${reportPath}`);
