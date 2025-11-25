import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Loader2 } from 'lucide-react';
import { analyzeContent } from '../../services/backendApi';
import { toast } from 'react-toastify';
import { AnalysisResult } from './types';
import { validateBasicInput } from './utils';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface TextAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: string) => void;
}

export default function TextAnalyzer({ onAnalysisComplete, onError }: TextAnalyzerProps) {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [textInput, setTextInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalysis = async () => {
    const validation = validateBasicInput('text', textInput);
    if (!validation.isValid) {
      const errorMsg = validation.error || t('scamAnalyzer.invalidInput', 'Invalid input');
      onError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsProcessing(true);
    onError('');

    try {
      const response = await analyzeContent('text', textInput);
      const analysisResult = response.analysisResult;
      const pointsAwarded = response.pointsAwarded || 0;
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

      // Show results based on Generative LLM AI analysis
      if (analysisResult.threatLevel === 'dangerous') {
        toast.error(t('scamAnalyzer.highThreatDetected', 'High threat detected! Please be extremely cautious.'));
      } else if (analysisResult.threatLevel === 'suspicious') {
        toast.warning(t('scamAnalyzer.suspiciousContent', 'Suspicious content detected. Proceed with caution.'));
      } else {
        toast.success(t('scamAnalyzer.contentSafe', 'Content appears safe, but always stay vigilant!'));
      }
    } catch (err: any) {
      console.error('Error analyzing text:', err);
      const errorMsg = t('scamAnalyzer.failedToAnalyze', 'Failed to analyze {{type}}. {{message}}', { 
        type: 'text', 
        message: err.message || t('scamAnalyzer.pleaseTryAgain', 'Please try again.') 
      });
      onError(errorMsg);
      toast.error(t('scamAnalyzer.analysisFailed', 'Analysis failed: {{message}}', { 
        message: err.message || t('scamAnalyzer.serverError', 'Server error. Please check your Generative LLM API key configuration (Gemini or ChatGPT).') 
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative z-10 space-y-6">
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder={t('scamAnalyzer.textPlaceholder')}
        className="w-full h-48 px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-lg shadow-inner placeholder:text-gray-400"
      />
      <button
        onClick={handleAnalysis}
        disabled={!textInput.trim() || isProcessing}
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
  );
}

