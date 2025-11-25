/**
 * Cloudflare URL Scanner API Service (Backend)
 * 
 * This service integrates with Cloudflare's URL Scanner API to provide
 * comprehensive URL analysis including screenshots, network stats, and security information.
 * 
 * Setup:
 * 1. Get API token from Cloudflare Dashboard > Account > API Tokens
 * 2. Create Custom Token with "URL Scanner" permission (Edit access level)
 * 3. Get your account_id from Cloudflare Dashboard
 * 4. Set environment variables in server/.env:
 *    - CLOUDFLARE_API_TOKEN
 *    - CLOUDFLARE_ACCOUNT_ID
 */

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const POLL_INTERVAL = 15000; // 15 seconds
const MAX_POLL_ATTEMPTS = 40; // 10 minutes max wait time

class CloudflareUrlScannerService {
  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || null;
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || null;
  }

  /**
   * Check if Cloudflare API is configured
   */
  isConfigured() {
    return !!(this.apiToken && this.accountId);
  }

  /**
   * Submit a URL for scanning
   */
  async submitScan(url, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Cloudflare API token and account ID must be configured. Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables.');
    }

    const requestBody = {
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
    } catch (error) {
      console.error('Cloudflare scan submission error:', error);
      throw new Error(`Failed to submit URL scan: ${error.message}`);
    }
  }

  /**
   * Get scan result by UUID
   */
  async getScanResult(scanId) {
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
    } catch (error) {
      console.error('Cloudflare scan result fetch error:', error);
      throw new Error(`Failed to fetch scan result: ${error.message}`);
    }
  }

  /**
   * Poll for scan result until complete
   */
  async pollScanResult(scanId, onProgress) {
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
   * Get screenshot as base64 or buffer
   */
  async getScreenshot(scanId, resolution = 'desktop') {
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
        console.warn(`Screenshot not available for ${scanId} at ${resolution} resolution`);
        return null;
      }

      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        console.warn('Screenshot endpoint returned non-image content');
        return null;
      }

      // Convert to base64 for easy transmission
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${contentType};base64,${base64}`;

      return dataUrl;
    } catch (error) {
      console.error('Failed to fetch screenshot:', error);
      return null;
    }
  }

  /**
   * Complete scan workflow: submit, poll, and return result with screenshot
   */
  async scanUrl(url, onProgress) {
    const scanResponse = await this.submitScan(url);
    
    if (onProgress) {
      onProgress('Queued');
    }

    const result = await this.pollScanResult(scanResponse.uuid, onProgress);
    
    // Get screenshot
    const screenshot = await this.getScreenshot(scanResponse.uuid, 'desktop');
    
    return {
      result,
      screenshot,
      scanId: scanResponse.uuid
    };
  }
}

// Export singleton instance
export default new CloudflareUrlScannerService();

