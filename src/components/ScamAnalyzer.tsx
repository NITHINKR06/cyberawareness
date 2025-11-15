 import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Loader2,
  Globe,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { analyzeContent, ocrService } from '../services/backendApi';
import { toast } from 'react-toastify';
import MarkdownRenderer from './MarkdownRenderer';

interface AnalysisResult {
  threatScore?: number; // 0-10 threat score
  threatLevel: 'safe' | 'suspicious' | 'dangerous';
  confidence: number;
  verdict?: string;
  reasoning?: string;
  indicators: string[];
  recommendations: string[];
  summary?: string;
  ocrConfidence?: number;
  extractedText?: string;
  source?: string;
}

export default function ScamAnalyzer() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text');
  const [textInput, setTextInput] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic validation only - no pattern matching, let Generative LLM AI do the analysis
  const validateBasicInput = (type: 'text' | 'url', content: string): { isValid: boolean; error?: string } => {
    if (!content || !content.trim()) {
      return { isValid: false, error: type === 'url' ? 'Please enter a URL to analyze' : 'Please enter text to analyze' };
    }

    if (type === 'url') {
      // Only validate URL format, no threat detection (Generative LLM will do that)
      try {
        const urlObj = new URL(content);
        // Check for valid protocol
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          return { isValid: false, error: 'URL must start with http:// or https://' };
        }
        // Basic length check
        if (content.length > 2000) {
          return { isValid: false, error: 'URL is too long (maximum 2000 characters)' };
        }
      } catch (e) {
        return { isValid: false, error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://' };
      }
    } else {
      // Basic length checks for text
      if (content.trim().length < 3) {
        return { isValid: false, error: 'Text is too short. Please enter at least 3 characters.' };
      }
      if (content.length > 10000) {
        return { isValid: false, error: 'Text is too long. Maximum 10,000 characters allowed.' };
      }
    }

    return { isValid: true };
  };

  const handleAnalysis = async (type: 'text' | 'url', content: string) => {
    // Basic validation only - no pattern matching, let Hugging Face AI do the analysis
    const validation = validateBasicInput(type, content);
    if (!validation.isValid) {
      setError(validation.error || t('scamAnalyzer.invalidInput', 'Invalid input'));
      toast.error(validation.error || t('scamAnalyzer.invalidInput', 'Invalid input'));
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Send directly to backend - Generative LLM AI will do all threat analysis
      const response = await analyzeContent(type, content);
      const analysisResult = response.analysisResult;
      setResult(analysisResult);

      // Show results based on Generative LLM AI analysis
      if (analysisResult.threatLevel === 'dangerous') {
        toast.error(t('scamAnalyzer.highThreatDetected', 'High threat detected! Please be extremely cautious.'));
      } else if (analysisResult.threatLevel === 'suspicious') {
        toast.warning(t('scamAnalyzer.suspiciousContent', 'Suspicious content detected. Proceed with caution.'));
      } else {
        toast.success(t('scamAnalyzer.contentSafe', 'Content appears safe, but always stay vigilant!'));
      }
    } catch (err: any) {
      console.error(`Error analyzing ${type}:`, err);
      setError(t('scamAnalyzer.failedToAnalyze', 'Failed to analyze {{type}}. {{message}}', { type, message: err.message || t('scamAnalyzer.pleaseTryAgain', 'Please try again.') }));
      toast.error(t('scamAnalyzer.analysisFailed', 'Analysis failed: {{message}}', { message: err.message || t('scamAnalyzer.serverError', 'Server error. Please check your Generative LLM API key configuration (Gemini or ChatGPT).') }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Extract text from image using OCR
      const response = await ocrService.uploadImage(selectedImage);
      const extractedText = response.text;
      
      if (!extractedText || !extractedText.trim()) {
        toast.warning('No text found in the image. Please try with a different image.');
        return;
      }

      // Step 2: Populate the text area and switch to text tab
      setTextInput(extractedText);
      setActiveTab('text');
      toast.success(t('scamAnalyzer.textExtracted', 'Text extracted! Analyzing with Generative LLM AI...'));

      // Step 3: Automatically analyze the extracted text using Generative LLM AI
      // The backend will use enhanced text analysis which works perfectly for image-extracted text
      const analysisResponse = await analyzeContent('text', extractedText);
      const analysisResult = analysisResponse.analysisResult;
      
      // Add OCR-specific information to the result
      analysisResult.ocrConfidence = response.confidence;
      analysisResult.extractedText = extractedText;
      analysisResult.sourceType = 'image'; // Track that this came from image OCR
      
      setResult(analysisResult);
      
      // Show appropriate toast based on threat level from Generative LLM AI
      if (analysisResult.threatLevel === 'dangerous') {
        toast.error(t('scamAnalyzer.highThreatImage', 'High threat detected in image! Please be extremely cautious.'));
      } else if (analysisResult.threatLevel === 'suspicious') {
        toast.warning(t('scamAnalyzer.suspiciousImageReview', 'Suspicious content detected in image. Please review the analysis.'));
      } else {
        toast.success(t('scamAnalyzer.imageSafe', 'Image content appears safe based on AI analysis.'));
      }

    } catch (err: any) {
      console.error('Error processing image:', err);
      setError(t('scamAnalyzer.failedToProcessImage', 'Failed to process image. {{message}}', { message: err.message || t('scamAnalyzer.pleaseTryAgain', 'Please try again.') }));
      toast.error(t('scamAnalyzer.imageProcessingFailed', 'Image processing failed: {{message}}', { message: err.message || t('scamAnalyzer.serverError', 'Server error') }));
    } finally {
      setIsProcessing(false);
    }
  };


  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200';
      case 'suspicious': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'dangerous': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case 'safe': return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'suspicious': return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      case 'dangerous': return <XCircle className="w-8 h-8 text-red-600" />;
      default: return <Shield className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('scamAnalyzer.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('scamAnalyzer.subtitle')}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-2">
          🤖 Powered by Generative LLM (Gemini/ChatGPT) - Advanced threat detection with detailed scoring (0-10)
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('text')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${activeTab === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            <MessageSquare className="w-5 h-5" /> {t('scamAnalyzer.analyzeText')}
          </button>
          <button onClick={() => setActiveTab('url')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${activeTab === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            <Globe className="w-5 h-5" /> {t('scamAnalyzer.analyzeUrl')}
          </button>
          <button onClick={() => setActiveTab('image')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${activeTab === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            <ImageIcon className="w-5 h-5" /> Analyze Image
          </button>
        </div>

        {activeTab === 'text' && (
          <div>
            <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder={t('scamAnalyzer.textPlaceholder')} className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            <button onClick={() => handleAnalysis('text', textInput || '')} disabled={!(textInput || '').trim() || isProcessing} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />{t('scamAnalyzer.analyzing')}</>) : (<><Shield className="w-5 h-5" />{t('scamAnalyzer.analyze')}</>)}
            </button>
          </div>
        )}
        
        {activeTab === 'url' && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Globe className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('scamAnalyzer.urlChecking', 'URL Checking')}</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{t('scamAnalyzer.comingSoon', 'Coming Soon')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mx-auto">
              {t('scamAnalyzer.urlComingSoonDesc', "We're working on adding URL threat intelligence checking. This feature will analyze URLs for phishing, malware, and other security threats.")}
            </p>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <ImageIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('scamAnalyzer.imageAnalysis', 'Image Analysis')}</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{t('scamAnalyzer.comingSoon', 'Coming Soon')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mx-auto">
              {t('scamAnalyzer.imageComingSoonDesc', "We're working on adding image analysis with OCR and AI-powered threat detection. This feature will extract text from images and analyze them for potential scams and threats.")}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('scamAnalyzer.results')}</h2>
          <div className={`border-2 rounded-lg p-6 mb-6 ${getThreatLevelColor(result.threatLevel)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getThreatLevelIcon(result.threatLevel)}
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('scamAnalyzer.threatLevel')}</p>
                  <p className="text-2xl font-bold capitalize">{t(`scamAnalyzer.${result.threatLevel}`)}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                {result.threatScore !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Threat Score</p>
                    <p className="text-2xl font-bold">{result.threatScore}/10</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('scamAnalyzer.confidence')}</p>
                  <p className="text-2xl font-bold">{result.confidence}%</p>
                </div>
                {result.ocrConfidence && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">OCR Confidence</p>
                    <p className="text-sm font-medium">{(result.ocrConfidence * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </div>
            {result.threatScore !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Threat Score</span>
                  <span>{result.threatScore}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.threatScore <= 2 ? 'bg-green-500' : 
                      result.threatScore <= 4 ? 'bg-yellow-500' : 
                      result.threatScore <= 6 ? 'bg-orange-500' : 
                      result.threatScore <= 8 ? 'bg-red-500' : 'bg-red-700'
                    }`} 
                    style={{ width: `${(result.threatScore / 10) * 100}%` }} 
                  />
                </div>
              </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-full rounded-full transition-all duration-500 ${result.threatLevel === 'safe' ? 'bg-green-500' : result.threatLevel === 'suspicious' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${result.confidence}%` }} />
            </div>
            {result.verdict && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Verdict:</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{result.verdict}</p>
              </div>
            )}
            {result.reasoning && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Detailed Reasoning:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{result.reasoning}</p>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" /> {t('scamAnalyzer.indicators')}</h3>
              <ul className="space-y-2">
                {result.indicators.map((indicator, index) => (<li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><span className="text-orange-500 mt-1">•</span> {indicator}</li>))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500" /> {t('scamAnalyzer.recommendations')}</h3>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (<li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><span className="text-blue-500 mt-1">✓</span> {recommendation}</li>))}
              </ul>
            </div>
          </div>
          
          {result.extractedText && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Extracted Text from Image</p>
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {result.extractedText}
              </div>
            </div>
          )}
          
          {result.summary && (
            <div className="mt-6 relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-700/50 shadow-lg">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
              
              {/* Content */}
              <div className="relative p-6">
                {/* Header with icon and badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {t('scamAnalyzer.aiSummary', 'AI Summary')}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('scamAnalyzer.intelligentAnalysis', 'Intelligent analysis powered by advanced AI')}
                      </p>
                    </div>
                  </div>
                  
                  {/* AI Provider Badge */}
                  {result.source && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-blue-200 dark:border-blue-700/50">
                      <div className={`w-2 h-2 rounded-full ${
                        result.source.includes('gemini') 
                          ? 'bg-gradient-to-r from-orange-400 to-red-500 animate-pulse' 
                          : result.source.includes('chatgpt') || result.source.includes('openai')
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse'
                          : 'bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse'
                      }`}></div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {result.source.includes('gemini') 
                          ? t('scamAnalyzer.poweredByGemini', 'Powered by Gemini')
                          : result.source.includes('chatgpt') || result.source.includes('openai')
                          ? t('scamAnalyzer.poweredByChatGPT', 'Powered by ChatGPT')
                          : t('scamAnalyzer.generativeAi', 'Generative AI')}
                      </span>
                    </div>
                  )}
                </div>
                
                            {/* Summary Content */}
                            <div className="mt-4 p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-blue-100 dark:border-blue-900/50">
                              <MarkdownRenderer content={result.summary} />
                            </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

