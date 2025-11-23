import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Shield,
  Search,
  Clock,
  BookOpen,
  MessageSquare,
  Menu,
  X,
  LogIn,
  UserPlus,
  Bell,
  Moon,
  Sun,
  PartyPopper
} from 'lucide-react';

export default function PublicLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is logged in, redirect to main app
  if (user) {
    navigate('/app/dashboard');
    return null;
  }

  const publicNavigation = [
    { id: 'analyzer', name: t('nav.scamAnalyzer'), icon: Search, path: '/analyzer', color: 'from-violet-500 to-purple-600' },
    { id: 'modules', name: t('modules.title'), icon: BookOpen, path: '/modules', color: 'from-emerald-500 to-teal-600' },
    { id: 'community', name: t('nav.community'), icon: MessageSquare, path: '/community', color: 'from-purple-500 to-pink-500' },
    { id: 'timemachine', name: t('nav.timeMachine'), icon: Clock, path: '/timemachine', color: 'from-amber-500 to-orange-600' },
  ] as const;

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-x-hidden transition-colors duration-300">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-400/30 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-400/30 dark:bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => navigate('/analyzer')}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 p-2 sm:p-3 rounded-xl">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    WALRUS
                  </h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">SECURITY SUITE</p>
                </div>
              </button>
            </div>

            {/* Main Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-2xl">
              {publicNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white`
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Utility Controls */}
              {/* <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                <LanguageSwitcher />
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {isDark ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div> */}

              {/* Auth Buttons - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('auth.signIn')}</span>
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-600 hover:to-indigo-600 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('auth.signUp')}</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-x-0 top-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
              {/* Navigation Links */}
              <div className="space-y-2">
                {publicNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white`
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Auth Buttons - Mobile */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    navigate('/auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('auth.signIn')}</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-600 hover:to-indigo-600 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('publicLayout.signUpFree', 'Sign Up Free')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sign Up Banner */}
      <div className="relative z-10 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <PartyPopper className="w-4 h-4" />
                  {t('publicLayout.bannerTitle', 'Create a free account to save your progress and earn rewards!')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  {t('publicLayout.bannerSubtitle', 'Track your learning, participate in the community, and unlock achievements')}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 whitespace-nowrap"
            >
              {t('publicLayout.signUpFree', 'Sign Up Free')}
            </button>
          </div>
        </div>
      </div>

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
        theme={isDark ? "dark" : "light"}
        toastClassName="backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/50"
      />
    </div>
  );
}
