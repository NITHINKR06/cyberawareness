import axios from 'axios';
import dotenv from 'dotenv';
import generativeLLMService from './generativeLLMService.js';

dotenv.config();

class AIAnalyzerService {
  constructor() {
    this.llmService = generativeLLMService;
  }

  // Analyze text using Generative LLM (Gemini or ChatGPT) (PRIMARY METHOD)
  // Falls back to pattern analysis only if LLM is unavailable
  async analyzeTextWithLLM(text) {
    try {
      if (this.llmService.isConfigured()) {
        const providerInfo = this.llmService.getProviderInfo();
        console.log(`🤖 Using ${providerInfo.provider.toUpperCase()} AI for text analysis (PRIMARY)`);
        console.log('🔍 Checking API configuration...');
        const result = await this.llmService.analyzeText(text);
        console.log(`✅ ${providerInfo.provider.toUpperCase()} analysis completed successfully`);
        console.log(`📊 Threat Score: ${result.threatScore}/10, Threat Level: ${result.threatLevel}`);
        return result;
      } else {
        console.error('❌❌❌ GENERATIVE LLM API NOT CONFIGURED ❌❌❌');
        console.error('⚠️  Using HARDCODED pattern analysis fallback (NOT AI)');
        console.error('⚠️  Set GEMINI_API_KEY or CHATGPT_API_KEY environment variable to use REAL AI analysis');
        const fallback = this.fallbackTextAnalysis(text);
        fallback.source = 'pattern_analysis_fallback_no_api_key';
        fallback.warning = '⚠️ WARNING: This is HARDCODED pattern matching, NOT AI. Set GEMINI_API_KEY or CHATGPT_API_KEY to use real AI.';
        fallback.isHardcoded = true;
        return fallback;
      }
    } catch (error) {
      console.error('❌❌❌ GENERATIVE LLM API CALL FAILED ❌❌❌');
      console.error('❌ Error:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('⚠️  Using HARDCODED pattern analysis fallback (NOT AI)');
      const fallback = this.fallbackTextAnalysis(text);
      fallback.source = 'pattern_analysis_fallback_api_error';
      fallback.error = error.message;
      fallback.warning = '⚠️ WARNING: Generative LLM API call failed. This is HARDCODED pattern matching, NOT AI.';
      fallback.isHardcoded = true;
      return fallback;
    }
  }

  // Fallback text analysis (minimal, used only when API unavailable)
  // THIS IS HARDCODED PATTERN MATCHING - NOT AI!
  fallbackTextAnalysis(text) {
    console.error('⚠️⚠️⚠️  USING HARDCODED PATTERN ANALYSIS (NOT AI) ⚠️⚠️⚠️');
    console.error('⚠️  This is predefined keyword matching, NOT Generative LLM AI');
    const lowerText = text.toLowerCase();
    
    // Enhanced keyword categories with weights
    const keywordCategories = {
      urgency: {
        weight: 3,
        keywords: [
          'urgent', 'act now', 'immediately', 'expire', 'deadline', 
          'limited time', 'hurry', 'last chance', 'final notice', 
          'suspended', 'terminated', 'act fast', 'time sensitive',
          'expires today', 'expires tomorrow', '24 hours', '48 hours',
          'immediate action required', 'respond now', 'don\'t delay'
        ]
      },
      financial_scam: {
        weight: 4,
        keywords: [
          'verify account', 'verify bank', 'verify identity', 'confirm account',
          'bank security', 'security update', 'account locked', 'account suspended',
          'otp', 'one time password', 'verification code', 'security code',
          'transfer funds', 'transfer money', 'wire transfer', 'send money',
          'processing fee', 'advance fee', 'administration fee', 'handling fee',
          'loan approved', 'loan offer', 'guaranteed loan', 'pre-approved',
          'credit card', 'debit card', 'card details', 'cvv', 'pin number',
          'tax refund', 'government grant', 'stimulus payment', 'inheritance',
          'bitcoin', 'cryptocurrency', 'crypto wallet', 'investment opportunity'
        ]
      },
      prize_lottery: {
        weight: 3.5,
        keywords: [
          'congratulations', 'winner', 'prize', 'lottery', 'jackpot',
          'you have won', 'you won', 'winning notification', 'lucky winner',
          'claim reward', 'claim prize', 'claim money', 'claim refund',
          'million dollars', 'cash prize', 'grand prize', 'sweepstakes',
          'selected', 'chosen', 'lucky draw', 'raffle'
        ]
      },
      phishing: {
        weight: 4,
        keywords: [
          'click here', 'click now', 'click below', 'click link',
          'verify your', 'confirm your', 'update your', 'validate your',
          'unusual activity', 'suspicious activity', 'security alert',
          'account compromise', 'unauthorized access', 'security breach',
          'reset password', 'change password', 'update password',
          'billing problem', 'payment failed', 'payment issue',
          'subscription expire', 'service suspension', 'account review'
        ]
      },
      threat_malware: {
        weight: 3.5,
        keywords: [
          'virus', 'malware', 'trojan', 'ransomware', 'spyware',
          'infected', 'threat detected', 'security risk', 'security threat',
          'hack', 'hacked', 'hacker', 'hacking', 'compromised', 'breach',
          'download now', 'install now', 'update required', 'software update',
          'clean your', 'scan your', 'protect your', 'antivirus'
        ]
      },
      personal_info: {
        weight: 3,
        keywords: [
          'social security', 'ssn', 'driver license', 'passport number',
          'date of birth', 'dob', 'mother maiden', 'full name',
          'home address', 'phone number', 'email address',
          'username', 'password', 'login credentials', 'account details'
        ]
      },
      romance_scam: {
        weight: 2.5,
        keywords: [
          'send money for', 'emergency funds', 'medical emergency',
          'stuck in', 'stranded', 'customs fee', 'visa fee',
          'military deployment', 'oil rig', 'inheritance claim',
          'business opportunity', 'joint venture', 'investment partner'
        ]
      }
    };

    // Typosquatting patterns
    const typosquattingPatterns = [
      { pattern: /paypa[1l]|pay-?pal[^.]|paipal|payp[4a]l/i, name: 'PayPal' },
      { pattern: /amaz[0o]n|amazone|amazn|ama-?zon/i, name: 'Amazon' },
      { pattern: /g[0o]{2}gle|googl[3e]|go{3,}gle/i, name: 'Google' },
      { pattern: /micr[0o]s[0o]ft|microsofy|mircosoft|micro-?soft/i, name: 'Microsoft' },
      { pattern: /app[1l]e|appl[3e]|appl[1i]|appie/i, name: 'Apple' },
      { pattern: /faceb[0o]{2}k|facebbok|facebok|face-?book/i, name: 'Facebook' },
      { pattern: /netf[1l]ix|netfllx|netfix|net-?flix/i, name: 'Netflix' },
      { pattern: /bank\s?of\s?america|bankofamerica|bofa/i, name: 'Bank of America' },
      { pattern: /wells\s?fargo|wellsfargo|wells-?fargo/i, name: 'Wells Fargo' },
      { pattern: /chase\s?bank|chasebank|chase-?bank/i, name: 'Chase Bank' }
    ];

    // Suspicious patterns
    const suspiciousPatterns = [
      { pattern: /\b\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/, type: 'phone_number', weight: 1 },
      { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, type: 'email', weight: 0.5 },
      { pattern: /https?:\/\/[^\s]+/, type: 'url', weight: 1.5 },
      { pattern: /\$[\d,]+(\.\d{2})?|\d+\s?(USD|dollars?|pounds?|euros?)/i, type: 'money', weight: 2 },
      { pattern: /\b[A-Z]{2,}\b/, type: 'caps_lock', weight: 0.5 },
      { pattern: /[!]{2,}/, type: 'excessive_exclamation', weight: 1 },
      { pattern: /free.{0,20}(money|cash|gift|prize)/i, type: 'free_money', weight: 3 }
    ];

    // Calculate scores
    let totalScore = 0;
    const detectedIndicators = [];
    const detectedKeywords = [];

    // Check keyword categories
    for (const [category, data] of Object.entries(keywordCategories)) {
      const found = data.keywords.filter(keyword => lowerText.includes(keyword));
      if (found.length > 0) {
        const categoryScore = found.length * data.weight;
        totalScore += categoryScore;
        detectedKeywords.push(...found);
        detectedIndicators.push(`${category.replace(/_/g, ' ')}: ${found.length} matches`);
      }
    }

    // Check typosquatting
    let typosquattingDetected = false;
    for (const typo of typosquattingPatterns) {
      if (typo.pattern.test(text)) {
        totalScore += 5; // High weight for typosquatting
        detectedIndicators.push(`Possible ${typo.name} impersonation`);
        typosquattingDetected = true;
      }
    }

    // Check suspicious patterns
    for (const suspicious of suspiciousPatterns) {
      const matches = text.match(suspicious.pattern);
      if (matches) {
        totalScore += suspicious.weight * matches.length;
        detectedIndicators.push(`${suspicious.type}: ${matches.length} found`);
      }
    }

    // Context-aware analysis
    const contextBonus = this.analyzeContext(lowerText, detectedKeywords);
    totalScore += contextBonus;

    // Determine threat level and threat score (0-10)
    let threatLevel = 'safe';
    let threatScore = 0;

    // Convert totalScore to threat score (0-10 scale)
    // Scale the totalScore to 0-10 range
    // Assuming totalScore can range from 0 to ~50 based on weights
    threatScore = Math.min(10, Math.max(0, Math.round((totalScore / 50) * 10)));

    // Extract threats from indicators
    const detectedThreats = [];
    if (detectedIndicators.some(ind => ind.toLowerCase().includes('homograph'))) {
      detectedThreats.push('HOMOGRAPH_ATTACK');
    }
    if (detectedIndicators.some(ind => ind.toLowerCase().includes('typosquatting') || ind.toLowerCase().includes('impersonation'))) {
      detectedThreats.push('TYPOSQUATTING');
    }

    // --- ENHANCED LOGIC FOR CRITICAL THREATS ---
    // Critical: If Homograph or Typosquatting is detected, it is immediately Dangerous.
    if (detectedThreats.includes('HOMOGRAPH_ATTACK') || detectedThreats.includes('TYPOSQUATTING') || totalScore >= 10) {
      threatLevel = 'dangerous';
      threatScore = Math.max(threatScore, 8); // Minimum 8 for dangerous threats
    } else if (totalScore >= 5) {
      // High-weight threats (Phishing Pattern, IP Address)
      threatLevel = 'suspicious';
      threatScore = Math.max(threatScore, 5); // Minimum 5 for suspicious
    } else if (totalScore >= 2) {
      // Low-weight threats (Shorteners, Suspicious TLD)
      threatLevel = 'suspicious';
      threatScore = Math.max(threatScore, 3); // Minimum 3 for low-level suspicious
    } else {
      threatLevel = 'safe';
      threatScore = Math.max(0, Math.min(2, threatScore)); // 0-2 for safe
    }

    // Calculate confidence based on threat score and indicators
    const confidence = Math.min(99, Math.max(50, 50 + (threatScore * 5)));

    return {
      threatScore,
      threatLevel,
      confidence: Math.round(confidence),
      verdict: `${threatLevel === 'dangerous' ? 'High risk detected' : threatLevel === 'suspicious' ? 'Suspicious content' : 'Content appears safe'}`,
      reasoning: `Pattern analysis detected ${detectedKeywords.length} suspicious keywords and ${detectedIndicators.length} indicators. ${threatLevel === 'dangerous' ? 'Multiple high-risk patterns identified.' : threatLevel === 'suspicious' ? 'Some concerning patterns found.' : 'No significant threat patterns detected.'}`,
      scores: {
        totalScore,
        keywordCount: detectedKeywords.length,
        indicatorCount: detectedIndicators.length
      },
      keywords: detectedKeywords.slice(0, 10), // Limit to top 10
      indicators: detectedIndicators.slice(0, 5), // Limit to top 5
      threats: detectedThreats.length > 0 ? detectedThreats : [],
      source: 'hardcoded_pattern_analysis_not_ai',
      isHardcoded: true,
      warning: '⚠️ WARNING: This analysis uses HARDCODED pattern matching, NOT Generative LLM AI. Results are based on predefined keywords only.'
    };
  }

  // Context-aware analysis helper
  analyzeContext(text, keywords) {
    let bonus = 0;

    // Check for dangerous combinations
    if (text.includes('urgent') && text.includes('verify')) bonus += 3;
    if (text.includes('click') && text.includes('immediately')) bonus += 3;
    if (text.includes('suspended') && text.includes('account')) bonus += 4;
    if (text.includes('winner') && text.includes('claim')) bonus += 3;
    if (text.includes('limited') && text.includes('time')) bonus += 2;
    if (text.includes('verify') && text.includes('identity')) bonus += 3;
    if (text.includes('security') && text.includes('update')) bonus += 2;
    
    // Check for multiple money-related terms
    const moneyTerms = ['$', 'dollar', 'money', 'cash', 'payment', 'fee', 'transfer'];
    const moneyCount = moneyTerms.filter(term => text.includes(term)).length;
    if (moneyCount >= 3) bonus += 4;

    // Check for impersonation attempts
    const brands = ['paypal', 'amazon', 'google', 'microsoft', 'apple', 'facebook', 'netflix', 'bank'];
    const brandMentions = brands.filter(brand => text.includes(brand)).length;
    if (brandMentions > 0 && keywords.length > 5) bonus += 3;

    return bonus;
  }

  // Analyze URL using Generative LLM (Gemini or ChatGPT) (PRIMARY METHOD)
  // Falls back to pattern analysis only if LLM is unavailable
  async analyzeUrlWithLLM(url) {
    try {
      if (this.llmService.isConfigured()) {
        const providerInfo = this.llmService.getProviderInfo();
        console.log(`🤖 Using ${providerInfo.provider.toUpperCase()} AI for URL analysis (PRIMARY)`);
        const result = await this.llmService.analyzeUrl(url);
        console.log(`✅ ${providerInfo.provider.toUpperCase()} URL analysis completed`);
        console.log(`📊 Threat Score: ${result.threatScore}/10, Threat Level: ${result.threatLevel}`);
        return result;
      } else {
        console.warn('⚠️  Generative LLM API not configured, using pattern analysis fallback');
        return this.fallbackUrlAnalysis(url);
      }
    } catch (error) {
      console.error('❌ Generative LLM API error, using pattern analysis fallback:', error.message);
      return this.fallbackUrlAnalysis(url);
    }
  }

  // Fallback URL analysis (minimal, used only when API unavailable)
  fallbackUrlAnalysis(url) {
    const lowerUrl = url.toLowerCase();
    let totalScore = 0;
    const threats = [];
    const indicators = [];

    // Known malicious patterns
    const maliciousPatterns = {
      phishing: {
        weight: 5,
        patterns: [
          /secure[.-]?(?:paypal|amazon|google|microsoft|apple|facebook|netflix|bank)/i,
          /account[.-]?(?:verify|update|suspended|locked)/i,
          /(?:verify|confirm|update)[.-]?(?:account|identity|payment)/i,
          /(?:suspended|locked|limited)[.-]?account/i,
          /security[.-]?(?:alert|update|check)/i,
          /billing[.-]?(?:update|problem|issue)/i
        ]
      },
      typosquatting: {
        weight: 4,
        patterns: [
          /payp[a4]l(?!\.com)/i,
          /paypa[1i](?!\.com)/i,
          /amaz[0o]n(?!\.com)/i,
          /g[0o]{2}gle(?!\.com)/i,
          /micr[0o]s[0o]ft(?!\.com)/i,
          /faceb[0o]{2}k(?!\.com)/i,
          /app[1l]e(?!\.com)/i,
          /netf[1l]ix(?!\.com)/i
        ]
      },
      suspicious_tlds: {
        weight: 3,
        domains: ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.review', '.top', '.win', '.bid', '.trade', '.date', '.stream', '.science']
      },
      url_shorteners: {
        weight: 2,
        domains: ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'is.gd', 't.co', 'buff.ly', 'short.link', 'tiny.cc', 'surl.li']
      },
      ip_addresses: {
        weight: 3,
        pattern: /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
      },
      suspicious_keywords: {
        weight: 2,
        keywords: [
          'free-money', 'get-rich', 'winner', 'prize', 'lottery',
          'click-here', 'act-now', 'limited-time', 'urgent',
          'verify-account', 'suspended-account', 'security-alert',
          'invoice', 'receipt', 'refund', 'tax-return'
        ]
      },
      data_harvesting: {
        weight: 3,
        patterns: [
          /\/(?:login|signin|verify|confirm)\.php/i,
          /\/(wp-admin|admin|login)$/i,
          /\/\.well-known\//i,
          /\/cgi-bin\//i
        ]
      },
      homograph_attacks: {
        weight: 4,
        check: (url) => {
          // Check for mixed scripts or unusual characters
          return /[а-яА-Я]/.test(url) || // Cyrillic
                 /[\u0430-\u044f]/.test(url) || // More Cyrillic
                 /[αβγδεζηθικλμνξοπρστυφχψω]/.test(url); // Greek
        }
      }
    };

    // Check phishing patterns
    for (const pattern of maliciousPatterns.phishing.patterns) {
      if (pattern.test(lowerUrl)) {
        totalScore += maliciousPatterns.phishing.weight;
        threats.push('PHISHING_PATTERN');
        indicators.push('Phishing URL pattern detected');
      }
    }

    // Check typosquatting
    for (const pattern of maliciousPatterns.typosquatting.patterns) {
      if (pattern.test(lowerUrl)) {
        totalScore += maliciousPatterns.typosquatting.weight;
        threats.push('TYPOSQUATTING');
        indicators.push('Possible brand impersonation');
      }
    }

    // Check suspicious TLDs
    for (const tld of maliciousPatterns.suspicious_tlds.domains) {
      if (lowerUrl.includes(tld)) {
        totalScore += maliciousPatterns.suspicious_tlds.weight;
        threats.push('SUSPICIOUS_TLD');
        indicators.push(`Suspicious domain extension: ${tld}`);
        break;
      }
    }

    // Check URL shorteners
    for (const shortener of maliciousPatterns.url_shorteners.domains) {
      if (lowerUrl.includes(shortener)) {
        totalScore += maliciousPatterns.url_shorteners.weight;
        threats.push('URL_SHORTENER');
        indicators.push(`URL shortener detected: ${shortener}`);
        break;
      }
    }

    // Check for IP addresses
    if (maliciousPatterns.ip_addresses.pattern.test(lowerUrl)) {
      totalScore += maliciousPatterns.ip_addresses.weight;
      threats.push('IP_ADDRESS');
      indicators.push('Direct IP address instead of domain');
    }

    // Check suspicious keywords in URL
    for (const keyword of maliciousPatterns.suspicious_keywords.keywords) {
      if (lowerUrl.includes(keyword)) {
        totalScore += maliciousPatterns.suspicious_keywords.weight;
        threats.push('SUSPICIOUS_KEYWORD');
        indicators.push(`Suspicious keyword: ${keyword}`);
      }
    }

    // Check data harvesting patterns
    for (const pattern of maliciousPatterns.data_harvesting.patterns) {
      if (pattern.test(lowerUrl)) {
        totalScore += maliciousPatterns.data_harvesting.weight;
        threats.push('DATA_HARVESTING');
        indicators.push('Potential data harvesting endpoint');
      }
    }

    // Check for homograph attacks
    if (maliciousPatterns.homograph_attacks.check(url)) {
      totalScore += maliciousPatterns.homograph_attacks.weight;
      threats.push('HOMOGRAPH_ATTACK');
      indicators.push('Suspicious characters detected (possible homograph attack)');
    }

    // Additional checks
    // Check for excessive subdomains
    const subdomainCount = (url.match(/\./g) || []).length;
    if (subdomainCount > 4) {
      totalScore += 2;
      threats.push('EXCESSIVE_SUBDOMAINS');
      indicators.push('Excessive subdomains detected');
    }

    // Check for suspicious port numbers
    const portMatch = url.match(/:(\d+)/);
    if (portMatch && portMatch[1] !== '80' && portMatch[1] !== '443') {
      totalScore += 2;
      threats.push('SUSPICIOUS_PORT');
      indicators.push(`Non-standard port: ${portMatch[1]}`);
    }

    // Check URL length (very long URLs are often suspicious)
    if (url.length > 100) {
      totalScore += 1;
      indicators.push('Unusually long URL');
    }

    // Check for multiple redirects indicators
    if (url.includes('redirect') || url.includes('redir') || url.includes('goto')) {
      totalScore += 2;
      threats.push('REDIRECT_CHAIN');
      indicators.push('Potential redirect chain');
    }

    // Determine threat level and threat score (0-10) based on score
    let threatLevel = 'safe';
    let threatScore = 0;

    // Convert totalScore to threat score (0-10 scale)
    // Scale the totalScore to 0-10 range
    threatScore = Math.min(10, Math.max(0, Math.round((totalScore / 50) * 10)));

    if (totalScore >= 10) {
      threatLevel = 'dangerous';
      threatScore = Math.max(threatScore, 8); // Minimum 8 for dangerous
    } else if (totalScore >= 5) {
      threatLevel = 'suspicious';
      threatScore = Math.max(threatScore, 5); // Minimum 5 for suspicious
    } else if (totalScore >= 2) {
      threatLevel = 'suspicious';
      threatScore = Math.max(threatScore, 3); // Minimum 3 for low-level suspicious
    } else {
      threatLevel = 'safe';
      threatScore = Math.max(0, Math.min(2, threatScore)); // 0-2 for safe
    }

    // Calculate confidence based on threat score
    const confidence = Math.min(99, Math.max(50, 50 + (threatScore * 5)));

    // Special case: known safe domains
    const safeDomains = [
      'google.com', 'youtube.com', 'facebook.com', 'amazon.com', 'twitter.com',
      'linkedin.com', 'wikipedia.org', 'github.com', 'stackoverflow.com',
      'microsoft.com', 'apple.com', 'netflix.com', 'paypal.com'
    ];

    for (const safeDomain of safeDomains) {
      if (url.includes(`://${safeDomain}`) || url.includes(`://www.${safeDomain}`)) {
        // Only mark as safe if it's actually the main domain, not a subdomain trick
        const domainRegex = new RegExp(`^https?://(www\\.)?${safeDomain.replace('.', '\\.')}(/|$)`);
        if (domainRegex.test(url)) {
          threatLevel = 'safe';
          confidence = 95;
          threats.length = 0;
          indicators.length = 0;
          indicators.push('Verified safe domain');
          break;
        }
      }
    }

    return {
      threatScore,
      threatLevel,
      confidence: Math.round(confidence),
      verdict: `${threatLevel === 'dangerous' ? 'High risk URL detected' : threatLevel === 'suspicious' ? 'Suspicious URL' : 'URL appears safe'}`,
      reasoning: `Pattern analysis detected ${threats.length} threat types and ${indicators.length} indicators. ${threatLevel === 'dangerous' ? 'Multiple high-risk patterns identified in URL structure.' : threatLevel === 'suspicious' ? 'Some concerning URL patterns found.' : 'No significant threat patterns detected in URL.'}`,
      threats: threats.slice(0, 5), // Limit to top 5 threats
      indicators: indicators.slice(0, 5), // Limit to top 5 indicators
      details: {
        totalScore,
        url: url.substring(0, 100) // Truncate for safety
      },
      source: 'hardcoded_analysis'
    };
  }

