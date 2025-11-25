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
    };
    headers: Record<string, string>;
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
    consoleLogs: number;
    hasLoginForm: boolean;
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

