// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';

// // Google Safe Browsing API Service (now routes through backend)
// export class SafeBrowsingService {
//   async checkUrl(url: string): Promise<{
//     isSafe: boolean;
//     threats: string[];
//     confidence: number;
//   }> {
//     try {
//       // Route through backend analyzer endpoint
//       const token = localStorage.getItem('authToken');
//       const response = await axios.post(
//         `${API_BASE_URL}/analyzer/analyze`,
//         {
//           inputType: 'url',
//           inputContent: url
//         },
//         {
//           headers: token ? {
//             'Authorization': `Bearer ${token}`
//           } : {},
//           withCredentials: true
//         }
//       );

//       const { analysisResult } = response.data;
      
//       return {
//         isSafe: analysisResult.threatLevel === 'safe',
//         threats: analysisResult.threats || [],
//         confidence: analysisResult.confidence || 75
//       };
//     } catch (error) {
//       console.error('URL analysis error:', error);
//       return this.fallbackUrlAnalysis(url);
//     }
//   }

//   private fallbackUrlAnalysis(url: string): {
//     isSafe: boolean;
//     threats: string[];
//     confidence: number;
//   } {
//     const suspiciousPatterns = [
//       /bit\.ly/i,
//       /tinyurl/i,
//       /short\.link/i,
//       /goo\.gl/i,
//       /ow\.ly/i
//     ];

//     const dangerousPatterns = [
//       /phishing/i,
//       /malware/i,
//       /virus/i,
//       /trojan/i,
//       /hack/i,
//       /scam/i
//     ];

//     const urlLower = url.toLowerCase();
//     const threats: string[] = [];
//     let confidence = 75;

//     // Check for HTTPS
//     if (!url.startsWith('https://')) {
//       threats.push('NO_HTTPS');
//       confidence = 70;
//     }

//     // Check for suspicious patterns
//     if (suspiciousPatterns.some(pattern => pattern.test(url))) {
//       threats.push('URL_SHORTENER');
//       confidence = 65;
//     }

//     // Check for dangerous patterns
//     if (dangerousPatterns.some(pattern => pattern.test(url))) {
//       threats.push('MALICIOUS_PATTERN');
//       confidence = 85;
//     }

//     // Check for IP addresses instead of domains
//     const ipPattern = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
//     if (ipPattern.test(url)) {
//       threats.push('IP_ADDRESS');
//       confidence = 60;
//     }

//     // Check for homograph attacks (similar looking characters)
//     const homographPatterns = [
//       /[а-яА-Я]/, // Cyrillic characters
//       /[αβγδεζηθικλμνξοπρστυφχψω]/, // Greek characters
//     ];
//     if (homographPatterns.some(pattern => pattern.test(url))) {
//       threats.push('HOMOGRAPH_ATTACK');
//       confidence = 80;
//     }

//     return {
//       isSafe: threats.length === 0,
//       threats,
//       confidence
//     };
//   }
// }

// // Text Analysis Service (now routes through backend)
// export class TextAnalysisService {
//   async analyzeText(text: string): Promise<{
//     threatLevel: 'safe' | 'suspicious' | 'dangerous';
//     confidence: number;
//     indicators: string[];
//     recommendations: string[];
//   }> {
//     try {
//       // Route through backend analyzer endpoint
//       const token = localStorage.getItem('authToken');
//       const response = await axios.post(
//         `${API_BASE_URL}/analyzer/analyze`,
//         {
//           inputType: 'text',
//           inputContent: text
//         },
//         {
//           headers: token ? {
//             'Authorization': `Bearer ${token}`
//           } : {},
//           withCredentials: true
//         }
//       );

//       const { analysisResult } = response.data;
      
//       return {
//         threatLevel: analysisResult.threatLevel as 'safe' | 'suspicious' | 'dangerous',
//         confidence: analysisResult.confidence || 75,
//         indicators: analysisResult.indicators || [],
//         recommendations: analysisResult.recommendations || []
//       };
//     } catch (error) {
//       console.error('Text analysis error:', error);
//       return this.fallbackTextAnalysis(text);
//     }
//   }

