import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TimeMachineInterface from '../components/timeMachine/TimeMachineInterface';
import ScenarioDetail from '../components/timeMachine/ScenarioDetail';
import InteractiveStoryline from '../components/timeMachine/InteractiveStoryline';
import StorylineResults from '../components/timeMachine/StorylineResults';

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

export default function TimeMachinePage() {
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
          name: year === 2015 ? 'Operation BlackEnergy' : year === 2025 ? 'Casino Royale Ransomware' : 'The Deepfake Heist',
          year,
          description: year === 2015
            ? 'The 2015 Ukraine power grid hack, where cyberattackers used BlackEnergy malware to remotely switch off power for 230,000 people.'
            : year === 2025
              ? 'A massive social engineering attack on a major casino resort, paralyzing operations for 10 days and costing over $100 million.'
              : 'A futuristic scenario where AI-driven deepfakes and quantum decryption are used to bypass biometric security and steal corporate funds.',
          red_flags: year === 2015
            ? ['Unexpected cursor movement', 'Files disappearing (KillDisk)', 'Phone lines jammed', 'Unusual VPN connections']
            : year === 2025
              ? ['Urgent help desk calls', 'MFA bypass requests', 'Unusual Okta activity', 'Privilege escalation']
              : ['Perfect video/audio sync', 'Biometric scanner glitches', 'Quantum decryption alerts', 'Signature verification failures'],
          impact: {
            summary: year === 2015
              ? 'First known successful cyberattack on a power grid. 230,000 people lost power for 1-6 hours.'
              : year === 2025
                ? '$100M+ financial loss, 10 days of operational downtime, and theft of customer data.'
                : 'Potential bankruptcy due to massive fund theft and loss of trust in biometric security.'
          },
          timeline: year === 2015 ? [
            { date: 'March 2015', event: 'Initial Compromise', description: 'Attackers gain access via spear-phishing emails.' },
            { date: 'Dec 23, 3:35 PM', event: 'Remote Access', description: 'Attackers remotely control SCADA systems.' },
            { date: 'Dec 23, 3:45 PM', event: 'Breakers Opened', description: 'Power is cut to 30 substations.' },
            { date: 'Dec 23, 4:00 PM', event: 'KillDisk Deployed', description: 'Wiper malware destroys system data.' }
          ] : year === 2025 ? [
            { date: 'Day 1', event: 'Vishing Attack', description: 'Attacker impersonates employee to IT help desk.' },
            { date: 'Day 1', event: 'Initial Access', description: 'MFA reset grants attacker entry.' },
            { date: 'Day 2', event: 'Lateral Movement', description: 'Attackers escalate to Domain Admin.' },
            { date: 'Day 5', event: 'Ransomware', description: 'Systems encrypted; ransom demand issued.' }
          ] : [
            { date: '2035', event: 'Reconnaissance', description: 'AI analyzes public CEO footage.' },
            { date: '2035', event: 'Deepfake Generation', description: 'Real-time video/audio clone created.' },
            { date: '2035', event: 'Biometric Bypass', description: 'MasterPrint AI spoofs retina scanner.' },
            { date: '2035', event: 'Fund Transfer', description: 'Quantum decryption authorizes transaction.' }
          ],
          prevention: {
            technical: year === 2015
              ? ['Two-Factor Authentication (2FA)', 'Network Segmentation', 'Endpoint Detection & Response (EDR)', 'Offline Backups']
              : year === 2025
                ? ['FIDO2 Hardware Keys', 'Visual Verification Policy', 'Just-In-Time Access', 'Identity Threat Detection']
                : ['Content Provenance (C2PA)', 'Liveness Detection', 'Quantum-Resistant Crypto', 'Multi-Person Authorization'],
            awareness: year === 2015
              ? ['Phishing Simulation', 'Incident Response Drills', 'Operational Technology (OT) Training', 'Reporting Procedures']
              : year === 2025
                ? ['Social Engineering Defense', 'Help Desk Verification Protocols', 'Insider Threat Awareness', 'Data Handling']
                : ['Deepfake Recognition', 'Zero Trust Mindset', 'Biometric Security Limits', 'Quantum Threat Awareness'],
            policy: year === 2015
              ? ['Manual Override Procedures', 'Vendor Risk Management', 'Critical Infrastructure Standards', 'Disaster Recovery Plan']
              : year === 2025
                ? ['Identity Verification Standards', 'Ransomware Payment Policy', 'Privileged Access Management', 'Audit Logging']
                : ['AI Governance Framework', 'Post-Quantum Migration', 'Biometric Data Privacy', 'Digital Signature Mandates']
          },
          case_study: {
            victim: year === 2015 ? 'Kyivoblenergo (Ukraine)' : year === 2025 ? 'MGM Resorts International' : 'Global Tech Corp (Fictional)',
            loss: year === 2015 ? 'Power outage for 230k people' : year === 2025 ? '$100 Million USD' : '$250 Million USD (Projected)',
            method: year === 2015 ? 'Spear-phishing + BlackEnergy' : year === 2025 ? 'Vishing + ALPHV/BlackCat' : 'Deepfake + Quantum Decryption'
          }
        },
        {
          id: 2,
          name: year === 2015 ? 'The OPM Data Breach' : year === 2025 ? 'Supply Chain Injection' : 'Neural Link Hijacking',
          year,
          description: year === 2015
            ? 'The theft of 21.5 million personnel records from the US Office of Personnel Management.'
            : year === 2025
              ? 'Attackers compromise a widely used software library, infecting thousands of downstream companies.'
              : 'Hackers intercept brain-computer interface (BCI) signals to manipulate user thoughts and actions.',
          red_flags: year === 2015
            ? ['Unusual outbound traffic', 'Unknown admin accounts', 'Database export logs', 'Credential dumping']
            : year === 2025
              ? ['Unexpected code changes', 'Unverified binary updates', 'Abnormal build times', 'Signature mismatches']
              : ['Involuntary motor movements', 'Memory gaps', 'Unexplained emotions', 'Interface lag'],
          impact: {
            summary: year === 2015
              ? 'Compromise of sensitive background check data for millions of government employees.'
              : year === 2025
                ? 'Global operational disruption across multiple industries relying on the compromised software.'
                : 'Loss of bodily autonomy and privacy of thought.'
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
