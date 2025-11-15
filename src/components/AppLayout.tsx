import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Auth from './Auth';
import LanguageSwitcher from './LanguageSwitcher';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Shield,
  Search,
  FlaskConical,
  User,
  Settings,
  Clock,
  Bell,
  MessageSquare,
  ChevronRight,
  Moon,
  Sun,
  ChevronLeft
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <Auth />;
  }

  // Navigation structure
  const mainNavigation = [
    { id: 'dashboard', name: t('nav.dashboard'), icon: LayoutDashboard, path: '/app/dashboard', gradient: 'from-cyan-500 to-indigo-500' },
    { id: 'modules', name: t('modules.title'), icon: BookOpen, path: '/app/modules', gradient: 'from-emerald-500 to-teal-500' },
    { id: 'achievements', name: t('nav.achievements'), icon: Award, path: '/app/achievements', gradient: 'from-amber-500 to-orange-500' },
    { id: 'community', name: t('nav.community'), icon: MessageSquare, path: '/app/community', gradient: 'from-purple-500 to-pink-500' },
  ];

  const toolsNavigation = [
    { id: 'analyzer', name: t('nav.scamAnalyzer'), icon: Search, path: '/app/analyzer', color: 'from-violet-500 to-purple-600', openInNewTab: false },
    { id: 'sandbox', name: t('nav.securitySandbox', 'Security Sandbox'), icon: FlaskConical, path: '/app/sandbox', color: 'from-emerald-500 to-teal-600', openInNewTab: false },
    { id: 'timemachine', name: t('nav.timeMachine', 'Time Machine'), icon: Clock, path: '/timemachine-standalone', color: 'from-amber-500 to-orange-600', openInNewTab: true },
    { id: 'report', name: t('nav.reportScam'), icon: AlertTriangle, path: '/app/report', color: 'from-rose-500 to-red-600', openInNewTab: false },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || (path === '/app/dashboard' && (location.pathname === '/app' || location.pathname === '/app/'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-x-hidden flex">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-50
        flex flex-col
        bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95
        backdrop-blur-2xl border-r border-slate-700/50
        shadow-2xl
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-72' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <button 
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-3 group relative flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-cyan-500 to-indigo-600 p-2.5 rounded-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                  WALRUS
                </h1>
                <p className="text-[9px] text-slate-500 font-medium tracking-wider -mt-0.5 whitespace-nowrap">SECURITY SUITE</p>
              </div>
            )}
          </button>
          
          {/* Toggle Sidebar Button - Desktop */}
          

          {/* Close Button - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-700/50">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{user.username}</p>
                <p className="text-xs text-slate-400 truncate">{user.email || t('appLayout.premiumMember', 'Premium Member')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-2">
            {sidebarOpen && (
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
                {t('appLayout.main', 'Main')}
              </h3>
            )}
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl
                    font-medium transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${!isActive && 'group-hover:scale-110 transition-transform duration-300'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="text-sm flex-1 text-left">{item.name}</span>
                      {isActive && (
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-20 blur-xl`}></div>
                      )}
                    </>
                  )}
                  {isActive && sidebarOpen && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Security Tools */}
          <div className="space-y-2">
            {sidebarOpen && (
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
                {t('appLayout.securityTools', 'Security Tools')}
              </h3>
            )}
            {toolsNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.openInNewTab) {
                      window.open(item.path, '_blank');
                    } else {
                      navigate(item.path);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl
                    font-medium transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${!isActive && 'group-hover:rotate-12 transition-transform duration-300'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="text-sm flex-1 text-left">{item.name}</span>
                      {isActive && (
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-20 blur-xl`}></div>
                      )}
                    </>
                  )}
                  {isActive && sidebarOpen && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <button
            onClick={() => {
              navigate('/app/profile');
              setMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-slate-400 hover:text-white hover:bg-slate-800/50
              transition-all duration-300
              ${!sidebarOpen && 'justify-center'}
            `}
            title={!sidebarOpen ? t('nav.profile', 'Profile') : undefined}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">{t('nav.profile', 'Profile')}</span>}
          </button>
          
          <button
            onClick={() => {
              navigate('/app/settings');
              setMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-slate-400 hover:text-white hover:bg-slate-800/50
              transition-all duration-300
              ${!sidebarOpen && 'justify-center'}
            `}
            title={!sidebarOpen ? t('nav.settings', 'Settings') : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">{t('nav.settings', 'Settings')}</span>}
          </button>

          <button
            onClick={logout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              bg-gradient-to-r from-red-500/10 to-rose-500/10
              text-red-400 hover:from-red-500/20 hover:to-rose-500/20
              border border-red-500/20 transition-all duration-300
              ${!sidebarOpen && 'justify-center'}
            `}
            title={!sidebarOpen ? t('nav.logout') : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-900/70 border-b border-slate-800/50 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Toggle Sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700/50"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50">
                <LanguageSwitcher />
                
                <button
                  className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
                  title={t('nav.notifications', 'Notifications')}
                >
                  <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </button>
                
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                >
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
      
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="backdrop-blur-xl bg-slate-800/90 border border-slate-700/50"
      />
    </div>
  );
}