//   private fallbackTextAnalysis(text: string): {
//     threatLevel: 'safe' | 'suspicious' | 'dangerous';
//     confidence: number;
//     indicators: string[];
//     recommendations: string[];
//   } {
//     const lowerText = text.toLowerCase();
//     const indicators: string[] = [];
//     const recommendations: string[] = [];
//     let threatScore = 0;

//     // Suspicious keywords (weight: 1)
//     const suspiciousKeywords = [
//       'urgent', 'act now', 'limited time', 'click here', 'verify',
//       'suspended', 'winner', 'congratulations', 'claim', 'prize',
//       'free', 'guarantee', 'no risk', 'special offer', 'exclusive'
//     ];

//     // Dangerous keywords (weight: 3)
//     const dangerousKeywords = [
//       'password', 'social security', 'ssn', 'bank account', 'credit card',
//       'wire transfer', 'bitcoin', 'payment required', 'tax', 'irs',
//       'arrest', 'legal action', 'lawsuit', 'warrant'
//     ];

//     // Financial scam patterns (weight: 2)
//     const financialPatterns = [
//       /\$\d+[,\d]*(\.\d{2})?/g, // Money amounts
//       /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, // Credit card pattern
//       /account.{0,20}(suspended|locked|frozen)/gi,
//       /verify.{0,20}(identity|account|information)/gi
//     ];

//     // Check suspicious keywords
//     suspiciousKeywords.forEach(keyword => {
//       if (lowerText.includes(keyword)) {
//         threatScore += 1;
//         if (indicators.length < 3) {
//           indicators.push(`Contains suspicious keyword: "${keyword}"`);
//         }
//       }
//     });

//     // Check dangerous keywords
//     dangerousKeywords.forEach(keyword => {
//       if (lowerText.includes(keyword)) {
//         threatScore += 3;
//         if (indicators.length < 5) {
//           indicators.push(`Requests sensitive information: "${keyword}"`);
//         }
//       }
//     });

//     // Check financial patterns
//     financialPatterns.forEach(pattern => {
//       if (pattern.test(text)) {
//         threatScore += 2;
//         if (indicators.length < 5) {
//           indicators.push('Contains financial information patterns');
//         }
//       }
//     });

//     // Check for excessive capitalization
//     const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
//     if (capsRatio > 0.3) {
//       threatScore += 1;
//       indicators.push('Excessive use of capital letters');
//     }

//     // Check for multiple exclamation marks
//     if ((text.match(/!/g) || []).length > 3) {
//       threatScore += 1;
//       indicators.push('Multiple exclamation marks detected');
//     }

//     // Check for URL shorteners
//     const urlShorteners = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'short.link'];
//     urlShorteners.forEach(shortener => {
//       if (lowerText.includes(shortener)) {
//         threatScore += 2;
//         indicators.push(`Contains URL shortener: ${shortener}`);
//       }
//     });

//     // Determine threat level
//     let threatLevel: 'safe' | 'suspicious' | 'dangerous' = 'safe';
//     let confidence = 85;

//     if (threatScore >= 8) {
//       threatLevel = 'dangerous';
//       confidence = Math.min(95, 70 + threatScore * 2);
//       recommendations.push('Do not provide any personal information');
//       recommendations.push('Report this message to authorities');
//       recommendations.push('Block the sender immediately');
//     } else if (threatScore >= 3) {
//       threatLevel = 'suspicious';
//       confidence = Math.min(85, 60 + threatScore * 3);
//       recommendations.push('Verify sender identity independently');
//       recommendations.push('Do not click any links');
//       recommendations.push('Be cautious with any requests');
//     } else {
//       confidence = Math.max(70, 85 - threatScore * 5);
//       recommendations.push('Message appears safe, but always remain vigilant');
//       recommendations.push('Verify unexpected requests through official channels');
//     }

//     if (indicators.length === 0) {
//       indicators.push('No immediate threats detected');
//     }

//     return {
//       threatLevel,
//       confidence,
//       indicators,
//       recommendations
//     };
//   }
// }

// // Export singleton instances
// export const safeBrowsingService = new SafeBrowsingService();
// export const textAnalysisService = new TextAnalysisService();
