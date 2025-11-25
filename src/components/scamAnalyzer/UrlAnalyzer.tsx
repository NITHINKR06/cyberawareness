import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2 } from 'lucide-react';
import { analyzeContent } from '../../services/backendApi';
import { cloudflareUrlScanner } from '../../services/cloudflareUrlScanner';
import { transformCloudflareResult } from '../../services/cloudflareTransformer';
import { toast } from 'react-toastify';
import { AnalysisResult } from './types';
import { validateBasicInput } from './utils';

interface UrlAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: string) => void;
}

export default function UrlAnalyzer({ onAnalysisComplete, onError }: UrlAnalyzerProps) {
  const { t } = useTranslation();
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');

  const handleAnalysis = async () => {
    const validation = validateBasicInput('url', urlInput);
    if (!validation.isValid) {
      const errorMsg = validation.error || t('scamAnalyzer.invalidInput', 'Invalid input');
      onError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsProcessing(true);
    onError('');
    setScanStatus('');

    // Try Cloudflare URL Scanner first if configured
    if (cloudflareUrlScanner.isConfigured()) {
      try {
        setScanStatus('Submitting to Cloudflare...');
        toast.info('Using Cloudflare URL Scanner for deep analysis...');

        // Submit scan and poll for results
        const cloudflareResult = await cloudflareUrlScanner.scanUrl(
          urlInput,
          (status) => {
            setScanStatus(`Cloudflare: ${status}`);
          }
        );

        // Get screenshot
        setScanStatus('Fetching screenshot...');
        const screenshotUrl = await cloudflareUrlScanner.getScreenshotUrl(cloudflareResult.task.uuid, 'desktop');

        // Transform Cloudflare result to AnalysisResult format
        const analysisResult = transformCloudflareResult(cloudflareResult, urlInput, screenshotUrl);
        
        setScanStatus('');
        onAnalysisComplete(analysisResult);

        // Show results based on threat level
        if (analysisResult.threatLevel === 'dangerous') {
          toast.error(t('scamAnalyzer.highThreatDetected', 'High threat detected! Please be extremely cautious.'));
        } else if (analysisResult.threatLevel === 'suspicious') {
          toast.warning(t('scamAnalyzer.suspiciousContent', 'Suspicious content detected. Proceed with caution.'));
        } else {
          toast.success(t('scamAnalyzer.contentSafe', 'Content appears safe, but always stay vigilant!'));
        }

        setIsProcessing(false);
        return;
      } catch (cloudflareError: any) {
        console.warn('Cloudflare URL Scanner failed, falling back to backend:', cloudflareError);
        toast.warning('Cloudflare scan failed, using backend analysis...');
        // Fall through to backend analysis
      }
    }

    // Fallback to existing backend analysis
    try {
      setScanStatus('Analyzing with backend...');
      const response = await analyzeContent('url', urlInput);
      const analysisResult = response.analysisResult;
      setScanStatus('');
      onAnalysisComplete(analysisResult);

      // Show results based on Generative LLM AI analysis
      if (analysisResult.threatLevel === 'dangerous') {
        toast.error(t('scamAnalyzer.highThreatDetected', 'High threat detected! Please be extremely cautious.'));
      } else if (analysisResult.threatLevel === 'suspicious') {
        toast.warning(t('scamAnalyzer.suspiciousContent', 'Suspicious content detected. Proceed with caution.'));
      } else {
        toast.success(t('scamAnalyzer.contentSafe', 'Content appears safe, but always stay vigilant!'));
      }
    } catch (err: any) {
      console.error('Error analyzing URL:', err);
      const errorMsg = t('scamAnalyzer.failedToAnalyze', 'Failed to analyze {{type}}. {{message}}', { 
        type: 'url', 
        message: err.message || t('scamAnalyzer.pleaseTryAgain', 'Please try again.') 
      });
      onError(errorMsg);
      toast.error(t('scamAnalyzer.analysisFailed', 'Analysis failed: {{message}}', { 
        message: err.message || t('scamAnalyzer.serverError', 'Server error. Please check your Generative LLM API key configuration (Gemini or ChatGPT).') 
      }));
    } finally {
      setIsProcessing(false);
      setScanStatus('');
    }
  };

  return (
    <div className="relative z-10 space-y-4">
      <div className="relative">
        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Enter website URL (e.g., https://example.com)"
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base placeholder:text-gray-400"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Deep analysis: Screenshots, Network Stats, Tech Detection & More
        {cloudflareUrlScanner.isConfigured() && (
          <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">
            (Powered by Cloudflare)
          </span>
        )}
      </p>
      {scanStatus && (
        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
          {scanStatus}
        </div>
      )}
      <button
        onClick={handleAnalysis}
        disabled={!urlInput.trim() || isProcessing}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{scanStatus || t('scamAnalyzer.analyzing')}</span>
          </>
        ) : (
          <>
            <Globe className="w-5 h-5" />
            <span>{t('scamAnalyzer.analyzeUrl')}</span>
          </>
        )}
      </button>
    </div>
  );
}

