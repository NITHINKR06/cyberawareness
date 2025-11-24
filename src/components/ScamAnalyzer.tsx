import { useState } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';
import { analyzeContent } from '../services/backendApi';
import { toast } from 'react-toastify';

interface AnalysisResult {
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

  // Legacy fields support
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

  // For image upload (Coming Soon)
  // const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);

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

  /* 
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
  */



  return (
    <div className="max-w-5xl mx-auto">
      {/* Premium Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
          {t('scamAnalyzer.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 font-medium">{t('scamAnalyzer.subtitle')}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-full backdrop-blur-sm">
          <span className="text-2xl">🤖</span>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Powered by Generative LLM (Gemini/ChatGPT)
          </span>
        </div>
      </div>

      {/* Glassmorphic Input Container */}
      <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 mb-8 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

        {/* Premium Segmented Tabs */}
        <div className="relative z-10 flex gap-3 mb-8 p-2 bg-gray-100/80 dark:bg-gray-900/50 rounded-2xl backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${activeTab === 'text'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:scale-102'
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>{t('scamAnalyzer.analyzeText')}</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${activeTab === 'url'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:scale-102'
              }`}
          >
            <Globe className="w-5 h-5" />
            <span>{t('scamAnalyzer.analyzeUrl')}</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${activeTab === 'image'
                ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/50 scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:scale-102'
              }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>Analyze Image</span>
          </button>
        </div>

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div className="relative z-10 space-y-6">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t('scamAnalyzer.textPlaceholder')}
              className="w-full h-48 px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-lg shadow-inner placeholder:text-gray-400"
            />
            <button
              onClick={() => handleAnalysis('text', textInput || '')}
              disabled={!(textInput || '').trim() || isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{t('scamAnalyzer.analyzing')}</span>
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  <span>{t('scamAnalyzer.analyze')}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
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
              onClick={() => handleAnalysis('url', urlInput || '')}
              disabled={!(urlInput || '').trim() || isProcessing}
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
        )}

        {/* Image Tab */}
        {activeTab === 'image' && (
          <div className="relative z-10 text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 backdrop-blur-sm border border-pink-300 dark:border-pink-800 mb-6">
              <ImageIcon className="w-12 h-12 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-3xl font-black text-gray-800 dark:text-gray-200 mb-3">
              {t('scamAnalyzer.imageAnalysis', 'Image Analysis')}
            </h3>
            <p className="text-xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text mb-6">
              {t('scamAnalyzer.comingSoon', 'Coming Soon')}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
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
        <div className="space-y-8">
          {/* Hero Header Section - Ultra Premium */}
          <div className={`relative overflow-hidden rounded-3xl shadow-2xl p-8 md:p-12 text-white animate-fade-in-up ${result.threatLevel === 'safe' ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 animate-gradient' :
            result.threatLevel === 'suspicious' ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 animate-gradient' :
              'bg-gradient-to-br from-red-600 via-rose-700 to-pink-800 animate-gradient'
            }`}>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-overlay"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md border ${result.threatLevel === 'safe' ? 'bg-emerald-400/20 border-emerald-300/30 text-emerald-50' :
                    result.threatLevel === 'suspicious' ? 'bg-amber-400/20 border-amber-300/30 text-amber-50' :
                      'bg-red-400/20 border-red-300/30 text-red-50'
                    }`}>
                    {result.verdict}
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 border border-white/10 backdrop-blur-md text-white/90 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> {result.domain?.ip || 'IP Hidden'}
                  </span>
                </div>

                <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg break-all leading-tight">
                  {result.domain?.name || result.url}
                </h2>

                <div className="flex items-center gap-2 text-white/80 text-sm font-medium max-w-2xl">
                  <span className="opacity-60">Scanned URL:</span>
                  <span className="truncate">{result.finalUrl}</span>
                </div>
              </div>

