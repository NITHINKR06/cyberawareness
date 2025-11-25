# Cloudflare URL Scanner Integration Setup

This guide explains how to set up Cloudflare URL Scanner API integration for enhanced URL analysis.

## Overview

The Cloudflare URL Scanner provides comprehensive URL analysis including:
- **Screenshots**: Desktop, mobile, and tablet views
- **Network Analysis**: Request chains, cookies, console logs
- **Security Detection**: SSL certificates, malicious content detection
- **Technology Detection**: Wappalyzer integration for tech stack detection
- **Threat Intelligence**: Phishing detection, domain categorization

## Setup Instructions

### Step 1: Get Cloudflare API Token

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Account** → **API Tokens** (or visit https://dash.cloudflare.com/profile/api-tokens)
3. Click **"Create Token"**
4. Click **"Create Custom Token"**
5. Configure the token:
   - **Token Name**: `URL Scanner API` (or any name you prefer)
   - **Permissions**:
     - Select **"Account"**
     - Under **"URL Scanner"**, select **"Edit"** access level
   - **Account Resources**: Select your account
6. Click **"Continue to summary"** → **"Create Token"**
7. **Copy the token immediately** (you won't be able to see it again)

### Step 2: Get Your Account ID

1. In Cloudflare Dashboard, select any domain
2. Scroll down to the **"API"** section in the right sidebar
3. Copy your **Account ID** (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 3: Configure Environment Variables

Add the following to your `.env` file in the **project root** (not in `server/.env`):

```env
# Cloudflare URL Scanner API Configuration
VITE_CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
VITE_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
```

**Important Notes:**
- These are **frontend** environment variables, so they must be prefixed with `VITE_`
- The `.env` file should be in the project root (same level as `package.json`)
- For production deployments (Vercel, Netlify, etc.), add these as environment variables in your hosting platform's dashboard

### Step 4: Restart Development Server

After adding the environment variables:

```bash
# Stop your current dev server (Ctrl+C)
# Then restart
npm run dev
```

## How It Works

### Automatic Fallback

The URL analyzer will:
1. **First try Cloudflare URL Scanner** (if configured)
   - Submits URL for scanning
   - Polls for results (every 15 seconds)
   - Fetches screenshots
   - Transforms results to match existing format

2. **Fallback to Backend Analysis** (if Cloudflare fails or isn't configured)
   - Uses existing Puppeteer-based analysis
   - Uses LLM for threat detection
   - Maintains all existing features

### Features Enabled with Cloudflare

When Cloudflare is configured, you get:
- ✅ Real-time URL scanning with Cloudflare's infrastructure
- ✅ High-quality screenshots (desktop, mobile, tablet)
- ✅ Comprehensive network request analysis
- ✅ Technology stack detection (Wappalyzer)
- ✅ Phishing and malware detection
- ✅ Domain categorization
- ✅ SSL certificate analysis
- ✅ Cookie and console log tracking

### Without Cloudflare

The system continues to work with:
- ✅ Backend Puppeteer-based analysis
- ✅ LLM-powered threat detection
- ✅ Basic screenshots
- ✅ Network analysis
- ✅ All existing features

## API Usage

The Cloudflare URL Scanner service is available at:
- **Service**: `src/services/cloudflareUrlScanner.ts`
- **Transformer**: `src/services/cloudflareTransformer.ts`

### Example Usage

```typescript
import { cloudflareUrlScanner } from './services/cloudflareUrlScanner';
import { transformCloudflareResult } from './services/cloudflareTransformer';

// Check if configured
if (cloudflareUrlScanner.isConfigured()) {
  // Scan URL
  const result = await cloudflareUrlScanner.scanUrl(url, (status) => {
    console.log('Scan status:', status);
  });
  
  // Get screenshot
  const screenshot = await cloudflareUrlScanner.getScreenshotUrl(result.task.uuid);
  
  // Transform to AnalysisResult
  const analysisResult = transformCloudflareResult(result, url, screenshot);
}
```

## Troubleshooting

### "Cloudflare API not configured" Error

- Check that `VITE_CLOUDFLARE_API_TOKEN` and `VITE_CLOUDFLARE_ACCOUNT_ID` are set in `.env`
- Ensure variables are prefixed with `VITE_`
- Restart your development server after adding variables
- Check that the token has "Edit" permission for URL Scanner

### Scan Timeout

- Cloudflare scans typically take 30-60 seconds
- Maximum wait time is 10 minutes (40 polling attempts × 15 seconds)
- If timeout occurs, the system will fall back to backend analysis

### Screenshot Not Loading

- Screenshots are fetched as blob URLs
- Some browsers may block blob URLs in certain contexts
- The system will gracefully handle missing screenshots

## Security Notes

- **Never commit** your API token to version control
- Add `.env` to `.gitignore` if not already present
- Use environment variables in production deployments
- The API token should have minimal required permissions (only URL Scanner Edit)

## Rate Limits

Cloudflare URL Scanner API has rate limits:
- Check Cloudflare's documentation for current limits
- The service includes automatic retry and fallback mechanisms
- Failed scans automatically fall back to backend analysis

## Support

For issues or questions:
1. Check Cloudflare's [URL Scanner API Documentation](https://developers.cloudflare.com/url-scanner/)
2. Verify your API token permissions
3. Check browser console for detailed error messages

