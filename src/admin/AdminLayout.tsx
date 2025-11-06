import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { 
  Home, 
  Users, 
  FileText, 
  MessageSquare, 
  Tag, 
  AlertTriangle, 
  Flag, 
  BarChart3, 
  Monitor, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/posts', label: 'Posts', icon: FileText },
    { path: '/admin/comments', label: 'Comments', icon: MessageSquare },
    { path: '/admin/topics', label: 'Topics', icon: Tag },
    { path: '/admin/scams', label: 'Scams', icon: AlertTriangle },
    { path: '/admin/reports', label: 'Reports', icon: Flag },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="terminal-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 200,
          display: 'none',
          padding: '0.5rem',
        }}
        id="mobile-menu-toggle"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--kali-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Monitor className="w-6 h-6" style={{ color: 'var(--kali-green)' }} />
            <h2 style={{ color: 'var(--kali-green)', fontSize: '1.2rem', margin: 0 }}>
              ADMIN TERMINAL
            </h2>
          </div>
          <div className="ascii-art" style={{ fontSize: '0.6rem' }}>
{`╔═══════════════════════╗
║  WALRUS ADMIN PANEL   ║
║  [AUTHORIZED ACCESS]  ║
╚═══════════════════════╝`}
          </div>
          <div style={{ color: 'var(--kali-text-secondary)', fontSize: '0.8rem' }}>
            Logged in as: <span style={{ color: 'var(--kali-green)' }}>{user?.username}</span>
          </div>
        </div>

        <nav style={{ padding: '1rem 0' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon">
                <item.icon className="w-4 h-4" />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '1rem',
          borderTop: '1px solid var(--kali-border)'
        }}>
          <button
            onClick={handleLogout}
            className="terminal-btn terminal-btn-danger"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <div className="terminal-header">
          <span className="terminal-title">WALRUS SECURITY ADMIN</span>
          <span style={{ marginLeft: 'auto', color: 'var(--kali-text-secondary)', fontSize: '0.9rem' }}>
            {new Date().toLocaleString()}
          </span>
        </div>
        
        <div className="command-line">
          <span className="command-prompt">root@walrus:~#</span>
          <input 
            type="text" 
            className="command-input" 
            value={`admin ${location.pathname.split('/').pop() || 'dashboard'}`}
            readOnly
          />
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default AdminLayout;
