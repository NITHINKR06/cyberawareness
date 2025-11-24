import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import whois from 'whois-json';
import sslChecker from 'ssl-checker';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

/**
 * Deep URL Threat Intelligence Service (Cloudflare Radar Style)
 * Uses Puppeteer for full-page rendering and analysis:
 * - Screenshot Capture
 * - Network Traffic Analysis
 * - Technology Detection
 * - Security Headers & SSL
 * - Console Logs & Cookies
 */
class URLThreatIntelligenceService {
  constructor() {
    this.requestCache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes cache
  }

  async analyzeUrl(url) {
    let browser = null;
    try {
      const normalizedUrl = this.normalizeUrl(url);

      // Check cache
      const cached = this.getCachedResult(normalizedUrl);
      if (cached) {
        console.log('📦 Using cached deep analysis result');
        return cached;
      }

      console.log(`🔍 Starting deep analysis for: ${normalizedUrl}`);

      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      // Set viewport for screenshot
      await page.setViewport({ width: 1280, height: 800 });

      // Data collection containers
      const networkStats = {
        totalRequests: 0,
        totalBytes: 0,
        types: {},
        domains: new Set(),
        securityHeaders: {}
      };
      const consoleLogs = [];
      const cookies = [];
      const redirectChain = [];

      // Enable request interception
      await page.setRequestInterception(true);

      page.on('request', (request) => {
        networkStats.totalRequests++;
        const type = request.resourceType();
        networkStats.types[type] = (networkStats.types[type] || 0) + 1;

        try {
          const urlObj = new URL(request.url());
          networkStats.domains.add(urlObj.hostname);
        } catch (e) { }

        request.continue();
      });

      page.on('response', async (response) => {
        try {
          // Track bytes (approximate)
          const length = Number(response.headers()['content-length'] || 0);
          networkStats.totalBytes += length;

          // Capture security headers from main document
          if (response.url() === normalizedUrl || response.url() === page.url()) {
            const headers = response.headers();
            networkStats.securityHeaders = {
              'Strict-Transport-Security': headers['strict-transport-security'],
              'Content-Security-Policy': headers['content-security-policy'],
              'X-Frame-Options': headers['x-frame-options'],
              'X-Content-Type-Options': headers['x-content-type-options'],
              'Referrer-Policy': headers['referrer-policy']
            };
          }
        } catch (e) { }
      });

      page.on('console', msg => {
        if (consoleLogs.length < 20) { // Limit logs
          consoleLogs.push({ type: msg.type(), text: msg.text() });
        }
      });

      // Navigate
      // Using domcontentloaded is faster and less prone to timeouts than networkidle0
      const response = await page.goto(normalizedUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Wait a bit for some dynamic content if needed, but don't block strictly
      try {
        await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => { });
      } catch (e) { }

      const finalUrl = page.url();

      // Helper to retry operations if execution context is destroyed (e.g. during redirects)
      const retryOperation = async (operation, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await operation();
          } catch (error) {
            if (error.message.includes('Execution context was destroyed') && i < maxRetries - 1) {
              await new Promise(r => setTimeout(r, 1000)); // Wait for navigation to settle
              continue;
            }
            throw error;
          }
        }
      };

