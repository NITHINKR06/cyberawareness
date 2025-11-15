import { useState, useRef, useEffect } from 'react';
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
import { analyzeContent, ocrService, configService } from '../services/backendApi';
import { toast } from 'react-toastify';

interface ThreatLevelConfig {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  toastType: string;
  toastMessage: string;
  cssClasses: {
    container: string;
    icon: string;
    progressBar: string;
  };
}

interface ValidationRules {
  threatLevels: {
    [key: string]: ThreatLevelConfig;
  };
  recommendations: {
    [key: string]: string[];
  };
}

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
  threatConfig?: ThreatLevelConfig;
  source?: string;
}

export default function ScamAnalyzerConfigurable() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text');
  const [textInput, setTextInput] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationRules, setValidationRules] = useState<ValidationRules | null>(null);

  // For image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch validation rules on component mount
  useEffect(() => {
    fetchValidationRules();
  }, []);

  const fetchValidationRules = async () => {
    try {
      const data = await configService.getValidationRules();
      if (data.success) {
        setValidationRules(data.rules);
      }
    } catch (err: any) {
      console.error('Failed to fetch validation rules:', err);
      if (err.code === 'ERR_NETWORK') {
        console.warn('Backend server is not running. Using default validation rules.');
      }
      // Use default rules if fetch fails
    }
  };

  const validateText = (text: string): { warnings: string[]; threatLevel?: 'high' | 'medium' | 'low' } => {
    const warnings: string[] = [];
    let maxThreatLevel: 'high' | 'medium' | 'low' = 'low';

    // HIGH RISK: Urgent/pressure tactics
    const urgentPatterns = [
      { pattern: /urgent|immediately|expire|deadline|limited time|act now|hurry/i, message: 'Contains urgency pressure tactics', threat: 'high' },
      { pattern: /last chance|final notice|account will be|suspended|terminated/i, message: 'Contains threatening language', threat: 'high' },
      { pattern: /24 hours?|48 hours?|today only|expires? (today|tomorrow)/i, message: 'Contains time pressure', threat: 'medium' }
    ];

    // HIGH RISK: Financial/banking scams
    const bankingPatterns = [
      { pattern: /bank.{0,20}security.{0,20}update/i, message: 'SCAM ALERT: Bank security update request', threat: 'high' },
      { pattern: /verify.{0,20}(bank|account|identity)/i, message: 'SCAM ALERT: Account verification request', threat: 'high' },
      { pattern: /otp|one.?time.?password|verification.?code/i, message: 'WARNING: OTP/verification code request', threat: 'high' },
      { pattern: /(loan|credit).{0,20}(approved|offer|guaranteed)/i, message: 'SCAM ALERT: Unsolicited loan offer', threat: 'high' },
      { pattern: /pre.?approved.{0,20}(loan|credit|amount)/i, message: 'SCAM ALERT: Pre-approved loan scam', threat: 'high' },
      { pattern: /transfer.{0,20}(money|funds|amount)/i, message: 'WARNING: Money transfer request', threat: 'medium' },
      { pattern: /claim.{0,20}(reward|prize|money|refund)/i, message: 'SCAM ALERT: Prize/reward claim', threat: 'high' },
      { pattern: /click.{0,20}(here|link|below).{0,20}(claim|verify|update)/i, message: 'SCAM ALERT: Suspicious click request', threat: 'high' }
    ];

    // HIGH RISK: Malware/hacking threats
    const malwarePatterns = [
      { pattern: /virus|malware|trojan|ransomware/i, message: 'Contains malware-related terms', threat: 'high' },
      { pattern: /hack(ed|er|ing)?|compromised|breach/i, message: 'Contains hacking-related threats', threat: 'high' },
      { pattern: /phish(y|ing|er)?|spoof(ed|ing)?/i, message: 'Contains phishing indicators', threat: 'high' },
      { pattern: /infected|detected.{0,20}threat|security.{0,20}(risk|threat)/i, message: 'Fake security threat warning', threat: 'high' },
      { pattern: /download.{0,20}(software|app|tool).{0,20}(remove|clean|fix)/i, message: 'Suspicious download request', threat: 'high' }
    ];

    // Check all patterns
    [...urgentPatterns, ...bankingPatterns, ...malwarePatterns].forEach(({ pattern, message, threat }) => {
      if (pattern.test(text)) {
        warnings.push(message);
        if (threat === 'high' && maxThreatLevel !== 'high') maxThreatLevel = 'high';
        else if (threat === 'medium' && maxThreatLevel === 'low') maxThreatLevel = 'medium';
      }
    });

    return { warnings, threatLevel: warnings.length > 0 ? maxThreatLevel : undefined };
  };

  const validateURL = (url: string): { isValid: boolean; error?: string; threatLevel?: 'high' | 'medium' | 'low' } => {
    // Basic URL validation
    if (!url || !url.trim()) {
      return { isValid: false, error: 'URL cannot be empty' };
    }

    // Check for valid URL format
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const fullUrl = url.toLowerCase();
      
      // Check for valid protocol
      if (!['http:', 'https:', 'ftp:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'URL must start with http://, https://, or ftp://' };
      }

      // HIGH RISK: Known phishing patterns
      const phishingPatterns = [
        // Typosquatting popular services (like paypa1.com instead of paypal.com)
        { pattern: /paypa[1l]\./, message: 'Suspicious: Looks like PayPal typosquatting', threat: 'high' },
        { pattern: /pay-?pal[^.]/, message: 'Suspicious: PayPal-like domain', threat: 'high' },
        { pattern: /amaz[0o]n\./, message: 'Suspicious: Looks like Amazon typosquatting', threat: 'high' },
        { pattern: /g[0o]{2}gle\./, message: 'Suspicious: Looks like Google typosquatting', threat: 'high' },
        { pattern: /micr[0o]s[0o]ft\./, message: 'Suspicious: Looks like Microsoft typosquatting', threat: 'high' },
        { pattern: /app[1l]e\./, message: 'Suspicious: Looks like Apple typosquatting', threat: 'high' },
        
        // Subdomain abuse (like yourbank.com.security-update.info)
        { pattern: /\.(com|org|net|edu|gov)\.[^\/]+\.(info|tk|ml|ga|cf)/, message: 'HIGH RISK: Deceptive subdomain mimicking legitimate site', threat: 'high' },
        { pattern: /\.(com|org|net|edu|gov)\.[^\/]+/, message: 'WARNING: Suspicious subdomain structure', threat: 'medium' },
        
        // Security-related keywords in suspicious positions
        { pattern: /security[- ]?update/, message: 'HIGH RISK: Fake security update domain', threat: 'high' },
        { pattern: /account[- ]?verify/, message: 'HIGH RISK: Fake account verification', threat: 'high' },
        { pattern: /secure[- ]?login/, message: 'HIGH RISK: Fake secure login page', threat: 'high' },
        { pattern: /verify[- ]?account/, message: 'HIGH RISK: Fake verification page', threat: 'high' },
        
        // Known test malware URLs
        { pattern: /testsafebrowsing\.appspot\.com/, message: 'TEST MALWARE URL: This is a known test URL for malware', threat: 'high' },
        { pattern: /malware|phishing|virus|trojan/i, message: 'WARNING: URL contains malware-related terms', threat: 'medium' }
      ];

      // Check for phishing patterns
      for (const { pattern, message, threat } of phishingPatterns) {
        if (pattern.test(fullUrl)) {
          return { isValid: true, error: message, threatLevel: threat as 'high' | 'medium' };
        }
      }

      // HIGH RISK: Direct IP addresses
      const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (ipPattern.test(hostname)) {
        // Check if it's a private IP
        const privateIpPatterns = [
          /^10\./,
          /^172\.(1[6-9]|2[0-9]|3[01])\./,
          /^192\.168\./,
          /^127\./
        ];
        
        const isPrivateIp = privateIpPatterns.some(pattern => pattern.test(hostname));
        if (isPrivateIp) {
          return { isValid: true, error: 'WARNING: Private IP address - only access if you trust this network', threatLevel: 'medium' };
        } else {
          return { isValid: true, error: 'HIGH RISK: Direct IP address - often used in phishing attacks', threatLevel: 'high' };
        }
      }

      // HIGH RISK: URL shorteners
      const urlShorteners = [
        'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'is.gd', 't.co', 
        'buff.ly', 'short.link', 'tiny.cc', 'soo.gd', 'clck.ru',
        'cutt.ly', 'shorturl.at', 'rb.gy', 'rotf.lol'
      ];
      
      if (urlShorteners.some(shortener => hostname.includes(shortener))) {
        return { isValid: true, error: 'HIGH RISK: URL shortener detected - destination unknown', threatLevel: 'high' };
      }

      // Check for homograph attacks (similar looking characters)
      const homographPatterns = [
        { pattern: /[а-яА-Я]/, message: 'HIGH RISK: Cyrillic characters detected (homograph attack)', threat: 'high' },
        { pattern: /[αβγδεζηθικλμνξοπρστυφχψω]/, message: 'HIGH RISK: Greek characters detected (homograph attack)', threat: 'high' },
        { pattern: /[０-９]/, message: 'WARNING: Full-width numbers detected', threat: 'medium' }
      ];
      
      for (const { pattern, message, threat } of homographPatterns) {
        if (pattern.test(hostname)) {
          return { isValid: true, error: message, threatLevel: threat as 'high' | 'medium' };
        }
      }

      // Check for look-alike character substitutions
      const lookAlikePatterns = [
        { original: 'paypal', variants: ['paypa1', 'paypaI', 'pαypal'] },
        { original: 'amazon', variants: ['amaz0n', 'amazοn', 'аmazon'] },
        { original: 'google', variants: ['g00gle', 'gοοgle', 'googIe'] },
        { original: 'microsoft', variants: ['micr0soft', 'microsoſt', 'miсrosoft'] },
        { original: 'apple', variants: ['app1e', 'appIe', 'аpple'] },
        { original: 'facebook', variants: ['faceb00k', 'facebοοk', 'fаcebook'] },
        { original: 'netflix', variants: ['netf1ix', 'netfIix', 'netfliх'] }
      ];

      for (const { original, variants } of lookAlikePatterns) {
        if (variants.some(variant => hostname.includes(variant))) {
          return { isValid: true, error: `HIGH RISK: Possible ${original} phishing site (look-alike domain)`, threatLevel: 'high' };
        }
      }

      // Check for excessive subdomains
      const subdomains = hostname.split('.');
      if (subdomains.length > 4) {
        return { isValid: true, error: 'WARNING: Excessive subdomains - often used to deceive', threatLevel: 'medium' };
      }

      // Check for suspicious TLDs
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.review', '.work', '.top'];
      if (suspiciousTlds.some(tld => hostname.endsWith(tld))) {
        return { isValid: true, error: 'WARNING: Suspicious top-level domain - often used in scams', threatLevel: 'medium' };
      }

      // Check for suspicious patterns in URL path
      const pathPatterns = [
        { pattern: /@/, message: 'WARNING: @ symbol in URL - can be used to hide real destination', threat: 'high' },
        { pattern: /[<>"]/, message: 'Invalid characters in URL', threat: 'medium' },
        { pattern: /javascript:/i, message: 'BLOCKED: JavaScript URLs are not allowed', threat: 'high' },
        { pattern: /data:/i, message: 'BLOCKED: Data URLs are not allowed', threat: 'high' }
      ];

      for (const { pattern, message, threat } of pathPatterns) {
        if (pattern.test(fullUrl)) {
          if (threat === 'high') {
            return { isValid: false, error: message };
          }
          return { isValid: true, error: message, threatLevel: threat as 'medium' };
        }
      }

      // Check URL length
      if (url.length > 2000) {
        return { isValid: false, error: 'URL is too long (maximum 2000 characters)' };
      }

      return { isValid: true };
    } catch (e) {
      return { isValid: false, error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://' };
    }
  };

  const handleAnalysis = async (type: 'text' | 'url', content: string) => {
    if (!content || !content.trim()) {
      setError(type === 'url' ? 'Please enter a URL to analyze' : 'Please enter text to analyze');
      return;
    }

    // Frontend validation for URLs
    if (type === 'url') {
      const validation = validateURL(content);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid URL');
        toast.error(validation.error || 'Invalid URL');
        return;
      }
      // Show warning if there's one but continue with analysis
      if (validation.error) {
        toast.warning(validation.error);
      }
    }

    // Frontend validation for text
    if (type === 'text') {
      // Check minimum length
      if (content.trim().length < 10) {
        setError('Text is too short. Please enter at least 10 characters.');
        toast.error('Text is too short for meaningful analysis');
        return;
      }
      // Check maximum length
      if (content.length > 10000) {
        setError('Text is too long. Maximum 10,000 characters allowed.');
        toast.error('Text exceeds maximum length');
        return;
      }
      
      // Check for scam patterns in text
      const textValidation = validateText(content);
      if (textValidation.warnings.length > 0) {
        // Show warnings for detected patterns
        textValidation.warnings.forEach(warning => {
          if (textValidation.threatLevel === 'high') {
            toast.error(`Warning: ${warning}`);
          } else {
            toast.warning(`Warning: ${warning}`);
          }
        });
        
        // Add a summary warning
        if (textValidation.threatLevel === 'high') {
          toast.error('HIGH RISK: Multiple scam indicators detected! Proceed with extreme caution.');
        }
      }
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeContent(type, content);
      const analysisResult = response.analysisResult;
      setResult(analysisResult);

      // Use configurable toast messages if available
      if (validationRules && analysisResult.threatConfig) {
        const config = analysisResult.threatConfig;
        
        if (config.toastType === 'error') {
          toast.error(config.toastMessage);
        } else if (config.toastType === 'warning') {
          toast.warning(config.toastMessage);
        } else {
          toast.success(config.toastMessage);
        }
      } else {
        // Fallback to default messages
        if (analysisResult.threatLevel === 'dangerous') {
          toast.error('High threat detected! Please be extremely cautious.');
        } else if (analysisResult.threatLevel === 'suspicious') {
          toast.warning('Suspicious content detected. Proceed with caution.');
        } else {
          toast.success('Content appears safe, but always stay vigilant!');
        }
      }
    } catch (err) {
      console.error(`Error analyzing ${type}:`, err);
      setError(`Failed to analyze ${type}. Please try again.`);
      toast.error(`Analysis failed. There was a server error.`);
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
      toast.success('Text extracted! Analyzing for scam indicators...');

      // Step 3: Automatically analyze the extracted text
      const analysisResponse = await analyzeContent('text', extractedText);
      const analysisResult = analysisResponse.analysisResult;
      
      // Add OCR confidence info to the result
      analysisResult.ocrConfidence = response.confidence;
      analysisResult.extractedText = extractedText;
      
      setResult(analysisResult);
      
      // Use configurable toast messages
      if (validationRules && analysisResult.threatConfig) {
        const config = analysisResult.threatConfig;
        
        if (config.toastType === 'error') {
          toast.error(config.toastMessage);
        } else if (config.toastType === 'warning') {
          toast.warning(config.toastMessage);
        } else {
          toast.success(config.toastMessage);
        }
      } else {
        // Fallback messages
        if (analysisResult.threatLevel === 'dangerous') {
          toast.error('High threat detected! Please be extremely cautious.');
        } else if (analysisResult.threatLevel === 'suspicious') {
          toast.warning('Suspicious content detected. Please review the analysis.');
        } else {
          toast.success('Content appears safe based on analysis.');
        }
      }

    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image. Please try again.');
      toast.error('Image processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getThreatLevelColor = (level: string, config?: ThreatLevelConfig) => {
    if (config && config.cssClasses) {
      return config.cssClasses.container;
    }
    // Fallback to default colors
    switch (level) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200';
      case 'suspicious': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'dangerous': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getThreatLevelIcon = (level: string, config?: ThreatLevelConfig) => {
    const iconName = config?.icon || 'Shield';
    const iconClass = config?.cssClasses?.icon || 'text-gray-600';
    
    // Map icon names to components
    const iconMap: { [key: string]: JSX.Element } = {
      'CheckCircle': <CheckCircle className={`w-8 h-8 ${iconClass}`} />,
      'AlertCircle': <AlertCircle className={`w-8 h-8 ${iconClass}`} />,
      'XCircle': <XCircle className={`w-8 h-8 ${iconClass}`} />,
      'Shield': <Shield className={`w-8 h-8 ${iconClass}`} />
    };
    
    return iconMap[iconName] || <Shield className={`w-8 h-8 ${iconClass}`} />;
  };

  const getProgressBarColor = (level: string, config?: ThreatLevelConfig) => {
    if (config && config.cssClasses) {
      return config.cssClasses.progressBar;
    }
    // Fallback to default colors
    switch (level) {
      case 'safe': return 'bg-green-500';
      case 'suspicious': return 'bg-yellow-500';
      case 'dangerous': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          {t('scamAnalyzer.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('scamAnalyzer.subtitle')}
        </p>
        {validationRules && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Using configurable validation rules
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('text')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'text' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <MessageSquare className="w-5 h-5" /> {t('scamAnalyzer.analyzeText')}
          </button>
          <button 
            onClick={() => setActiveTab('url')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'url' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Globe className="w-5 h-5" /> {t('scamAnalyzer.analyzeUrl')}
          </button>
          <button 
            onClick={() => setActiveTab('image')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'image' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ImageIcon className="w-5 h-5" /> Analyze Image
          </button>
        </div>

        {activeTab === 'text' && (
          <div>
            <textarea 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              placeholder={t('scamAnalyzer.textPlaceholder')} 
              className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
            />
            <button 
              onClick={() => handleAnalysis('text', textInput || '')} 
              disabled={!(textInput || '').trim() || isProcessing} 
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('scamAnalyzer.analyzing')}
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  {t('scamAnalyzer.analyze')}
                </>
              )}
            </button>
          </div>
        )}
        
        {activeTab === 'url' && (
          <div>
            <input 
              type="url" 
              value={urlInput} 
              onChange={(e) => setUrlInput(e.target.value)} 
              placeholder={t('scamAnalyzer.urlPlaceholder')} 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            <button 
              onClick={() => handleAnalysis('url', urlInput || '')} 
              disabled={!(urlInput || '').trim() || isProcessing} 
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('scamAnalyzer.analyzing')}
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  {t('scamAnalyzer.checkUrl')}
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'image' && (
          <div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              ref={fileInputRef} 
              className="hidden" 
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Selected preview" 
                  className="h-full w-full object-contain rounded-lg" 
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Upload className="w-10 h-10 mx-auto mb-2" />
                  <p>Click to upload an image</p>
                  <p className="text-xs">(PNG, JPG, etc.)</p>
                </div>
              )}
            </div>
            <button 
              onClick={handleImageUpload} 
              disabled={!selectedImage || isProcessing} 
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Image...
                </>
              ) : (
                <>Extract & Analyze Image</>
              )}
            </button>
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            {t('scamAnalyzer.results')}
          </h2>
          
          <div className={`border-2 rounded-lg p-6 mb-6 ${getThreatLevelColor(result.threatLevel, result.threatConfig)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getThreatLevelIcon(result.threatLevel, result.threatConfig)}
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('scamAnalyzer.threatLevel')}
                  </p>
                  <p className="text-2xl font-bold capitalize">
                    {result.threatConfig?.displayName || t(`scamAnalyzer.${result.threatLevel}`)}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    {t('scamAnalyzer.confidence')}
                  </p>
                  <p className="text-2xl font-bold">{result.confidence}%</p>
                </div>
                {result.ocrConfidence && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">OCR Confidence</p>
                    <p className="text-sm font-medium">
                      {(result.ocrConfidence * 100).toFixed(1)}%
                    </p>
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
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(result.threatLevel, result.threatConfig)}`} 
                style={{ width: `${result.confidence}%` }} 
              />
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
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> 
                {t('scamAnalyzer.indicators')}
              </h3>
              <ul className="space-y-2">
                {result.indicators.map((indicator, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 mt-1">•</span> 
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> 
                {t('scamAnalyzer.recommendations')}
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-blue-500 mt-1">✓</span> 
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {result.extractedText && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> 
                Extracted Text from Image
              </p>
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {result.extractedText}
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Shield className="w-4 h-4" /> 
              {result.summary ? 'AI Summary' : t('scamAnalyzer.aiPowered')}
            </p>
            {result.summary && (
              <p className="text-sm text-blue-900 mt-2 whitespace-pre-wrap">
                {result.summary}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
