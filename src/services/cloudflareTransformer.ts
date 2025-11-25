/**
 * Transform Cloudflare URL Scanner API response to AnalysisResult format
 */

import { AnalysisResult } from '../components/scamAnalyzer/types';
import { CloudflareScanResult } from './cloudflareUrlScanner';

/**
 * Transform Cloudflare scan result to AnalysisResult format
 */
export function transformCloudflareResult(
  cloudflareResult: CloudflareScanResult,
  originalUrl: string,
  screenshotUrl?: string | null
): AnalysisResult {
  const { task, page, data, meta, lists, verdicts } = cloudflareResult;

  // Determine threat level based on verdicts
  let threatLevel: 'safe' | 'suspicious' | 'dangerous' = 'safe';
  let threatScore = 0;
  const indicators: string[] = [];

  if (verdicts.overall.malicious) {
    threatLevel = 'dangerous';
    threatScore = 85;
    indicators.push('Malicious content detected by Cloudflare');
  } else if (meta.processors.phishing?.type) {
    threatLevel = 'suspicious';
    threatScore = 60;
    indicators.push(`Phishing detection: ${meta.processors.phishing.type}`);
  } else if (verdicts.overall.categories && verdicts.overall.categories.length > 0) {
    threatLevel = 'suspicious';
    threatScore = 50;
    indicators.push(`Security categories: ${verdicts.overall.categories.join(', ')}`);
  }

  // Extract domain categories
  if (meta.processors.domainCategories && meta.processors.domainCategories.length > 0) {
    const suspiciousCategories = ['Malware', 'Phishing', 'Suspicious', 'Spam'];
    const hasSuspiciousCategory = meta.processors.domainCategories.some(cat => 
      suspiciousCategories.some(susp => cat.toLowerCase().includes(susp.toLowerCase()))
    );
    if (hasSuspiciousCategory) {
      threatLevel = threatLevel === 'safe' ? 'suspicious' : 'dangerous';
      threatScore = Math.max(threatScore, 70);
      indicators.push(`Domain category: ${meta.processors.domainCategories.join(', ')}`);
    }
  }

  // Calculate security score (inverse of threat score, max 100)
  const securityScore = Math.max(0, 100 - threatScore);

  // Extract SSL certificate info
  const certificates = lists.certificates || [];
  const validCertificate = certificates.find(cert => cert.valid);
  const sslIssuer = validCertificate?.issuer || 'Unknown';

  // Extract technologies
  const technologies = (meta.processors.wappa || meta.processors.technologies || []).map(tech => ({
    name: tech.name,
    type: tech.category || 'Unknown'
  }));

  // Calculate network stats
  const requests = data.requests || [];
  const networkTypes: Record<string, number> = {};
  const domains = new Set<string>();

  requests.forEach(req => {
    const type = req.type || 'other';
    networkTypes[type] = (networkTypes[type] || 0) + 1;
    
    try {
      const urlObj = new URL(req.url);
      domains.add(urlObj.hostname);
    } catch (e) {
      // Invalid URL, skip
    }
  });

  // Extract cookies
  const cookies = data.cookies || [];

  // Extract console logs
  const consoleLogs = data.console || [];

  // Determine verdict text
  let verdict = 'Safe';
  if (threatLevel === 'dangerous') {
    verdict = 'Dangerous - Do not visit';
  } else if (threatLevel === 'suspicious') {
    verdict = 'Suspicious - Proceed with caution';
  }

  // Build recommendations
  const recommendations: string[] = [];
  if (threatLevel === 'dangerous') {
    recommendations.push('Do not visit this website');
    recommendations.push('Do not enter any personal information');
    recommendations.push('Report this URL if you haven\'t already');
  } else if (threatLevel === 'suspicious') {
    recommendations.push('Verify the website before entering sensitive information');
    recommendations.push('Check for HTTPS and valid SSL certificate');
    recommendations.push('Be cautious with any downloads or forms');
  } else {
    recommendations.push('Website appears safe, but always stay vigilant');
    recommendations.push('Keep your browser and security software updated');
  }

  // Extract IP address
  const ipAddress = page.ip || lists.ips?.[0]?.ip || 'Unknown';

  // Extract registrar (not available in Cloudflare API, will be Unknown)
  const registrar = 'Unknown';

  // Build result
  const result: AnalysisResult = {
    url: originalUrl,
    finalUrl: page.url || originalUrl,
    scanDate: new Date().toISOString(),
    screenshot: screenshotUrl || undefined,

    domain: {
      name: page.domain || new URL(page.url || originalUrl).hostname,
      registrar,
      ip: ipAddress
    },

    security: {
      ssl: {
        valid: !!validCertificate,
        issuer: sslIssuer
      },
      headers: {}, // Cloudflare API doesn't provide security headers in the main response
      score: securityScore
    },

    network: {
      requests: requests.length,
      bytes: 0, // Not directly available from Cloudflare API
      types: networkTypes,
      domains: Array.from(domains)
    },

    technologies,

    page: {
      title: page.title || 'No Title',
      cookies: cookies.length,
      consoleLogs: consoleLogs.length,
      hasLoginForm: false // Not available from Cloudflare API
    },

    verdict,
    threatLevel,
    threatScore,
    indicators,
    recommendations,

    // Additional metadata
    confidence: verdicts.overall.malicious ? 95 : threatScore,
    reasoning: `Cloudflare URL Scanner analysis: ${verdicts.overall.malicious ? 'Malicious content detected' : 'No immediate threats found'}. ${meta.processors.phishing?.type ? `Phishing type: ${meta.processors.phishing.type}` : ''}`,
    source: 'Cloudflare URL Scanner'
  };

  return result;
}