      // Capture Screenshot (Base64)
      let screenshot = null;
      try {
        const screenshotBuffer = await retryOperation(() => page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 60 }));
        screenshot = `data:image/jpeg;base64,${screenshotBuffer}`;
      } catch (e) {
        console.warn('⚠️ Screenshot failed:', e.message);
      }

      // Get Page Content with retry
      let content = '';
      try {
        content = await retryOperation(() => page.content());
      } catch (e) {
        console.warn('⚠️ Content fetch failed:', e.message);
        content = '<html><body>Failed to retrieve content</body></html>';
      }

      const $ = cheerio.load(content);
      const title = $('title').text().trim();

      // Get Cookies
      let pageCookies = [];
      try {
        pageCookies = await retryOperation(() => page.cookies());
      } catch (e) {
        console.warn('⚠️ Cookie fetch failed:', e.message);
      }

      // Technology Detection (Heuristic)
      const technologies = this.detectTechnologies($, response ? response.headers() : {}, content);

      // Parallel Native Checks (Whois, SSL, DNS)
      const urlObj = new URL(finalUrl);
      const hostname = urlObj.hostname;

      const [whoisData, sslData, dnsData] = await Promise.allSettled([
        this.checkWhois(hostname),
        this.checkSSL(hostname),
        this.checkDNS(hostname)
      ]);

      // Compile Results
      const results = {
        url: normalizedUrl,
        finalUrl: finalUrl,
        scanDate: new Date().toISOString(),
        screenshot: screenshot,

        // Domain Info
        domain: {
          name: hostname,
          age: whoisData.status === 'fulfilled' ? whoisData.value?.ageDays : null,
          registrar: whoisData.status === 'fulfilled' ? whoisData.value?.registrar : null,
          ip: dnsData.status === 'fulfilled' ? dnsData.value?.address : null
        },

        // Security Info
        security: {
          ssl: sslData.status === 'fulfilled' ? sslData.value : { valid: false },
          headers: networkStats.securityHeaders,
          score: this.calculateSecurityScore(sslData.value, networkStats.securityHeaders, whoisData.value)
        },

        // Network Info
        network: {
          requests: networkStats.totalRequests,
          bytes: networkStats.totalBytes,
          types: networkStats.types,
          domains: Array.from(networkStats.domains).slice(0, 20) // Limit list
        },

        // Tech Stack
        technologies: technologies,

        // Page Info
        page: {
          title: title,
          cookies: pageCookies.length,
          consoleLogs: consoleLogs.length,
          hasLoginForm: $('input[type="password"]').length > 0
        },

        // Verdict
        verdict: 'Safe', // Default
        threatLevel: 'safe',
        threatScore: 0,
        confidence: 100,
        indicators: [],
        recommendations: []
      };

      // Calculate Verdict
      this.calculateVerdict(results);

      this.cacheResult(normalizedUrl, results);
      return results;

    } catch (error) {
      console.error('❌ Deep Analysis Error:', error.message);

      // Determine threat level based on error type
      let threatLevel = 'suspicious';
      let threatScore = 5;
      let verdict = 'Analysis Failed';
      let indicators = ['Scan Failed or Timed Out'];
      let recommendations = ['Try scanning again later', 'Check URL accessibility'];

      // DNS Resolution Failure - Very suspicious
      if (error.message.includes('ERR_NAME_NOT_RESOLVED') || error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
        threatLevel = 'dangerous';
        threatScore = 9;
        verdict = 'Domain Does Not Resolve';
        indicators = [
          'Domain name does not resolve to any IP address',
          'Possible typosquatting or phishing attempt',
          'Domain may be recently taken down or never existed',
          'Suspicious domain pattern detected'
        ];
        recommendations = [
          'DO NOT enter any personal information',
          'This appears to be a fake or malicious domain',
          'Verify the legitimate website URL from official sources',
          'Report this URL if received via email or message'
        ];
      }
      // Connection Refused - Site may be down or blocking
      else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        threatLevel = 'suspicious';
        threatScore = 6;
        verdict = 'Connection Refused';
        indicators = [
          'Server refused connection',
          'Site may be temporarily down or blocking automated access'
        ];
        recommendations = [
          'Proceed with caution',
          'Verify URL from trusted source',
          'Try again later if legitimate'
        ];
      }
      // Timeout - Could be slow server or blocking
      else if (error.message.includes('Timeout') || error.message.includes('timeout')) {
        threatLevel = 'suspicious';
        threatScore = 4;
        verdict = 'Connection Timeout';
        indicators = [
          'Page took too long to load',
          'Server may be overloaded or intentionally slow'
        ];
      }

      return {
        url: url,
        finalUrl: url,
        scanDate: new Date().toISOString(),
        error: error.message,
        threatLevel: threatLevel,
        threatScore: threatScore,
        verdict: verdict,
        confidence: 100, // High confidence in error detection
        indicators: indicators,
        recommendations: recommendations,
        domain: { name: url },
        security: { ssl: { valid: false }, headers: {}, score: 0 },
        network: { requests: 0, bytes: 0, types: {}, domains: [] },
        technologies: [],
        page: { title: 'Error', cookies: 0, consoleLogs: 0, hasLoginForm: false }
      };
    } finally {
      if (browser) await browser.close();
    }
  }

  // --- Helper Methods ---

  detectTechnologies($, headers, content) {
    const techs = [];
    const headerStr = JSON.stringify(headers).toLowerCase();
    const html = content.toLowerCase();

    // Server
    if (headers['server']) techs.push({ name: headers['server'], type: 'Web Server' });
    if (headers['x-powered-by']) techs.push({ name: headers['x-powered-by'], type: 'Web Framework' });

    // CMS / Frameworks
    if (html.includes('wp-content')) techs.push({ name: 'WordPress', type: 'CMS' });
    if (html.includes('react')) techs.push({ name: 'React', type: 'JavaScript Framework' });
    if (html.includes('vue')) techs.push({ name: 'Vue.js', type: 'JavaScript Framework' });
    if (html.includes('bootstrap')) techs.push({ name: 'Bootstrap', type: 'UI Framework' });
    if (html.includes('jquery')) techs.push({ name: 'jQuery', type: 'JavaScript Library' });
    if (html.includes('shopify')) techs.push({ name: 'Shopify', type: 'Ecommerce' });

    // Analytics / Ads
    if (html.includes('google-analytics')) techs.push({ name: 'Google Analytics', type: 'Analytics' });
    if (html.includes('googletagmanager')) techs.push({ name: 'Google Tag Manager', type: 'Tag Manager' });
    if (html.includes('facebook-pixel')) techs.push({ name: 'Facebook Pixel', type: 'Analytics' });
    if (html.includes('adsense')) techs.push({ name: 'Google AdSense', type: 'Advertising' });

    // Security
    if (headers['cf-ray']) techs.push({ name: 'Cloudflare', type: 'CDN/Security' });
    if (headers['server'] === 'cloudflare') techs.push({ name: 'Cloudflare', type: 'CDN/Security' });

    return [...new Set(techs.map(t => JSON.stringify(t)))].map(s => JSON.parse(s));
  }

  calculateSecurityScore(ssl, headers, whois) {
    let score = 100;

    // SSL Deductions
    if (!ssl || !ssl.valid) score -= 40;
    else if (ssl.daysRemaining < 7) score -= 10;

    // Header Deductions
    if (!headers['Strict-Transport-Security']) score -= 10;
    if (!headers['Content-Security-Policy']) score -= 10;
    if (!headers['X-Frame-Options']) score -= 5;
    if (!headers['X-Content-Type-Options']) score -= 5;

    // Domain Age Deductions
    if (whois && whois.ageDays < 30) score -= 20;

    return Math.max(0, score);
  }

  calculateVerdict(results) {
    let threatScore = 0;
    const indicators = [];

    // 1. Domain Age
    if (results.domain.age !== null && results.domain.age < 30) {
      threatScore += 4;
      indicators.push('New Domain');
    }

    // 2. SSL
    if (!results.security.ssl.valid) {
      threatScore += 3;
      indicators.push('Invalid SSL');
    }

    // 3. Login Form on New Domain
    if (results.page.hasLoginForm && results.domain.age < 90) {
      threatScore += 5;
      indicators.push('Login Form on New Domain');
    }

    // 4. Suspicious Tech (e.g., none detected on a complex looking site is weird, but hard to score)

    results.threatScore = Math.min(10, threatScore);
    results.indicators = indicators;

    if (threatScore >= 7) {
      results.threatLevel = 'dangerous';
      results.verdict = 'High Risk';
    } else if (threatScore >= 4) {
      results.threatLevel = 'suspicious';
      results.verdict = 'Suspicious';
    } else {
      results.threatLevel = 'safe';
      results.verdict = 'Safe';
    }
  }

  async checkDNS(hostname) {
    try {
      const { address } = await lookup(hostname);
      return { address };
    } catch (e) {
      return null;
    }
  }

  async checkWhois(hostname) {
    try {
      const data = await whois(hostname);
      const creationDateStr = data.creationDate || data.created || data['Creation Date'];
      if (!creationDateStr) return { ageDays: null };

      const created = new Date(creationDateStr);
      const now = new Date();
      const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

      return { creationDate: created, ageDays, registrar: data.registrar };
    } catch (e) {
      return null;
    }
  }

  async checkSSL(hostname) {
    try {
      const sslData = await sslChecker(hostname);
      return {
        valid: sslData.valid,
        daysRemaining: sslData.daysRemaining,
        issuer: sslData.issuer ? (sslData.issuer.O || sslData.issuer.CN) : 'Unknown'
      };
    } catch (e) {
      return { valid: false };
    }
  }

  normalizeUrl(url) {
    let normalized = url.trim();
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized;
    }
    return normalized;
  }

  getCachedResult(url) {
    const cached = this.requestCache.get(url);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.requestCache.delete(url);
    return null;
  }

  cacheResult(url, data) {
    this.requestCache.set(url, { data, timestamp: Date.now() });
    if (this.requestCache.size > 50) { // Keep fewer large objects
      const entries = Array.from(this.requestCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 10).forEach(([key]) => this.requestCache.delete(key));
    }
  }
}

export default new URLThreatIntelligenceService();
