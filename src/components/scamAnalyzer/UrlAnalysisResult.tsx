import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  TrendingUp,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { AnalysisResult } from './types';

interface UrlAnalysisResultProps {
  result: AnalysisResult;
}

export default function UrlAnalysisResult({ result }: UrlAnalysisResultProps) {
  return (
    <div className="space-y-6">
      {/* Header Section - Simplified */}
      <div className={`border-l-4 p-6 rounded-lg ${
        result.threatLevel === 'safe' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
        result.threatLevel === 'suspicious' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
        'bg-red-50 dark:bg-red-900/20 border-red-500'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                result.threatLevel === 'safe' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' :
                result.threatLevel === 'suspicious' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
              }`}>
                {result.verdict}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Globe className="w-4 h-4" /> {result.domain?.ip || 'IP Hidden'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 break-all">
              {result.domain?.name || result.url}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Scanned URL:</span> {result.finalUrl}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{result.security?.score || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">Security Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Visuals & Quick Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Screenshot Card - Simplified */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">{result.finalUrl}</p>
            </div>
            <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-900">
              {result.screenshot ? (
                <img src={result.screenshot} alt="Site Preview" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-30" />
                  <span className="text-sm">Preview Unavailable</span>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cookies</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{result.page?.cookies || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Console Logs</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{result.page?.consoleLogs || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Requests</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{result.network?.requests || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Tech Stack
            </h3>
            <div className="space-y-2">
              {result.technologies && result.technologies.length > 0 ? (
                result.technologies.map((tech, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{tech.name}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                      {tech.type}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No technologies detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Deep Data (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Domain & Security Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Domain Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Domain Information
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Registrar</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100" title={result.domain?.registrar || 'Unknown'}>
                    {result.domain?.registrar || 'Unknown'}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">IP Address</span>
                  <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                    {result.domain?.ip || 'Unknown'}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Page Title</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                    {result.page?.title || 'No Title Detected'}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Security Status
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">SSL Certificate</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {result.security?.ssl?.issuer || 'Unknown Issuer'}
                    </span>
                    {result.security?.ssl?.valid ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                        <CheckCircle className="w-4 h-4" /> Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-medium">
                        <XCircle className="w-4 h-4" /> Invalid
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Security Headers</span>
                  <div className="flex flex-wrap gap-2">
                    {result.security?.headers && Object.entries(result.security.headers).map(([key, value]) => (
                      value ? (
                        <span key={key} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded border border-blue-200 dark:border-blue-800">
                          {key}
                        </span>
                      ) : null
                    ))}
                    {(!result.security?.headers || Object.values(result.security.headers).every(v => !v)) && (
                      <span className="text-sm text-gray-400 italic flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> No security headers found
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Network Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Network Activity
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{result.network?.requests || 0}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Requests</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {result.network?.bytes ? (result.network.bytes / 1024 / 1024).toFixed(2) : 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Size (MB)</p>
              </div>
              <div className="col-span-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">Resource Breakdown</p>
                <div className="space-y-2">
                  {result.network?.types && Object.entries(result.network.types).slice(0, 4).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className="w-16 text-xs text-gray-600 dark:text-gray-400 truncate">{type}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (count / (result.network?.requests || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-xs font-medium text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Indicators Section */}
          {result.indicators && result.indicators.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Threat Indicators
              </h3>
              <div className="space-y-2">
                {result.indicators.map((indicator, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{indicator}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

