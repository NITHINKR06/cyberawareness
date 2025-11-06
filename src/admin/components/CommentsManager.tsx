import React from 'react';
import '../styles/kali-theme.css';

const CommentsManager: React.FC = () => {
  return (
    <div className="terminal-card">
      <div className="terminal-card-header">
        <h2 className="terminal-card-title">💬 COMMENT MANAGEMENT</h2>
      </div>
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--kali-text-secondary)' }}>
        <p>Comment management interface coming soon...</p>
      </div>
    </div>
  );
};

export default CommentsManager;
