import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, MessageSquare, Image as ImageIcon, XCircle } from 'lucide-react';
import { AnalysisResult } from './scamAnalyzer/types';
import TextAnalyzer from './scamAnalyzer/TextAnalyzer';
import UrlAnalyzer from './scamAnalyzer/UrlAnalyzer';
import TextAnalysisResult from './scamAnalyzer/TextAnalysisResult';
import UrlAnalysisResult from './scamAnalyzer/UrlAnalysisResult';

export default function ScamAnalyzer() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'text' | 'url' | null>(null);

  const handleTextAnalysisComplete = (analysisResult: AnalysisResult) => {
    setResult(analysisResult);
    setAnalysisType('text');
    setError(null);
  };

  const handleUrlAnalysisComplete = (analysisResult: AnalysisResult) => {
    setResult(analysisResult);
    setAnalysisType('url');
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
    setAnalysisType(null);
  };



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
          <TextAnalyzer
            onAnalysisComplete={handleTextAnalysisComplete}
            onError={handleError}
          />
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <UrlAnalyzer
            onAnalysisComplete={handleUrlAnalysisComplete}
            onError={handleError}
          />
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

      {result && analysisType === 'text' && (
        <TextAnalysisResult result={result} />
      )}

      {result && analysisType === 'url' && (
        <UrlAnalysisResult result={result} />
      )}
    </div>
  );
}

