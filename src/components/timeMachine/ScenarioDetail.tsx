import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertTriangle, ShieldCheck, Clock, MapPin, Users, Brain, MessageSquare } from 'lucide-react';

interface Scenario {
  id: number;
  name: string;
  year: number;
  description: string;
  red_flags: string[];
  impact: { summary: string };
  timeline?: {
    date: string;
    event: string;
    description: string;
  }[];
  prevention?: {
    technical: string[];
    awareness: string[];
    policy: string[];
  };
  case_study?: {
    victim: string;
    loss: string;
    method: string;
  };
}

interface ScenarioDetailProps {
  scenario: Scenario;
  onBack: () => void;
  onStartStoryline: () => void;
}

export default function ScenarioDetail({ scenario, onBack, onStartStoryline }: ScenarioDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: t('timeMachine.overview'), icon: <Brain className="w-4 h-4" /> },
    { id: 'timeline', label: t('timeMachine.timeline'), icon: <Clock className="w-4 h-4" /> },
    { id: 'prevention', label: t('timeMachine.prevention'), icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'caseStudy', label: t('timeMachine.caseStudy'), icon: <Users className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {t('timeMachine.scenarioOverview')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {scenario.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  {t('timeMachine.redFlags')}
                </h4>
                <ul className="space-y-2">
                  {scenario.red_flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                  {t('timeMachine.impactPrevention')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {scenario.impact.summary}
                </p>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('timeMachine.attackTimeline')}
            </h3>
            {scenario.timeline ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                <div className="space-y-6">
                  {scenario.timeline.map((event, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      <div className="relative z-10 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{i + 1}</span>
                      </div>
                      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {event.date}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {event.event}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t('timeMachine.noTimelineData')}
              </div>
            )}
          </div>
        );

      case 'prevention':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('timeMachine.preventionMeasures')}
            </h3>
            {scenario.prevention ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    {t('timeMachine.technicalMeasures')}
                  </h4>
                  <ul className="space-y-2">
                    {scenario.prevention.technical.map((measure, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300 text-sm">
                        • {measure}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {t('timeMachine.awarenessMeasures')}
                  </h4>
                  <ul className="space-y-2">
                    {scenario.prevention.awareness.map((measure, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300 text-sm">
                        • {measure}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                  <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('timeMachine.policyMeasures')}
                  </h4>
                  <ul className="space-y-2">
                    {scenario.prevention.policy.map((measure, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300 text-sm">
                        • {measure}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t('timeMachine.noPreventionData')}
              </div>
            )}
          </div>
        );

      case 'caseStudy':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('timeMachine.realWorldCase')}
            </h3>
            {scenario.case_study ? (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {t('timeMachine.victim')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {scenario.case_study.victim}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {t('timeMachine.financialLoss')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {scenario.case_study.loss}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {t('timeMachine.attackMethod')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {scenario.case_study.method}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t('timeMachine.noCaseStudyData')}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 relative overflow-hidden">
      {/* 3D Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{t('timeMachine.backToEras')}</span>
            </button>

            <div className="text-center">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {scenario.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {scenario.year} • {t('timeMachine.scenarioAnalysis')}
              </p>
            </div>

            <button
              onClick={onStartStoryline}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm sm:text-base">{t('timeMachine.startStoryline')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200/50 dark:border-gray-700/50">
            <nav className="-mb-px flex flex-wrap gap-2 sm:gap-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
