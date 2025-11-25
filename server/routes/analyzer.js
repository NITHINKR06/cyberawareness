import express from 'express';
import jwt from 'jsonwebtoken';
import AnalyzerHistory from '../models/AnalyzerHistory.js';
import { authenticateToken } from './auth.js';
import { verifyFirebaseAuth } from '../middleware/firebaseAdminAuth.js';
import { analyzerRateLimit } from '../middleware/security.js';
import aiAnalyzer from '../services/aiAnalyzer.js';
import configurableAnalyzer from '../services/aiAnalyzerConfigurable.js';

import urlThreatIntelligenceService from '../services/urlThreatIntelligence.js';
import cloudflareUrlScanner from '../services/cloudflareUrlScanner.js';
import { transformCloudflareResult } from '../services/cloudflareTransformer.js';

const router = express.Router();

// Flag to switch between original and configurable analyzer
const USE_CONFIGURABLE_ANALYZER = false;

// Analyze content endpoint
// - Text analysis: Public (no auth required)
// - URL analysis: Requires authentication
// Apply general rate limiting first, then check type in handler
router.post('/analyze', analyzerRateLimit, async (req, res) => {
  try {
    const { inputType, inputContent } = req.body;

    // Validate input
    if (!inputType || !inputContent) {
      return res.status(400).json({
        error: 'Input type and content are required'
      });
    }

    // Validate input type
    const validTypes = ['text', 'url', 'email', 'phone'];
    if (!validTypes.includes(inputType)) {
      return res.status(400).json({
        error: 'Invalid input type. Must be one of: text, url, email, phone'
      });
    }

    // URL analysis requires authentication
    if (inputType === 'url') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required for URL analysis. Please login to use this feature.',
          requiresAuth: true
        });
      }

      // Verify Firebase token (basic validation - in production use Firebase Admin SDK)
      if (token.length < 20 || token.length > 1000) {
        return res.status(401).json({
          error: 'Invalid authentication token. Please login again.',
          requiresAuth: true
        });
      }
    }

    // Get user ID from token if authenticated
    let userId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Try Firebase UID first (current implementation)
      if (token.length >= 20 && token.length <= 1000) {
        // This is likely a Firebase UID
        userId = token;
      } else {
        // Try JWT token (legacy)
        const JWT_SECRET = process.env.JWT_SECRET;
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          // Token invalid or expired, continue as anonymous for text analysis
          if (inputType === 'url') {
            return res.status(401).json({
              error: 'Invalid authentication token. Please login again.',
              requiresAuth: true
            });
          }
        }
      }
    }

    // Use configurable analyzer if enabled
    const analyzer = USE_CONFIGURABLE_ANALYZER ? configurableAnalyzer : aiAnalyzer;

    // Perform analysis based on type
    let analysisResult;

    if (inputType === 'url') {
      // Try Cloudflare URL Scanner first if configured, then fallback to Puppeteer
      if (cloudflareUrlScanner.isConfigured()) {
        try {
          console.log(`🔍 Analyzing URL with Cloudflare: ${inputContent}`);
          const cloudflareData = await cloudflareUrlScanner.scanUrl(inputContent, (status) => {
            console.log(`Cloudflare scan status: ${status}`);
          });
          
          analysisResult = transformCloudflareResult(
            cloudflareData.result,
            inputContent,
            cloudflareData.screenshot
          );
          console.log('✅ Cloudflare scan completed successfully');
        } catch (cloudflareError) {
          console.warn('⚠️ Cloudflare scan failed, falling back to Puppeteer:', cloudflareError.message);
          // Fallback to Puppeteer-based analysis
          analysisResult = await urlThreatIntelligenceService.analyzeUrl(inputContent);
        }
      } else {
        // Use specialized URL threat intelligence service (Puppeteer)
        console.log(`🔍 Analyzing URL with Puppeteer: ${inputContent}`);
        analysisResult = await urlThreatIntelligenceService.analyzeUrl(inputContent);
      }
    } else {
      // Use AI analyzer for text, email, phone
      analysisResult = await analyzer.analyze(inputType, inputContent);
    }

    // Save to history
    const history = new AnalyzerHistory({
      userId,
      sessionId: req.session.sessionId,
      inputType,
      inputContent,
      analysisResult: {
        threatScore: analysisResult.threatScore,
        threatLevel: analysisResult.threatLevel,
        confidence: analysisResult.confidence,
        verdict: analysisResult.verdict,
        reasoning: analysisResult.reasoning,
        indicators: analysisResult.indicators,
        recommendations: analysisResult.recommendations,
        details: {
          summary: analysisResult.summary,
          source: analysisResult.source,
          threats: analysisResult.threats,
          keywords: analysisResult.keywords,
          analyzedAt: new Date().toISOString()
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await history.save();

    // Award points if user is authenticated and content is dangerous
    // Note: Points are managed in Firestore, not MongoDB for Firebase users
    // This would need to be updated via Firestore Admin SDK or API endpoint
    if (userId && analysisResult.threatLevel === 'dangerous') {
      // Points awarded: 10 (handled via Firestore in frontend or separate API call)
      // For now, we just indicate points in the response
    }

    res.json({
      analysisResult,
      historyId: history._id,
      pointsAwarded: (userId && analysisResult.threatLevel === 'dangerous') ? 10 : 0,
      sessionId: req.session.sessionId
    });
  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// ADD THIS NEW ROUTE to analyzer.js, before the existing '/history' route

// Cloudflare URL Scanner endpoint (optional direct access)
router.post('/cloudflare-scan', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!cloudflareUrlScanner.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cloudflare URL Scanner is not configured. Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables.' 
      });
    }

    // Submit scan and poll for results
    const cloudflareData = await cloudflareUrlScanner.scanUrl(url, (status) => {
      // Could implement Server-Sent Events (SSE) here for real-time progress
      console.log(`Cloudflare scan progress: ${status}`);
    });

    // Transform to AnalysisResult format
    const analysisResult = transformCloudflareResult(
      cloudflareData.result,
      url,
      cloudflareData.screenshot
    );

    res.json({
      success: true,
      analysisResult,
      scanId: cloudflareData.scanId
    });
  } catch (error) {
    console.error('Cloudflare scan error:', error);
    res.status(500).json({ 
      error: 'Cloudflare scan failed', 
      message: error.message 
    });
  }
});

