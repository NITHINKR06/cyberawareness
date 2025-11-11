import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';
import { configService } from '../services/backendApi';
import { toast } from 'react-toastify';

interface ValidationRules {
  threatLevels: any;
  scoringThresholds: {
    dangerous: number;
    suspicious: number;
    safe: number;
  };
  scamKeywords: {
    [key: string]: string[];
  };
  keywordWeights: {
    [key: string]: number;
  };
  suspiciousUrlPatterns: {
    url_shorteners: string[];
    suspicious_tlds: string[];
    phishing_patterns: string[];
  };
  recommendations: {
    [key: string]: string[];
  };
  features: {
    [key: string]: boolean;
  };
}

export default function ValidationRulesAdmin() {
  const [rules, setRules] = useState<ValidationRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'thresholds' | 'keywords' | 'urls' | 'recommendations' | 'features'>('thresholds');
  const [editingKeywords, setEditingKeywords] = useState<{ [key: string]: string[] }>({});
  const [editingRecommendations, setEditingRecommendations] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await configService.getValidationRules();
      if (data.success) {
        setRules(data.rules);
        setEditingKeywords(data.rules.scamKeywords);
        setEditingRecommendations(data.rules.recommendations);
      }
    } catch (error: any) {
      console.error('Failed to fetch rules:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Unable to load validation rules. Please check if the server is running.');
      } else {
        toast.error('Failed to load validation rules');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveRules = async () => {
    if (!rules) return;
    
    setSaving(true);
    try {
      const updatedRules = {
        ...rules,
        scamKeywords: editingKeywords,
        recommendations: editingRecommendations
      };
      
      const data = await configService.updateValidationRules(updatedRules);
      if (data.success) {
        toast.success('Validation rules updated successfully');
        setRules(updatedRules);
      }
    } catch (error: any) {
      console.error('Failed to save rules:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Unable to save validation rules. Please check if the server is running.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to save validation rules');
      }
    } finally {
      setSaving(false);
    }
  };

  const updateThreshold = (key: string, value: number) => {
    if (!rules) return;
    setRules({
      ...rules,
      scoringThresholds: {
        ...rules.scoringThresholds,
        [key]: value
      }
    });
  };

  const updateFeature = (key: string, value: boolean) => {
    if (!rules) return;
    setRules({
      ...rules,
      features: {
        ...rules.features,
        [key]: value
      }
    });
  };

  const addKeyword = (category: string) => {
    const newKeyword = prompt('Enter new keyword:');
    if (newKeyword && newKeyword.trim()) {
      setEditingKeywords({
        ...editingKeywords,
        [category]: [...(editingKeywords[category] || []), newKeyword.trim()]
      });
    }
  };

  const removeKeyword = (category: string, index: number) => {
    setEditingKeywords({
      ...editingKeywords,
      [category]: editingKeywords[category].filter((_, i) => i !== index)
    });
  };

  const addRecommendation = (level: string) => {
    const newRec = prompt('Enter new recommendation:');
    if (newRec && newRec.trim()) {
      setEditingRecommendations({
        ...editingRecommendations,
        [level]: [...(editingRecommendations[level] || []), newRec.trim()]
      });
    }
  };

  const removeRecommendation = (level: string, index: number) => {
    setEditingRecommendations({
      ...editingRecommendations,
      [level]: editingRecommendations[level].filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!rules) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load validation rules</p>
        <button 
          onClick={fetchRules}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Validation Rules Configuration
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage scam detection rules and thresholds
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchRules}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={saveRules}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['thresholds', 'keywords', 'urls', 'recommendations', 'features']).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'thresholds' | 'keywords' | 'urls' | 'recommendations' | 'features')}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-gray-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'thresholds' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Threat Level Thresholds
              </h2>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Dangerous Threshold</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Score ≥ {rules.scoringThresholds.dangerous} is considered dangerous
                      </p>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={rules.scoringThresholds.dangerous}
                    onChange={(e) => updateThreshold('dangerous', parseFloat(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Suspicious Threshold</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Score ≥ {rules.scoringThresholds.suspicious} is considered suspicious
                      </p>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={rules.scoringThresholds.suspicious}
                    onChange={(e) => updateThreshold('suspicious', parseFloat(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Safe Threshold</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Score {'<'} {rules.scoringThresholds.suspicious} is considered safe
                      </p>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={rules.scoringThresholds.safe}
                    onChange={(e) => updateThreshold('safe', parseFloat(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Scam Detection Keywords
              </h2>
              
              {Object.entries(editingKeywords).map(([category, keywords]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {category.replace('_', ' ')} Keywords
                    </h3>
                    <button
                      onClick={() => addKeyword(category)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center gap-2"
                      >
                        <span className="text-sm">{keyword}</span>
                        <button
                          onClick={() => removeKeyword(category, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'urls' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Suspicious URL Patterns
              </h2>
              
              <div className="grid gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">URL Shorteners</h3>
                  <div className="flex flex-wrap gap-2">
                    {rules.suspiciousUrlPatterns.url_shorteners.map((shortener, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {shortener}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Suspicious TLDs</h3>
                  <div className="flex flex-wrap gap-2">
                    {rules.suspiciousUrlPatterns.suspicious_tlds.map((tld, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {tld}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Phishing Patterns</h3>
                  <div className="flex flex-wrap gap-2">
                    {rules.suspiciousUrlPatterns.phishing_patterns.map((pattern, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Recommendations by Threat Level
              </h2>
              
              {Object.entries(editingRecommendations).map(([level, recs]) => (
                <div key={level} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {level.replace('_', ' ')} Recommendations
                    </h3>
                    <button
                      onClick={() => addRecommendation(level)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {recs.map((rec, index) => (
                      <li key={index} className="flex items-start justify-between gap-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">• {rec}</span>
                        <button
                          onClick={() => removeRecommendation(level, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Feature Flags
              </h2>
              
              <div className="grid gap-4">
                {Object.entries(rules.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => updateFeature(feature, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
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
