import axios from 'axios';
import dotenv from 'dotenv';
import { 
  getValidationRules, 
  getThreatLevelByScore, 
  calculateConfidence 
} from '../config/validationRules.js';

dotenv.config();

class ConfigurableAIAnalyzerService {
  constructor() {
    this.huggingFaceToken = process.env.HUGGINGFACE_API_KEY;
    this.googleSafeBrowsingKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY || 'key';
    this.rules = getValidationRules();
  }

  // Refresh rules (useful if they're updated at runtime)
  refreshRules() {
    this.rules = getValidationRules();
  }

  // Analyze text using hardcoded logic (replacing Hugging Face)
  async analyzeTextWithHuggingFace(text) {
    console.log('Using hardcoded text analysis (configurable analyzer)');
    // Always use fallback analysis which is now our primary hardcoded analysis
    return this.fallbackTextAnalysis(text);
  }

  // Analyze URL using hardcoded logic (replacing Google Safe Browsing)
  async analyzeUrlWithGoogleSafeBrowsing(url) {
    console.log('Using hardcoded URL analysis (configurable analyzer)');
    // Always use fallback analysis which is now our primary hardcoded analysis
    return this.fallbackUrlAnalysis(url);
  }

  // Generate summary using hardcoded logic (replacing Gemini AI)
  async generateSummaryWithGemini(analysisData) {
    console.log('Using hardcoded summary generation (configurable analyzer)');
    // Always use fallback summary which is now our primary hardcoded summary
    return this.generateFallbackSummary(analysisData);
  }

  // Fallback analysis for text using configurable keywords
  fallbackTextAnalysis(text) {
    if (!this.rules.features.useFallbackAnalysis) {
      return {
        threatLevel: 'safe',
        confidence: 50,
        source: 'disabled'
      };
    }

    const lowerText = text.toLowerCase();
    const keywords = this.rules.scamKeywords;
    const weights = this.rules.keywordWeights;
    
    let totalScore = 0;
    const foundKeywords = [];
    
    // Check each category of keywords
    for (const [category, keywordList] of Object.entries(keywords)) {
      const weight = weights[category] || 1;
      const found = keywordList.filter(keyword => lowerText.includes(keyword.toLowerCase()));
      
      if (found.length > 0) {
        totalScore += found.length * weight;
        foundKeywords.push(...found.map(k => ({ keyword: k, category, weight })));
      }
    }
    
    // Determine threat level based on configurable thresholds
    const thresholds = this.rules.fallbackSettings.keywordThresholds;
    let threatLevel = 'safe';
    
    if (totalScore >= thresholds.dangerous) {
      threatLevel = 'dangerous';
    } else if (totalScore >= thresholds.suspicious) {
      threatLevel = 'suspicious';
    }
    
    const confidence = this.rules.fallbackSettings.defaultConfidence[threatLevel];

    return {
      threatLevel,
      confidence,
      keywords: foundKeywords,
      totalScore,
      source: 'fallback'
    };
  }

  // Fallback analysis for URLs using configurable patterns
  fallbackUrlAnalysis(url) {
    if (!this.rules.features.useFallbackAnalysis) {
      return {
        threatLevel: 'safe',
        confidence: 50,
        threats: [],
        source: 'disabled'
      };
    }

    const suspiciousPatterns = this.rules.suspiciousUrlPatterns;
    const threats = [];
    let suspicionLevel = 0;
    
    // Check URL shorteners
    const foundShortener = suspiciousPatterns.url_shorteners.find(shortener => 
      url.toLowerCase().includes(shortener.toLowerCase())
    );
    if (foundShortener) {
      threats.push(`URL_SHORTENER: ${foundShortener}`);
      suspicionLevel += 2;
    }
    
    // Check suspicious TLDs
    const foundTLD = suspiciousPatterns.suspicious_tlds.find(tld => 
      url.toLowerCase().endsWith(tld.toLowerCase())
    );
    if (foundTLD) {
      threats.push(`SUSPICIOUS_TLD: ${foundTLD}`);
      suspicionLevel += 2;
    }
    
    // Check phishing patterns
    const foundPattern = suspiciousPatterns.phishing_patterns.find(pattern => 
      url.toLowerCase().includes(pattern.toLowerCase())
    );
    if (foundPattern) {
      threats.push(`PHISHING_PATTERN: ${foundPattern}`);
      suspicionLevel += 3;
    }
    
    const threatLevel = suspicionLevel >= 3 ? 'suspicious' : 'safe';
    const confidence = this.rules.fallbackSettings.defaultConfidence[threatLevel];

    return {
      threatLevel,
      confidence,
      threats,
      suspicionLevel,
      source: 'fallback'
    };
  }

