import { createBrowserRouter, Navigate } from 'react-router-dom';
import { FirebaseAuthProvider as AuthProvider } from '../contexts/FirebaseAuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Auth from '../components/Auth';
import Dashboard from '../components/Dashboard';
import LearningModules from '../components/LearningModules';
import Achievements from '../components/Achievements';
import ReportScam from '../components/ReportScam';
import ScamAnalyzer from '../components/ScamAnalyzer';
import SecuritySandbox from '../components/SecuritySandbox';
import TimeMachine from '../components/TimeMachine';
import TimeMachinePage from '../pages/TimeMachinePage';
import UserProfile from '../components/UserProfile';
import Settings from '../components/Settings';
import AppLayout from '../components/AppLayout';
import PublicLayout from '../components/PublicLayout';
import Community from '../components/Community';
import AdminPanel from '../admin/AdminPanel';
import FirebaseAdminLogin from '../components/FirebaseAdminLogin';
import FirebaseAdminRegister from '../components/FirebaseAdminRegister';

export const router = createBrowserRouter([
  // Public routes - accessible without login
  {
    path: '/',
    element: <ThemeProvider><AuthProvider><PublicLayout /></AuthProvider></ThemeProvider>,
    children: [
      {
        index: true,
        element: <Navigate to="/analyzer" replace />,
      },
      {
        path: 'analyzer',
        element: <ScamAnalyzer />,
      },
      {
        path: 'modules',
        element: <LearningModules />,
      },
      {
        path: 'community',
        element: <Community />,
      },
      {
        path: 'timemachine',
        element: <TimeMachine />,
      },
    ],
  },
  
  // Protected routes - require authentication
  {
    path: '/app',
    element: <ThemeProvider><AuthProvider><AppLayout /></AuthProvider></ThemeProvider>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'modules',
        element: <LearningModules />,
      },
      {
        path: 'achievements',
        element: <Achievements />,
      },
      {
        path: 'report',
        element: <ReportScam />,
      },
      {
        path: 'analyzer',
        element: <ScamAnalyzer />,
      },
      {
        path: 'sandbox',
        element: <SecuritySandbox />,
      },
      {
        path: 'timemachine',
        element: <TimeMachine />,
      },
      {
        path: 'profile',
        element: <UserProfile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'community',
        element: <Community />,
      },
    ],
  },
  
  // Legacy routes - redirect to new structure
  {
    path: '/dashboard',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/profile',
    element: <Navigate to="/app/profile" replace />,
  },
  {
    path: '/settings',
    element: <Navigate to="/app/settings" replace />,
  },
  {
    path: '/achievements',
    element: <Navigate to="/app/achievements" replace />,
  },
  {
    path: '/report',
    element: <Navigate to="/app/report" replace />,
  },
  {
    path: '/sandbox',
    element: <Navigate to="/app/sandbox" replace />,
  },
  
  // Auth routes
  {
    path: '/auth',
    element: <ThemeProvider><AuthProvider><Auth /></AuthProvider></ThemeProvider>,
  },
  
  // Admin routes
  {
    path: '/admin/login',
    element: <ThemeProvider><AuthProvider><FirebaseAdminLogin /></AuthProvider></ThemeProvider>,
  },
  {
    path: '/admin/register',
    element: <ThemeProvider><AuthProvider><FirebaseAdminRegister /></AuthProvider></ThemeProvider>,
  },
  {
    path: '/admin/*',
    element: <ThemeProvider><AuthProvider><AdminPanel /></AuthProvider></ThemeProvider>,
  },
  
  // Standalone routes
  {
    path: '/timemachine-standalone',
    element: <ThemeProvider><AuthProvider><TimeMachinePage /></AuthProvider></ThemeProvider>,
  },
]);
