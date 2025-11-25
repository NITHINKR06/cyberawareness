import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import whois from 'whois-json';
import sslChecker from 'ssl-checker';
import dns from 'dns';
import { promisify } from 'util';
import net from 'net';

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

      // Get Cookies with detailed analysis
      let pageCookies = [];
      let cookieSecurity = { secure: 0, httpOnly: 0, sameSite: 0, total: 0 };
      try {
        pageCookies = await retryOperation(() => page.cookies());
        cookieSecurity.total = pageCookies.length;
        pageCookies.forEach(cookie => {
          if (cookie.secure) cookieSecurity.secure++;
          if (cookie.httpOnly) cookieSecurity.httpOnly++;
          if (cookie.sameSite && cookie.sameSite !== 'None') cookieSecurity.sameSite++;
        });
      } catch (e) {
        console.warn('⚠️ Cookie fetch failed:', e.message);
      }

      // Check for mixed content (HTTP resources on HTTPS page)
      const mixedContent = this.detectMixedContent(content, finalUrl);

      // Technology Detection (Heuristic)
      const technologies = this.detectTechnologies($, response ? response.headers() : {}, content);

      // Enhanced Security Header Analysis
      const allHeaders = response ? response.headers() : {};
      const securityHeadersAnalysis = this.analyzeSecurityHeaders(allHeaders, networkStats.securityHeaders);

      // Parallel Native Checks (Whois, SSL, DNS)
      const urlObj = new URL(finalUrl);
      const hostname = urlObj.hostname;
      const port = urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80);

      const [whoisData, sslData, dnsData] = await Promise.allSettled([
        this.checkWhois(hostname),
        this.checkSSL(hostname),
        this.checkDNS(hostname)
      ]);

      // Port scanning (after DNS resolution)
      const ipAddress = dnsData.status === 'fulfilled' ? dnsData.value?.address : null;
      const portScanData = await Promise.resolve(this.scanPorts(hostname, ipAddress)).then(
        result => ({ status: 'fulfilled', value: result }),
        error => ({ status: 'rejected', reason: error })
      );

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
          headersAnalysis: securityHeadersAnalysis,
          cookies: cookieSecurity,
          mixedContent: mixedContent,
          ports: portScanData.status === 'fulfilled' ? portScanData.value : { open: [], weak: [], secure: [] },
          vulnerabilities: this.detectVulnerabilities(
            sslData.value,
            securityHeadersAnalysis,
            cookieSecurity,
            mixedContent,
            portScanData.status === 'fulfilled' ? portScanData.value : null,
            whoisData.value
          ),
          score: this.calculateSecurityScore(
            sslData.value,
            networkStats.securityHeaders,
            whoisData.value,
            cookieSecurity,
            mixedContent,
            portScanData.status === 'fulfilled' ? portScanData.value : null
          )
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
          cookieDetails: pageCookies.slice(0, 10), // Limit to first 10 for display
          consoleLogs: consoleLogs.length,
          consoleLogDetails: consoleLogs.slice(0, 10), // Limit to first 10
          hasLoginForm: $('input[type="password"]').length > 0,
          externalLinks: this.extractExternalLinks($, hostname),
          scripts: this.extractScripts($),
          iframes: $('iframe').length,
          forms: $('form').length
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

  calculateSecurityScore(ssl, headers, whois, cookies, mixedContent, ports) {
    let score = 100;

    // SSL Deductions
    if (!ssl || !ssl.valid) score -= 40;
    else if (ssl.daysRemaining < 7) score -= 10;
    else if (ssl.daysRemaining < 30) score -= 5;

    // Header Deductions
    if (!headers['Strict-Transport-Security']) score -= 10;
    if (!headers['Content-Security-Policy']) score -= 10;
    if (!headers['X-Frame-Options']) score -= 5;
    if (!headers['X-Content-Type-Options']) score -= 5;
    if (!headers['Referrer-Policy']) score -= 3;
    if (!headers['Permissions-Policy']) score -= 3;

    // Cookie Security Deductions
    if (cookies && cookies.total > 0) {
      const secureRatio = cookies.secure / cookies.total;
      const httpOnlyRatio = cookies.httpOnly / cookies.total;
      if (secureRatio < 1) score -= (1 - secureRatio) * 10;
      if (httpOnlyRatio < 0.8) score -= (1 - httpOnlyRatio) * 5;
    }

    // Mixed Content Deductions
    if (mixedContent && mixedContent.count > 0) {
      score -= Math.min(15, mixedContent.count * 3);
    }

    // Port Security Deductions
    if (ports && ports.weak && ports.weak.length > 0) {
      score -= ports.weak.length * 5;
    }

    // Domain Age Deductions
    if (whois && whois.ageDays < 30) score -= 20;
    else if (whois && whois.ageDays < 90) score -= 10;

    return Math.max(0, Math.min(100, score));
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
      indicators.push('Invalid SSL Certificate');
    } else if (results.security.ssl.daysRemaining < 7) {
      threatScore += 2;
      indicators.push('SSL Certificate Expiring Soon');
    }

    // 3. Login Form on New Domain
    if (results.page.hasLoginForm && results.domain.age < 90) {
      threatScore += 5;
      indicators.push('Login Form on New Domain');
    }

    // 4. Security Headers
    if (!results.security.headers['Strict-Transport-Security']) {
      threatScore += 2;
      indicators.push('Missing HSTS Header');
    }
    if (!results.security.headers['Content-Security-Policy']) {
      threatScore += 2;
      indicators.push('Missing CSP Header');
    }

    // 5. Cookie Security
    if (results.security.cookies && results.security.cookies.total > 0) {
      const insecureCookies = results.security.cookies.total - results.security.cookies.secure;
      if (insecureCookies > 0) {
        threatScore += 2;
        indicators.push(`${insecureCookies} Insecure Cookie(s)`);
      }
    }

    // 6. Mixed Content
    if (results.security.mixedContent && results.security.mixedContent.count > 0) {
      threatScore += 3;
      indicators.push(`${results.security.mixedContent.count} Mixed Content Resource(s)`);
    }

    // 7. Weak Ports
    if (results.security.ports && results.security.ports.weak && results.security.ports.weak.length > 0) {
      threatScore += results.security.ports.weak.length * 2;
      indicators.push(`${results.security.ports.weak.length} Weak Port(s) Open`);
    }

    // 8. Vulnerabilities
    if (results.security.vulnerabilities && results.security.vulnerabilities.length > 0) {
      threatScore += results.security.vulnerabilities.length * 2;
      indicators.push(...results.security.vulnerabilities.map(v => v.title));
    }

    // 9. Suspicious patterns
    if (results.page.externalLinks && results.page.externalLinks.length > 10) {
      threatScore += 1;
      indicators.push('High Number of External Links');
    }

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
        issuer: sslData.issuer ? (sslData.issuer.O || sslData.issuer.CN) : 'Unknown',
        validFrom: sslData.validFrom,
        validTo: sslData.validTo,
        protocol: sslData.protocol || 'Unknown',
        cipher: sslData.cipher || 'Unknown'
      };
    } catch (e) {
      return { valid: false };
    }
  }

  // Scan common ports for security assessment
  async scanPorts(hostname, ipAddress) {
    const targetIP = ipAddress || (await this.checkDNS(hostname))?.address;
    if (!targetIP) {
      return { open: [], weak: [], secure: [] };
    }

    // Common ports to check
    const portsToCheck = [
      { port: 21, name: 'FTP', secure: false },
      { port: 22, name: 'SSH', secure: true },
      { port: 23, name: 'Telnet', secure: false },
      { port: 25, name: 'SMTP', secure: false },
      { port: 53, name: 'DNS', secure: false },
      { port: 80, name: 'HTTP', secure: false },
      { port: 110, name: 'POP3', secure: false },
      { port: 143, name: 'IMAP', secure: false },
      { port: 443, name: 'HTTPS', secure: true },
      { port: 445, name: 'SMB', secure: false },
      { port: 1433, name: 'MSSQL', secure: false },
      { port: 3306, name: 'MySQL', secure: false },
      { port: 3389, name: 'RDP', secure: false },
      { port: 5432, name: 'PostgreSQL', secure: false },
      { port: 8080, name: 'HTTP-Proxy', secure: false },
      { port: 8443, name: 'HTTPS-Alt', secure: true }
    ];

    const openPorts = [];
    const weakPorts = [];
    const securePorts = [];

    // Scan ports with timeout
    const scanPromises = portsToCheck.map(portInfo => 
      this.checkPort(targetIP, portInfo.port, 2000)
        .then(isOpen => {
          if (isOpen) {
            openPorts.push({ port: portInfo.port, name: portInfo.name });
            if (portInfo.secure) {
              securePorts.push({ port: portInfo.port, name: portInfo.name });
            } else {
              weakPorts.push({ port: portInfo.port, name: portInfo.name });
            }
          }
        })
        .catch(() => {}) // Ignore errors
    );

    await Promise.allSettled(scanPromises);

    return { open: openPorts, weak: weakPorts, secure: securePorts };
  }

  // Check if a port is open
  checkPort(host, port, timeout = 2000) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      const onError = () => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(false);
        }
      };

      socket.setTimeout(timeout);
      socket.once('timeout', onError);
      socket.once('error', onError);
      socket.once('connect', () => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(true);
        }
      });

      socket.connect(port, host);
    });
  }

  // Detect mixed content (HTTP resources on HTTPS page)
  detectMixedContent(content, pageUrl) {
    if (!pageUrl.startsWith('https://')) {
      return { count: 0, resources: [] };
    }

    const resources = [];
    const httpPattern = /(src|href|action)=["'](http:\/\/[^"']+)["']/gi;
    let match;

    while ((match = httpPattern.exec(content)) !== null && resources.length < 20) {
      resources.push(match[2]);
    }

    return {
      count: resources.length,
      resources: resources.slice(0, 10) // Limit to first 10
    };
  }

  // Analyze security headers in detail
  analyzeSecurityHeaders(allHeaders, securityHeaders) {
    const analysis = {
      present: [],
      missing: [],
      weak: [],
      recommendations: []
    };

    const requiredHeaders = {
      'Strict-Transport-Security': { required: true, weak: false },
      'Content-Security-Policy': { required: true, weak: false },
      'X-Frame-Options': { required: true, weak: false },
      'X-Content-Type-Options': { required: true, weak: false },
      'Referrer-Policy': { required: false, weak: false },
      'Permissions-Policy': { required: false, weak: false },
      'X-XSS-Protection': { required: false, weak: true } // Deprecated but sometimes present
    };

    Object.entries(requiredHeaders).forEach(([header, config]) => {
      const value = allHeaders[header.toLowerCase()] || securityHeaders[header];
      if (value) {
        analysis.present.push({ name: header, value });
        // Check for weak configurations
        if (header === 'X-Frame-Options' && value !== 'DENY' && value !== 'SAMEORIGIN') {
          analysis.weak.push({ name: header, issue: 'Weak configuration' });
        }
        if (header === 'Strict-Transport-Security' && !value.includes('max-age')) {
          analysis.weak.push({ name: header, issue: 'Missing max-age directive' });
        }
      } else {
        if (config.required) {
          analysis.missing.push(header);
          analysis.recommendations.push(`Add ${header} header`);
        }
      }
    });

    return analysis;
  }

  // Detect security vulnerabilities
  detectVulnerabilities(ssl, headersAnalysis, cookies, mixedContent, ports, whois) {
    const vulnerabilities = [];

    // SSL Issues
    if (!ssl || !ssl.valid) {
      vulnerabilities.push({
        severity: 'high',
        title: 'Invalid SSL Certificate',
        description: 'The website does not have a valid SSL certificate'
      });
    } else if (ssl.daysRemaining < 7) {
      vulnerabilities.push({
        severity: 'medium',
        title: 'SSL Certificate Expiring Soon',
        description: `SSL certificate expires in ${ssl.daysRemaining} days`
      });
    }

    // Missing Security Headers
    if (headersAnalysis.missing.length > 0) {
      vulnerabilities.push({
        severity: 'medium',
        title: `Missing ${headersAnalysis.missing.length} Security Header(s)`,
        description: `Missing: ${headersAnalysis.missing.join(', ')}`
      });
    }

    // Weak Security Headers
    if (headersAnalysis.weak.length > 0) {
      vulnerabilities.push({
        severity: 'low',
        title: 'Weak Security Header Configuration',
        description: 'Some security headers are configured weakly'
      });
    }

    // Insecure Cookies
    if (cookies && cookies.total > 0) {
      const insecureCount = cookies.total - cookies.secure;
      if (insecureCount > 0) {
        vulnerabilities.push({
          severity: 'medium',
          title: `${insecureCount} Insecure Cookie(s)`,
          description: 'Cookies are not marked as secure'
        });
      }
    }

    // Mixed Content
    if (mixedContent && mixedContent.count > 0) {
      vulnerabilities.push({
        severity: 'high',
        title: `${mixedContent.count} Mixed Content Resource(s)`,
        description: 'HTTP resources loaded on HTTPS page'
      });
    }

    // Weak Ports
    if (ports && ports.weak && ports.weak.length > 0) {
      vulnerabilities.push({
        severity: 'high',
        title: `${ports.weak.length} Weak Port(s) Open`,
        description: `Open ports: ${ports.weak.map(p => `${p.name} (${p.port})`).join(', ')}`
      });
    }

    // New Domain
    if (whois && whois.ageDays < 30) {
      vulnerabilities.push({
        severity: 'low',
        title: 'Very New Domain',
        description: `Domain is only ${whois.ageDays} days old`
      });
    }

    return vulnerabilities;
  }

  // Extract external links
  extractExternalLinks($, hostname) {
    const links = [];
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        try {
          const url = new URL(href);
          if (url.hostname !== hostname) {
            links.push({ url: href, text: $(elem).text().trim().substring(0, 50) });
          }
        } catch (e) {}
      }
    });
    return links.slice(0, 20); // Limit to first 20
  }

  // Extract scripts
  extractScripts($) {
    const scripts = [];
    $('script[src]').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        scripts.push(src);
      }
    });
    return scripts.slice(0, 20); // Limit to first 20
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