              {/* Score Card */}
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-2xl min-w-[140px] transform hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * (result.security?.score || 0) / 100)} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-3xl font-black tracking-tighter">{result.security?.score}</span>
                    <span className="text-[10px] uppercase font-bold opacity-70">Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Visuals & Quick Stats (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Screenshot Card - Browser Style */}
              <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up delay-100">
                <div className="bg-gray-100 dark:bg-gray-900 px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
                  </div>
                  <div className="flex-1 mx-2 bg-white dark:bg-gray-800 rounded-lg h-8 text-xs flex items-center px-4 text-gray-400 truncate shadow-inner font-mono">
                    <span className="text-green-500 mr-2">🔒</span> {result.finalUrl}
                  </div>
                </div>
                <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-900 overflow-hidden">
                  {result.screenshot ? (
                    <img src={result.screenshot} alt="Site Preview" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                      <span className="text-sm font-medium opacity-50">Preview Unavailable</span>
                    </div>
                  )}
                  {/* Glass Overlay Stats */}
                  <div className="absolute inset-x-4 bottom-4 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg flex justify-between items-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="text-center px-2">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Cookies</p>
                      <p className="text-xl font-black text-gray-800 dark:text-gray-100">{result.page?.cookies || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-center px-2">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Console</p>
                      <p className="text-xl font-black text-gray-800 dark:text-gray-100">{result.page?.consoleLogs || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-center px-2">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Requests</p>
                      <p className="text-xl font-black text-gray-800 dark:text-gray-100">{result.network?.requests || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-200">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 shadow-sm">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  Tech Stack
                </h3>
                <div className="space-y-3">
                  {result.technologies && result.technologies.length > 0 ? (
                    result.technologies.map((tech, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-purple-200 dark:hover:border-purple-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-300 hover:-translate-x-1">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-150 transition-transform duration-300"></div>
                          <span className="font-bold text-gray-700 dark:text-gray-200">{tech.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-purple-100 dark:border-purple-800/30">
                          {tech.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                      No technologies detected
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Deep Data (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Domain & Security Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Domain Info */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform duration-700 group-hover:scale-110"></div>
                  <h3 className="relative z-10 text-xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
                      <Globe className="w-6 h-6" />
                    </div>
                    Domain Intelligence
                  </h3>
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Registrar</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-right max-w-[60%] truncate px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg" title={result.domain?.registrar || 'Unknown'}>
                        {result.domain?.registrar || 'Unknown'}
                      </span>
                    </div>
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-700"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">IP Address</span>
                      <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                        {result.domain?.ip || 'Unknown'}
                      </span>
                    </div>
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-700"></div>
                    <div>
                      <span className="text-gray-500 font-medium block mb-2">Page Title</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                        {result.page?.title || 'No Title Detected'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform duration-700 group-hover:scale-110"></div>
                  <h3 className="relative z-10 text-xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <Shield className="w-6 h-6" />
                    </div>
                    Security Status
                  </h3>

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1">SSL Certificate</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                          {result.security?.ssl?.issuer || 'Unknown Issuer'}
                        </span>
                      </div>
                      {result.security?.ssl?.valid ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-bold shadow-sm border border-emerald-200 dark:border-emerald-800/30">
                          <CheckCircle className="w-5 h-5" /> Valid
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-bold shadow-sm border border-red-200 dark:border-red-800/30">
                          <XCircle className="w-5 h-5" /> Invalid
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-3">Security Headers</p>
                      <div className="flex flex-wrap gap-2">
                        {result.security?.headers && Object.entries(result.security.headers).map(([key, value]) => (
                          value ? (
                            <div key={key} className="group/header relative">
                              <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-800 cursor-help transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-sm">
                                {key}
                              </span>
                            </div>
                          ) : null
                        ))}
                        {(!result.security?.headers || Object.values(result.security.headers).every(v => !v)) && (
                          <span className="text-sm text-gray-400 italic flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> No security headers found
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Stats - Visual Charts */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-400">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400 shadow-sm">
                    <Globe className="w-6 h-6" />
                  </div>
                  Network Activity
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="p-5 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/30 text-center transform hover:scale-105 transition-transform duration-300">
                    <p className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-1 tracking-tighter">{result.network?.requests || 0}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Requests</p>
                  </div>
                  <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 text-center transform hover:scale-105 transition-transform duration-300">
                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-1 tracking-tighter">
                      {result.network?.bytes ? (result.network.bytes / 1024 / 1024).toFixed(2) : 0}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Size (MB)</p>
                  </div>
                  <div className="col-span-2 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Resource Breakdown</p>
                    <div className="space-y-3">
                      {result.network?.types && Object.entries(result.network.types).slice(0, 4).map(([type, count]) => (
                        <div key={type} className="flex items-center gap-3">
                          <span className="w-20 text-xs font-bold text-gray-500 uppercase truncate">{type}</span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, (count / (result.network?.requests || 1)) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="w-8 text-right text-sm font-bold text-gray-700 dark:text-gray-300">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicators Section */}
              {result.indicators && result.indicators.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-3xl p-8 shadow-lg animate-fade-in-up delay-500">
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6" /> Threat Indicators
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.indicators.map((indicator, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-snug">{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