  // Generate summary using Generative LLM (Gemini or ChatGPT) (PRIMARY METHOD)
  // Enhanced summary generation with better detail and accuracy
  async generateSummaryWithLLM(analysisData) {
    try {
      if (this.llmService.isConfigured()) {
        const providerInfo = this.llmService.getProviderInfo();
        console.log(`🤖 Using ${providerInfo.provider.toUpperCase()} AI for enhanced summary generation (PRIMARY)`);
        return await this.llmService.generateSummary(analysisData);
      } else {
        console.warn('⚠️  Generative LLM API not configured, using enhanced fallback summary');
        return this.generateFallbackSummary(analysisData);
      }
    } catch (error) {
      console.error('❌ Generative LLM summary generation error, using enhanced fallback:', error.message);
      return this.generateFallbackSummary(analysisData);
    }
  }

  // Fallback summary generation - Enhanced with dynamic content analysis
  generateFallbackSummary(analysisData) {
    const { threatScore, threatLevel, confidence, indicators = [], threats = [], keywords = [], inputType, scores, reasoning = '', verdict = '' } = analysisData;
    
    let summary = '';
    
    // Analyze detected keywords to understand the scam type
    const scamTypes = this.identifyScamTypes(keywords, indicators);
    const specificThreats = this.getSpecificThreats(threats, indicators);
    
    if (threatLevel === 'dangerous') {
      if (inputType === 'url') {
        summary = `CRITICAL SECURITY WARNING: This URL has been identified as highly dangerous.\n\n`;
        summary += `THREAT SCORE: ${threatScore}/10 (${threatLevel.toUpperCase()})\n`;
        summary += `CONFIDENCE: ${confidence}%\n`;
        if (verdict) summary += `VERDICT: ${verdict}\n`;
        summary += `\nTHREAT ANALYSIS:\n`;
        
        // Use reasoning if available, otherwise use fallback
        if (reasoning) {
          summary += `${reasoning}\n\n`;
        } else {
          // Dynamic threat description based on actual detected threats
          if (specificThreats.length > 0) {
            specificThreats.forEach(threat => {
              summary += `• ${threat}\n`;
            });
          } else {
            summary += `• Multiple malicious patterns detected in this URL\n`;
            summary += `• This link may lead to a fraudulent or harmful website\n`;
          }
        }
        
        summary += `\nIMMEDIATE ACTIONS REQUIRED:\n`;
        summary += `1. DO NOT click on this link or enter any information\n`;
        summary += `2. Delete the message containing this URL immediately\n`;
        summary += `3. Report this URL to your IT security team or relevant authorities\n`;
        summary += `4. Run a security scan if you've already visited this URL\n`;
        summary += `5. Change passwords if you've entered any credentials`;
        
      } else {
        // Text analysis - dangerous with dynamic scam type identification
        summary = `HIGH-RISK SCAM DETECTED: This message exhibits multiple characteristics of a ${scamTypes.primary || 'sophisticated scam'}.\n\n`;
        summary += `THREAT SCORE: ${threatScore}/10 (${threatLevel.toUpperCase()})\n`;
        summary += `CONFIDENCE: ${confidence}%\n`;
        if (verdict) summary += `VERDICT: ${verdict}\n`;
        summary += `\nIDENTIFIED SCAM INDICATORS:\n`;
        
        // Use reasoning if available, otherwise use fallback
        if (reasoning) {
          summary += `${reasoning}\n\n`;
        } else {
          // Dynamic indicators based on actual detected keywords
          if (scamTypes.details.length > 0) {
            scamTypes.details.forEach(detail => {
              summary += `• ${detail}\n`;
            });
          } else {
            summary += `• Multiple scam indicators detected in this message\n`;
            summary += `• Content designed to manipulate or deceive recipients\n`;
          }
          
          // Add specific keyword warnings if available
          if (keywords && keywords.length > 0) {
            const topKeywords = keywords.slice(0, 5).join('", "');
            summary += `• Detected suspicious terms: "${topKeywords}"\n`;
          }
        }
        
        summary += `\nPROTECTIVE ACTIONS:\n`;
        summary += `1. DELETE this message immediately without responding\n`;
        summary += `2. BLOCK the sender to prevent future contact\n`;
        summary += `3. REPORT to anti-fraud authorities (spam@uce.gov, reportfraud.ftc.gov)\n`;
        summary += `4. WARN others who may have received similar messages\n`;
        summary += `5. NEVER provide personal, financial, or login information`;
      }
      
    } else if (threatLevel === 'suspicious') {
      if (inputType === 'url') {
        summary = `SUSPICIOUS URL DETECTED: This link shows concerning characteristics that require caution.\n\n`;
        summary += `THREAT SCORE: ${threatScore}/10 (${threatLevel.toUpperCase()})\n`;
        summary += `CONFIDENCE: ${confidence}%\n`;
        if (verdict) summary += `VERDICT: ${verdict}\n`;
        summary += `\nSUSPICIOUS ELEMENTS:\n`;
        
        // Use reasoning if available, otherwise use fallback
        if (reasoning) {
          summary += `${reasoning}\n\n`;
        } else {
          // Dynamic suspicious elements based on actual threats
          if (specificThreats.length > 0) {
            specificThreats.forEach(threat => {
              summary += `• ${threat}\n`;
            });
          } else if (indicators.length > 0) {
            indicators.slice(0, 3).forEach(indicator => {
              summary += `• ${indicator}\n`;
            });
          } else {
            summary += `• Some characteristics of this URL raise concerns\n`;
          }
        }
        
        summary += `\nRECOMMENDED PRECAUTIONS:\n`;
        summary += `1. Verify the sender through a separate, trusted communication channel\n`;
        summary += `2. Hover over the link to see the actual destination (don't click)\n`;
        summary += `3. Use a URL scanner service to check safety before visiting\n`;
        summary += `4. Access the website directly through your browser instead\n`;
        summary += `5. Ensure your antivirus and browser security are up-to-date`;
        
      } else {
        // Text analysis - suspicious with dynamic content
        summary = `POTENTIALLY SUSPICIOUS MESSAGE: This content contains elements commonly found in ${scamTypes.primary || 'scam messages'}.\n\n`;
        summary += `THREAT SCORE: ${threatScore}/10 (${threatLevel.toUpperCase()})\n`;
        summary += `CONFIDENCE: ${confidence}%\n`;
        if (verdict) summary += `VERDICT: ${verdict}\n`;
        summary += `\nWARNING SIGNS DETECTED:\n`;
        
        // Use reasoning if available, otherwise use fallback
        if (reasoning) {
          summary += `${reasoning}\n\n`;
        } else {
          // Show actual detected indicators
          if (scamTypes.details.length > 0) {
            scamTypes.details.forEach(detail => {
              summary += `• ${detail}\n`;
            });
          } else if (indicators.length > 0) {
            indicators.slice(0, 3).forEach(indicator => {
              summary += `• ${indicator}\n`;
            });
          } else {
            summary += `• Some elements of this message warrant caution\n`;
          }
        }
        
        summary += `\nSAFETY RECOMMENDATIONS:\n`;
        summary += `1. Verify the sender's identity through official contact methods\n`;
        summary += `2. Don't click links or download attachments without verification\n`;
        summary += `3. Check for spelling errors and generic greetings (red flags)\n`;
        summary += `4. Contact the organization directly using known phone numbers/websites\n`;
        summary += `5. Trust your instincts - if it seems too good to be true, it probably is`;
      }
      
    } else {
      // Safe threat level summaries
      if (inputType === 'url') {
        summary = `URL APPEARS SAFE: Initial analysis shows no immediate threats.\n\n`;
        summary += `THREAT SCORE: ${threatScore}/10 (${threatLevel.toUpperCase()})\n`;
        summary += `CONFIDENCE: ${confidence}%\n`;
        if (verdict) summary += `VERDICT: ${verdict}\n`;
        summary += `\nANALYSIS RESULTS:\n`;
        
        if (reasoning) {
          summary += `${reasoning}\n\n`;
        } else {
          summary += `• No known malicious patterns detected\n`;
          summary += `• Domain appears legitimate\n`;
          summary += `• No suspicious URL characteristics found\n\n`;
        }
        
        summary += `BEST PRACTICES:\n`;
        summary += `• Always verify HTTPS connection (look for padlock icon)\n`;
        summary += `• Check the domain spelling carefully\n`;
        summary += `• Be cautious with personal information even on safe sites\n`;
        summary += `• Keep your browser and security software updated\n`;
        summary += `• Report any suspicious behavior you encounter`;
        
      } else {
        // Text analysis - safe
        summary = `MESSAGE APPEARS LEGITIMATE: No significant scam indicators detected.\n\n`;
        summary += `THREAT SCORE: ${threatScore}/10 (${threatLevel.toUpperCase()})\n`;
        summary += `CONFIDENCE: ${confidence}%\n`;
        if (verdict) summary += `VERDICT: ${verdict}\n`;
        summary += `\nANALYSIS SUMMARY:\n`;
        
        if (reasoning) {
          summary += `${reasoning}\n\n`;
        } else {
          summary += `• No common scam keywords or patterns found\n`;
          summary += `• Message structure appears normal\n`;
          summary += `• No urgent threats or pressure tactics detected\n\n`;
        }
        
        summary += `STAY SAFE ONLINE:\n`;
        summary += `• Continue to verify sender identity for important matters\n`;
        summary += `• Never share passwords or PINs, even with legitimate contacts\n`;
        summary += `• Keep personal information private unless absolutely necessary\n`;
        summary += `• Stay informed about new scam techniques\n`;
        summary += `• Trust your instincts if something feels wrong`;
      }
    }
    
    // Add educational note
    summary += `\n\n📚 REMEMBER: Scammers constantly evolve their tactics. Stay vigilant and when in doubt, verify through official channels.`;
    
    return summary;
  }

