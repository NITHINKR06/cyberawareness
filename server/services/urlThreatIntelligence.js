import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * URL Threat Intelligence Service
 * Integrates multiple security APIs for comprehensive URL analysis:
 * - PhishTank: Community-driven phishing database (free, no API key)
 * - VirusTotal: Multi-engine malware/phishing scanner (free tier with API key)
 * - URLVoid/APIVoid: Domain reputation checker (free tier with API key)
 */
class URLThreatIntelligenceService {
  constructor() {
    // API Keys (optional - some services work without keys)
    this.virustotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    this.apivoidApiKey = process.env.APIVOID_API_KEY;
    
    // API Endpoints
    this.phishTankApiUrl = 'https://checkurl.phishtank.com/checkurl/';
    this.virustotalApiUrl = 'https://www.virustotal.com/vtapi/v2/url/report';
    this.apivoidUrlReputationUrl = 'https://endpoint.apivoid.com/urlrep/v1/pay-as-you-go/';
    
    // Rate limiting and caching
    this.requestCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Main analysis function - Hybrid flow as recommended
   * 1. Check PhishTank first (if confirmed phishing, return Dangerous)
   * 2. If inconclusive, check VirusTotal or URLVoid
   * 3. Calculate final score based on blocklist matches
   */
  async analyzeUrl(url) {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      
      // Check cache first
      const cached = this.getCachedResult(normalizedUrl);
      if (cached) {
        console.log('📦 Using cached threat intelligence result');
        return cached;
      }

      const results = {
        url: normalizedUrl,
        sources: {},
        threatLevel: 'safe',
        threatScore: 0,
        confidence: 50,
        verdict: 'URL appears safe',
        reasoning: '',
        threats: [],
        indicators: [],
        blocklistMatches: 0,
        totalEngines: 0
      };

      // Step 1: Check PhishTank (free, no API key required)
      console.log('🔍 Step 1: Checking PhishTank...');
      const phishTankResult = await this.checkPhishTank(normalizedUrl);
      results.sources.phishTank = phishTankResult;

      if (phishTankResult.isPhishing && phishTankResult.verified) {
        // Confirmed phishing - immediately return Dangerous
        results.threatLevel = 'dangerous';
        results.threatScore = 9;
        results.confidence = 95;
        results.verdict = 'Confirmed phishing URL detected by PhishTank';
        results.reasoning = `This URL has been verified as a phishing site by PhishTank's community database. Status: ${phishTankResult.status}`;
        results.threats.push('PHISHING_CONFIRMED');
        results.indicators.push('Verified phishing URL in PhishTank database');
        this.cacheResult(normalizedUrl, results);
        return results;
      }

      // Step 2: Cross-check with VirusTotal or URLVoid
      let engineResults = null;
      
      // Try VirusTotal first (if API key available)
      if (this.virustotalApiKey) {
        console.log('🔍 Step 2: Checking VirusTotal...');
        try {
          engineResults = await this.checkVirusTotal(normalizedUrl);
          results.sources.virusTotal = engineResults;
        } catch (error) {
          console.warn('⚠️ VirusTotal check failed:', error.message);
        }
      }

      // If VirusTotal unavailable or inconclusive, try URLVoid
      if (!engineResults && this.apivoidApiKey) {
        console.log('🔍 Step 2: Checking URLVoid/APIVoid...');
        try {
          engineResults = await this.checkURLVoid(normalizedUrl);
          results.sources.urlVoid = engineResults;
        } catch (error) {
          console.warn('⚠️ URLVoid check failed:', error.message);
        }
      }

      // Step 3: Calculate final score based on all results
      if (engineResults) {
        results.blocklistMatches = engineResults.detections || engineResults.blocklistCount || 0;
        results.totalEngines = engineResults.totalEngines || engineResults.engineCount || 0;
        
        // Calculate threat level based on blocklist matches
        const detectionRatio = results.totalEngines > 0 
          ? results.blocklistMatches / results.totalEngines 
          : 0;

        if (results.blocklistMatches >= 15 || detectionRatio >= 0.5) {
          // 15+ engines flag it OR 50%+ detection rate = Dangerous
          results.threatLevel = 'dangerous';
          results.threatScore = Math.min(10, 7 + Math.floor(results.blocklistMatches / 5));
          results.confidence = Math.min(99, 85 + Math.floor(detectionRatio * 10));
          results.verdict = `High threat: ${results.blocklistMatches} out of ${results.totalEngines} security engines flagged this URL`;
          results.reasoning = `Multiple security engines have flagged this URL as malicious. ${results.blocklistMatches} engines detected threats including: ${(engineResults.threats || []).slice(0, 3).join(', ')}`;
          results.threats.push('MALWARE', 'PHISHING', 'MULTIPLE_ENGINE_DETECTION');
        } else if (results.blocklistMatches >= 5 || detectionRatio >= 0.15) {
          // 5-14 engines flag it OR 15-49% detection rate = Suspicious
          results.threatLevel = 'suspicious';
          results.threatScore = Math.min(7, 4 + Math.floor(results.blocklistMatches / 3));
          results.confidence = Math.min(85, 60 + Math.floor(detectionRatio * 20));
          results.verdict = `Suspicious: ${results.blocklistMatches} out of ${results.totalEngines} security engines flagged this URL`;
          results.reasoning = `Several security engines have flagged this URL. ${results.blocklistMatches} engines detected potential threats. Exercise caution.`;
          results.threats.push('SUSPICIOUS_ACTIVITY');
        } else if (results.blocklistMatches > 0) {
          // 1-4 engines flag it = Low suspicious
          results.threatLevel = 'suspicious';
          results.threatScore = Math.min(5, 3 + results.blocklistMatches);
          results.confidence = Math.min(70, 50 + (results.blocklistMatches * 5));
          results.verdict = `Low suspicion: ${results.blocklistMatches} out of ${results.totalEngines} security engines flagged this URL`;
          results.reasoning = `A few security engines flagged this URL. While not definitively dangerous, exercise caution.`;
        }

        // Add specific threats from engine results
        if (engineResults.threats && engineResults.threats.length > 0) {
          results.threats.push(...engineResults.threats.slice(0, 5));
        }
        if (engineResults.indicators && engineResults.indicators.length > 0) {
          results.indicators.push(...engineResults.indicators.slice(0, 5));
        }
      }

      // Combine PhishTank result if not verified but still suspicious
      if (phishTankResult.isPhishing && !phishTankResult.verified) {
        results.indicators.push('Reported as phishing in PhishTank (unverified)');
        if (results.threatLevel === 'safe') {
          results.threatLevel = 'suspicious';
          results.threatScore = Math.max(results.threatScore, 4);
        }
      }

      // Final confidence adjustment
      if (Object.keys(results.sources).length === 0) {
        results.confidence = 30;
        results.reasoning = 'No threat intelligence APIs available. Analysis based on URL patterns only.';
      } else {
        // Increase confidence based on number of sources checked
        const sourceCount = Object.keys(results.sources).length;
        results.confidence = Math.min(99, results.confidence + (sourceCount * 5));
      }

      this.cacheResult(normalizedUrl, results);
      return results;

    } catch (error) {
      console.error('❌ URL Threat Intelligence analysis error:', error);
      return {
        url: this.normalizeUrl(url),
        threatLevel: 'safe',
        threatScore: 0,
        confidence: 30,
        verdict: 'Analysis unavailable',
        reasoning: 'Threat intelligence services are currently unavailable',
        threats: [],
        indicators: [],
        error: error.message,
        sources: {}
      };
    }
  }

