import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, MessageSquare, Brain, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StoryStep {
  id: number;
  title: string;
  description: string;
  situation: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    consequence: string;
  }[];
  correctAnswer?: string;
  userChoice?: string;
}

interface InteractiveStorylineProps {
  scenario: any;
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

export default function InteractiveStoryline({ scenario, onBack, onComplete }: InteractiveStorylineProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mock storyline data - in real app, this would come from the backend
  const storylineSteps: StoryStep[] = [
    {
      id: 1,
      title: t('timeMachine.storyline.step1.title'),
      description: t('timeMachine.storyline.step1.description'),
      situation: t('timeMachine.storyline.step1.situation'),
      question: t('timeMachine.storyline.step1.question'),
      options: [
        {
          id: 'a',
          text: t('timeMachine.storyline.step1.optionA'),
          isCorrect: true,
          explanation: t('timeMachine.storyline.step1.explanationA'),
          consequence: t('timeMachine.storyline.step1.consequenceA')
        },
        {
          id: 'b',
          text: t('timeMachine.storyline.step1.optionB'),
          isCorrect: false,
          explanation: t('timeMachine.storyline.step1.explanationB'),
          consequence: t('timeMachine.storyline.step1.consequenceB')
        },
        {
          id: 'c',
          text: t('timeMachine.storyline.step1.optionC'),
          isCorrect: false,
          explanation: t('timeMachine.storyline.step1.explanationC'),
          consequence: t('timeMachine.storyline.step1.consequenceC')
        }
      ]
    },
    {
      id: 2,
      title: t('timeMachine.storyline.step2.title'),
      description: t('timeMachine.storyline.step2.description'),
      situation: t('timeMachine.storyline.step2.situation'),
      question: t('timeMachine.storyline.step2.question'),
      options: [
        {
          id: 'a',
          text: t('timeMachine.storyline.step2.optionA'),
          isCorrect: false,
          explanation: t('timeMachine.storyline.step2.explanationA'),
          consequence: t('timeMachine.storyline.step2.consequenceA')
        },
        {
          id: 'b',
          text: t('timeMachine.storyline.step2.optionB'),
          isCorrect: true,
          explanation: t('timeMachine.storyline.step2.explanationB'),
          consequence: t('timeMachine.storyline.step2.consequenceB')
        },
        {
          id: 'c',
          text: t('timeMachine.storyline.step2.optionC'),
          isCorrect: false,
          explanation: t('timeMachine.storyline.step2.explanationC'),
          consequence: t('timeMachine.storyline.step2.consequenceC')
        }
      ]
    },
    {
      id: 3,
      title: t('timeMachine.storyline.step3.title'),
      description: t('timeMachine.storyline.step3.description'),
      situation: t('timeMachine.storyline.step3.situation'),
      question: t('timeMachine.storyline.step3.question'),
      options: [
        {
          id: 'a',
          text: t('timeMachine.storyline.step3.optionA'),
          isCorrect: false,
          explanation: t('timeMachine.storyline.step3.explanationA'),
          consequence: t('timeMachine.storyline.step3.consequenceA')
        },
        {
          id: 'b',
          text: t('timeMachine.storyline.step3.optionB'),
          isCorrect: false,
          explanation: t('timeMachine.storyline.step3.explanationB'),
          consequence: t('timeMachine.storyline.step3.consequenceB')
        },
        {
          id: 'c',
          text: t('timeMachine.storyline.step3.optionC'),
          isCorrect: true,
          explanation: t('timeMachine.storyline.step3.explanationC'),
          consequence: t('timeMachine.storyline.step3.consequenceC')
        }
      ]
    }
  ];

  const currentStepData = storylineSteps[currentStep];

  const handleAnswerSelect = (answerId: string) => {
    setIsAnimating(true);
    setUserAnswers(prev => ({ ...prev, [currentStep]: answerId }));
    
    setTimeout(() => {
      setShowResult(true);
      setIsAnimating(false);
    }, 500);
  };

  const handleNext = () => {
    if (currentStep < storylineSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowResult(false);
    } else {
      // Calculate final score
      const correctAnswers = Object.values(userAnswers).reduce((count, answer, index) => {
        const step = storylineSteps[index];
        const selectedOption = step.options.find(opt => opt.id === answer);
        return count + (selectedOption?.isCorrect ? 1 : 0);
      }, 0);
      
      onComplete(correctAnswers, storylineSteps.length);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowResult(false);
    }
  };

  const getSelectedOption = () => {
    const selectedAnswer = userAnswers[currentStep];
    return currentStepData.options.find(opt => opt.id === selectedAnswer);
  };

  const selectedOption = getSelectedOption();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* 3D Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{t('timeMachine.backToScenario')}</span>
            </button>

            <div className="text-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('timeMachine.interactiveStoryline')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t('timeMachine.step')} {currentStep + 1} {t('timeMachine.of')} {storylineSteps.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                {Object.keys(userAnswers).length}/{storylineSteps.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${((currentStep + 1) / storylineSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Scenario Context */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentStepData.title}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {currentStepData.description}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('timeMachine.currentSituation')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepData.situation}
              </p>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              {t('timeMachine.whatWouldYouDo')}
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {currentStepData.question}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentStepData.options.map((option) => {
                const isSelected = userAnswers[currentStep] === option.id;
                const isCorrect = option.isCorrect;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => !showResult && handleAnswerSelect(option.id)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                      !showResult
                        ? 'hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer'
                        : 'cursor-not-allowed'
                    } ${
                      isSelected
                        ? showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : showResult && isCorrect
                          ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? showResult
                            ? isCorrect
                              ? 'border-green-500 bg-green-500'
                              : 'border-red-500 bg-red-500'
                            : 'border-blue-500 bg-blue-500'
                          : showResult && isCorrect
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                        {showResult && isCorrect && !isSelected && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                        {isSelected && showResult && !isCorrect && (
                          <XCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className={`font-medium ${
                        isSelected
                          ? showResult
                            ? isCorrect
                              ? 'text-green-700 dark:text-green-400'
                              : 'text-red-700 dark:text-red-400'
                            : 'text-blue-700 dark:text-blue-400'
                          : showResult && isCorrect
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {option.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result */}
            {showResult && selectedOption && (
              <div className={`mt-6 p-4 rounded-lg border-l-4 ${
                selectedOption.isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {selectedOption.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <h4 className={`font-semibold ${
                    selectedOption.isCorrect
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}>
                    {selectedOption.isCorrect ? t('timeMachine.correct') : t('timeMachine.incorrect')}
                  </h4>
                </div>
                <p className={`mb-2 ${
                  selectedOption.isCorrect
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {selectedOption.explanation}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  <strong>{t('timeMachine.consequence')}:</strong> {selectedOption.consequence}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('timeMachine.previous')}
            </button>

            {showResult && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                {currentStep === storylineSteps.length - 1 ? t('timeMachine.finish') : t('timeMachine.next')}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