  // Helper function to identify specific scam types from keywords
  identifyScamTypes(keywords = [], indicators = []) {
    const scamCategories = {
      financial: {
        keywords: ['bank', 'account', 'transfer', 'money', 'payment', 'card', 'bitcoin', 'cryptocurrency', 'wire', 'cvv', 'pin'],
        description: 'Financial Fraud',
        details: [
          'Financial Fraud Attempt: Trying to steal money or financial information',
          'Requests for banking details, passwords, or money transfers',
          'May impersonate banks or financial institutions'
        ]
      },
      urgency: {
        keywords: ['urgent', 'immediately', 'expire', 'suspended', 'limited time', 'act now', 'deadline', 'hurry'],
        description: 'Pressure Tactic Scam',
        details: [
          'Pressure Tactics: Creates false urgency to force quick decisions',
          'Uses time-sensitive language to prevent careful consideration',
          'Designed to bypass your normal security awareness'
        ]
      },
      prize: {
        keywords: ['winner', 'prize', 'lottery', 'congratulations', 'claim', 'won', 'jackpot', 'sweepstakes'],
        description: 'Prize/Lottery Scam',
        details: [
          'Fake Prize/Lottery Scam: Claims you won something you never entered',
          'Requires payment or personal information to "claim" the prize',
          'Classic advance-fee fraud technique'
        ]
      },
      phishing: {
        keywords: ['verify', 'confirm', 'update', 'click here', 'security alert', 'validate', 'reset password'],
        description: 'Phishing Attack',
        details: [
          'Phishing Attempt: Trying to steal login credentials or personal data',
          'Impersonates legitimate organizations to gain trust',
          'May lead to fake login pages or malware downloads'
        ]
      },
      malware: {
        keywords: ['virus', 'malware', 'infected', 'download', 'install', 'update required', 'scan', 'antivirus'],
        description: 'Malware/Tech Support Scam',
        details: [
          'Malware/Tech Support Scam: Claims device is infected or at risk',
          'Attempts to install malicious software or gain remote access',
          'May impersonate tech support or security companies'
        ]
      },
      identity: {
        keywords: ['social security', 'ssn', 'passport', 'driver license', 'date of birth', 'mother maiden'],
        description: 'Identity Theft Attempt',
        details: [
          'Identity Theft Attempt: Requesting sensitive personal information',
          'Could be used for fraud, account takeover, or identity theft',
          'Legitimate organizations never ask for this via email/text'
        ]
      }
    };

    let primaryType = null;
    let maxMatches = 0;
    const matchedDetails = [];

    // Find which category has the most keyword matches
    for (const [type, category] of Object.entries(scamCategories)) {
      const matches = keywords.filter(k => 
        category.keywords.some(ck => k.toLowerCase().includes(ck.toLowerCase()))
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        primaryType = category.description;
        matchedDetails.length = 0;
        matchedDetails.push(...category.details);
      } else if (matches > 0 && matches === maxMatches) {
        // Multiple categories with same match count - add details from both
        matchedDetails.push(category.details[0]);
      }
    }

    return {
      primary: primaryType,
      details: matchedDetails.slice(0, 3) // Limit to top 3 details
    };
  }

