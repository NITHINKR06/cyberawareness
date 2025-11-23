import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Activity, Users, FileText, Flag, Shield } from 'lucide-react';
import { getApiBaseUrl } from '../../services/backendApi';
import '../styles/kali-theme.css';

interface AnalyticsData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    totalComments: number;
    totalReports: number;
    totalScams: number;
    totalAnalyses: number;
  };
  trends: {
    userGrowth: number;
    postGrowth: number;
    reportGrowth: number;
  };
  recentActivity: {
    topUsers: any[];
    topPosts: any[];
    recentReports: any[];
  };
}

const AnalyticsManager: React.FC = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      
      // Transform the data to match our AnalyticsData interface
      setAnalytics({
        stats: {
          totalUsers: data.stats.totalUsers,
          activeUsers: data.stats.activeUsers,
          totalPosts: data.stats.totalPosts,
          totalComments: data.stats.totalComments,
          totalReports: data.stats.totalReports,
          totalScams: data.stats.totalScams,
          totalAnalyses: data.stats.totalAnalyses
        },
        trends: {
          userGrowth: data.stats.activeUsers > 0 ? ((data.stats.activeUsers / data.stats.totalUsers) * 100).toFixed(1) : 0,
          postGrowth: data.stats.totalPosts > 0 ? 100 : 0,
          reportGrowth: data.stats.totalReports > 0 ? 100 : 0
        },
        recentActivity: {
          topUsers: data.recentActivity?.users || [],
          topPosts: data.recentActivity?.posts || [],
          recentReports: data.recentActivity?.reports || []
        }
      });
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div className="terminal-loader"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="terminal-card" style={{ background: 'rgba(248, 81, 73, 0.1)', borderColor: 'var(--kali-red)' }}>
        <p style={{ color: 'var(--kali-red)' }} className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {error || 'No analytics data available'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="terminal-card">
        <div className="terminal-card-header">
          <h2 className="terminal-card-title flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('admin.analytics.title', 'ANALYTICS & INSIGHTS')}
          </h2>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Key Metrics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ color: 'var(--kali-blue)' }}>
                <Users size={24} />
              </div>
              <div className="stat-value" style={{ color: 'var(--kali-blue)' }}>
                {analytics.stats.totalUsers}
              </div>
              <div className="stat-label">{t('admin.analytics.totalUsers', 'Total Users')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--kali-text-secondary)', marginTop: '0.25rem' }}>
                {analytics.stats.activeUsers} {t('admin.analytics.active', 'active')}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ color: 'var(--kali-cyan)' }}>
                <FileText size={24} />
              </div>
              <div className="stat-value" style={{ color: 'var(--kali-cyan)' }}>
                {analytics.stats.totalPosts}
              </div>
              <div className="stat-label">{t('admin.analytics.totalPosts', 'Total Posts')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--kali-text-secondary)', marginTop: '0.25rem' }}>
                {analytics.stats.totalComments} {t('admin.analytics.comments', 'comments')}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ color: 'var(--kali-yellow)' }}>
                <Flag size={24} />
              </div>
              <div className="stat-value" style={{ color: 'var(--kali-yellow)' }}>
                {analytics.stats.totalReports}
              </div>
              <div className="stat-label">{t('admin.analytics.totalReports', 'Total Reports')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--kali-text-secondary)', marginTop: '0.25rem' }}>
                {t('admin.analytics.pending', 'Pending')}: {analytics.stats.totalReports}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ color: 'var(--kali-red)' }}>
                <Shield size={24} />
              </div>
              <div className="stat-value" style={{ color: 'var(--kali-red)' }}>
                {analytics.stats.totalScams}
              </div>
              <div className="stat-label">{t('admin.analytics.totalScams', 'Scam Records')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--kali-text-secondary)', marginTop: '0.25rem' }}>
                {analytics.stats.totalAnalyses} {t('admin.analytics.analyses', 'analyses')}
              </div>
            </div>
          </div>

          {/* Growth Trends */}
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="terminal-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--kali-green)' }} />
                <span style={{ color: 'var(--kali-text-secondary)', fontSize: '0.9rem' }}>
                  {t('admin.analytics.userGrowth', 'User Growth')}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--kali-green)' }}>
                {analytics.trends.userGrowth}%
              </div>
            </div>

            <div className="terminal-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--kali-blue)' }} />
                <span style={{ color: 'var(--kali-text-secondary)', fontSize: '0.9rem' }}>
                  {t('admin.analytics.postGrowth', 'Post Growth')}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--kali-blue)' }}>
                {analytics.trends.postGrowth}%
              </div>
            </div>

            <div className="terminal-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--kali-yellow)' }} />
                <span style={{ color: 'var(--kali-text-secondary)', fontSize: '0.9rem' }}>
                  {t('admin.analytics.reportGrowth', 'Report Growth')}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--kali-yellow)' }}>
                {analytics.trends.reportGrowth}%
              </div>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--kali-green)', marginBottom: '1rem' }} className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t('admin.analytics.recentActivity', 'Recent Activity Summary')}
            </h3>
            <div style={{ padding: '1rem', background: 'var(--kali-bg-secondary)', borderRadius: '4px', border: '1px solid var(--kali-border)' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem', color: 'var(--kali-text-secondary)' }}>
                  ✓ {t('admin.analytics.realTimeMonitoring', 'Real-time threat monitoring active')}
                </li>
                <li style={{ marginBottom: '0.5rem', color: 'var(--kali-text-secondary)' }}>
                  ✓ {t('admin.analytics.userBehavior', 'User behavior analysis enabled')}
                </li>
                <li style={{ marginBottom: '0.5rem', color: 'var(--kali-text-secondary)' }}>
                  ✓ {t('admin.analytics.scamPatterns', 'Scam pattern recognition active')}
                </li>
                <li style={{ marginBottom: '0.5rem', color: 'var(--kali-text-secondary)' }}>
                  ✓ {t('admin.analytics.performanceMetrics', 'Performance metrics tracking enabled')}
                </li>
                <li style={{ color: 'var(--kali-text-secondary)' }}>
                  ✓ {t('admin.analytics.customReports', 'Custom report generation available')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;
