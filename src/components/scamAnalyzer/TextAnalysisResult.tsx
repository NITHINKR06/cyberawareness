import { CheckCircle, XCircle, AlertCircle, MessageSquare, AlertTriangle, Shield } from 'lucide-react';
import { AnalysisResult } from './types';

interface TextAnalysisResultProps {
  result: AnalysisResult;
}

export default function TextAnalysisResult({ result }: TextAnalysisResultProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-100 dark:border-gray-700">
      {/* Header Section */}
      <div className={`flex items-center gap-6 mb-8 pb-8 border-b-2 ${
        result.threatLevel === 'safe' ? 'border-green-200 dark:border-green-800' :
        result.threatLevel === 'suspicious' ? 'border-yellow-200 dark:border-yellow-800' :
        'border-red-200 dark:border-red-800'
      }`}>
        <div className={`p-5 rounded-2xl ${
          result.threatLevel === 'safe' ? 'bg-green-100 dark:bg-green-900/30' :
          result.threatLevel === 'suspicious' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
          'bg-red-100 dark:bg-red-900/30'
        }`}>
          {result.threatLevel === 'safe' ? (
            <CheckCircle className="w-14 h-14 text-green-600 dark:text-green-400" />
          ) : result.threatLevel === 'suspicious' ? (
            <AlertCircle className="w-14 h-14 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <XCircle className="w-14 h-14 text-red-600 dark:text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-3xl font-bold mb-2 ${
            result.threatLevel === 'safe' ? 'text-green-700 dark:text-green-300' :
            result.threatLevel === 'suspicious' ? 'text-yellow-700 dark:text-yellow-300' :
            'text-red-700 dark:text-red-300'
          }`}>
            {result.verdict || (
              result.threatLevel === 'safe' ? 'Content Appears Safe' :
              result.threatLevel === 'suspicious' ? 'Suspicious Content Detected' :
              'Dangerous Content Detected'
            )}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Threat Score: <span className="font-bold text-xl">{result.threatScore || 0}/10</span>
            {result.confidence !== undefined && (
              <span className="ml-3">• Confidence: <span className="font-bold">{result.confidence}%</span></span>
            )}
          </p>
        </div>
      </div>

      {/* AI Reasoning */}
      {result.reasoning && (
        <div className="mb-8">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
            <MessageSquare className="w-6 h-6" /> AI Analysis
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {result.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {result.summary && (
        <div className="mb-8">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Summary</h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
            <div className="prose prose-base dark:prose-invert max-w-none">
              {result.summary.split(/(?:###|####|\*\*\*\*)/g).filter(Boolean).map((section, idx) => {
                const cleanText = section.replace(/\*\*/g, '').trim();
                if (!cleanText) return null;

                // Check if this looks like a header (short and ends with **)
                const isHeader = section.includes('**') && cleanText.length < 100;

                return isHeader ? (
                  <h5 key={idx} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-5 mb-3 first:mt-0">
                    {cleanText}
                  </h5>
                ) : (
                  <p key={idx} className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {cleanText}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Threat Indicators */}
      {result.indicators && result.indicators.length > 0 && (
        <div className="mb-8">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" /> Threat Indicators
          </h4>
          <ul className="space-y-3">
            {result.indicators.map((indicator, index) => (
              <li key={index} className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                <span className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{indicator}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Recommendations
          </h4>
          <ul className="space-y-3">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

