import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  TrendingUp,
  AlertCircle,
  Image as ImageIcon,
  Lock,
  Unlock,
  Network,
  Server,
  Cookie,
  FileWarning,
  ExternalLink,
  Code,
  Layout
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
                  <div className="space-y-2">
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
                    {result.security?.ssl?.daysRemaining !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Expires in {result.security.ssl.daysRemaining} days
                        {result.security.ssl.validTo && ` • Valid until ${new Date(result.security.ssl.validTo).toLocaleDateString()}`}
                      </p>
                    )}
                    {result.security?.ssl?.protocol && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Protocol: {result.security.ssl.protocol} • Cipher: {result.security.ssl.cipher || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Security Headers</span>
                  <div className="space-y-2">
                    {result.security?.headersAnalysis?.present && result.security.headersAnalysis.present.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.security.headersAnalysis.present.map((header, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded border border-green-200 dark:border-green-800" title={header.value}>
                            <CheckCircle className="w-3 h-3 inline mr-1" /> {header.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {result.security?.headersAnalysis?.missing && result.security.headersAnalysis.missing.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.security.headersAnalysis.missing.map((header, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded border border-red-200 dark:border-red-800">
                            <XCircle className="w-3 h-3 inline mr-1" /> {header}
                          </span>
                        ))}
                      </div>
                    )}
                    {result.security?.headersAnalysis?.weak && result.security.headersAnalysis.weak.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.security.headersAnalysis.weak.map((header, idx) => (
                          <span key={idx} className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs rounded border border-yellow-200 dark:border-yellow-800" title={header.issue}>
                            <AlertTriangle className="w-3 h-3 inline mr-1" /> {header.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {(!result.security?.headersAnalysis && (!result.security?.headers || Object.values(result.security.headers).every(v => !v))) && (
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

          {/* Vulnerabilities Section */}
          {result.security?.vulnerabilities && result.security.vulnerabilities.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
                <FileWarning className="w-5 h-5" /> Security Vulnerabilities
              </h3>
              <div className="space-y-3">
                {result.security.vulnerabilities.map((vuln, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    vuln.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' :
                    vuln.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' :
                    'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        vuln.severity === 'high' ? 'bg-red-500' :
                        vuln.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{vuln.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{vuln.description}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                          vuln.severity === 'high' ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' :
                          vuln.severity === 'medium' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                          'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                        }`}>
                          {vuln.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Port Scanning Results */}
          {result.security?.ports && (result.security.ports.open.length > 0 || result.security.ports.weak.length > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Port Scan Results
              </h3>
              <div className="space-y-4">
                {result.security.ports.weak.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400 block mb-2 flex items-center gap-1">
                      <Unlock className="w-4 h-4" /> Weak Ports ({result.security.ports.weak.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.security.ports.weak.map((port, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-sm border border-red-200 dark:border-red-800">
                          {port.name} ({port.port})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.security.ports.secure.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 block mb-2 flex items-center gap-1">
                      <Lock className="w-4 h-4" /> Secure Ports ({result.security.ports.secure.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.security.ports.secure.map((port, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm border border-green-200 dark:border-green-800">
                          {port.name} ({port.port})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cookie Security */}
          {result.security?.cookies && result.security.cookies.total > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Cookie Security
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Cookies</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.security.cookies.total}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Secure</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">{result.security.cookies.secure}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">HttpOnly</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{result.security.cookies.httpOnly}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SameSite</p>
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{result.security.cookies.sameSite}</p>
                </div>
              </div>
              {result.page?.cookieDetails && result.page.cookieDetails.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cookie Details:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.page.cookieDetails.map((cookie, idx) => (
                      <div key={idx} className="text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                        <span className="font-mono font-medium">{cookie.name}</span>
                        <div className="flex gap-2 mt-1">
                          {cookie.secure && <span className="text-green-600 dark:text-green-400">Secure</span>}
                          {cookie.httpOnly && <span className="text-blue-600 dark:text-blue-400">HttpOnly</span>}
                          {cookie.sameSite && <span className="text-purple-600 dark:text-purple-400">SameSite: {cookie.sameSite}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mixed Content */}
          {result.security?.mixedContent && result.security.mixedContent.count > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Mixed Content Detected
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Found {result.security.mixedContent.count} HTTP resource(s) loaded on HTTPS page
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {result.security.mixedContent.resources.map((resource, idx) => (
                  <div key={idx} className="text-xs p-2 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-800 font-mono break-all">
                    {resource}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Page Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Page Analysis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Forms</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.page?.forms || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">iFrames</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.page?.iframes || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scripts</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.page?.scripts?.length || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">External Links</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.page?.externalLinks?.length || 0}</p>
              </div>
            </div>
            {result.page?.externalLinks && result.page.externalLinks.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" /> External Links:
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {result.page.externalLinks.slice(0, 10).map((link, idx) => (
                    <div key={idx} className="text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                        {link.url}
                      </a>
                      {link.text && <p className="text-gray-500 dark:text-gray-400 mt-1 truncate">{link.text}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.page?.consoleLogDetails && result.page.consoleLogDetails.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <Code className="w-4 h-4" /> Console Logs:
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {result.page.consoleLogDetails.map((log, idx) => (
                    <div key={idx} className={`text-xs p-2 rounded border ${
                      log.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      log.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                      'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}>
                      <span className="font-medium">{log.type}:</span> {log.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
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

