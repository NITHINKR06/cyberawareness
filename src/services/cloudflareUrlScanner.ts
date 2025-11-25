/**
 * Cloudflare URL Scanner API Service
 * 
 * This service integrates with Cloudflare's URL Scanner API to provide
 * comprehensive URL analysis including screenshots, network stats, and security information.
 * 
 * Setup:
 * 1. Get API token from Cloudflare Dashboard > Account > API Tokens
 * 2. Create Custom Token with "URL Scanner" permission (Edit access level)
 * 3. Get your account_id from Cloudflare Dashboard
 * 4. Set environment variables:
 *    - VITE_CLOUDFLARE_API_TOKEN
 *    - VITE_CLOUDFLARE_ACCOUNT_ID
 */

interface CloudflareScanRequest {
  url: string;
  screenshotsResolutions?: ('desktop' | 'mobile' | 'tablet')[];
  customagent?: string;
  referer?: string;
  customHeaders?: Record<string, string>;
  visibility?: 'Public' | 'Unlisted';
}

interface CloudflareScanResponse {
  uuid: string;
  api: string;
  visibility: string;
  url: string;
  message: string;
}

interface CloudflareScanResult {
  task: {
    uuid: string;
    url: string;
    success: boolean;
    status: string;
  };
  page: {
    url: string;
    domain: string;
    ip: string;
    country: string;
    asn: number;
    server: string;
    title: string;
    history: Array<{
      url: string;
      status: number;
    }>;
    screenshot?: {
      desktop?: string;
      mobile?: string;
      tablet?: string;
    };
    domStructHash?: string;
    favicon?: {
      hash: string;
    };
  };
  data: {
    requests?: Array<{
      url: string;
      method: string;
      status: number;
      type: string;
    }>;
    cookies?: Array<{
      name: string;
      domain: string;
      path: string;
    }>;
    console?: Array<{
      level: string;
      text: string;
    }>;
    performance?: {
      loadEventEnd?: number;
      domContentLoadedEventEnd?: number;
    };
  };
  meta: {
    processors: {
      domainCategories?: string[];
      phishing?: {
        type?: string;
        verified?: boolean;
      };
      radarRank?: number;
      wappa?: Array<{
        name: string;
        category: string;
      }>;
      technologies?: Array<{
        name: string;
        category: string;
      }>;
    };
  };
  lists: {
    ips?: Array<{
      ip: string;
      asn: number;
      country: string;
    }>;
    domains?: Array<{
      domain: string;
      ip: string;
    }>;
    certificates?: Array<{
      issuer: string;
      valid: boolean;
    }>;
  };
  verdicts: {
    overall: {
      malicious: boolean;
      categories?: string[];
    };
  };
}

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const POLL_INTERVAL = 15000; // 15 seconds
const MAX_POLL_ATTEMPTS = 40; // 10 minutes max wait time

class CloudflareUrlScannerService {
  private apiToken: string | null;
  private accountId: string | null;

  constructor() {
    this.apiToken = import.meta.env.VITE_CLOUDFLARE_API_TOKEN || null;
    this.accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || null;
  }

  /**
   * Check if Cloudflare API is configured
   */
  isConfigured(): boolean {
    return !!(this.apiToken && this.accountId);
  }

  /**
   * Submit a URL for scanning
   */
  async submitScan(url: string, options?: Partial<CloudflareScanRequest>): Promise<CloudflareScanResponse> {
    if (!this.isConfigured()) {
      throw new Error('Cloudflare API token and account ID must be configured. Set VITE_CLOUDFLARE_API_TOKEN and VITE_CLOUDFLARE_ACCOUNT_ID environment variables.');
    }

    const requestBody: CloudflareScanRequest = {
      url,
      screenshotsResolutions: ['desktop', 'mobile'],
      visibility: 'Unlisted',
      ...options
    };

    try {
      const response = await fetch(
        `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/urlscanner/v2/scan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.message || `Cloudflare API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Cloudflare scan submission error:', error);
      throw new Error(`Failed to submit URL scan: ${error.message}`);
    }
  }

  /**
   * Get scan result by UUID
   */
  async getScanResult(scanId: string): Promise<CloudflareScanResult | null> {
    if (!this.isConfigured()) {
      throw new Error('Cloudflare API not configured');
    }

    try {
      const response = await fetch(
        `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/urlscanner/v2/result/${scanId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 404) {
        // Scan is still in progress
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.message || `Cloudflare API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Cloudflare scan result fetch error:', error);
      throw new Error(`Failed to fetch scan result: ${error.message}`);
    }
  }

  /**
   * Poll for scan result until complete
   */
  async pollScanResult(scanId: string, onProgress?: (status: string) => void): Promise<CloudflareScanResult> {
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      const result = await this.getScanResult(scanId);

      if (result) {
        if (result.task.status === 'Finished' && result.task.success) {
          return result;
        } else if (result.task.status === 'Failed') {
          throw new Error(`Scan failed: ${result.task.status}`);
        }
        
        // Update progress
        if (onProgress) {
          onProgress(result.task.status);
        }
      } else {
        // Still in progress (404 response)
        if (onProgress) {
          onProgress('InProgress');
        }
      }

      attempts++;
      if (attempts < MAX_POLL_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    }

    throw new Error('Scan timeout: Maximum polling attempts reached');
  }

  /**
   * Get screenshot URL from scan result
   * Returns a blob URL that can be used directly in img src
   */
  async getScreenshotUrl(scanId: string, resolution: 'desktop' | 'mobile' | 'tablet' = 'desktop'): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await fetch(
        `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/urlscanner/v2/screenshot/${scanId}?resolution=${resolution}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      if (!response.ok) {
        // Screenshot might not be available yet or for this resolution
        console.warn(`Screenshot not available for ${scanId} at ${resolution} resolution`);
        return null;
      }

      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        console.warn('Screenshot endpoint returned non-image content');
        return null;
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to fetch screenshot:', error);
      return null;
    }
  }

  /**
   * Complete scan workflow: submit, poll, and return result
   */
  async scanUrl(url: string, onProgress?: (status: string) => void): Promise<CloudflareScanResult> {
    const scanResponse = await this.submitScan(url);
    
    if (onProgress) {
      onProgress('Queued');
    }

    return await this.pollScanResult(scanResponse.uuid, onProgress);
  }
}

// Export singleton instance
export const cloudflareUrlScanner = new CloudflareUrlScannerService();

// Export types for use in components
export type { CloudflareScanResult, CloudflareScanRequest, CloudflareScanResponse };