  /**
   * Check PhishTank (free, no API key required)
   * Returns: { isPhishing, verified, status, inDatabase }
   */
  async checkPhishTank(url) {
    try {
      const formData = new URLSearchParams();
      formData.append('url', url);
      formData.append('format', 'json');
      formData.append('app_key', process.env.PHISHTANK_API_KEY || ''); // Optional app key

      const response = await axios.post(this.phishTankApiUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ScamAnalyzer/1.0'
        },
        timeout: 10000
      });

      // Handle different response formats
      let result = null;
      if (response.data) {
        // Standard format: { results: {...} }
        if (response.data.results) {
          result = response.data.results;
        }
        // Alternative format: direct result object
        else if (response.data.in_database !== undefined) {
          result = response.data;
        }
      }

      if (result) {
        return {
          isPhishing: result.in_database === true || result.in_database === 'true',
          verified: result.verified === 'yes' || result.verified === true,
          status: result.verified === 'yes' || result.verified === true 
            ? 'verified' 
            : result.verified === 'no' || result.verified === false 
            ? 'unverified' 
            : 'unknown',
          inDatabase: result.in_database === true || result.in_database === 'true',
          submittedBy: result.submitted_by || null,
          verifiedAt: result.verified_at || null
        };
      }

      return { isPhishing: false, verified: false, status: 'not_found', inDatabase: false };
    } catch (error) {
      console.warn('PhishTank check failed:', error.message);
      return { isPhishing: false, verified: false, status: 'error', inDatabase: false, error: error.message };
    }
  }

  /**
   * Check VirusTotal (requires API key, free tier: 4 requests/minute)
   * Returns: { detections, totalEngines, threats, indicators }
   */
  async checkVirusTotal(url) {
    if (!this.virustotalApiKey) {
      throw new Error('VirusTotal API key not configured');
    }

    try {
      // First, submit URL for scanning if not already scanned
      const reportResponse = await axios.get(this.virustotalApiUrl, {
        params: {
          apikey: this.virustotalApiKey,
          resource: url,
          scan: 1 // Force rescan if needed
        },
        timeout: 15000
      });

      const data = reportResponse.data;
      
      if (data.response_code === 1) {
        // URL found in database
        const positives = data.positives || 0;
        const total = data.total || 0;
        const scans = data.scans || {};
        
        const threats = [];
        const indicators = [];
        
        // Extract threat types from scan results
        Object.entries(scans).forEach(([engine, result]) => {
          if (result.detected) {
            threats.push(result.result || 'MALWARE');
            indicators.push(`${engine}: ${result.result || 'Threat detected'}`);
          }
        });

        return {
          detections: positives,
          totalEngines: total,
          threats: [...new Set(threats)], // Remove duplicates
          indicators: indicators.slice(0, 10), // Limit to 10
          scanDate: data.scan_date,
          permalink: data.permalink
        };
      } else if (data.response_code === 0) {
        // URL not in database - will be queued for scanning
        return {
          detections: 0,
          totalEngines: 0,
          threats: [],
          indicators: ['URL queued for scanning'],
          message: 'URL not in database, scan queued'
        };
      } else {
        throw new Error(`VirusTotal API error: ${data.verbose_msg || 'Unknown error'}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 204) {
        throw new Error('VirusTotal rate limit exceeded (4 requests/minute on free tier)');
      }
      throw error;
    }
  }

  /**
   * Check URLVoid/APIVoid (requires API key, free tier available)
   * Returns: { blocklistCount, engineCount, riskScore, threats, indicators }
   */
  async checkURLVoid(url) {
    if (!this.apivoidApiKey) {
      throw new Error('APIVoid API key not configured');
    }

    try {
      const response = await axios.get(this.apivoidUrlReputationUrl, {
        params: {
          key: this.apivoidApiKey,
          url: url
        },
        timeout: 15000
      });

      const data = response.data;
      
      if (data && data.data) {
        const report = data.data;
        const engines = report.detections || {};
        const engineCount = Object.keys(engines).length;
        const blocklistCount = Object.values(engines).filter(detection => detection.detected === true).length;
        
        const threats = [];
        const indicators = [];
        
        // Extract threat information
        Object.entries(engines).forEach(([engine, detection]) => {
          if (detection.detected) {
            threats.push(detection.result || 'BLACKLISTED');
            indicators.push(`${engine}: ${detection.result || 'Listed in blacklist'}`);
          }
        });

        return {
          blocklistCount,
          engineCount,
          riskScore: report.risk_score || 0,
          threats: [...new Set(threats)],
          indicators: indicators.slice(0, 10),
          domainAge: report.domain_age || null,
          domainReputation: report.domain_reputation || null
        };
      }

      return {
        blocklistCount: 0,
        engineCount: 0,
        riskScore: 0,
        threats: [],
        indicators: []
      };
    } catch (error) {
      if (error.response && error.response.status === 403) {
        throw new Error('APIVoid API key invalid or quota exceeded');
      }
      throw error;
    }
  }

  /**
   * Check Google Safe Browsing (optional, requires API key)
   * Returns: { isThreat, threatType, platformTypes }
   */
  async checkGoogleSafeBrowsing(url) {
    if (!this.googleSafeBrowsingApiKey) {
      throw new Error('Google Safe Browsing API key not configured');
    }

    try {
      const requestBody = {
        client: {
          clientId: 'scam-analyzer',
          clientVersion: '1.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: url }]
        }
      };

      const response = await axios.post(
        `${this.googleSafeBrowsingUrl}?key=${this.googleSafeBrowsingApiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.matches && response.data.matches.length > 0) {
        const match = response.data.matches[0];
        return {
          isThreat: true,
          threatType: match.threatType || 'UNKNOWN',
          platformTypes: match.platformTypes || [],
          cacheDuration: match.cacheDuration || null
        };
      }

      return {
        isThreat: false,
        threatType: null,
        platformTypes: []
      };
    } catch (error) {
      if (error.response && error.response.status === 400) {
        throw new Error('Invalid Google Safe Browsing API request');
      }
      throw error;
    }
  }

  /**
   * Normalize URL for consistent checking
   */
  normalizeUrl(url) {
    try {
      // Remove protocol if present for some checks
      let normalized = url.trim();
      
      // Ensure URL has protocol
      if (!normalized.match(/^https?:\/\//i)) {
        normalized = 'http://' + normalized;
      }

      // Remove trailing slashes and fragments for some APIs
      normalized = normalized.replace(/\/$/, '').split('#')[0];
      
      return normalized;
    } catch (error) {
      return url;
    }
  }

  /**
   * Cache management
   */
  getCachedResult(url) {
    const cached = this.requestCache.get(url);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.requestCache.delete(url);
    return null;
  }

  cacheResult(url, data) {
    this.requestCache.set(url, {
      data,
      timestamp: Date.now()
    });
    
    // Clean old cache entries (keep cache size manageable)
    if (this.requestCache.size > 100) {
      const entries = Array.from(this.requestCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      // Remove oldest 20 entries
      entries.slice(0, 20).forEach(([key]) => this.requestCache.delete(key));
    }
  }

  /**
   * Check if any threat intelligence APIs are configured
   */
  isConfigured() {
    return !!(this.virustotalApiKey || this.apivoidApiKey || this.googleSafeBrowsingApiKey);
  }

  /**
   * Get status of available services
   */
  getServiceStatus() {
    return {
      phishTank: { available: true, requiresKey: false },
      virusTotal: { available: !!this.virustotalApiKey, requiresKey: true },
      urlVoid: { available: !!this.apivoidApiKey, requiresKey: true },
      googleSafeBrowsing: { available: !!this.googleSafeBrowsingApiKey, requiresKey: true }
    };
  }
}

export default new URLThreatIntelligenceService();

