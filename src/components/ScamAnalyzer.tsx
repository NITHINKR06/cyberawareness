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
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          {t('scamAnalyzer.title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">{t('scamAnalyzer.subtitle')}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Powered by Generative LLM (Gemini/ChatGPT)
          </span>
        </div>
      </div>

      {/* Input Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 py-3 px-4 font-medium transition-colors ${
              activeTab === 'text'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('scamAnalyzer.analyzeText')}</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 py-3 px-4 font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t('scamAnalyzer.analyzeUrl')}</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 py-3 px-4 font-medium transition-colors ${
              activeTab === 'image'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
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
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t('scamAnalyzer.imageAnalysis', 'Image Analysis')}
            </h3>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-4">
              {t('scamAnalyzer.comingSoon', 'Coming Soon')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              {t('scamAnalyzer.imageComingSoonDesc', "We're working on adding image analysis with OCR and AI-powered threat detection. This feature will extract text from images and analyze them for potential scams and threats.")}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
              <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
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