// Vulnerable endpoint for the Security Sandbox demonstration
router.post('/analyze-vulnerable', async (req, res) => {
  try {
    const { inputType, inputContent } = req.body;
    if (!inputType || !inputContent) {
      return res.status(400).json({ error: 'Input type and content are required' });
    }

    // Call the new weak prompt function
    const result = await aiAnalyzer.analyzeWithWeakPrompt(inputType, inputContent);

    res.json(result);
  } catch (error) {
    console.log('Error in vulnerable analysis:', error);
    res.status(500).json({ error: 'Server error during vulnerable analysis' });
  }
});

// Get user's analysis history (authenticated)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const history = await AnalyzerHistory.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Server error while fetching history' });
  }
});

// Get session analysis history (for anonymous users)
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (sessionId !== req.session.sessionId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const history = await AnalyzerHistory.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Server error while fetching history' });
  }
});

// Removed the hardcoded analysis function - now using AI services

// Get current analyzer configuration
router.get('/configuration', async (req, res) => {
  try {
    if (!USE_CONFIGURABLE_ANALYZER) {
      return res.status(404).json({
        success: false,
        error: 'Configuration endpoint not available in original analyzer mode'
      });
    }

    const configuration = configurableAnalyzer.getConfiguration();
    res.json({
      success: true,
      configuration
    });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyzer configuration'
    });
  }
});

export default router;
