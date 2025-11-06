// Validation Rules Configuration
// This file contains all configurable validation rules for the scam analyzer

const validationRules = {
  // Threat level definitions
  threatLevels: {
    safe: {
      name: 'safe',
      displayName: 'Safe',
      color: 'green',
      icon: 'CheckCircle',
      toastType: 'success',
      toastMessage: 'Content appears safe, but always stay vigilant!',
      cssClasses: {
        container: 'text-green-600 bg-green-50 border-green-200',
        icon: 'text-green-600',
        progressBar: 'bg-green-500'
      }
    },
    suspicious: {
      name: 'suspicious',
      displayName: 'Suspicious',
      color: 'yellow',
      icon: 'AlertCircle',
      toastType: 'warning',
      toastMessage: 'Suspicious content detected. Proceed with caution.',
      cssClasses: {
        container: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        progressBar: 'bg-yellow-500'
      }
    },
    dangerous: {
      name: 'dangerous',
      displayName: 'Dangerous',
      color: 'red',
      icon: 'XCircle',
      toastType: 'error',
      toastMessage: 'High threat detected! Please be extremely cautious.',
      cssClasses: {
        container: 'text-red-600 bg-red-50 border-red-200',
        icon: 'text-red-600',
        progressBar: 'bg-red-500'
      }
    }
  },

  // Scoring thresholds for AI analysis
  scoringThresholds: {
    dangerous: 0.8,      // Score >= 0.8 is dangerous
    suspicious: 0.4,     // Score >= 0.4 is suspicious
    safe: 0              // Score < 0.4 is safe
  },

  // Confidence calculation parameters
  confidenceRanges: {
    dangerous: {
      min: 85,
      max: 99,
      scaleFactor: 25
    },
    suspicious: {
      min: 70,
      max: 84,
      scaleFactor: 14
    },
    safe: {
      min: 80,
      max: 100,
      scaleFactor: 20
    }
  },

  // Scam detection keywords for text analysis
  scamKeywords: {
    high_risk: [
      'urgent', 
      'act now', 
      'verify account', 
      'suspended',
      'click here immediately',
      'confirm your identity',
      'update payment information',
      'your account will be closed',
      'limited time offer'
    ],
    medium_risk: [
      'congratulations', 
      'winner', 
      'prize', 
      'lottery',
      'you have been selected',
      'claim your reward',
      'exclusive offer',
      'free gift'
    ],
    financial: [
      'transfer funds', 
      'processing fee',
      'wire transfer',
      'bitcoin',
      'cryptocurrency',
      'investment opportunity',
      'guaranteed returns',
      'no risk'
    ],
    phishing: [
      'verify your password',
      'update your details',
      'confirm your account',
      'security alert',
      'unusual activity',
      'temporary suspension'
    ]
  },

  // Keyword scoring weights
  keywordWeights: {
    high_risk: 3,
    medium_risk: 2,
    financial: 2.5,
    phishing: 3
  },

  // Suspicious URL patterns
  suspiciousUrlPatterns: {
    url_shorteners: [
      'bit.ly', 
      'tinyurl.com', 
      'goo.gl',
      'ow.ly',
      'is.gd',
      't.co',
      'buff.ly'
    ],
    suspicious_tlds: [
      '.tk',
      '.ml',
      '.ga',
      '.cf',
      '.click',
      '.download',
      '.review'
    ],
    phishing_patterns: [
      'secure-',
      'account-',
      'verify-',
      'update-',
      'suspended-',
      'confirm-'
    ]
  },

  // Recommendations based on threat level
  recommendations: {
    safe: [
      '✓ Appears safe, but always remain vigilant',
      'Continue to verify information through official sources',
      'Keep your security software updated',
      'Report any suspicious changes'
    ],
    suspicious: [
      'CAUTION: Verify before proceeding',
      'Double-check the sender\'s identity',
      'Look for official contact information',
      'Never share sensitive information without verification',
      'Consider reporting this content'
    ],
    dangerous: [
      'HIGH RISK: Do not interact with this content',
      'Do not click any links or download attachments',
      'Report this to relevant authorities immediately',
      'Block the sender if possible',
      'Warn others about this potential scam'
    ],
    url_specific: [
      'Always verify URLs before clicking',
      'Look for HTTPS and valid SSL certificates',
      'Check the domain carefully for typos',
      'Hover over links to see the actual destination'
    ],
    text_specific: [
      'Never share passwords or sensitive information',
      'Verify sender identity through official channels',
      'Be suspicious of unsolicited messages',
      'Check for spelling and grammar errors'
    ]
  },

  // Analysis fallback settings
  fallbackSettings: {
    defaultConfidence: {
      safe: 70,
      suspicious: 60,
      dangerous: 75
    },
    keywordThresholds: {
      dangerous: 3,  // More than 3 keywords = dangerous
      suspicious: 1  // 1 or more keywords = suspicious
    }
  },

  // API timeout settings
  apiSettings: {
    huggingFaceTimeout: 10000,
    geminiTimeout: 10000
  },

  // Feature flags
  features: {
    useHuggingFace: true,
    useGeminiSummary: true,
    useFallbackAnalysis: true,
    enableVulnerableMode: true  // For educational purposes
  }
};

// Function to get validation rules
export const getValidationRules = () => {
  return validationRules;
};

// Function to update validation rules (for admin interface)
export const updateValidationRules = (newRules) => {
  Object.assign(validationRules, newRules);
  return validationRules;
};

// Function to get threat level by score
export const getThreatLevelByScore = (score) => {
  const thresholds = validationRules.scoringThresholds;
  
  if (score >= thresholds.dangerous) {
    return 'dangerous';
  } else if (score >= thresholds.suspicious) {
    return 'suspicious';
  } else {
    return 'safe';
  }
};

// Function to calculate confidence
export const calculateConfidence = (score, threatLevel) => {
  const ranges = validationRules.confidenceRanges[threatLevel];
  const thresholds = validationRules.scoringThresholds;
  
  let confidence = 0;
  
  if (threatLevel === 'dangerous') {
    confidence = ranges.min + (score - thresholds.dangerous) * ranges.scaleFactor;
  } else if (threatLevel === 'suspicious') {
    const range = thresholds.dangerous - thresholds.suspicious;
    confidence = ranges.min + ((score - thresholds.suspicious) / range) * ranges.scaleFactor;
  } else {
    confidence = ranges.max - (score / thresholds.suspicious) * ranges.scaleFactor;
  }
  
  return Math.round(Math.min(confidence, ranges.max));
};

export default validationRules;
