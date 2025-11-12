import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    
    // Model configuration - can be customized via environment variables
    // Using better models for improved accuracy
    this.models = {
      // Text classification - using zero-shot classification model
      textAnalysis: process.env.HUGGINGFACE_TEXT_MODEL || 'facebook/bart-large-mnli',
      // URL analysis - using same model with better prompts
      urlAnalysis: process.env.HUGGINGFACE_URL_MODEL || 'facebook/bart-large-mnli',
      // Summary generation - using text generation model for better summaries
      summaryGeneration: process.env.HUGGINGFACE_SUMMARY_MODEL || 'facebook/bart-large-cnn',
      // Alternative: Use text generation models for better summaries
      textGeneration: process.env.HUGGINGFACE_TEXT_GEN_MODEL || 'google/flan-t5-large'
    };
    
    this.timeout = parseInt(process.env.HUGGINGFACE_TIMEOUT) || 45000; // Increased timeout for better models
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'your_huggingface_api_key';
  }

  /**
   * Analyze text content using Hugging Face model with enhanced accuracy
   */
  async analyzeText(text) {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      // Enhanced labels for better classification accuracy
      const labels = [
        'phishing attack',
        'scam message',
        'spam email',
        'fraudulent content',
        'malicious intent',
        'social engineering',
        'financial scam',
        'identity theft attempt',
        'legitimate message',
        'safe content',
        'suspicious but safe',
        'urgent scam',
        'fake prize',
        'tech support scam'
      ];

      // Enhanced prompt for better context understanding
      const enhancedPrompt = `Analyze this message for security threats: "${text}". 
      Identify if this is a phishing attempt, scam, spam, fraudulent content, or legitimate message.
      Consider: urgency tactics, financial requests, personal information requests, suspicious links, grammar errors, and scam patterns.`;

      const response = await axios.post(
        `${this.baseUrl}/${this.models.textAnalysis}`,
        {
          inputs: enhancedPrompt,
          parameters: {
            candidate_labels: labels,
            multi_label: true,
            hypothesis_template: 'This message is about {}.'
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

      return this.parseTextAnalysisResponse(response.data, text);
    } catch (error) {
      console.error('Hugging Face text analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze URL using Hugging Face AI model (PRIMARY) with pattern analysis as minimal fallback
   * Prioritizes Hugging Face AI for accurate threat detection
   */
  async analyzeUrl(url) {
    const results = {
      aiAnalysis: null,
      patternAnalysis: null
    };

    // PRIMARY: Try Hugging Face AI model for URL analysis
    if (this.isConfigured()) {
      try {
        results.aiAnalysis = await this.analyzeUrlWithAI(url);
        console.log('✅ Hugging Face AI URL analysis successful');
      } catch (error) {
        console.error('❌ Hugging Face URL analysis error:', error.message);
        // Only use pattern analysis if AI completely fails
        results.patternAnalysis = this.analyzeUrlPatterns(url);
      }
    } else {
      // Fallback only if not configured
      console.warn('⚠️  Hugging Face not configured, using pattern analysis');
      results.patternAnalysis = this.analyzeUrlPatterns(url);
    }

    // If AI analysis succeeded, use it primarily (pattern analysis is supplementary)
    if (results.aiAnalysis) {
      // Only add pattern analysis as supplementary context, not as primary
      const combined = this.combineUrlAnalysisResults(results, url);
      return combined;
    }

    // Fallback to pattern analysis only if AI failed
    if (results.patternAnalysis) {
      return {
        ...results.patternAnalysis,
        source: 'pattern_analysis_fallback',
        details: {
          methods: ['Pattern Analysis (Fallback - Hugging Face AI unavailable)'],
          url: url.substring(0, 100)
        }
      };
    }

    // If both fail, return safe default
    return {
      threatLevel: 'suspicious',
      confidence: 50,
      threats: [],
      indicators: ['Unable to analyze URL - analysis services unavailable'],
      source: 'error',
      details: {
        methods: [],
        url: url.substring(0, 100)
      }
    };
  }

  /**
   * Analyze URL using Hugging Face AI model with enhanced accuracy
   */
  async analyzeUrlWithAI(url) {
    // Enhanced labels for better URL threat detection
    const labels = [
      'phishing website',
      'malware distribution site',
      'scam website',
      'fraudulent domain',
      'typosquatting domain',
      'suspicious URL',
      'safe website',
      'legitimate domain',
      'URL shortener',
      'malicious redirect',
      'fake login page',
      'credential harvesting site'
    ];

    // Enhanced prompt with URL analysis context
    const enhancedPrompt = `Analyze this URL for security threats: "${url}".
    Check for: phishing attempts, malware, scams, typosquatting, suspicious domains, fake websites, credential harvesting, and malicious redirects.
    Consider the domain structure, subdomains, path, and overall URL patterns.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.models.urlAnalysis}`,
        {
          inputs: enhancedPrompt,
          parameters: {
            candidate_labels: labels,
            multi_label: true,
            hypothesis_template: 'This URL is a {}.'
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

      return this.parseUrlAIResponse(response.data, url);
    } catch (error) {
      console.error('Hugging Face URL analysis error:', error.message);
      throw error;
    }
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
   * Parse AI URL analysis response with enhanced accuracy
   */
  parseUrlAIResponse(data, originalUrl) {
    if (!data || !data.labels || !data.scores) {
      throw new Error('Invalid response format from Hugging Face');
    }

    const results = data.labels.map((label, index) => ({
      label: label.toLowerCase(),
      score: data.scores[index],
      originalLabel: data.labels[index]
    })).sort((a, b) => b.score - a.score); // Sort by score descending

    // Enhanced threat categorization for URLs
    const dangerousLabels = [
      'phishing website', 'malware distribution site', 'scam website',
      'fraudulent domain', 'typosquatting domain', 'malicious redirect',
      'fake login page', 'credential harvesting site'
    ];
    const suspiciousLabels = ['suspicious url', 'url shortener'];
    const safeLabels = ['safe website', 'legitimate domain'];

    let maxDangerousScore = 0;
    let maxSuspiciousScore = 0;
    let maxSafeScore = 0;
    const detectedThreats = [];
    const indicators = [];

    results.forEach(result => {
      const labelLower = result.label.toLowerCase();
      
      // Check if it matches dangerous patterns
      const isDangerous = dangerousLabels.some(danger => 
        labelLower.includes(danger.split(' ')[0]) || danger.includes(labelLower.split(' ')[0])
      );
      const isSuspicious = suspiciousLabels.some(susp => 
        labelLower.includes(susp.split(' ')[0]) || susp.includes(labelLower.split(' ')[0])
      );
      const isSafe = safeLabels.some(safe => 
        labelLower.includes(safe.split(' ')[0]) || safe.includes(labelLower.split(' ')[0])
      );

      if (isDangerous && result.score > 0.2) {
        maxDangerousScore = Math.max(maxDangerousScore, result.score);
        if (result.score > 0.4) {
          detectedThreats.push(result.originalLabel.toUpperCase().replace(/\s+/g, '_'));
          indicators.push(`${result.originalLabel} (${Math.round(result.score * 100)}% confidence)`);
        }
      } else if (isSuspicious && result.score > 0.3) {
        maxSuspiciousScore = Math.max(maxSuspiciousScore, result.score);
        if (result.score > 0.5) {
          indicators.push(`${result.originalLabel} (${Math.round(result.score * 100)}% confidence)`);
        }
      } else if (isSafe && result.score > 0.3) {
        maxSafeScore = Math.max(maxSafeScore, result.score);
      }
    });

    // Enhanced threat level determination
    let threatLevel = 'safe';
    let confidence = 0;

    if (maxDangerousScore > 0.5) {
      threatLevel = 'dangerous';
      confidence = Math.round(maxDangerousScore * 100);
    } else if (maxDangerousScore > 0.25 || maxSuspiciousScore > 0.4) {
      threatLevel = 'suspicious';
      confidence = Math.round(Math.max(maxDangerousScore * 120, maxSuspiciousScore * 100));
    } else if (maxSafeScore > 0.5) {
      threatLevel = 'safe';
      confidence = Math.round(maxSafeScore * 100);
    } else {
      threatLevel = 'suspicious';
      confidence = Math.round(Math.max(maxDangerousScore, maxSuspiciousScore, maxSafeScore) * 80);
    }

    // Ensure confidence is within valid range
    confidence = Math.min(Math.max(confidence, 30), 99);

    // Add top threats as indicators if not already included
    const topThreats = results
      .filter(r => r.score > 0.3 && !indicators.some(ind => ind.includes(r.originalLabel)))
      .slice(0, 3)
      .map(r => `${r.originalLabel} (${Math.round(r.score * 100)}%)`);

    return {
      threatLevel,
      confidence,
      threats: detectedThreats.length > 0 ? detectedThreats : (threatLevel === 'dangerous' ? ['MULTIPLE_THREAT_INDICATORS'] : []),
      indicators: indicators.length > 0 ? indicators : topThreats.length > 0 ? topThreats : ['URL analysis completed'],
      source: 'huggingface_ai',
      analysisDetails: {
        topLabels: results.slice(0, 5),
        threatScore: maxDangerousScore,
        suspiciousScore: maxSuspiciousScore,
        safeScore: maxSafeScore,
        url: originalUrl.substring(0, 100)
      }
    };
  }

  /**
   * Combine results from Hugging Face AI and pattern analysis
   * Priority: Hugging Face AI is primary, pattern analysis is only used as fallback or supplementary
   */
  combineUrlAnalysisResults(results, url) {
    const { aiAnalysis, patternAnalysis } = results;

    // Priority: Hugging Face AI > Pattern Analysis (fallback only)
    let finalResult = {
      threatLevel: 'safe',
      confidence: 0,
      threats: [],
      indicators: [],
      details: {
        url: url.substring(0, 100),
        methods: []
      },
      source: 'huggingface_ai' // Default to AI source
    };

    // PRIMARY: Use Hugging Face AI analysis if available
    if (aiAnalysis) {
      finalResult.threatLevel = aiAnalysis.threatLevel;
      finalResult.confidence = aiAnalysis.confidence;
      finalResult.threats = aiAnalysis.threats || [];
      finalResult.indicators = aiAnalysis.indicators || [];
      finalResult.details.methods.push('Hugging Face AI (Primary)');
      finalResult.source = 'huggingface_ai';
      
      // Supplementary: Add pattern analysis context only if it provides additional value
      if (patternAnalysis && patternAnalysis.threats && patternAnalysis.threats.length > 0) {
        // Only add pattern indicators if they're different from AI results
        const uniquePatternIndicators = patternAnalysis.indicators.filter(
          indicator => !finalResult.indicators.some(aiInd => 
            aiInd.toLowerCase().includes(indicator.toLowerCase().substring(0, 20))
          )
        );
        
        if (uniquePatternIndicators.length > 0) {
          finalResult.details.methods.push('Pattern Analysis (Supplementary)');
          // Add unique pattern-based indicators as supplementary information
          finalResult.indicators.push(...uniquePatternIndicators.slice(0, 2)); // Limit to 2 additional
        }
        
        // Boost confidence slightly if both methods agree (max 5% boost)
        if (patternAnalysis.threatLevel === aiAnalysis.threatLevel) {
          finalResult.confidence = Math.min(finalResult.confidence + 5, 99);
        }
      }
    }
    // FALLBACK: Only use pattern analysis if Hugging Face AI is unavailable
    else if (patternAnalysis) {
      console.warn('Hugging Face AI unavailable, using pattern analysis fallback');
      finalResult.threatLevel = patternAnalysis.threatLevel;
      finalResult.confidence = patternAnalysis.confidence;
      finalResult.threats = patternAnalysis.threats || [];
      finalResult.indicators = patternAnalysis.indicators || [];
      finalResult.details.methods.push('Pattern Analysis (Fallback - Hugging Face AI unavailable)');
      finalResult.source = 'pattern_analysis_fallback';
    }

    return finalResult;
  }

  /**
   * Generate comprehensive summary using Hugging Face model with enhanced detail
   */
  async generateSummary(analysisData) {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      const { threatLevel, confidence, inputType, indicators = [], threats = [], keywords = [] } = analysisData;
      
      // Build enhanced prompt for better summarization
      const prompt = this.buildEnhancedSummaryPrompt(threatLevel, confidence, inputType, indicators, threats, keywords);

      // Try using text generation model for better summaries, fallback to summary model
      try {
        const response = await axios.post(
          `${this.baseUrl}/${this.models.summaryGeneration}`,
          {
            inputs: prompt,
            parameters: {
              max_length: 600,
              min_length: 150,
              do_sample: true,
              temperature: 0.7,
              top_p: 0.9,
              repetition_penalty: 1.2
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

        let summary = this.parseSummaryResponse(response.data);
        
        // Enhance summary with additional context if too short
        if (summary.length < 100) {
          summary = this.enhanceSummary(summary, threatLevel, confidence, indicators, threats);
        }
        
        return summary;
      } catch (summaryError) {
        console.warn('Summary generation failed, using enhanced fallback:', summaryError.message);
        return this.generateEnhancedFallbackSummary(analysisData);
      }
    } catch (error) {
      console.error('Hugging Face summary generation error:', error.message);
      // Return enhanced fallback summary instead of throwing
      return this.generateEnhancedFallbackSummary(analysisData);
    }
  }

  /**
   * Build enhanced summary prompt for better AI-generated summaries
   */
  buildEnhancedSummaryPrompt(threatLevel, confidence, inputType, indicators, threats, keywords) {
    const context = inputType === 'url' ? 'URL/website' : inputType === 'image' ? 'image content' : 'text message';
    const threatDesc = threatLevel === 'dangerous' ? 'HIGH RISK - DANGEROUS' : 
                       threatLevel === 'suspicious' ? 'MODERATE RISK - SUSPICIOUS' : 
                       'LOW RISK - SAFE';
    
    const indicatorText = indicators.length > 0 ? indicators.slice(0, 5).join(', ') : 'general analysis';
    const threatText = threats.length > 0 ? threats.join(', ') : 'various threat indicators';
    const keywordText = keywords.length > 0 ? keywords.slice(0, 5).join(', ') : '';

    return `Provide a detailed, actionable security analysis summary for a ${context}:

THREAT LEVEL: ${threatDesc}
CONFIDENCE: ${confidence}%
DETECTED THREATS: ${threatText}
KEY INDICATORS: ${indicatorText}
${keywordText ? `KEYWORDS: ${keywordText}` : ''}

Write a comprehensive summary (150-400 words) that:
1. Clearly explains the threat level and why
2. Describes the specific security risks identified
3. Provides actionable recommendations for the user
4. Explains what to do if this is dangerous content
5. Offers prevention tips for similar threats

Write in a clear, professional, and user-friendly tone. Be specific about the risks and recommendations.`;
  }

  /**
   * Enhance a short summary with additional details
   */
  enhanceSummary(summary, threatLevel, confidence, indicators, threats) {
    let enhanced = summary;
    
    if (threatLevel === 'dangerous') {
      enhanced += `\n\n⚠️ CRITICAL WARNING: This content has been identified as highly dangerous with ${confidence}% confidence. `;
      if (threats.length > 0) {
        enhanced += `Detected threats include: ${threats.slice(0, 3).join(', ')}. `;
      }
      enhanced += `Do not interact with this content. Delete it immediately and report if necessary.`;
    } else if (threatLevel === 'suspicious') {
      enhanced += `\n\n⚠️ CAUTION: This content shows suspicious characteristics (${confidence}% confidence). `;
      if (indicators.length > 0) {
        enhanced += `Key indicators: ${indicators.slice(0, 2).join(', ')}. `;
      }
      enhanced += `Verify the sender through official channels before taking any action.`;
    }
    
    return enhanced;
  }

  /**
   * Generate enhanced fallback summary when AI summarization fails
   */
  generateEnhancedFallbackSummary(analysisData) {
    const { threatLevel, confidence, inputType, indicators = [], threats = [], keywords = [] } = analysisData;
    const context = inputType === 'url' ? 'URL' : inputType === 'image' ? 'image' : 'message';
    
    let summary = '';
    
    if (threatLevel === 'dangerous') {
      summary = `🚨 HIGH RISK THREAT DETECTED (${confidence}% confidence)\n\n`;
      summary += `This ${context} has been identified as highly dangerous. `;
      if (threats.length > 0) {
        summary += `Detected threat types: ${threats.slice(0, 3).join(', ')}. `;
      }
      if (indicators.length > 0) {
        summary += `\n\nKey warning signs:\n${indicators.slice(0, 5).map(ind => `• ${ind}`).join('\n')}\n`;
      }
      summary += `\n🚫 IMMEDIATE ACTIONS:\n`;
      summary += `1. DO NOT click any links or download anything\n`;
      summary += `2. DO NOT provide any personal or financial information\n`;
      summary += `3. Delete this ${context} immediately\n`;
      summary += `4. Report to relevant authorities if applicable\n`;
      summary += `5. Run a security scan on your device\n`;
    } else if (threatLevel === 'suspicious') {
      summary = `⚠️ SUSPICIOUS CONTENT DETECTED (${confidence}% confidence)\n\n`;
      summary += `This ${context} shows characteristics commonly associated with scams or phishing attempts. `;
      if (indicators.length > 0) {
        summary += `\n\nWarning indicators:\n${indicators.slice(0, 4).map(ind => `• ${ind}`).join('\n')}\n`;
      }
      summary += `\n💡 RECOMMENDATIONS:\n`;
      summary += `1. Verify the sender through official, separate communication channels\n`;
      summary += `2. Do not click links without verifying their destination\n`;
      summary += `3. Never share passwords, PINs, or personal information\n`;
      summary += `4. Contact the organization directly using known phone numbers or websites\n`;
      summary += `5. Trust your instincts - if something seems off, it probably is\n`;
    } else {
      summary = `✓ CONTENT APPEARS SAFE (${confidence}% confidence)\n\n`;
      summary += `Initial analysis indicates this ${context} does not show immediate threat indicators. `;
      summary += `\n\n💡 STAY SAFE:\n`;
      summary += `• Always verify important communications through official channels\n`;
      summary += `• Never share sensitive information via email or messages\n`;
      summary += `• Keep your security software updated\n`;
      summary += `• Report any suspicious activity you encounter\n`;
      summary += `• Stay informed about current scam techniques\n`;
    }
    
    if (keywords.length > 0) {
      summary += `\n\n📋 Detected keywords: ${keywords.slice(0, 5).join(', ')}`;
    }
    
    return summary;
  }

  /**
   * Parse text analysis response from Hugging Face with enhanced accuracy
   */
  parseTextAnalysisResponse(data, originalText) {
    if (!data || !data.labels || !data.scores) {
      throw new Error('Invalid response format from Hugging Face');
    }

    const results = data.labels.map((label, index) => ({
      label: label.toLowerCase(),
      score: data.scores[index],
      originalLabel: data.labels[index]
    })).sort((a, b) => b.score - a.score); // Sort by score descending

    // Enhanced threat categorization
    const dangerousLabels = [
      'phishing attack', 'scam message', 'fraudulent content', 'malicious intent',
      'social engineering', 'financial scam', 'identity theft attempt', 'urgent scam',
      'fake prize', 'tech support scam'
    ];
    const suspiciousLabels = ['suspicious but safe', 'spam email'];
    const safeLabels = ['legitimate message', 'safe content'];

    let maxDangerousScore = 0;
    let maxSuspiciousScore = 0;
    let maxSafeScore = 0;
    const detectedThreats = [];
    const indicators = [];

    results.forEach(result => {
      const labelLower = result.label.toLowerCase();
      
      // Check if it matches dangerous patterns
      const isDangerous = dangerousLabels.some(danger => labelLower.includes(danger) || danger.includes(labelLower.split(' ')[0]));
      const isSuspicious = suspiciousLabels.some(susp => labelLower.includes(susp) || susp.includes(labelLower.split(' ')[0]));
      const isSafe = safeLabels.some(safe => labelLower.includes(safe) || safe.includes(labelLower.split(' ')[0]));

      if (isDangerous && result.score > 0.2) {
        maxDangerousScore = Math.max(maxDangerousScore, result.score);
        if (result.score > 0.4) {
          detectedThreats.push(result.originalLabel);
          indicators.push(`${result.originalLabel} (${Math.round(result.score * 100)}% confidence)`);
        }
      } else if (isSuspicious && result.score > 0.3) {
        maxSuspiciousScore = Math.max(maxSuspiciousScore, result.score);
        if (result.score > 0.5) {
          indicators.push(`${result.originalLabel} (${Math.round(result.score * 100)}% confidence)`);
        }
      } else if (isSafe && result.score > 0.3) {
        maxSafeScore = Math.max(maxSafeScore, result.score);
      }
    });

    // Enhanced threat level determination
    let threatLevel = 'safe';
    let confidence = 0;

    if (maxDangerousScore > 0.5) {
      threatLevel = 'dangerous';
      confidence = Math.round(maxDangerousScore * 100);
    } else if (maxDangerousScore > 0.25 || maxSuspiciousScore > 0.4) {
      threatLevel = 'suspicious';
      confidence = Math.round(Math.max(maxDangerousScore * 120, maxSuspiciousScore * 100)); // Boost suspicious if dangerous is present
    } else if (maxSafeScore > 0.5) {
      threatLevel = 'safe';
      confidence = Math.round(maxSafeScore * 100);
    } else {
      // Default to suspicious if unclear
      threatLevel = 'suspicious';
      confidence = Math.round(Math.max(maxDangerousScore, maxSuspiciousScore, maxSafeScore) * 80);
    }

    // Ensure confidence is within valid range
    confidence = Math.min(Math.max(confidence, 30), 99);

    // Add top threats as indicators if not already included
    const topThreats = results
      .filter(r => r.score > 0.3 && !indicators.some(ind => ind.includes(r.originalLabel)))
      .slice(0, 3)
      .map(r => `${r.originalLabel} (${Math.round(r.score * 100)}%)`);

    return {
      threatLevel,
      confidence,
      scores: results,
      threats: detectedThreats.length > 0 ? detectedThreats : (threatLevel === 'dangerous' ? ['Multiple threat indicators detected'] : []),
      keywords: results.filter(r => r.score > 0.25).map(r => r.originalLabel),
      indicators: indicators.length > 0 ? indicators : topThreats.length > 0 ? topThreats : ['Analysis completed'],
      source: 'huggingface_ai',
      analysisDetails: {
        topLabels: results.slice(0, 5),
        threatScore: maxDangerousScore,
        suspiciousScore: maxSuspiciousScore,
        safeScore: maxSafeScore
      }
    };
  }



  /**
   * Parse summary response from Hugging Face with enhanced error handling
   */
  parseSummaryResponse(data) {
    // Handle various response formats from Hugging Face models
    if (Array.isArray(data)) {
      // BART CNN model format
      if (data[0] && data[0].summary_text) {
        return data[0].summary_text.trim();
      }
      // Text generation model format
      if (data[0] && data[0].generated_text) {
        return data[0].generated_text.trim();
      }
      // Some models return text directly in array
      if (typeof data[0] === 'string') {
        return data[0].trim();
      }
    }
    
    // Handle object response
    if (data && typeof data === 'object') {
      if (data.summary_text) {
        return data.summary_text.trim();
      }
      if (data.generated_text) {
        return data.generated_text.trim();
      }
      if (data.text) {
        return data.text.trim();
      }
    }
    
    // Handle string response
    if (typeof data === 'string') {
      return data.trim();
    }
    
    // If we can't parse, return a descriptive error message
    console.warn('Unexpected summary response format:', JSON.stringify(data).substring(0, 200));
    throw new Error('Invalid summary response format from Hugging Face');
  }
}

export default new HuggingFaceService();
