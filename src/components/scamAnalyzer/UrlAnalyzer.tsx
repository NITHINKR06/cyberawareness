import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2 } from 'lucide-react';
import { analyzeContent } from '../../services/backendApi';
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

    try {
      const response = await analyzeContent('url', urlInput);
      const analysisResult = response.analysisResult;
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
    }
  };

  return (
    <div className="relative z-10 space-y-6">
      <div className="relative">
        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-500" />
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Enter website URL (e.g., https://example.com)"
          className="w-full pl-16 pr-6 py-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-lg shadow-inner placeholder:text-gray-400"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 ml-2 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
        Deep analysis with Puppeteer: Screenshots, Network Stats, Tech Detection & More
      </p>
      <button
        onClick={handleAnalysis}
        disabled={!urlInput.trim() || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-5 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-purple-600 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>{t('scamAnalyzer.analyzing')}</span>
          </>
        ) : (
          <>
            <Globe className="w-6 h-6" />
            <span>{t('scamAnalyzer.analyzeUrl')}</span>
          </>
        )}
      </button>
    </div>
  );
}

