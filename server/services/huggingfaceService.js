import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    
    // Model configuration - can be customized via environment variables
    this.models = {
      textAnalysis: process.env.HUGGINGFACE_TEXT_MODEL || 'facebook/bart-large-mnli',
      urlAnalysis: process.env.HUGGINGFACE_URL_MODEL || 'facebook/bart-large-mnli',
      summaryGeneration: process.env.HUGGINGFACE_SUMMARY_MODEL || 'facebook/bart-large-cnn'
    };
    
    this.timeout = parseInt(process.env.HUGGINGFACE_TIMEOUT) || 30000;
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'your_huggingface_api_key';
  }

  /**
   * Analyze text content using Hugging Face model
   */
  async analyzeText(text) {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      const labels = [
        'spam',
        'phishing',
        'scam',
        'legitimate',
        'safe',
        'malicious',
        'fraudulent',
        'suspicious'
      ];

      const response = await axios.post(
        `${this.baseUrl}/${this.models.textAnalysis}`,
        {
          inputs: text,
          parameters: {
            candidate_labels: labels,
            multi_label: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      return this.parseTextAnalysisResponse(response.data);
    } catch (error) {
      console.error('Hugging Face text analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze URL using Hugging Face AI model and pattern analysis
   * (Google Safe Browsing removed - using Hugging Face only)
   */
  async analyzeUrl(url) {
    const results = {
      aiAnalysis: null,
      patternAnalysis: null
    };

    // 1. Try Hugging Face AI model for URL analysis
    if (this.isConfigured()) {
      try {
        results.aiAnalysis = await this.analyzeUrlWithAI(url);
      } catch (error) {
        console.error('Hugging Face URL analysis error:', error.message);
      }
    }

    // 2. Always perform pattern-based analysis as baseline
    results.patternAnalysis = this.analyzeUrlPatterns(url);

    // Combine results from both methods
    return this.combineUrlAnalysisResults(results, url);
  }

  /**
   * Analyze URL using Hugging Face AI model
   */
  async analyzeUrlWithAI(url) {
    const labels = [
      'phishing',
      'malware',
      'safe',
      'suspicious',
      'legitimate',
      'malicious'
    ];

    const response = await axios.post(
      `${this.baseUrl}/${this.models.urlAnalysis}`,
      {
        inputs: `Analyze this URL for security threats: ${url}`,
        parameters: {
          candidate_labels: labels,
          multi_label: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      }
    );

    return this.parseUrlAIResponse(response.data);
  }

  /**
   * Analyze URL using pattern matching
   */
  analyzeUrlPatterns(url) {
    const lowerUrl = url.toLowerCase();
    let score = 0;
    const threats = [];
    const indicators = [];

    // Check for suspicious TLDs
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.review', '.top', '.win', '.bid'];
    if (suspiciousTlds.some(tld => lowerUrl.endsWith(tld))) {
      score += 3;
      threats.push('SUSPICIOUS_TLD');
      indicators.push('Suspicious domain extension');
    }

    // Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'is.gd', 't.co'];
    if (shorteners.some(s => lowerUrl.includes(s))) {
      score += 2;
      threats.push('URL_SHORTENER');
      indicators.push('URL shortener detected');
    }

    // Check for IP address instead of domain
    if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
      score += 3;
      threats.push('IP_ADDRESS');
      indicators.push('Direct IP address');
    }

    // Check for phishing keywords
    const phishingKeywords = ['secure-', 'account-', 'verify-', 'update-', 'suspended-', 'confirm-'];
    if (phishingKeywords.some(k => lowerUrl.includes(k))) {
      score += 4;
      threats.push('PHISHING_PATTERN');
      indicators.push('Phishing pattern detected');
    }

    // Check for typosquatting (brand impersonation)
    const typosquattingPatterns = [
      /payp[a41]l(?!\.com)/i,
      /paypa[1i](?!\.com)/i,
      /amaz[0o]n(?!\.com)/i,
      /g[0o]{2}gle(?!\.com)/i,
      /micr[0o]s[0o]ft(?!\.com)/i,
      /faceb[0o]{2}k(?!\.com)/i,
      /app[1l]e(?!\.com)/i,
      /netf[1l]ix(?!\.com)/i
    ];
    if (typosquattingPatterns.some(pattern => pattern.test(url))) {
      score += 5; // High weight for typosquatting
      threats.push('TYPOSQUATTING');
      indicators.push('Possible brand impersonation detected');
    }

    // Check for excessive subdomains
    const subdomainCount = (url.match(/\./g) || []).length;
    if (subdomainCount > 4) {
      score += 2;
      threats.push('EXCESSIVE_SUBDOMAINS');
      indicators.push('Excessive subdomains');
    }

    // Determine threat level
    let threatLevel = 'safe';
    let confidence = 70;

    if (score >= 8) {
      threatLevel = 'dangerous';
      confidence = 85;
    } else if (score >= 4) {
      threatLevel = 'suspicious';
      confidence = 75;
    } else {
      threatLevel = 'safe';
      confidence = 80;
    }

    return {
      threatLevel,
      confidence,
      threats,
      indicators,
      score,
      source: 'pattern_analysis'
    };
  }

  /**
   * Parse AI URL analysis response
   */
  parseUrlAIResponse(data) {
    if (!data || !data.labels || !data.scores) {
      throw new Error('Invalid response format from Hugging Face');
    }

    const results = data.labels.map((label, index) => ({
      label,
      score: data.scores[index]
    }));

    const dangerousLabels = ['phishing', 'malware', 'malicious'];
    const suspiciousLabels = ['suspicious'];
    const safeLabels = ['safe', 'legitimate'];

    let maxDangerousScore = 0;
    let maxSuspiciousScore = 0;
    let maxSafeScore = 0;

    results.forEach(result => {
      if (dangerousLabels.includes(result.label.toLowerCase())) {
        maxDangerousScore = Math.max(maxDangerousScore, result.score);
      } else if (suspiciousLabels.includes(result.label.toLowerCase())) {
        maxSuspiciousScore = Math.max(maxSuspiciousScore, result.score);
      } else if (safeLabels.includes(result.label.toLowerCase())) {
        maxSafeScore = Math.max(maxSafeScore, result.score);
      }
    });

    let threatLevel = 'safe';
    let confidence = 0;

    if (maxDangerousScore > 0.6) {
      threatLevel = 'dangerous';
      confidence = Math.round(maxDangerousScore * 100);
    } else if (maxDangerousScore > 0.3 || maxSuspiciousScore > 0.5) {
      threatLevel = 'suspicious';
      confidence = Math.round(Math.max(maxDangerousScore, maxSuspiciousScore) * 100);
    } else {
      threatLevel = 'safe';
      confidence = Math.round(maxSafeScore * 100);
    }

    return {
      threatLevel,
      confidence,
      threats: results.filter(r => r.score > 0.5 && dangerousLabels.includes(r.label.toLowerCase())).map(r => r.label.toUpperCase()),
      indicators: results.filter(r => r.score > 0.3).map(r => `${r.label}: ${Math.round(r.score * 100)}%`),
      source: 'huggingface_ai'
    };
  }

  /**
   * Combine results from Hugging Face AI and pattern analysis
   */
  combineUrlAnalysisResults(results, url) {
    const { aiAnalysis, patternAnalysis } = results;

    // Priority: AI > Pattern
    let finalResult = {
      threatLevel: 'safe',
      confidence: 0,
      threats: [],
      indicators: [],
      details: {
        url: url.substring(0, 100),
        methods: []
      },
      source: 'combined'
    };

    // Use AI analysis if available
    if (aiAnalysis) {
      finalResult.threatLevel = aiAnalysis.threatLevel;
      finalResult.confidence = aiAnalysis.confidence;
      finalResult.threats = aiAnalysis.threats;
      finalResult.indicators = aiAnalysis.indicators;
      finalResult.details.methods.push('Hugging Face AI');
      
      // Add pattern analysis context if available
      if (patternAnalysis && patternAnalysis.threats.length > 0) {
        finalResult.details.methods.push('Pattern Analysis');
        // Boost confidence if both methods agree
        if (patternAnalysis.threatLevel === aiAnalysis.threatLevel) {
          finalResult.confidence = Math.min(finalResult.confidence + 10, 99);
          finalResult.indicators.push('✓ Multiple methods confirm result');
        }
        // Add additional pattern-based indicators
        if (patternAnalysis.indicators && patternAnalysis.indicators.length > 0) {
          finalResult.indicators.push(...patternAnalysis.indicators);
        }
      }
    }
    // Fall back to pattern analysis
    else if (patternAnalysis) {
      finalResult.threatLevel = patternAnalysis.threatLevel;
      finalResult.confidence = patternAnalysis.confidence;
      finalResult.threats = patternAnalysis.threats;
      finalResult.indicators = patternAnalysis.indicators;
      finalResult.details.methods.push('Pattern Analysis');
    }

    return finalResult;
  }

  /**
   * Generate summary using Hugging Face model
   */
  async generateSummary(analysisData) {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      const { threatLevel, confidence, inputType, indicators = [] } = analysisData;
      
      const prompt = this.buildSummaryPrompt(threatLevel, confidence, inputType, indicators);

      const response = await axios.post(
        `${this.baseUrl}/${this.models.summaryGeneration}`,
        {
          inputs: prompt,
          parameters: {
            max_length: 500,
            min_length: 100,
            do_sample: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      return this.parseSummaryResponse(response.data);
    } catch (error) {
      console.error('Hugging Face summary generation error:', error.message);
      throw error;
    }
  }

  /**
   * Parse text analysis response from Hugging Face
   */
  parseTextAnalysisResponse(data) {
    if (!data || !data.labels || !data.scores) {
      throw new Error('Invalid response format from Hugging Face');
    }

    const results = data.labels.map((label, index) => ({
      label,
      score: data.scores[index]
    }));

    // Determine threat level based on scores
    const dangerousLabels = ['spam', 'phishing', 'scam', 'malicious', 'fraudulent'];
    const suspiciousLabels = ['suspicious'];
    const safeLabels = ['legitimate', 'safe'];

    let maxDangerousScore = 0;
    let maxSuspiciousScore = 0;
    let maxSafeScore = 0;

    results.forEach(result => {
      if (dangerousLabels.includes(result.label.toLowerCase())) {
        maxDangerousScore = Math.max(maxDangerousScore, result.score);
      } else if (suspiciousLabels.includes(result.label.toLowerCase())) {
        maxSuspiciousScore = Math.max(maxSuspiciousScore, result.score);
      } else if (safeLabels.includes(result.label.toLowerCase())) {
        maxSafeScore = Math.max(maxSafeScore, result.score);
      }
    });

    let threatLevel = 'safe';
    let confidence = 0;

    if (maxDangerousScore > 0.6) {
      threatLevel = 'dangerous';
      confidence = Math.round(maxDangerousScore * 100);
    } else if (maxDangerousScore > 0.3 || maxSuspiciousScore > 0.5) {
      threatLevel = 'suspicious';
      confidence = Math.round(Math.max(maxDangerousScore, maxSuspiciousScore) * 100);
    } else {
      threatLevel = 'safe';
      confidence = Math.round(maxSafeScore * 100);
    }

    return {
      threatLevel,
      confidence,
      scores: results,
      keywords: results.filter(r => r.score > 0.3).map(r => r.label),
      indicators: results.filter(r => r.score > 0.5).map(r => `${r.label}: ${Math.round(r.score * 100)}%`),
      source: 'huggingface'
    };
  }

  /**
   * Parse URL analysis response from Hugging Face
   */
  parseUrlAnalysisResponse(data, url) {
    if (!data || !data.labels || !data.scores) {
      throw new Error('Invalid response format from Hugging Face');
    }

    const results = data.labels.map((label, index) => ({
      label,
      score: data.scores[index]
    }));

    const dangerousLabels = ['phishing', 'malware', 'malicious'];
    const suspiciousLabels = ['suspicious'];
    const safeLabels = ['safe', 'legitimate'];

    let maxDangerousScore = 0;
    let maxSuspiciousScore = 0;
    let maxSafeScore = 0;

    results.forEach(result => {
      if (dangerousLabels.includes(result.label.toLowerCase())) {
        maxDangerousScore = Math.max(maxDangerousScore, result.score);
      } else if (suspiciousLabels.includes(result.label.toLowerCase())) {
        maxSuspiciousScore = Math.max(maxSuspiciousScore, result.score);
      } else if (safeLabels.includes(result.label.toLowerCase())) {
        maxSafeScore = Math.max(maxSafeScore, result.score);
      }
    });

    let threatLevel = 'safe';
    let confidence = 0;

    if (maxDangerousScore > 0.6) {
      threatLevel = 'dangerous';
      confidence = Math.round(maxDangerousScore * 100);
    } else if (maxDangerousScore > 0.3 || maxSuspiciousScore > 0.5) {
      threatLevel = 'suspicious';
      confidence = Math.round(Math.max(maxDangerousScore, maxSuspiciousScore) * 100);
    } else {
      threatLevel = 'safe';
      confidence = Math.round(maxSafeScore * 100);
    }

    return {
      threatLevel,
      confidence,
      threats: results.filter(r => r.score > 0.5 && dangerousLabels.includes(r.label.toLowerCase())).map(r => r.label.toUpperCase()),
      indicators: results.filter(r => r.score > 0.3).map(r => `${r.label}: ${Math.round(r.score * 100)}%`),
      details: {
        url: url.substring(0, 100),
        scores: results
      },
      source: 'huggingface'
    };
  }

  /**
   * Build prompt for summary generation
   */
  buildSummaryPrompt(threatLevel, confidence, inputType, indicators) {
    const context = inputType === 'url' ? 'URL' : 'text message';
    const indicatorText = indicators.length > 0 ? indicators.join(', ') : 'none';
    
    return `Summarize this security analysis for a ${context}:
Threat Level: ${threatLevel}
Confidence: ${confidence}%
Indicators: ${indicatorText}

Provide a clear, actionable summary for the user about the security risks and recommended actions.`;
  }

  /**
   * Parse summary response from Hugging Face
   */
  parseSummaryResponse(data) {
    if (Array.isArray(data) && data.length > 0 && data[0].summary_text) {
      return data[0].summary_text;
    } else if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      return data[0].generated_text;
    } else if (typeof data === 'string') {
      return data;
    }
    throw new Error('Invalid summary response format');
  }
}

export default new HuggingFaceService();
