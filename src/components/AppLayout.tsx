import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Auth from './Auth';
import LanguageSwitcher from './LanguageSwitcher';
import NavDropdown from './NavDropdown';
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
  Sun
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <Auth />;
  }

  // Navigation structure - simplified without non-working items
  const dashboardItems = [
    { id: 'dashboard', name: t('nav.dashboard'), icon: LayoutDashboard, onClick: () => navigate('/app/dashboard') },
  ];

  const achievementsItems = [
    { id: 'achievements', name: t('nav.achievements'), icon: Award, onClick: () => navigate('/app/achievements') },
  ];

  const userMenuItems = [
    { id: 'profile', name: t('nav.profile', 'Profile'), icon: User, onClick: () => navigate('/app/profile') },
    { id: 'settings', name: t('nav.settings', 'Settings'), icon: Settings, onClick: () => navigate('/app/settings') },
    { id: 'logout', name: t('nav.logout'), icon: LogOut, onClick: logout },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-900/70 border-b border-slate-800/50 shadow-2xl">
        {/* Premium gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px] gap-4">
            {/* Logo Section - Enhanced */}
            <div className="flex items-center min-w-fit">
              <button 
                onClick={() => navigate('/app/dashboard')}
                className="flex items-center gap-3 group relative"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-cyan-500 to-indigo-600 p-3 rounded-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    WALRUS
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wider -mt-1">SECURITY SUITE</p>
                </div>
              </button>
            </div>

            {/* Main Navigation - Desktop - Redesigned */}
            <div className="hidden lg:flex items-center gap-3 flex-1 justify-center max-w-5xl">
              {/* Core Navigation - Glass morphism pills */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50">
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                    isActiveRoute('/app/dashboard') 
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm">{t('nav.dashboard')}</span>
                  {isActiveRoute('/app/dashboard') && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 blur-xl"></div>
                  )}
                </button>

                <NavDropdown
                  label={t('nav.learn')}
                  icon={BookOpen}
                  items={[
                    { id: 'modules', name: 'Learning Modules', icon: BookOpen, onClick: () => navigate('/app/modules') },
                    { id: 'achievements', name: t('nav.achievements'), icon: Award, onClick: () => navigate('/app/achievements') },
                  ]}
                  isActive={isActiveRoute('/app/modules') || isActiveRoute('/app/achievements')}
                />

                <button
                  onClick={() => navigate('/app/community')}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                    isActiveRoute('/app/community') 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Community</span>
                  {isActiveRoute('/app/community') && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"></div>
                  )}
                </button>
              </div>

              {/* Premium Divider */}
              <div className="relative h-8 w-px">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>
              </div>

              {/* Security Tools - Card style */}
              <div className="flex items-center gap-2">
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
                      }}
                      className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                          : 'bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                      title={item.name}
                    >
                      <Icon className={`w-4 h-4 ${!isActive && 'group-hover:rotate-12 transition-transform duration-300'}`} />
                      <span className="text-sm font-semibold">{item.name}</span>
                      {isActive && (
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-20 blur-xl`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Section - User Info & Controls - Refined */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
              {/* Utility Controls with glass effect */}
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50">
                <LanguageSwitcher />
                
                {/* Notifications - Enhanced */}
                <button
                  className="relative p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
                  title={t('nav.notifications', 'Notifications')}
                >
                  <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                </button>
                
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 hover:rotate-12"
                >
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>

              {/* User Dropdown - Premium style */}
              <div className="hidden md:block">
                <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/50">
                  <NavDropdown
                    label={user.username}
                    icon={User}
                    items={userMenuItems}
                    className="font-semibold text-sm"
                  />
                </div>
              </div>

              {/* Mobile Menu Button - Enhanced */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden relative p-2.5 rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
              >
                <div className="relative w-5 h-5">
                  <span className={`absolute inset-0 transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-180 opacity-0' : ''}`}>
                    <Menu className="w-5 h-5" />
                  </span>
                  <span className={`absolute inset-0 transform transition-all duration-300 ${mobileMenuOpen ? '' : '-rotate-180 opacity-0'}`}>
                    <X className="w-5 h-5" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Premium redesign */}
        <div className={`lg:hidden absolute inset-x-0 top-full transition-all duration-500 ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800/50 shadow-2xl">
            <div className="px-4 py-6 space-y-6 max-h-[calc(100vh-72px)] overflow-y-auto">
              {/* User Profile Card - Mobile */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-2xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{user.username}</p>
                    <p className="text-xs text-slate-400">{user.email || 'Premium Member'}</p>
                  </div>
                </div>
              </div>

              {/* Core Navigation - Cards */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                  Main Navigation
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { path: '/app/dashboard', icon: LayoutDashboard, name: t('nav.dashboard'), gradient: 'from-cyan-500 to-indigo-500' },
                    { path: '/app/modules', icon: BookOpen, name: 'Learning Modules', gradient: 'from-emerald-500 to-teal-500' },
                    { path: '/app/achievements', icon: Award, name: t('nav.achievements'), gradient: 'from-amber-500 to-orange-500' },
                    { path: '/app/community', icon: MessageSquare, name: 'Community', gradient: 'from-purple-500 to-pink-500' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`group relative flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                          isActive 
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                        {isActive && (
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-10 blur-xl`}></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tools Section - Grid Cards */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                  Security Tools
                </h3>
                <div className="grid grid-cols-2 gap-3">
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
                        className={`group relative flex flex-col items-center gap-3 px-3 py-5 rounded-2xl font-medium transition-all duration-300 ${
                          isActive 
                            ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs text-center font-semibold">{item.name}</span>
                        {isActive && (
                          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-10 blur-xl`}></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Actions - Bottom */}
              <div className="space-y-3 pt-4 border-t border-slate-800/50">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      navigate('/app/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{t('nav.profile', 'Profile')}</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/app/settings');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-300"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">{t('nav.settings', 'Settings')}</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400 hover:from-red-500/20 hover:to-rose-500/20 border border-red-500/20 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
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