  // Helper function to get specific threat descriptions
  getSpecificThreats(threats = [], indicators = []) {
    const threatDescriptions = {
      'PHISHING_PATTERN': 'Phishing Attack: URL designed to steal personal information by impersonating legitimate sites',
      'TYPOSQUATTING': 'Brand Impersonation: Uses deceptive characters to mimic trusted brands',
      'MALWARE': 'Malware Risk: Site may attempt to install harmful software on your device',
      'DATA_HARVESTING': 'Data Harvesting: Page designed to collect sensitive information',
      'URL_SHORTENER': 'URL Shortener: Actual destination is hidden, commonly used in scams',
      'SUSPICIOUS_TLD': 'Questionable Domain: Uses domain extension commonly associated with scams',
      'IP_ADDRESS': 'Direct IP Address: Using IP instead of domain name is suspicious',
      'SUSPICIOUS_KEYWORD': 'Suspicious Keywords: URL contains terms commonly used in scams',
      'EXCESSIVE_SUBDOMAINS': 'Excessive Subdomains: Unusually complex URL structure',
      'SUSPICIOUS_PORT': 'Non-Standard Port: Using unusual port numbers',
      'REDIRECT_CHAIN': 'Redirect Chain: May redirect through multiple sites',
      'HOMOGRAPH_ATTACK': 'Homograph Attack: Uses lookalike characters to deceive users'
    };

    const descriptions = [];
    
    // Add descriptions for detected threats
    threats.forEach(threat => {
      if (threatDescriptions[threat]) {
        descriptions.push(threatDescriptions[threat]);
      }
    });

    // If no specific threats, use indicators
    if (descriptions.length === 0 && indicators.length > 0) {
      indicators.slice(0, 3).forEach(indicator => {
        descriptions.push(indicator);
      });
    }

    return descriptions;
  }

