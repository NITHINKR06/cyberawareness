import React from 'react';
import '../styles/kali-theme.css';

const AnalyticsManager: React.FC = () => {
  return (
    <div className="terminal-card">
      <div className="terminal-card-header">
        <h2 className="terminal-card-title">📊 ANALYTICS & INSIGHTS</h2>
      </div>
      <div style={{ padding: '2rem' }}>
        <div className="ascii-art" style={{ textAlign: 'center', marginBottom: '2rem' }}>
{`
┌─────────────────────────────────┐
│   SYSTEM ANALYTICS DASHBOARD    │
│   ═══════════════════════════   │
│   [▓▓▓▓▓▓▓▓▓▓░░░░░] 70%        │
│   Processing Data...             │
└─────────────────────────────────┘
`}
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--kali-green)' }}>98.5%</div>
            <div className="stat-label">System Uptime</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--kali-blue)' }}>1,234</div>
            <div className="stat-label">Daily Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--kali-yellow)' }}>567</div>
            <div className="stat-label">Scams Detected</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--kali-cyan)' }}>89%</div>
            <div className="stat-label">Detection Accuracy</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--kali-bg)', borderRadius: '4px', border: '1px solid var(--kali-border)' }}>
          <h3 style={{ color: 'var(--kali-green)', marginBottom: '1rem' }}>📈 Advanced Analytics Features</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ Real-time threat monitoring</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ User behavior analysis</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Scam pattern recognition</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Performance metrics tracking</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Custom report generation</li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--kali-text-secondary)' }}>
          <p>Full analytics dashboard with charts and detailed insights coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;
