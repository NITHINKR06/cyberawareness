import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, FileText, MessageSquare, Tag, Shield, Flag, Clock, Activity, Database, BarChart3, AlertTriangle } from 'lucide-react';
import '../styles/kali-theme.css';

interface DashboardStats {
  stats: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    totalPosts: number;
    totalComments: number;
    totalTopics: number;
    totalScams: number;
    totalReports: number;
    pendingReports: number;
    totalAnalyses: number;
  };
  recentActivity: {
    users: any[];
    reports: any[];
    posts: any[];
  };
  analytics: {
    dailyUserRegistrations: any[];
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Dashboard error:', err);
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

  if (error) {
    return (
      <div className="terminal-card" style={{ background: 'rgba(248, 81, 73, 0.1)', borderColor: 'var(--kali-red)' }}>
        <p style={{ color: 'var(--kali-red)' }} className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="ascii-art" style={{ marginBottom: '2rem', textAlign: 'center' }}>
{`
██╗    ██╗ █████╗ ██╗     ██████╗ ██╗   ██╗███████╗
██║    ██║██╔══██╗██║     ██╔══██╗██║   ██║██╔════╝
██║ █╗ ██║███████║██║     ██████╔╝██║   ██║███████╗
██║███╗██║██╔══██║██║     ██╔══██╗██║   ██║╚════██║
╚███╔███╔╝██║  ██║███████╗██║  ██║╚██████╔╝███████║
 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
                ADMIN CONTROL CENTER
`}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--kali-blue)' }}>
            <Users size={24} />
          </div>
          <div className="stat-value">{stats.stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--kali-green)' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-value" style={{ color: 'var(--kali-green)' }}>
            {stats.stats.activeUsers}
          </div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--kali-red)' }}>
            <UserX size={24} />
          </div>
          <div className="stat-value" style={{ color: 'var(--kali-red)' }}>
            {stats.stats.bannedUsers}
          </div>
          <div className="stat-label">Banned Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--kali-cyan)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-value">{stats.stats.totalPosts}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--kali-purple)' }}>
            <MessageSquare size={24} />
          </div>
          <div className="stat-value">{stats.stats.totalComments}</div>
          <div className="stat-label">Comments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--kali-orange)' }}>
            <Tag size={24} />
          </div>
          <div className="stat-value">{stats.stats.totalTopics}</div>
          <div className="stat-label">Topics</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--kali-red)' }}>
            <Shield size={24} />
          </div>
          <div className="stat-value">{stats.stats.totalScams}</div>
          <div className="stat-label">Scam Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--kali-yellow)' }}>
            <Flag size={24} />
          </div>
          <div className="stat-value" style={{ color: 'var(--kali-yellow)' }}>
            {stats.stats.pendingReports}
          </div>
          <div className="stat-label">Pending Reports</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Recent Users */}
        <div className="terminal-card">
          <div className="terminal-card-header">
            <h3 className="terminal-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} style={{ color: 'var(--kali-blue)' }} />
              Recent Users
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.users.map((user: any) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="terminal-card">
          <div className="terminal-card-header">
            <h3 className="terminal-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flag size={20} style={{ color: 'var(--kali-yellow)' }} />
              Recent Reports
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.reports.map((report: any) => (
                  <tr key={report._id}>
                    <td>{report.scamType}</td>
                    <td>{report.userId?.username || 'Anonymous'}</td>
                    <td>
                      <span className={`badge badge-${report.status === 'pending' ? 'warning' : 'success'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="terminal-card">
          <div className="terminal-card-header">
            <h3 className="terminal-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: 'var(--kali-cyan)' }} />
              Recent Posts
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Topic</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.posts.map((post: any) => (
                  <tr key={post._id}>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title}
                    </td>
                    <td>{post.author?.username}</td>
                    <td>
                      <span className="badge badge-info">{post.topic?.name}</span>
                    </td>
                    <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status */}
        <div className="terminal-card">
          <div className="terminal-card-header">
            <h3 className="terminal-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} style={{ color: 'var(--kali-green)' }} />
              System Status
            </h3>
          </div>
          <div style={{ fontFamily: 'var(--terminal-font)', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--kali-text-secondary)' }}>Status:</span>{' '}
              <span style={{ color: 'var(--kali-green)' }}>● ONLINE</span>
            </div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} style={{ color: 'var(--kali-text-secondary)' }} />
              <span style={{ color: 'var(--kali-text-secondary)' }}>Database:</span>{' '}
              <span style={{ color: 'var(--kali-green)' }}>Connected</span>
            </div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} style={{ color: 'var(--kali-text-secondary)' }} />
              <span style={{ color: 'var(--kali-text-secondary)' }}>Total Analyses:</span>{' '}
              <span style={{ color: 'var(--kali-blue)' }}>{stats.stats.totalAnalyses}</span>
            </div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flag size={16} style={{ color: 'var(--kali-text-secondary)' }} />
              <span style={{ color: 'var(--kali-text-secondary)' }}>Total Reports:</span>{' '}
              <span style={{ color: 'var(--kali-blue)' }}>{stats.stats.totalReports}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--kali-text-secondary)' }} />
              <span style={{ color: 'var(--kali-text-secondary)' }}>Last Update:</span>{' '}
              <span style={{ color: 'var(--kali-cyan)' }}>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Registration Chart */}
      {stats.analytics.dailyUserRegistrations.length > 0 && (
        <div className="terminal-card" style={{ marginTop: '2rem' }}>
          <div className="terminal-card-header">
            <h3 className="terminal-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} style={{ color: 'var(--kali-purple)' }} />
              User Registrations (Last 30 Days)
            </h3>
          </div>
          <div style={{ padding: '1rem', fontFamily: 'var(--terminal-font)' }}>
            {stats.analytics.dailyUserRegistrations.map((day: any) => (
              <div key={day._id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '100px', color: 'var(--kali-text-secondary)' }}>{day._id}:</span>
                <div style={{ flex: 1, background: 'var(--kali-bg)', padding: '0.25rem', marginLeft: '1rem' }}>
                  <div 
                    style={{ 
                      width: `${(day.count / Math.max(...stats.analytics.dailyUserRegistrations.map((d: any) => d.count))) * 100}%`,
                      background: 'var(--kali-green)',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '0.5rem'
                    }}
                  >
                    <span style={{ color: 'var(--kali-bg)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {day.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
