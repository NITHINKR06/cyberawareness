import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class GenerativeLLMService {
  constructor() {
    // API Keys
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.chatgptApiKey = process.env.CHATGPT_API_KEY || process.env.OPENAI_API_KEY;
    
    // Provider selection: 'gemini' or 'chatgpt' (defaults to gemini if available)
    this.provider = process.env.LLM_PROVIDER || (this.geminiApiKey ? 'gemini' : 'chatgpt');
    
    // API endpoints
    this.geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.chatgptBaseUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Model selection
    // Note: Try 'gemini-pro' if 'gemini-1.5-flash' doesn't work
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-pro';
    this.chatgptModel = process.env.CHATGPT_MODEL || 'gpt-4o-mini';
    
    this.timeout = parseInt(process.env.LLM_TIMEOUT) || 30000;
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    if (this.provider === 'gemini') {
      return !!this.geminiApiKey && this.geminiApiKey !== 'your_gemini_api_key';
    } else {
      return !!this.chatgptApiKey && this.chatgptApiKey !== 'your_chatgpt_api_key';
    }
  }

  /**
   * Analyze text content using Generative LLM
   * Returns: threatScore (0-10), reasoning, verdict, threatLevel
   */
  async analyzeText(text) {
    if (!this.isConfigured()) {
      throw new Error(`${this.provider.toUpperCase()} API key not configured`);
    }

    try {
      const prompt = this.buildTextAnalysisPrompt(text);
      const response = await this.callLLM(prompt);
      
      return this.parseAnalysisResponse(response, 'text', text);
    } catch (error) {
      console.error(`❌ ${this.provider.toUpperCase()} text analysis error:`, error.message);
      throw error;
    }
  }

  /**
   * Analyze URL using Generative LLM
   * Returns: threatScore (0-10), reasoning, verdict, threatLevel
   */
  async analyzeUrl(url) {
    if (!this.isConfigured()) {
      throw new Error(`${this.provider.toUpperCase()} API key not configured`);
    }

    try {
      const prompt = this.buildUrlAnalysisPrompt(url);
      const response = await this.callLLM(prompt);
      
      return this.parseAnalysisResponse(response, 'url', url);
    } catch (error) {
      console.error(`❌ ${this.provider.toUpperCase()} URL analysis error:`, error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive summary using Generative LLM
   */
  async generateSummary(analysisData) {
    if (!this.isConfigured()) {
      throw new Error(`${this.provider.toUpperCase()} API key not configured`);
    }

    try {
      const prompt = this.buildSummaryPrompt(analysisData);
      const response = await this.callLLM(prompt);
      
      return this.parseSummaryResponse(response);
    } catch (error) {
      console.error(`❌ ${this.provider.toUpperCase()} summary generation error:`, error.message);
      throw error;
    }
  }

  /**
   * Build prompt for text analysis
   */
  buildTextAnalysisPrompt(text) {
    return `You are a cybersecurity expert analyzing a message for potential threats. Analyze the following text and provide a detailed security assessment.

TEXT TO ANALYZE:
"${text.substring(0, 2000)}"

REQUIRED OUTPUT FORMAT (JSON):
{
  "threatScore": <number from 0-10, where 0 is completely safe and 10 is extremely dangerous>,
  "threatLevel": "<safe|suspicious|dangerous>",
  "verdict": "<brief one-line verdict>",
  "reasoning": "<comprehensive detailed reasoning explaining why this score was assigned, what threats were detected, what patterns indicate risk, and what makes this content safe or dangerous>",
  "threats": ["<list of specific threat types detected>"],
  "indicators": ["<list of specific warning signs or red flags found>"],
  "keywords": ["<list of suspicious or concerning keywords found>"],
  "confidence": <percentage 0-100>
}

ANALYSIS CRITERIA:
- Phishing attempts (attempts to steal credentials or personal information)
- Scam messages (financial fraud, fake prizes, urgent requests for money)
- Social engineering (manipulation tactics, urgency, authority impersonation)
- Malware distribution (requests to download or install software)
- Identity theft (requests for personal information like SSN, passwords, etc.)
- Spam characteristics (unsolicited, promotional, low quality)
- Urgency tactics (time pressure, threats, false deadlines)
- Grammatical errors and suspicious language patterns
- Brand impersonation attempts
- Financial scams (requests for money, account verification, etc.)

SCORING GUIDELINES:
- 0-2: Completely safe, legitimate content
- 3-4: Mostly safe, minor concerns
- 5-6: Suspicious, multiple warning signs
- 7-8: Dangerous, clear scam/phishing indicators
- 9-10: Extremely dangerous, immediate threat

Provide a thorough analysis with detailed reasoning.`;
  }

  /**
   * Build prompt for URL analysis
   */
  buildUrlAnalysisPrompt(url) {
    return `You are a cybersecurity expert analyzing a URL for potential threats. Analyze the following URL and provide a detailed security assessment.

URL TO ANALYZE:
"${url}"

REQUIRED OUTPUT FORMAT (JSON):
{
  "threatScore": <number from 0-10, where 0 is completely safe and 10 is extremely dangerous>,
  "threatLevel": "<safe|suspicious|dangerous>",
  "verdict": "<brief one-line verdict>",
  "reasoning": "<comprehensive detailed reasoning explaining why this score was assigned, what threats were detected, what URL patterns indicate risk, domain analysis, and what makes this URL safe or dangerous>",
  "threats": ["<list of specific threat types detected>"],
  "indicators": ["<list of specific warning signs or red flags found in the URL>"],
  "confidence": <percentage 0-100>
}

ANALYSIS CRITERIA:
- Phishing websites (impersonation of legitimate sites)
- Malware distribution sites
- Typosquatting (deceptive domain names similar to legitimate brands)
- Suspicious TLDs (uncommon or risky domain extensions)
- URL shorteners (hidden destinations)
- IP addresses instead of domains
- Suspicious subdomains or paths
- Homograph attacks (lookalike characters)
- Data harvesting endpoints (fake login pages, credential collection)
- Redirect chains or suspicious redirects
- Domain age and reputation indicators
- SSL certificate validity (if HTTPS)

SCORING GUIDELINES:
- 0-2: Completely safe, legitimate URL
- 3-4: Mostly safe, minor concerns
- 5-6: Suspicious, multiple warning signs
- 7-8: Dangerous, clear threat indicators
- 9-10: Extremely dangerous, immediate threat

Provide a thorough analysis with detailed reasoning.`;
  }

  /**
   * Build prompt for summary generation
   */
  buildSummaryPrompt(analysisData) {
    const { threatScore, threatLevel, confidence, inputType, indicators = [], threats = [], keywords = [], reasoning = '', verdict = '' } = analysisData;
    
    const context = inputType === 'url' ? 'URL/website' : 'text message';
    const threatDesc = threatLevel === 'dangerous' ? 'HIGH RISK - DANGEROUS' : 
                       threatLevel === 'suspicious' ? 'MODERATE RISK - SUSPICIOUS' : 
                       'LOW RISK - SAFE';
    
    return `Generate a comprehensive, user-friendly security analysis summary for a ${context}.

ANALYSIS RESULTS:
- Threat Score: ${threatScore}/10
- Threat Level: ${threatDesc}
- Confidence: ${confidence}%
- Verdict: ${verdict}
- Detected Threats: ${threats.length > 0 ? threats.join(', ') : 'None'}
- Key Indicators: ${indicators.length > 0 ? indicators.slice(0, 5).join(', ') : 'None'}
- Suspicious Keywords: ${keywords.length > 0 ? keywords.slice(0, 5).join(', ') : 'None'}
- Detailed Reasoning: ${reasoning.substring(0, 500)}

REQUIREMENTS:
Write a comprehensive summary (200-400 words) that:
1. Clearly explains the threat score (0-10) and what it means
2. Describes the threat level and why it was assigned
3. Provides detailed reasoning about the detected threats
4. Lists specific security risks identified
5. Provides actionable recommendations for the user
6. Explains what to do if this is dangerous content
7. Offers prevention tips for similar threats
8. Uses clear, professional, and user-friendly language

Format the summary with clear sections and bullet points where appropriate.`;
  }

  /**
   * Call the appropriate LLM API
   */
  async callLLM(prompt) {
    if (this.provider === 'gemini') {
      return await this.callGeminiAPI(prompt);
    } else {
      return await this.callChatGPTAPI(prompt);
    }
  }

  /**
   * Call Gemini API
   */
  async callGeminiAPI(prompt) {
    // Correct Gemini API endpoint format: /v1beta/models/{model}:generateContent
    const url = `${this.geminiBaseUrl}/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    
    console.log('🌐 Calling Gemini API');
    console.log('📝 Model:', this.geminiModel);
    console.log('🔗 URL (masked):', url.replace(this.geminiApiKey, '***'));
    console.log('🔑 API Key configured:', !!this.geminiApiKey);
    
    try {
      const response = await axios.post(
        url,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      console.log('✅ Gemini API response received');
      
      if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
        return response.data.candidates[0].content.parts[0]?.text || '';
      }
      
      console.error('❌ Invalid response structure from Gemini API:', JSON.stringify(response.data).substring(0, 200));
      throw new Error('Invalid response from Gemini API');
    } catch (error) {
      console.error('❌ Gemini API Error Details:');
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   URL:', error.config?.url?.replace(this.geminiApiKey, '***'));
      console.error('   Response Data:', error.response?.data ? JSON.stringify(error.response.data).substring(0, 300) : 'No response data');
      throw error;
    }
  }

  /**
   * Call ChatGPT API
   */
  async callChatGPTAPI(prompt) {
    const response = await axios.post(
      this.chatgptBaseUrl,
      {
        model: this.chatgptModel,
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert. Always respond with valid JSON when requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${this.chatgptApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      }
    );

    if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content || '';
    }
    
    throw new Error('Invalid response from ChatGPT API');
  }

  /**
   * Parse analysis response from LLM
   */
  parseAnalysisResponse(response, inputType, originalInput) {
    try {
      // Try to extract JSON from response
      let jsonText = response.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to find JSON object in response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonText);
      
      // Validate and normalize the response
      const threatScore = Math.max(0, Math.min(10, parseInt(parsed.threatScore) || 0));
      const threatLevel = this.scoreToThreatLevel(threatScore);
      const confidence = Math.max(0, Math.min(100, parseInt(parsed.confidence) || 70));
      const verdict = parsed.verdict || 'Analysis completed';
      const reasoning = parsed.reasoning || 'No detailed reasoning provided';
      const threats = Array.isArray(parsed.threats) ? parsed.threats : [];
      const indicators = Array.isArray(parsed.indicators) ? parsed.indicators : [];
      const keywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
      
      return {
        threatScore,
        threatLevel,
        confidence,
        verdict,
        reasoning,
        threats,
        indicators,
        keywords,
        source: `${this.provider}_ai`,
        inputType,
        analysisDetails: {
          provider: this.provider,
          model: this.provider === 'gemini' ? this.geminiModel : this.chatgptModel,
          originalInput: originalInput.substring(0, 100)
        }
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error.message);
      console.error('Response text:', response.substring(0, 500));
      
      // Fallback: try to extract key information using regex
      return this.parseFallbackResponse(response, inputType, originalInput);
    }
  }

  /**
   * Fallback parser for non-JSON responses
   */
  parseFallbackResponse(response, inputType, originalInput) {
    // Try to extract threat score
    const scoreMatch = response.match(/threatScore["\s:]*(\d+)/i) || 
                       response.match(/threat.*score["\s:]*(\d+)/i) ||
                       response.match(/(\d+)\s*\/\s*10/i);
    const threatScore = scoreMatch ? Math.max(0, Math.min(10, parseInt(scoreMatch[1]))) : 5;
    
    // Try to extract threat level
    const levelMatch = response.match(/threatLevel["\s:]*["\']?(\w+)/i) ||
                       response.match(/(safe|suspicious|dangerous)/i);
    const threatLevel = levelMatch ? levelMatch[1].toLowerCase() : this.scoreToThreatLevel(threatScore);
    
    // Extract verdict if present
    const verdictMatch = response.match(/verdict["\s:]*["\']([^"']+)/i);
    const verdict = verdictMatch ? verdictMatch[1] : 'Analysis completed';
    
    // Use the response as reasoning
    const reasoning = response.length > 1000 ? response.substring(0, 1000) + '...' : response;
    
    return {
      threatScore,
      threatLevel,
      confidence: 70,
      verdict,
      reasoning,
      threats: [],
      indicators: [],
      keywords: [],
      source: `${this.provider}_ai_fallback`,
      inputType,
      analysisDetails: {
        provider: this.provider,
        model: this.provider === 'gemini' ? this.geminiModel : this.chatgptModel,
        originalInput: originalInput.substring(0, 100),
        parseError: 'Response was not in expected JSON format'
      }
    };
  }

  /**
   * Parse summary response
   */
  parseSummaryResponse(response) {
    // Remove markdown code blocks if present
    let summary = response.trim();
    summary = summary.replace(/```\n?/g, '').trim();
    
    return summary;
  }

  /**
   * Convert threat score (0-10) to threat level
   */
  scoreToThreatLevel(score) {
    if (score >= 7) {
      return 'dangerous';
    } else if (score >= 4) {
      return 'suspicious';
    } else {
      return 'safe';
    }
  }

  /**
   * Generate text from a custom prompt (for advanced use cases)
   * WARNING: This method does not validate or sanitize the prompt
   */
  async generateFromPrompt(prompt) {
    if (!this.isConfigured()) {
      throw new Error(`${this.provider.toUpperCase()} API key not configured`);
    }

    try {
      return await this.callLLM(prompt);
    } catch (error) {
      console.error(`❌ ${this.provider.toUpperCase()} prompt generation error:`, error.message);
      throw error;
    }
  }

  /**
   * Get provider information
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      configured: this.isConfigured(),
      model: this.provider === 'gemini' ? this.geminiModel : this.chatgptModel
    };
  }
}

export default new GenerativeLLMService();

