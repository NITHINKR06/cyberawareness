import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TimeMachineInterface from './timeMachine/TimeMachineInterface';
import ScenarioDetail from './timeMachine/ScenarioDetail';
import InteractiveStoryline from './timeMachine/InteractiveStoryline';
import StorylineResults from './timeMachine/StorylineResults';

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

type ViewState = 'interface' | 'scenarios' | 'scenario-detail' | 'storyline' | 'results';

export default function TimeMachine() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewState>('interface');
  const [selectedEra, setSelectedEra] = useState<number | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storylineScore, setStorylineScore] = useState({ score: 0, total: 0 });

  const fetchScenarios = async (year: number) => {
    setIsLoading(true);
    setError(null);
    setSelectedEra(year);
    
    try {
      // Mock data for demonstration - replace with actual API call
      const mockScenarios: Scenario[] = [
        {
          id: 1,
          name: year === 2015 ? 'Classic Phishing Emails' : year === 2025 ? 'AI-Powered Social Engineering' : 'Quantum Cryptography Attacks',
          year,
          description: year === 2015 
            ? 'Traditional email-based phishing attacks targeting unsuspecting users with fake bank notifications and lottery scams.'
            : year === 2025 
            ? 'Advanced AI-generated personalized attacks using deep learning to create convincing fake personas and messages.'
            : 'Future threats leveraging quantum computing to break traditional encryption and create new attack vectors.',
          red_flags: year === 2015 
            ? ['Poor grammar and spelling', 'Generic greetings', 'Urgent action required', 'Suspicious sender addresses']
            : year === 2025 
            ? ['Perfect grammar and personalization', 'AI-generated images', 'Realistic voice cloning', 'Behavioral pattern analysis']
            : ['Quantum signature verification failures', 'Unusual encryption patterns', 'Temporal attack signatures', 'Quantum entanglement anomalies'],
          impact: {
            summary: year === 2015 
              ? 'Financial losses, identity theft, and compromised personal information through traditional social engineering.'
              : year === 2025 
              ? 'Massive data breaches, advanced persistent threats, and AI-assisted identity theft.'
              : 'Complete cryptographic system compromise, quantum-level data breaches, and fundamental security paradigm shifts.'
          },
          timeline: year === 2015 ? [
            { date: 'Day 1', event: 'Phishing email sent', description: 'Scammer sends fake bank notification to thousands of users' },
            { date: 'Day 2', event: 'Users click links', description: 'Victims click malicious links in the phishing emails' },
            { date: 'Day 3', event: 'Credentials stolen', description: 'Fake login pages capture user credentials' },
            { date: 'Day 4', event: 'Account compromise', description: 'Scammers access victim accounts and steal funds' }
          ] : year === 2025 ? [
            { date: 'Week 1', event: 'AI reconnaissance', description: 'AI analyzes target social media and public information' },
            { date: 'Week 2', event: 'Persona creation', description: 'AI generates realistic fake personas and backstories' },
            { date: 'Week 3', event: 'Relationship building', description: 'AI establishes trust with targets through social engineering' },
            { date: 'Week 4', event: 'Advanced attack', description: 'AI executes sophisticated multi-vector attack campaign' }
          ] : [
            { date: 'Month 1', event: 'Quantum surveillance', description: 'Quantum computers monitor encrypted communications' },
            { date: 'Month 2', event: 'Pattern analysis', description: 'Quantum algorithms identify encryption weaknesses' },
            { date: 'Month 3', event: 'Key extraction', description: 'Quantum attacks extract private keys from quantum systems' },
            { date: 'Month 4', event: 'System compromise', description: 'Complete cryptographic infrastructure compromised' }
          ],
          prevention: {
            technical: year === 2015 
              ? ['Email filtering systems', 'Two-factor authentication', 'SSL certificates', 'Anti-virus software']
              : year === 2025 
              ? ['AI detection systems', 'Behavioral analytics', 'Quantum-resistant encryption', 'Deepfake detection']
              : ['Post-quantum cryptography', 'Quantum key distribution', 'Quantum authentication', 'Quantum intrusion detection'],
            awareness: year === 2015 
              ? ['Email security training', 'Phishing awareness programs', 'Suspicious link education', 'Password security']
              : year === 2025 
              ? ['AI literacy training', 'Deepfake recognition', 'Advanced social engineering awareness', 'Digital identity protection']
              : ['Quantum security education', 'Post-quantum awareness', 'Quantum threat modeling', 'Future security paradigms'],
            policy: year === 2015 
              ? ['Email security policies', 'Incident response procedures', 'User training requirements', 'Security audits']
              : year === 2025 
              ? ['AI governance frameworks', 'Deepfake regulations', 'Advanced threat response', 'Quantum security standards']
              : ['Quantum security frameworks', 'Post-quantum migration plans', 'Quantum threat intelligence', 'Future security regulations']
          },
          case_study: {
            victim: year === 2015 ? 'Small business owner' : year === 2025 ? 'Tech executive' : 'Government agency',
            loss: year === 2015 ? '$50,000 in fraudulent transactions' : year === 2025 ? '$2M in intellectual property theft' : 'Complete system compromise',
            method: year === 2015 ? 'Fake bank notification email' : year === 2025 ? 'AI-generated video call impersonation' : 'Quantum algorithm exploitation'
          }
        },
        {
          id: 2,
          name: year === 2015 ? 'Nigerian Prince Scams' : year === 2025 ? 'Deepfake Video Calls' : 'Quantum Entanglement Hacking',
          year,
          description: year === 2015 
            ? 'Classic advance fee fraud promising large sums of money in exchange for small upfront payments.'
            : year === 2025 
            ? 'Realistic video calls using deepfake technology to impersonate trusted contacts and request money transfers.'
            : 'Quantum entanglement manipulation to create undetectable communication channels for espionage.',
          red_flags: year === 2015 
            ? ['Promises of large money', 'Requests for upfront fees', 'Urgent secrecy', 'Poor English']
            : year === 2025 
            ? ['Slightly delayed responses', 'Unusual background details', 'Perfect video quality', 'Behavioral inconsistencies']
            : ['Quantum signature mismatches', 'Entanglement pattern anomalies', 'Temporal inconsistencies', 'Quantum decoherence'],
          impact: {
            summary: year === 2015 
              ? 'Financial losses from advance fee payments and compromised bank accounts.'
              : year === 2025 
              ? 'Massive financial fraud, corporate espionage, and trust erosion in digital communications.'
              : 'Undetectable data exfiltration, quantum-level surveillance, and fundamental communication security breakdown.'
          }
        }
      ];
      
      setScenarios(mockScenarios);
      setCurrentView('scenarios');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch scenarios.');
      setScenarios([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentView('scenario-detail');
  };

  const handleStartStoryline = () => {
    setCurrentView('storyline');
  };

  const handleStorylineComplete = (score: number, total: number) => {
    setStorylineScore({ score, total });
    setCurrentView('results');
  };

  const handleRestart = () => {
    setCurrentView('storyline');
  };

  const handleBackToInterface = () => {
    setCurrentView('interface');
    setSelectedEra(null);
    setSelectedScenario(null);
    setScenarios([]);
  };

  const handleBackToScenarios = () => {
    setCurrentView('scenarios');
    setSelectedScenario(null);
  };

  const handleBackToScenarioDetail = () => {
    setCurrentView('scenario-detail');
  };

  // Render different views based on current state
  switch (currentView) {
    case 'interface':
      return <TimeMachineInterface onEraSelect={fetchScenarios} selectedEra={selectedEra} />;
    
    case 'scenarios':
  return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {selectedEra === 2015 ? t('timeMachine.classicScams') : 
                 selectedEra === 2025 ? t('timeMachine.modernThreats') : 
                 t('timeMachine.futureFrauds')}
              </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('timeMachine.selectScenario')}
        </p>
      </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t('timeMachine.loadingScenarios')}</p>
      </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
                >
              <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                  <div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{scenario.year}</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {scenario.name}
                        </h3>
                  </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
                        {selectedEra === 2015 ? t('timeMachine.classic') : 
                         selectedEra === 2025 ? t('timeMachine.modern') : 
                         t('timeMachine.future')}
                  </div>
                </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {scenario.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{scenario.red_flags.length} {t('timeMachine.redFlags')}</span>
                        <span>{t('timeMachine.interactive')}</span>
                      </div>
                      <button className="text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {t('timeMachine.explore')} →
                      </button>
                  </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleBackToInterface}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('timeMachine.backToEras')}
              </button>
        </div>
      </div>
    </div>
  );

    case 'scenario-detail':
      return selectedScenario ? (
        <ScenarioDetail
          scenario={selectedScenario}
          onBack={handleBackToScenarios}
          onStartStoryline={handleStartStoryline}
        />
      ) : null;

    case 'storyline':
      return selectedScenario ? (
        <InteractiveStoryline
          scenario={selectedScenario}
          onBack={handleBackToScenarioDetail}
          onComplete={handleStorylineComplete}
        />
      ) : null;

    case 'results':
      return selectedScenario ? (
        <StorylineResults
          score={storylineScore.score}
          total={storylineScore.total}
          onRestart={handleRestart}
          onBack={handleBackToScenarioDetail}
          scenario={selectedScenario}
        />
      ) : null;

    default:
      return <TimeMachineInterface onEraSelect={fetchScenarios} selectedEra={selectedEra} />;
  }
}
