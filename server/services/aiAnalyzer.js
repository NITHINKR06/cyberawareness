import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AIAnalyzerService {
  constructor() {
    this.huggingFaceToken = process.env.HUGGINGFACE_API_KEY;
    this.googleSafeBrowsingKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY || 'key';
  }

  

  // Analyze text using hardcoded logic (replacing Hugging Face)
  async analyzeTextWithHuggingFace(text) {
    console.log('Using hardcoded text analysis instead of Hugging Face API');
    return this.performHardcodedTextAnalysis(text);
  }

  // Comprehensive hardcoded text analysis
  performHardcodedTextAnalysis(text) {
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

    // Determine threat level and confidence
    let threatLevel = 'safe';
    let confidence = 0;

    // Adjusted thresholds to be more sensitive to threats
    if (totalScore >= 10 || typosquattingDetected) {
      threatLevel = 'dangerous';
      confidence = Math.min(85 + Math.floor(totalScore / 3), 99);
    } else if (totalScore >= 5) {
      threatLevel = 'suspicious';
      confidence = Math.min(70 + Math.floor(totalScore / 2), 84);
    } else if (totalScore >= 2) {
      threatLevel = 'suspicious';
      confidence = Math.min(60 + Math.floor(totalScore * 2), 69);
    } else {
      threatLevel = 'safe';
      confidence = Math.max(90 - Math.floor(totalScore * 5), 70);
    }

    return {
      threatLevel,
      confidence: Math.round(confidence),
      scores: {
        totalScore,
        keywordCount: detectedKeywords.length,
        indicatorCount: detectedIndicators.length
      },
      keywords: detectedKeywords.slice(0, 10), // Limit to top 10
      indicators: detectedIndicators.slice(0, 5), // Limit to top 5
      source: 'hardcoded_analysis'
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

  // Analyze URL using hardcoded logic (replacing Google Safe Browsing)
  async analyzeUrlWithGoogleSafeBrowsing(url) {
    console.log('Using hardcoded URL analysis instead of Google Safe Browsing API');
    return this.performHardcodedUrlAnalysis(url);
  }

  // Comprehensive hardcoded URL analysis
  performHardcodedUrlAnalysis(url) {
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

    // Determine threat level based on score
    let threatLevel = 'safe';
    let confidence = 0;

    if (totalScore >= 10) {
      threatLevel = 'dangerous';
      confidence = Math.min(85 + Math.floor(totalScore / 2), 99);
    } else if (totalScore >= 5) {
      threatLevel = 'suspicious';
      confidence = Math.min(70 + Math.floor(totalScore * 2), 84);
    } else if (totalScore >= 2) {
      threatLevel = 'suspicious';
      confidence = Math.min(60 + Math.floor(totalScore * 3), 69);
    } else {
      threatLevel = 'safe';
      confidence = Math.max(90 - Math.floor(totalScore * 10), 70);
    }

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
      threatLevel,
      confidence: Math.round(confidence),
      threats: threats.slice(0, 5), // Limit to top 5 threats
      indicators: indicators.slice(0, 5), // Limit to top 5 indicators
      details: {
        totalScore,
        url: url.substring(0, 100) // Truncate for safety
      },
      source: 'hardcoded_analysis'
    };
  }

// Generate summary using hardcoded logic (replacing Gemini AI)
  async generateSummaryWithGemini(analysisData) {
    // Directly use hardcoded summary without any API calls
    return this.generateHardcodedSummary(analysisData);
  }

  // Comprehensive hardcoded summary generation
  generateHardcodedSummary(analysisData) {
    const { threatLevel, confidence, indicators = [], threats = [], keywords = [], inputType } = analysisData;
    
    let summary = '';
    
    if (threatLevel === 'dangerous') {
      // Dangerous threat level summaries
      if (inputType === 'url') {
        summary = `🚨 CRITICAL SECURITY WARNING: This URL has been identified as highly dangerous with ${confidence}% confidence.\n\n`;
        summary += `⚠️ THREAT ANALYSIS:\n`;
        
        if (threats.includes('PHISHING_PATTERN')) {
          summary += `• Phishing Attack Detected: This URL appears to be impersonating a legitimate website to steal your personal information.\n`;
        }
        if (threats.includes('TYPOSQUATTING')) {
          summary += `• Brand Impersonation: The URL uses deceptive characters to mimic a trusted brand.\n`;
        }
        if (threats.includes('MALWARE')) {
          summary += `• Malware Risk: This site may attempt to install harmful software on your device.\n`;
        }
        if (threats.includes('DATA_HARVESTING')) {
          summary += `• Data Harvesting: This URL leads to a page designed to collect sensitive information.\n`;
        }
        
        summary += `\n🛡️ IMMEDIATE ACTIONS REQUIRED:\n`;
        summary += `1. DO NOT click on this link or enter any information\n`;
        summary += `2. Delete the message containing this URL immediately\n`;
        summary += `3. Report this URL to your IT security team or relevant authorities\n`;
        summary += `4. Run a security scan on your device if you've already visited this URL\n`;
        summary += `5. Change passwords if you've entered any credentials on this site`;
        
      } else {
        // Text analysis - dangerous
        summary = `🚨 HIGH-RISK SCAM DETECTED: This message exhibits multiple characteristics of a sophisticated scam with ${confidence}% confidence.\n\n`;
        summary += `⚠️ IDENTIFIED SCAM INDICATORS:\n`;
        
        if (keywords && keywords.length > 0) {
          const keywordCategories = {
            financial: ['bank', 'account', 'transfer', 'money', 'payment', 'card', 'bitcoin'],
            urgency: ['urgent', 'immediately', 'expire', 'suspended', 'limited time'],
            prize: ['winner', 'prize', 'lottery', 'congratulations', 'claim'],
            phishing: ['verify', 'confirm', 'update', 'click here', 'security alert']
          };
          
          for (const [category, terms] of Object.entries(keywordCategories)) {
            const found = keywords.filter(k => terms.some(t => k.includes(t)));
            if (found.length > 0) {
              if (category === 'financial') {
                summary += `• Financial Fraud Attempt: Message contains financial scam terminology\n`;
              } else if (category === 'urgency') {
                summary += `• Pressure Tactics: Creates false urgency to force quick action\n`;
              } else if (category === 'prize') {
                summary += `• Fake Prize/Lottery Scam: Claims you've won something you didn't enter\n`;
              } else if (category === 'phishing') {
                summary += `• Phishing Attempt: Trying to steal your login credentials or personal data\n`;
              }
            }
          }
        }
        
        summary += `\n🛡️ PROTECTIVE ACTIONS:\n`;
        summary += `1. DELETE this message immediately without responding\n`;
        summary += `2. BLOCK the sender to prevent future contact\n`;
        summary += `3. REPORT to anti-fraud authorities (spam@uce.gov, reportfraud.ftc.gov)\n`;
        summary += `4. WARN others who may have received similar messages\n`;
        summary += `5. NEVER provide personal, financial, or login information`;
      }
      
    } else if (threatLevel === 'suspicious') {
      // Suspicious threat level summaries
      if (inputType === 'url') {
        summary = `⚠️ SUSPICIOUS URL DETECTED: This link shows concerning characteristics that require caution (${confidence}% confidence).\n\n`;
        summary += `🔍 SUSPICIOUS ELEMENTS:\n`;
        
        if (threats.includes('URL_SHORTENER')) {
          summary += `• URL Shortener: The actual destination is hidden, which is often used in scams\n`;
        }
        if (threats.includes('SUSPICIOUS_TLD')) {
          summary += `• Questionable Domain: Uses a domain extension commonly associated with scams\n`;
        }
        if (indicators.some(i => i.includes('long URL'))) {
          summary += `• Unusually Long URL: May be attempting to hide malicious parameters\n`;
        }
        
        summary += `\n✅ RECOMMENDED PRECAUTIONS:\n`;
        summary += `1. Verify the sender through a separate, trusted communication channel\n`;
        summary += `2. Hover over the link to see the actual destination (don't click)\n`;
        summary += `3. Use a URL scanner service to check safety before visiting\n`;
        summary += `4. Access the website directly through your browser instead of clicking the link\n`;
        summary += `5. Ensure your antivirus and browser security are up-to-date`;
        
      } else {
        // Text analysis - suspicious
        summary = `⚠️ POTENTIALLY SUSPICIOUS MESSAGE: This content contains elements commonly found in scam messages (${confidence}% confidence).\n\n`;
        summary += `🔍 WARNING SIGNS DETECTED:\n`;
        
        if (indicators && indicators.length > 0) {
          indicators.slice(0, 3).forEach(indicator => {
            summary += `• ${indicator}\n`;
          });
        }
        
        summary += `\n✅ SAFETY RECOMMENDATIONS:\n`;
        summary += `1. Verify the sender's identity through official contact methods\n`;
        summary += `2. Don't click links or download attachments without verification\n`;
        summary += `3. Check for spelling errors and generic greetings (red flags)\n`;
        summary += `4. Contact the organization directly using known phone numbers/websites\n`;
        summary += `5. Trust your instincts - if it seems too good to be true, it probably is`;
      }
      
    } else {
      // Safe threat level summaries
      if (inputType === 'url') {
        summary = `✅ URL APPEARS SAFE: Initial analysis shows no immediate threats (${confidence}% confidence).\n\n`;
        summary += `📋 ANALYSIS RESULTS:\n`;
        summary += `• No known malicious patterns detected\n`;
        summary += `• Domain appears legitimate\n`;
        summary += `• No suspicious URL characteristics found\n\n`;
        summary += `💡 BEST PRACTICES:\n`;
        summary += `• Always verify HTTPS connection (look for padlock icon)\n`;
        summary += `• Check the domain spelling carefully\n`;
        summary += `• Be cautious with personal information even on safe sites\n`;
        summary += `• Keep your browser and security software updated\n`;
        summary += `• Report any suspicious behavior you encounter`;
        
      } else {
        // Text analysis - safe
        summary = `✅ MESSAGE APPEARS LEGITIMATE: No significant scam indicators detected (${confidence}% confidence).\n\n`;
        summary += `📋 ANALYSIS SUMMARY:\n`;
        summary += `• No common scam keywords or patterns found\n`;
        summary += `• Message structure appears normal\n`;
        summary += `• No urgent threats or pressure tactics detected\n\n`;
        summary += `💡 STAY SAFE ONLINE:\n`;
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

  // ADD THIS NEW FUNCTION to aiAnalyzer.js

  // Intentionally vulnerable analyzer for demonstration purposes
  async analyzeWithWeakPrompt(inputType, inputContent) {
    let analysisResult;
    // Perform the initial analysis (this part is the same)
    if (inputType === 'url') {
        analysisResult = await this.analyzeUrlWithGoogleSafeBrowsing(inputContent);
    } else {
        analysisResult = await this.analyzeTextWithHuggingFace(inputContent);
    }

    // WEAK PROMPT: Directly includes user input without protection
    const weakPrompt = `
      Summarize the following analysis. The user's original text was: "${inputContent}"
      
      Analysis data:
      - Threat Level: ${analysisResult.threatLevel}
      - Confidence: ${analysisResult.confidence}%
    `;

    try {
        if (!this.geminiApiKey || this.geminiApiKey === 'key') {
            analysisResult.summary = "⚠️ VULNERABLE AI: This is a demonstration of how an unsecured AI system responds to prompt injection attacks. The system directly includes user input in the prompt without protection, making it susceptible to manipulation.";
            return { analysisResult };
        }

        console.log('Calling Gemini API (vulnerable) with key:', this.geminiApiKey.substring(0, 10) + '...');

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.geminiApiKey}`, {
                contents: [{ parts: [{ text: weakPrompt }] }]
            },
            {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Gemini API response (vulnerable):', response.data);

        if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
            analysisResult.summary = response.data.candidates[0].content.parts[0]?.text || "Failed to get vulnerable summary.";
        } else {
            analysisResult.summary = "⚠️ VULNERABLE AI: This demonstrates how an unsecured AI system can be manipulated. The system failed to properly analyze the malicious input.";
        }
    } catch (error) {
        console.log('Gemini API error (vulnerable):', error.response?.data || error.message);
        analysisResult.summary = "⚠️ VULNERABLE AI: This is a demonstration of how an unsecured AI system responds to prompt injection attacks. The system directly includes user input in the prompt without protection, making it susceptible to manipulation.";
    }

    return { analysisResult };
  }

// You also need to export the new function.
// Find the `export default new AIAnalyzerService();` line at the bottom
// and add this line right before it:
  // Fallback analysis for text (when APIs are not available)
  fallbackTextAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    // Comprehensive scam keywords and patterns
    const highRiskKeywords = [
      // Urgency/pressure
      'urgent', 'act now', 'immediately', 'expire', 'deadline', 'limited time', 'hurry',
      'last chance', 'final notice', 'suspended', 'terminated',
      
      // Banking/financial scams
      'verify account', 'verify bank', 'verify identity',
      'bank security update', 'security update',
      'otp', 'one time password', 'verification code',
      'loan approved', 'loan offer', 'guaranteed loan', 'pre-approved',
      'transfer funds', 'transfer money', 'processing fee',
      'claim reward', 'claim prize', 'claim money', 'claim refund',
      
      // Lottery/prize scams
      'congratulations', 'winner', 'prize', 'lottery', 'jackpot',
      'you have won', 'you won', 'winning notification',
      
      // Malware/hacking threats
      'virus', 'malware', 'trojan', 'ransomware',
      'hack', 'hacked', 'hacker', 'hacking', 'compromised', 'breach',
      'phishy', 'phishing', 'phisher', 'spoofing', 'spoofed',
      'infected', 'threat detected', 'security risk', 'security threat',
      
      // Typosquatting patterns (common misspellings)
      'paypa1', 'paypal1', 'paipal', 'payp4l',
      'amaz0n', 'amazone', 'amazn',
      'g00gle', 'googl3', 'gooogle',
      'micr0soft', 'microsofy', 'mircosoft',
      'app1e', 'appl3', 'appl1', 'appie',
      'faceb00k', 'facebbok', 'facebok',
      'netf1ix', 'netfllx', 'netfix'
    ];
    
    const mediumRiskKeywords = [
      '24 hours', '48 hours', 'today only', 'expires today', 'expires tomorrow',
      'click here', 'click now', 'click below',
      'update your', 'confirm your', 'validate your',
      'unusual activity', 'suspicious activity',
      'free gift', 'free money', 'free offer',
      'investment opportunity', 'get rich'
    ];
    
    // Count matches
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    const foundKeywords = [];
    
    // Check high risk keywords
    highRiskKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        highRiskCount++;
        foundKeywords.push(keyword);
      }
    });
    
    // Check medium risk keywords
    mediumRiskKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        mediumRiskCount++;
        foundKeywords.push(keyword);
      }
    });
    
    // Check for specific typosquatting patterns using regex
    const typosquattingPatterns = [
      /\b(paypa[1l]|pay-?pal[^.])\b/i,
      /\b(amaz[0o]n|ama-?zon)\b/i,
      /\b(g[0o]{2}gle|go{3,}gle)\b/i,
      /\b(micr[0o]s[0o]ft|micro-?soft)\b/i,
      /\b(app[1l]e|app-?le)\b/i,
      /\b(faceb[0o]{2}k|face-?book)\b/i
    ];
    
    typosquattingPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        highRiskCount += 2; // Typosquatting is high risk
        foundKeywords.push('typosquatting detected');
      }
    });
    
    // Determine threat level based on findings
    let threatLevel = 'safe';
    let confidence = 70;
    
    if (highRiskCount >= 2 || (highRiskCount >= 1 && mediumRiskCount >= 2)) {
      threatLevel = 'dangerous';
      confidence = Math.min(85 + (highRiskCount * 5), 95);
    } else if (highRiskCount >= 1 || mediumRiskCount >= 2) {
      threatLevel = 'suspicious';
      confidence = Math.min(70 + (highRiskCount * 10 + mediumRiskCount * 3), 85);
    } else if (mediumRiskCount >= 1) {
      threatLevel = 'suspicious';
      confidence = 60;
    } else {
      threatLevel = 'safe';
      confidence = Math.max(90 - (foundKeywords.length * 5), 70);
    }

    return {
      threatLevel,
      confidence,
      keywords: foundKeywords,
      source: 'fallback',
      highRiskCount,
      mediumRiskCount
    };
  }

  // Fallback analysis for URLs
  fallbackUrlAnalysis(url) {
    const suspiciousDomains = ['bit.ly', 'tinyurl', 'goo.gl'];
    const isSuspicious = suspiciousDomains.some(domain => url.includes(domain));

    return {
      threatLevel: isSuspicious ? 'suspicious' : 'safe',
      confidence: 60,
      threats: isSuspicious ? ['URL_SHORTENER'] : [],
      source: 'fallback'
    };
  }

  // Generate fallback summary
  generateFallbackSummary(analysisData) {
    const { threatLevel, confidence, indicators = [] } = analysisData;
    
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

  // Main analysis function
  async analyze(inputType, inputContent) {
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
        
        analysisResult.recommendations = [
          'Always verify URLs before clicking',
          'Look for HTTPS and valid SSL certificates',
          'Check the domain carefully for typos'
        ];
      } else {
        const textAnalysis = await this.analyzeTextWithHuggingFace(inputContent);
        analysisResult = { ...analysisResult, ...textAnalysis };
        
        analysisResult.recommendations = [
          'Never share passwords or sensitive information',
          'Verify sender identity through official channels',
          'Be suspicious of unsolicited messages'
        ];
      }

      if (analysisResult.threatLevel === 'dangerous') {
        analysisResult.indicators.push('High risk content detected');
        if (analysisResult.threats) {
          analysisResult.indicators.push(...analysisResult.threats);
        }
        if (analysisResult.keywords && analysisResult.keywords.length > 0) {
          analysisResult.indicators.push(`Scam keywords detected: ${analysisResult.keywords.join(', ')}`);
        }
      } else if (analysisResult.threatLevel === 'suspicious') {
        analysisResult.indicators.push('Potentially suspicious content');
        if (analysisResult.keywords && analysisResult.keywords.length > 0) {
          analysisResult.indicators.push(`Warning keywords detected: ${analysisResult.keywords.join(', ')}`);
        }
      } else {
        analysisResult.indicators.push('No immediate threats detected');
      }

      analysisResult.summary = await this.generateSummaryWithGemini(analysisResult);

      if (analysisResult.threatLevel === 'dangerous') {
        analysisResult.recommendations.unshift('⚠️ HIGH RISK: Do not interact with this content');
        analysisResult.recommendations.push('Report this to relevant authorities');
      } else if (analysisResult.threatLevel === 'suspicious') {
        analysisResult.recommendations.unshift('⚠️ CAUTION: Verify before proceeding');
      } else {
        analysisResult.recommendations.unshift('✓ Appears safe, but always remain vigilant');
      }

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