  // ADD THIS NEW FUNCTION to aiAnalyzer.js

  // Intentionally vulnerable analyzer for demonstration purposes
  async analyzeWithWeakPrompt(inputType, inputContent) {
    let analysisResult;
    // Perform the initial analysis (this part is the same)
    if (inputType === 'url') {
        analysisResult = await this.analyzeUrlWithLLM(inputContent);
    } else {
        analysisResult = await this.analyzeTextWithLLM(inputContent);
    }

    // WEAK PROMPT: Directly includes user input without protection
    const weakPrompt = `
      Summarize the following analysis. The user's original text was: "${inputContent}"
      
      Analysis data:
      - Threat Score: ${analysisResult.threatScore || 0}/10
      - Threat Level: ${analysisResult.threatLevel}
      - Confidence: ${analysisResult.confidence}%
    `;

    try {
        if (!this.llmService.isConfigured()) {
            analysisResult.summary = "VULNERABLE AI: This is a demonstration of how an unsecured AI system responds to prompt injection attacks. The system directly includes user input in the prompt without protection, making it susceptible to manipulation.";
            return { analysisResult };
        }

        const providerInfo = this.llmService.getProviderInfo();
        console.log(`Calling ${providerInfo.provider.toUpperCase()} API (vulnerable)...`);

        const response = await this.llmService.generateFromPrompt(weakPrompt);

        console.log(`${providerInfo.provider.toUpperCase()} API response (vulnerable):`, response.substring(0, 200));

        analysisResult.summary = response || "VULNERABLE AI: This demonstrates how an unsecured AI system can be manipulated. The system failed to properly analyze the malicious input.";
    } catch (error) {
        console.log('LLM API error (vulnerable):', error.response?.data || error.message);
        analysisResult.summary = "VULNERABLE AI: This is a demonstration of how an unsecured AI system responds to prompt injection attacks. The system directly includes user input in the prompt without protection, making it susceptible to manipulation.";
    }

    return { analysisResult };
  }

// You also need to export the new function.
// Find the `export default new AIAnalyzerService();` line at the bottom
// and add this line right before it:

