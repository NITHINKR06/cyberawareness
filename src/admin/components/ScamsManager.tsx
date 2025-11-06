import React from 'react';
import { AlertTriangle } from 'lucide-react';
import '../styles/kali-theme.css';

const ScamsManager: React.FC = () => {
  return (
    <div className="terminal-card">
      <div className="terminal-card-header">
        <h2 className="terminal-card-title flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          SCAM MANAGEMENT
        </h2>
      </div>
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--kali-text-secondary)' }}>
        <p>Scam database management interface coming soon...</p>
      </div>
    </div>
  );
};

export default ScamsManager;
