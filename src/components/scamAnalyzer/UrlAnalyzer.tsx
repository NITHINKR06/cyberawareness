import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Globe, Loader2, Lock } from 'lucide-react';
import { analyzeContent } from '../../services/backendApi';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { toast } from 'react-toastify';
import { AnalysisResult } from './types';
import { validateBasicInput } from './utils';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface UrlAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: string) => void;
}

export default function UrlAnalyzer({ onAnalysisComplete, onError }: UrlAnalyzerProps) {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');

  const handleAnalysis = async () => {
    // Check if user is authenticated
    if (!user) {
      const errorMsg = t('scamAnalyzer.loginRequired', 'Please login to use URL analyzer. This feature requires authentication.');
      onError(errorMsg);
      toast.error(errorMsg, {
        onClick: () => navigate('/auth'),
        style: { cursor: 'pointer' }
      });
      // Optionally redirect to login after a delay
      setTimeout(() => {
        if (confirm(t('scamAnalyzer.redirectToLogin', 'Would you like to login now?'))) {
          navigate('/auth');
        }
      }, 2000);
      return;
    }

    const validation = validateBasicInput('url', urlInput);
    if (!validation.isValid) {
      const errorMsg = validation.error || t('scamAnalyzer.invalidInput', 'Invalid input');
      onError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsProcessing(true);
    onError('');
    setScanStatus('Initializing deep security scan...');

    try {
      // Backend will automatically use Cloudflare if configured, otherwise falls back to Puppeteer
      setScanStatus('Scanning ports and network security...');
      const response = await analyzeContent('url', urlInput);
      const analysisResult = response.analysisResult;
      const pointsAwarded = response.pointsAwarded || 0;
      setScanStatus('Analysis complete!');
      setTimeout(() => setScanStatus(''), 1000);
      onAnalysisComplete(analysisResult);

      // Update Firestore if points were awarded (for Firebase users)
      if (pointsAwarded > 0 && user?.id) {
        try {
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentPoints = userData.totalPoints || 0;
            const newTotalPoints = currentPoints + pointsAwarded;
            const newLevel = Math.floor(newTotalPoints / 500) + 1;

            await updateDoc(userRef, {
              totalPoints: newTotalPoints,
              level: Math.max(newLevel, userData.level || 1),
              lastActivity: new Date()
            });

            // Refresh user data in context
            await refreshUser();
            toast.success(t('scamAnalyzer.pointsAwarded', `+${pointsAwarded} points awarded for detecting dangerous content!`));
          }
        } catch (firestoreError) {
          console.error('Error updating Firestore points:', firestoreError);
        }
      }

      // Show results based on threat level
      if (analysisResult.threatLevel === 'dangerous') {
        toast.error(t('scamAnalyzer.highThreatDetected', 'High threat detected! Please be extremely cautious.'));
      } else if (analysisResult.threatLevel === 'suspicious') {
        toast.warning(t('scamAnalyzer.suspiciousContent', 'Suspicious content detected. Proceed with caution.'));
      } else {
        toast.success(t('scamAnalyzer.contentSafe', 'Content appears safe, but always stay vigilant!'));
      }
    } catch (err: any) {
      console.error('Error analyzing URL:', err);
      
      // Check if error is due to authentication
      if (err.response?.status === 401 || err.response?.data?.requiresAuth) {
        const errorMsg = t('scamAnalyzer.loginRequired', 'Please login to use URL analyzer. This feature requires authentication.');
        onError(errorMsg);
        toast.error(errorMsg, {
          onClick: () => navigate('/auth'),
          style: { cursor: 'pointer' }
        });
        setTimeout(() => {
          if (confirm(t('scamAnalyzer.redirectToLogin', 'Would you like to login now?'))) {
            navigate('/auth');
          }
        }, 2000);
      } else {
        const errorMsg = t('scamAnalyzer.failedToAnalyze', 'Failed to analyze {{type}}. {{message}}', { 
          type: 'url', 
          message: err.message || t('scamAnalyzer.pleaseTryAgain', 'Please try again.') 
        });
        onError(errorMsg);
        toast.error(t('scamAnalyzer.analysisFailed', 'Analysis failed: {{message}}', { 
          message: err.message || t('scamAnalyzer.serverError', 'Server error. Please check your Generative LLM API key configuration (Gemini or ChatGPT).') 
        }));
      }
    } finally {
      setIsProcessing(false);
      setScanStatus('');
    }
  };

  return (
    <div className="relative z-10 space-y-4">
      {!user && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                {t('scamAnalyzer.loginRequiredTitle', 'Login Required')}
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                {t('scamAnalyzer.loginRequiredDesc', 'URL analysis requires authentication. Please login or create an account to use this feature.')}
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {t('scamAnalyzer.goToLogin', 'Go to Login')}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="relative">
        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Enter website URL (e.g., https://example.com)"
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base placeholder:text-gray-400"
          disabled={!user}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {user 
          ? 'Deep analysis: Screenshots, Network Stats, Tech Detection & More'
          : t('scamAnalyzer.loginToUnlock', 'Login to unlock URL analysis features')
        }
      </p>
      {scanStatus && (
        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
          {scanStatus}
        </div>
      )}
      <button
        onClick={handleAnalysis}
        disabled={!urlInput.trim() || isProcessing || !user}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{scanStatus || t('scamAnalyzer.analyzing')}</span>
          </>
        ) : !user ? (
          <>
            <Lock className="w-5 h-5" />
            <span>{t('scamAnalyzer.loginToAnalyze', 'Login to Analyze URL')}</span>
          </>
        ) : (
          <>
            <Globe className="w-5 h-5" />
            <span>{t('scamAnalyzer.analyzeUrl')}</span>
          </>
        )}
      </button>
    </div>
  );
}

