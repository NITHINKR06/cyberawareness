import { createBrowserRouter } from 'react-router-dom';
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
import Community from '../components/Community';
import AdminPanel from '../admin/AdminPanel';
import FirebaseAdminLogin from '../components/FirebaseAdminLogin';
import FirebaseAdminRegister from '../components/FirebaseAdminRegister';

export const router = createBrowserRouter([
  {
    path: '/',
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
  {
    path: '/auth',
    element: <ThemeProvider><AuthProvider><Auth /></AuthProvider></ThemeProvider>,
  },
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
  {
    path: '/timemachine-standalone',
    element: <ThemeProvider><AuthProvider><TimeMachinePage /></AuthProvider></ThemeProvider>,
  },
]);
