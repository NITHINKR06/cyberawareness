import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trophy, Star, Brain, Shield, Target, RefreshCw } from 'lucide-react';

interface StorylineResultsProps {
  score: number;
  total: number;
  onRestart: () => void;
  onBack: () => void;
  scenario: any;
}

export default function StorylineResults({ score, total, onRestart, onBack, scenario }: StorylineResultsProps) {
  const { t } = useTranslation();
  
  const percentage = Math.round((score / total) * 100);
  const isExcellent = percentage >= 90;
  const isGood = percentage >= 70;
  const isAverage = percentage >= 50;

  const getPerformanceMessage = () => {
    if (isExcellent) return t('timeMachine.results.excellent');
    if (isGood) return t('timeMachine.results.good');
    if (isAverage) return t('timeMachine.results.average');
    return t('timeMachine.results.needsImprovement');
  };

  const getPerformanceColor = () => {
    if (isExcellent) return 'from-yellow-400 to-orange-500';
    if (isGood) return 'from-blue-400 to-purple-500';
    if (isAverage) return 'from-green-400 to-blue-500';
    return 'from-red-400 to-pink-500';
  };

  const getPerformanceIcon = () => {
    if (isExcellent) return <Trophy className="w-8 h-8" />;
    if (isGood) return <Star className="w-8 h-8" />;
    if (isAverage) return <Brain className="w-8 h-8" />;
    return <Shield className="w-8 h-8" />;
  };

  const achievements = [
    {
      id: 'perfect',
      title: t('timeMachine.achievements.perfect.title'),
      description: t('timeMachine.achievements.perfect.description'),
      unlocked: score === total,
      icon: <Trophy className="w-6 h-6" />
    },
    {
      id: 'quick_learner',
      title: t('timeMachine.achievements.quickLearner.title'),
      description: t('timeMachine.achievements.quickLearner.description'),
      unlocked: percentage >= 80,
      icon: <Brain className="w-6 h-6" />
    },
    {
      id: 'security_aware',
      title: t('timeMachine.achievements.securityAware.title'),
      description: t('timeMachine.achievements.securityAware.description'),
      unlocked: percentage >= 70,
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'participant',
      title: t('timeMachine.achievements.participant.title'),
      description: t('timeMachine.achievements.participant.description'),
      unlocked: true,
      icon: <Target className="w-6 h-6" />
    }
  ];

  const recommendations = [
    {
      category: t('timeMachine.recommendations.immediate'),
      items: [
        t('timeMachine.recommendations.verifySources'),
        t('timeMachine.recommendations.doubleCheck'),
        t('timeMachine.recommendations.trustInstincts')
      ]
    },
    {
      category: t('timeMachine.recommendations.longTerm'),
      items: [
        t('timeMachine.recommendations.stayInformed'),
        t('timeMachine.recommendations.shareKnowledge'),
        t('timeMachine.recommendations.practiceScenarios')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 relative overflow-hidden">
      {/* 3D Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500/5 to-blue-500/5"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{t('timeMachine.backToScenario')}</span>
            </button>

            <div className="text-center">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('timeMachine.results.title')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {scenario.name} • {scenario.year}
              </p>
            </div>

            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm sm:text-base">{t('timeMachine.restart')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Score Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${getPerformanceColor()} text-white mb-4`}>
                {getPerformanceIcon()}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {getPerformanceMessage()}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('timeMachine.results.score')}: {score}/{total} ({percentage}%)
              </p>
            </div>

            {/* Progress Circle */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200 dark:text-gray-700"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${isExcellent ? 'text-yellow-400' : isGood ? 'text-blue-400' : isAverage ? 'text-green-400' : 'text-red-400'}`}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${
                  isExcellent ? 'text-yellow-600 dark:text-yellow-400' : 
                  isGood ? 'text-blue-600 dark:text-blue-400' : 
                  isAverage ? 'text-green-600 dark:text-green-400' : 
                  'text-red-600 dark:text-red-400'
                }`}>
                  {percentage}%
                </span>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {isExcellent && t('timeMachine.results.excellentMessage')}
              {isGood && !isExcellent && t('timeMachine.results.goodMessage')}
              {isAverage && !isGood && t('timeMachine.results.averageMessage')}
              {!isAverage && t('timeMachine.results.improvementMessage')}
            </p>
          </div>

          {/* Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              {t('timeMachine.achievements.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    achievement.unlocked
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className={`flex items-center gap-3 mb-2 ${
                    achievement.unlocked ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {achievement.icon}
                    <span className={`font-semibold ${achievement.unlocked ? '' : 'line-through'}`}>
                      {achievement.title}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  {rec.category}
                </h3>
                <ul className="space-y-3">
                  {rec.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              {t('timeMachine.playAgain')}
            </button>
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('timeMachine.exploreMoreScenarios')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
