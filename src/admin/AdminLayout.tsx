import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
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
  X,
  Sun,
  Moon
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: t('admin.dashboard.label', 'Dashboard'), icon: Home },
    { path: '/admin/users', label: t('admin.users.label', 'Users'), icon: Users },
    { path: '/admin/posts', label: t('admin.posts.label', 'Posts'), icon: FileText },
    { path: '/admin/comments', label: t('admin.comments'), icon: MessageSquare },
    { path: '/admin/topics', label: t('admin.topics'), icon: Tag },
    { path: '/admin/scams', label: t('admin.scams'), icon: AlertTriangle },
    { path: '/admin/reports', label: t('admin.reports'), icon: Flag },
    { path: '/admin/analytics', label: t('admin.analytics'), icon: BarChart3 },
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
              {t('admin.adminTerminal')}
            </h2>
          </div>
          <div className="ascii-art" style={{ fontSize: '0.6rem' }}>
{`╔═══════════════════════╗
║  ${t('admin.walrusAdminPanel')}   ║
║  ${t('admin.authorizedAccess')}  ║
╚═══════════════════════╝`}
          </div>
          <div style={{ color: 'var(--kali-text-secondary)', fontSize: '0.8rem' }}>
            {t('admin.loggedInAs')} <span style={{ color: 'var(--kali-green)' }}>{user?.username}</span>
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
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <div className="terminal-header">
          <span className="terminal-title">{t('admin.walrusSecurityAdmin')}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="terminal-btn"
              style={{ 
                padding: '0.5rem', 
                minWidth: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isDark ? t('settings.light', 'Light') : t('settings.dark', 'Dark')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span style={{ color: 'var(--kali-text-secondary)', fontSize: '0.9rem' }}>
              {new Date().toLocaleString()}
            </span>
          </div>
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