  // Generate fallback summary using configurable messages
  generateFallbackSummary(analysisData) {
    const { threatLevel, confidence, indicators = [] } = analysisData;
    const threatConfig = this.rules.threatLevels[threatLevel];
    
    let summary = '';
    
    if (threatLevel === 'dangerous') {
      summary = `⚠️ HIGH RISK DETECTED: This content shows strong indicators of being a scam or malicious. `;
      summary += `We detected ${indicators.length} warning signs with ${confidence}% confidence. `;
      summary += `DO NOT interact with this content and report it to authorities.`;
    } else if (threatLevel === 'suspicious') {
      summary = `⚠️ CAUTION ADVISED: This content has some suspicious characteristics. `;
      summary += `We found ${indicators.length} potential warning signs. `;
      summary += `Verify the source through official channels before proceeding.`;
    } else {
      summary = `✅ APPEARS SAFE: No immediate threats detected in this content. `;
      summary += `However, always remain vigilant and verify information through official sources.`;
    }

    return summary;
  }

  // Main analysis function using configurable rules
  async analyze(inputType, inputContent) {
    // Refresh rules to get latest configuration
    this.refreshRules();
    
    let analysisResult = {
      inputType,
      threatLevel: 'safe',
      confidence: 0,
      indicators: [],
      recommendations: [],
      summary: ''
    };

    try {
      if (inputType === 'url') {
        const urlAnalysis = await this.analyzeUrlWithGoogleSafeBrowsing(inputContent);
        analysisResult = { ...analysisResult, ...urlAnalysis };
        
        // Use configurable recommendations
        analysisResult.recommendations = [
          ...this.rules.recommendations[urlAnalysis.threatLevel],
          ...this.rules.recommendations.url_specific
        ];
      } else {
        const textAnalysis = await this.analyzeTextWithHuggingFace(inputContent);
        analysisResult = { ...analysisResult, ...textAnalysis };
        
        // Use configurable recommendations
        analysisResult.recommendations = [
          ...this.rules.recommendations[textAnalysis.threatLevel],
          ...this.rules.recommendations.text_specific
        ];
      }

      // Add configurable indicators
      const threatConfig = this.rules.threatLevels[analysisResult.threatLevel];
      
      if (analysisResult.threatLevel === 'dangerous') {
        analysisResult.indicators.push('High risk content detected');
        if (analysisResult.threats) {
          analysisResult.indicators.push(...analysisResult.threats);
        }
      } else if (analysisResult.threatLevel === 'suspicious') {
        analysisResult.indicators.push('Potentially suspicious content');
        if (analysisResult.keywords) {
          analysisResult.indicators.push(
            ...analysisResult.keywords.map(k => `Keyword: ${k.keyword || k}`)
          );
        }
      } else {
        analysisResult.indicators.push('No immediate threats detected');
      }

      // Generate summary
      analysisResult.summary = await this.generateSummaryWithGemini(analysisResult);

      // Add threat level configuration to response
      analysisResult.threatConfig = threatConfig;

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Use fallback analysis
      if (inputType === 'url') {
        const fallback = this.fallbackUrlAnalysis(inputContent);
        analysisResult = { ...analysisResult, ...fallback };
      } else {
        const fallback = this.fallbackTextAnalysis(inputContent);
        analysisResult = { ...analysisResult, ...fallback };
      }
      
      analysisResult.summary = this.generateFallbackSummary(analysisResult);
      analysisResult.threatConfig = this.rules.threatLevels[analysisResult.threatLevel];
      
      // Add fallback recommendations
      analysisResult.recommendations = [
        ...this.rules.recommendations[analysisResult.threatLevel],
        ...(inputType === 'url' ? 
          this.rules.recommendations.url_specific : 
          this.rules.recommendations.text_specific)
      ];
    }

    return analysisResult;
  }

  // Get current configuration (for admin interface)
  getConfiguration() {
    return this.rules;
  }
}

export default new ConfigurableAIAnalyzerService();
