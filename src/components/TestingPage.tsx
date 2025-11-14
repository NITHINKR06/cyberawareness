import { useState } from 'react';
import { 
  TestTube,
  Loader2,
  Copy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';
import { analyzeContent } from '../services/backendApi';
import { toast } from 'react-toastify';

/**
 * TESTING PAGE - FOR DEVELOPMENT/TESTING ONLY
 * This page is separate from production code and can be easily removed
 * Access via /test route
 */

interface TestResult {
  rawResponse?: any;
  analysisResult?: {
    threatLevel: 'safe' | 'suspicious' | 'dangerous';
    confidence: number;
    indicators: string[];
    recommendations: string[];
    summary?: string;
    source?: string;
    isHardcoded?: boolean;
    warning?: string;
    error?: string;
  };
  error?: string;
  timestamp: string;
}

export default function TestingPage() {
  const [testInput, setTestInput] = useState<string>('');
  const [testType, setTestType] = useState<'text' | 'url'>('text');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestProcessing, setIsTestProcessing] = useState(false);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);

  // Predefined test cases for quick testing
  const testCases = {
    text: {
      dangerous: [
        "URGENT: Your bank account will be suspended in 24 hours! Click here to verify: http://fake-bank-security.com/verify",
        "Congratulations! You've won $1,000,000! Claim your prize now by sending your bank details and OTP code to claim@prize.com",
        "Your account has been compromised. Immediate action required! Verify your identity by providing your SSN and date of birth at secure-verify.com",
        "WARNING: Your PayPal account will be closed permanently. Click here immediately: http://paypal-security-update.com/login"
      ],
      suspicious: [
        "Hi, I'm calling from Microsoft support. Your computer has a virus. Please download our software to fix it.",
        "Limited time offer! Get 50% off on all products. Click here before the offer expires tomorrow.",
        "Your package delivery failed. Please update your payment information at delivery-update.net",
        "Your Netflix subscription is about to expire. Update your payment method now to avoid interruption."
      ],
      safe: [
        "Hello, this is a legitimate message from your bank. Your monthly statement is ready for review.",
        "Thank you for your purchase. Your order #12345 has been shipped and will arrive on Monday.",
        "Meeting reminder: Team standup at 10 AM tomorrow in Conference Room B.",
        "Your appointment with Dr. Smith is scheduled for next Tuesday at 2:00 PM."
      ]
    },
    url: {
      dangerous: [
        "http://bank-security-verify-now.com/update",
        "https://prize-claim-winner.com/claim-now",
        "http://secure-account-verify.net/login",
        "http://paypal-security-urgent.com/verify"
      ],
      suspicious: [
        "https://delivery-update-package.com/track",
        "http://tech-support-fix.com/download",
        "https://limited-offer-sale.net/shop",
        "https://netflix-payment-update.com/account"
      ],
      safe: [
        "https://www.google.com",
        "https://github.com",
        "https://stackoverflow.com",
        "https://www.microsoft.com"
      ]
    }
  };

  const handleTestCase = (content: string, type: 'text' | 'url') => {
    setTestInput(content);
    setTestType(type);
    setTestResult(null);
  };

  const handleTestAnalysis = async () => {
    if (!testInput.trim()) {
      toast.error('Please enter test content');
      return;
    }

    setIsTestProcessing(true);
    setTestResult(null);

    try {
      console.log('🧪 Starting test analysis...');
      const response = await analyzeContent(testType, testInput);
      console.log('📥 Full API response:', response);
      
      const result: TestResult = {
        rawResponse: response,
        analysisResult: response.analysisResult,
        timestamp: new Date().toISOString()
      };
      
      // Check if response is from Hugging Face or fallback
      const source = response.analysisResult?.source || 'unknown';
      const isFromHuggingFace = source.includes('huggingface') || source.includes('hugging_face');
      const isFallback = source.includes('fallback') || source.includes('pattern_analysis') || source.includes('hardcoded');
      
      console.log('🔍 Analysis source:', source);
      console.log('🤖 From Hugging Face:', isFromHuggingFace);
      console.log('⚠️  Is Fallback:', isFallback);
      
      setTestResult(result);
      setTestHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10 tests
      
      if (isFallback) {
        toast.warning('⚠️ Using fallback analysis - Hugging Face API may not be configured!');
      } else if (isFromHuggingFace) {
        toast.success('✅ Analysis completed using Hugging Face AI!');
      } else {
        toast.success('Test analysis completed!');
      }
    } catch (err: any) {
      console.error('Test analysis error:', err);
      const errorResult: TestResult = {
        error: err.message || 'Test failed',
        timestamp: new Date().toISOString()
      };
      setTestResult(errorResult);
      setTestHistory(prev => [errorResult, ...prev].slice(0, 10));
      toast.error(`Test failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTestProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clearHistory = () => {
    setTestHistory([]);
    toast.info('Test history cleared');
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
      case 'safe': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'suspicious': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'dangerous': return <XCircle className="w-6 h-6 text-red-600" />;
      default: return <Shield className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <TestTube className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          <h1 className="text-3xl font-bold text-yellow-800 dark:text-yellow-300">
            🧪 Testing & Development Page
          </h1>
        </div>
        <p className="text-yellow-700 dark:text-yellow-400">
          This page is for testing the scam analyzer functionality. It is separate from production code and can be easily removed.
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
          ⚠️ This page should be removed or protected before production deployment.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Test Input */}
        <div className="space-y-6">
          {/* Quick Test Cases */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Quick Test Cases
            </h2>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Text Examples</h3>
              <div className="grid gap-2">
                <div>
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Dangerous</p>
                  <div className="space-y-1">
                    {testCases.text.dangerous.map((test, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTestCase(test, 'text')}
                        className="w-full text-left text-xs p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        {test.substring(0, 60)}...
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Suspicious</p>
                  <div className="space-y-1">
                    {testCases.text.suspicious.map((test, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTestCase(test, 'text')}
                        className="w-full text-left text-xs p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                      >
                        {test.substring(0, 60)}...
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Safe</p>
                  <div className="space-y-1">
                    {testCases.text.safe.map((test, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTestCase(test, 'text')}
                        className="w-full text-left text-xs p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        {test.substring(0, 60)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL Examples</h3>
              <div className="grid md:grid-cols-3 gap-2">
                {Object.entries(testCases.url).map(([level, urls]) => (
                  <div key={level}>
                    <p className="text-xs font-medium mb-1 capitalize">{level}</p>
                    {urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTestCase(url, 'url')}
                        className="w-full text-left text-xs p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mb-1"
                      >
                        {url}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Test Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Custom Test Input
            </h2>
            
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setTestType('text')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  testType === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setTestType('url')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  testType === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                URL
              </button>
            </div>

            {testType === 'text' ? (
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter test text here or click a test case above..."
                className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
              />
            ) : (
              <input
                type="url"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter test URL here or click a test case above..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
            )}

            <button
              onClick={handleTestAnalysis}
              disabled={!testInput.trim() || isTestProcessing}
              className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isTestProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-5 h-5" />
                  Run Test Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Test Results */}
        <div className="space-y-6">
          {/* Current Test Result */}
          {testResult && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Test Results
                </h2>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Copy results"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              {testResult.error ? (
                <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="font-medium mb-1">Error:</p>
                  <p>{testResult.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResult.analysisResult && (
                    <>
                      {/* Source Indicator - Make it VERY obvious */}
                      <div className={`mb-4 p-4 rounded-lg border-2 ${
                        testResult.analysisResult.source?.includes('huggingface') || testResult.analysisResult.source?.includes('hugging_face')
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-800 dark:text-green-300'
                          : testResult.analysisResult.isHardcoded || testResult.analysisResult.source?.includes('fallback') || testResult.analysisResult.source?.includes('pattern_analysis') || testResult.analysisResult.source?.includes('hardcoded')
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300 animate-pulse'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-400 text-gray-800 dark:text-gray-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          {(testResult.analysisResult.source?.includes('huggingface') || testResult.analysisResult.source?.includes('hugging_face')) ? (
                            <>
                              <CheckCircle className="w-6 h-6" />
                              <div>
                                <p className="font-bold text-lg">✅ Using Hugging Face AI</p>
                                <p className="text-sm">Real AI analysis from Hugging Face model</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-6 h-6" />
                              <div>
                                <p className="font-bold text-lg">❌ NOT USING HUGGING FACE AI</p>
                                <p className="text-sm font-semibold">This is HARDCODED pattern matching, NOT real AI!</p>
                                <p className="text-xs mt-1">
                                  {testResult.analysisResult.warning || 
                                   (testResult.analysisResult.source?.includes('no_api_key')
                                    ? 'Hugging Face API key not configured - using predefined keyword matching'
                                    : 'Hugging Face API unavailable - using predefined keyword matching')}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                          <p className="text-xs font-mono font-bold">Source: {testResult.analysisResult.source || 'unknown'}</p>
                          {testResult.analysisResult.isHardcoded && (
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                              ⚠️ HARDCODED DATA - NOT AI ANALYSIS
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={`border-2 rounded-lg p-4 ${getThreatLevelColor(testResult.analysisResult.threatLevel)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getThreatLevelIcon(testResult.analysisResult.threatLevel)}
                            <div>
                              <p className="text-sm font-medium">Threat Level</p>
                              <p className="text-xl font-bold capitalize">{testResult.analysisResult.threatLevel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Confidence</p>
                            <p className="text-xl font-bold">{testResult.analysisResult.confidence}%</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Indicators</h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {testResult.analysisResult.indicators?.map((ind: string, idx: number) => (
                            <li key={idx}>{ind}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Recommendations</h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {testResult.analysisResult.recommendations?.map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>

                      {testResult.analysisResult.summary && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">AI Summary</h3>
                          <p className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap">
                            {testResult.analysisResult.summary}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-2">
                      View Full Raw Response (JSON)
                    </summary>
                    <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-auto max-h-96 border border-gray-200 dark:border-gray-700">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </details>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Tested at: {new Date(testResult.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Test History */}
          {testHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Test History (Last 10)
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testHistory.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setTestResult(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.analysisResult ? (
                          getThreatLevelIcon(result.analysisResult.threatLevel)
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="text-sm font-medium">
                          {result.analysisResult
                            ? `${result.analysisResult.threatLevel.toUpperCase()} (${result.analysisResult.confidence}%)`
                            : 'ERROR'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
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