  // Main analysis function
  // Uses Generative LLM (Gemini or ChatGPT) as PRIMARY method for threat detection
  // Falls back to pattern analysis only if LLM is unavailable
  async analyze(inputType, inputContent) {
    let analysisResult = {
      inputType,
      threatScore: 0,
      threatLevel: 'safe',
      confidence: 0,
      verdict: '',
      reasoning: '',
      indicators: [],
      recommendations: [],
      summary: ''
    };

    try {
      // PRIMARY: Use Generative LLM (Gemini or ChatGPT) for analysis
      if (inputType === 'url') {
        const urlAnalysis = await this.analyzeUrlWithLLM(inputContent);
        analysisResult = { ...analysisResult, ...urlAnalysis };
        
        // Enhanced, contextual recommendations based on threat level
        if (analysisResult.threatLevel === 'dangerous') {
          analysisResult.recommendations = [
            'DO NOT visit this URL under any circumstances',
            'Do not enter any information on this website',
            'Report this URL to your security team or authorities',
            'Run a security scan if you already visited this URL',
            'Change passwords if you entered any credentials'
          ];
        } else if (analysisResult.threatLevel === 'suspicious') {
          analysisResult.recommendations = [
            'Verify the URL destination before clicking',
            'Check the domain spelling carefully for typosquatting',
            'Look for HTTPS and valid SSL certificates',
            'Use a URL scanner service to verify safety',
            'Access the website directly through your browser instead'
          ];
        } else {
          analysisResult.recommendations = [
            'Always verify URLs before clicking',
            'Look for HTTPS and valid SSL certificates',
            'Check the domain carefully for typos',
            'Keep your browser and security software updated',
            'Stay vigilant even with safe-looking URLs'
          ];
        }
      } else {
        // Text or image analysis (image uses OCR then text analysis)
        const textAnalysis = await this.analyzeTextWithLLM(inputContent);
        analysisResult = { ...analysisResult, ...textAnalysis };
        
        // Enhanced, contextual recommendations based on threat level
        if (analysisResult.threatLevel === 'dangerous') {
          analysisResult.recommendations = [
            'DELETE this message immediately without responding',
            'DO NOT click any links or download attachments',
            'DO NOT provide any personal or financial information',
            'BLOCK the sender to prevent future contact',
            'Report to anti-fraud authorities (spam@uce.gov, reportfraud.ftc.gov)',
            'WARN others who may have received similar messages'
          ];
        } else if (analysisResult.threatLevel === 'suspicious') {
          analysisResult.recommendations = [
            'Verify the sender through official, separate communication channels',
            'Do not click links or download attachments without verification',
            'Check for spelling errors and generic greetings (red flags)',
            'Contact the organization directly using known phone numbers/websites',
            'Trust your instincts - if it seems too good to be true, it probably is',
            'Never share passwords, PINs, or personal information'
          ];
        } else {
          analysisResult.recommendations = [
            'Continue to verify sender identity for important matters',
            'Never share passwords or PINs, even with legitimate contacts',
            'Keep personal information private unless absolutely necessary',
            'Stay informed about new scam techniques',
            'Trust your instincts if something feels wrong',
            'Report any suspicious activity you encounter'
          ];
        }
      }

      // Enhanced indicators are already provided by Generative LLM AI
      // Only add generic indicator if indicators array is empty
      if (!analysisResult.indicators || analysisResult.indicators.length === 0) {
        if (analysisResult.threatLevel === 'dangerous') {
          analysisResult.indicators = ['High risk content detected via AI analysis'];
          if (analysisResult.threats && analysisResult.threats.length > 0) {
            analysisResult.indicators.push(...analysisResult.threats.slice(0, 3));
          }
        } else if (analysisResult.threatLevel === 'suspicious') {
          analysisResult.indicators = ['Potentially suspicious content detected'];
        } else {
          analysisResult.indicators = ['No immediate threats detected'];
        }
      }

      // Ensure threatScore exists (convert from confidence if needed for legacy compatibility)
      if (analysisResult.threatScore === undefined && analysisResult.confidence !== undefined) {
        // Convert confidence percentage to threat score (0-10)
        analysisResult.threatScore = Math.round((analysisResult.confidence / 100) * 10);
      }

      // Generate enhanced summary using Generative LLM
      // Ensure inputType is passed for context-aware summarization
      analysisResult.inputType = inputType;
      analysisResult.summary = await this.generateSummaryWithLLM(analysisResult);

      // Recommendations are already contextual and enhanced above
      // No need to modify them further as they're tailored to threat level

    } catch (error) {
      console.error('Analysis error:', error);
      if (inputType === 'url') {
        const fallback = this.fallbackUrlAnalysis(inputContent);
        analysisResult = { ...analysisResult, ...fallback };
      } else {
        const fallback = this.fallbackTextAnalysis(inputContent);
        analysisResult = { ...analysisResult, ...fallback };
      }
      analysisResult.summary = this.generateFallbackSummary(analysisResult);
    }

    return analysisResult;
  }
}

export default new AIAnalyzerService();