export interface AnalysisResult {
  url: string;
  finalUrl: string;
  scanDate: string;
  screenshot?: string;

  domain: {
    name: string;
    age?: number;
    registrar?: string;
    ip?: string;
  };

  security: {
    ssl: {
      valid: boolean;
      daysRemaining?: number;
      issuer?: string;
      validFrom?: string;
      validTo?: string;
      protocol?: string;
      cipher?: string;
    };
    headers: Record<string, string>;
    headersAnalysis?: {
      present: Array<{ name: string; value: string }>;
      missing: string[];
      weak: Array<{ name: string; issue: string }>;
      recommendations: string[];
    };
    cookies?: {
      secure: number;
      httpOnly: number;
      sameSite: number;
      total: number;
    };
    mixedContent?: {
      count: number;
      resources: string[];
    };
    ports?: {
      open: Array<{ port: number; name: string }>;
      weak: Array<{ port: number; name: string }>;
      secure: Array<{ port: number; name: string }>;
    };
    vulnerabilities?: Array<{
      severity: 'low' | 'medium' | 'high';
      title: string;
      description: string;
    }>;
    score: number;
  };

  network: {
    requests: number;
    bytes: number;
    types: Record<string, number>;
    domains: string[];
  };

  technologies: Array<{
    name: string;
    type: string;
  }>;

  page: {
    title: string;
    cookies: number;
    cookieDetails?: Array<{
      name: string;
      domain?: string;
      path?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: string;
    }>;
    consoleLogs: number;
    consoleLogDetails?: Array<{
      type: string;
      text: string;
    }>;
    hasLoginForm: boolean;
    externalLinks?: Array<{
      url: string;
      text: string;
    }>;
    scripts?: string[];
    iframes?: number;
    forms?: number;
  };

  verdict: string;
  threatLevel: 'safe' | 'suspicious' | 'dangerous';
  threatScore: number;
  indicators: string[];
  recommendations?: string[];

  // Text analysis fields
  confidence?: number;
  reasoning?: string;

  // Legacy fields support
  summary?: string;
  ocrConfidence?: number;
  extractedText?: string;
  source?: string;
}

