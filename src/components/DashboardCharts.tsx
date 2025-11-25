import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts';
import { AlertTriangle, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { reportService } from '../services/backendApi';

// Derived chart data built from real backend stats
const buildThreatTrendsFromStats = (stats: any) => {
  // Backend exposes last24Hours and last7Days counts, but not per-day series.
  // We synthesize a simple 7-day trend using last7Days total as a baseline distribution.
  const total7 = stats?.last7Days ?? 0;
  const avg = Math.max(0, Math.round(total7 / 7));
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return days.map((day, idx) => ({
    day,
    phishing: Math.max(0, avg - ((idx % 3) - 1) * 2),
    malware: Math.max(0, Math.round(avg * 0.6) - ((idx % 2) * 2)),
    scams: Math.max(0, Math.round(avg * 0.5) + (idx % 4) - 1)
  }));
};

const COLORS = ['#3B82F6','#EF4444','#F59E0B','#8B5CF6','#10B981','#6B7280'];
const toDistribution = (dist: any[]) => {
  if (!Array.isArray(dist)) return [] as { name: string; value: number; color: string }[];
  return dist.map((d, i) => ({
    name: String(d._id || 'Other'),
    value: Number(d.count || 0),
    color: COLORS[i % COLORS.length]
  }));
};

// Placeholder personal trend (no per-month API yet)
const userProgressData = [
  { month: 'Jan', points: 100, modules: 1 },
  { month: 'Feb', points: 250, modules: 2 },
  { month: 'Mar', points: 450, modules: 3 },
  { month: 'Apr', points: 600, modules: 4 },
  { month: 'May', points: 850, modules: 5 },
  { month: 'Jun', points: 1100, modules: 7 },
];

// Static skill radar until a skills API exists - will be translated in component
const skillRadarDataKeys = [
  'passwordSecurity',
  'phishingDetection',
  'safeBrowsing',
  'socialEngineering',
  'dataProtection',
  'networkSecurity'
];
const skillRadarScores = [85, 70, 90, 60, 75, 65];

const buildCommunityFromRecent = (recent: any[]) => {
  // Bucket recent verified reports by hour label
  const buckets: Record<string, number> = {};
  recent.forEach(r => {
    const date = new Date(r.createdAt);
    const hour = String(date.getHours()).padStart(2, '0') + ':00';
    buckets[hour] = (buckets[hour] || 0) + 1;
  });
  const hours = ['00:00','04:00','08:00','12:00','16:00','20:00'];
  return hours.map(h => ({ hour: h, reports: buckets[h] || 0 }));
};

export function ThreatTrendsChart() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    reportService.getStats().then(setStats).catch(() => setStats(null));
  }, []);

  const trendData = buildThreatTrendsFromStats(stats);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {t('dashboard.threatTrends', 'Weekly Threat Trends')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="phishing" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Phishing"
          />
          <Line 
            type="monotone" 
            dataKey="malware" 
            stroke="#EF4444" 
            strokeWidth={2}
            dot={{ fill: '#EF4444', r: 4 }}
            activeDot={{ r: 6 }}
            name="Malware"
          />
          <Line 
            type="monotone" 
            dataKey="scams" 
            stroke="#F59E0B" 
            strokeWidth={2}
            dot={{ fill: '#F59E0B', r: 4 }}
            activeDot={{ r: 6 }}
            name="Scams"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ThreatDistributionChart() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    reportService.getStats().then(setStats).catch(() => setStats(null));
  }, []);

  const threatDistribution = toDistribution(stats?.typeDistribution || []);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {t('dashboard.threatDistribution', 'Threat Distribution')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={threatDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name} ${entry.value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {threatDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UserProgressChart() {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {t('dashboard.progressOverTime', 'Your Progress Over Time')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={userProgressData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="points" 
            stroke="#3B82F6" 
            fill="#3B82F6"
            fillOpacity={0.3}
            strokeWidth={2}
            name={t('dashboard.pointsEarned', 'Points Earned')}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillRadarChart() {
  const { t } = useTranslation();
  
  const skillRadarData = skillRadarDataKeys.map((key, index) => ({
    skill: t(`dashboard.skills.${key}`, key),
    score: skillRadarScores[index]
  }));
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {t('dashboard.skillAssessment', 'Skill Assessment')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={skillRadarData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="skill" fontSize={11} />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            fontSize={10}
            stroke="#6B7280"
          />
          <Radar 
            name={t('dashboard.yourSkills', 'Your Skills')} 
            dataKey="score" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CommunityActivityChart() {
  const { t } = useTranslation();
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    reportService.getRecentReports()
      .then((data: any[]) => setRecent(Array.isArray(data) ? data : []))
      .catch(() => setRecent([]));
  }, []);

  const communityReportsData = buildCommunityFromRecent(recent);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {t('dashboard.communityActivity', 'Community Scam Reports (24h)')}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={communityReportsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="reports" 
            fill="#10B981"
            radius={[8, 8, 0, 0]}
            name="Reports"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Live threat feed component
export function LiveThreatFeed() {
  const { t } = useTranslation();
  
  const mockThreats = [
    {
      id: 1,
      type: 'phishing',
      severity: 'high',
      description: 'Fake banking email detected',
      time: '2 mins ago',
      location: 'Mumbai, India'
    },
    {
      id: 2,
      type: 'malware',
      severity: 'critical',
      description: 'Ransomware link reported',
      time: '5 mins ago',
      location: 'Delhi, India'
    },
    {
      id: 3,
      type: 'scam',
      severity: 'medium',
      description: 'Online shopping fraud',
      time: '12 mins ago',
      location: 'Bangalore, India'
    },
    {
      id: 4,
      type: 'phishing',
      severity: 'high',
      description: 'Government impersonation SMS',
      time: '18 mins ago',
      location: 'Chennai, India'
    },
    {
      id: 5,
      type: 'scam',
      severity: 'low',
      description: 'Lottery winning notification',
      time: '25 mins ago',
      location: 'Pune, India'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phishing': return <span className="text-2xl">🎣</span>;
      case 'malware': return <span className="text-2xl">🦠</span>;
      case 'scam': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default: return <Lock className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {t('dashboard.liveThreatFeed', 'Live Threat Feed')}
        </h3>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-600">Live</span>
        </span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {mockThreats.map((threat) => (
          <div 
            key={threat.id}
            className={`p-3 rounded-lg border ${getSeverityColor(threat.severity)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <span>{getTypeIcon(threat.type)}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold capitalize">{threat.type}</span>
                  <span className="text-xs">{threat.time}</span>
                </div>
                <p className="text-sm mb-1">{threat.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    📍 {threat.location}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${
                    threat.severity === 'critical' ? 'bg-red-200' :
                    threat.severity === 'high' ? 'bg-orange-200' :
                    threat.severity === 'medium' ? 'bg-yellow-200' :
                    'bg-blue-200'
                  }`}>
                    {threat.severity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
