import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AdminLayout from './AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import UsersManager from './components/UsersManager';
import PostsManager from './components/PostsManager';
import CommentsManager from './components/CommentsManager';
import TopicsManager from './components/TopicsManager';
import ScamsManager from './components/ScamsManager';
import ReportsManager from './components/ReportsManager';
import AnalyticsManager from './components/AnalyticsManager';
import './styles/kali-theme.css';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check Firebase auth state for admin
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is admin in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.isAdmin || userData.role === 'admin') {
              setIsAdmin(true);
              // Store admin info in localStorage for session management
              localStorage.setItem('adminToken', user.uid);
              localStorage.setItem('adminUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                username: userData.username,
                isAdmin: true
              }));
            } else {
              // User is not admin
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminUser');
              navigate('/admin/login');
            }
          } else {
            // User document doesn't exist
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/admin/login');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          navigate('/admin/login');
        }
      } else {
        // No user logged in
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="admin-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="terminal-loader"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-panel">
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersManager />} />
          <Route path="/posts" element={<PostsManager />} />
          <Route path="/comments" element={<CommentsManager />} />
          <Route path="/topics" element={<TopicsManager />} />
          <Route path="/scams" element={<ScamsManager />} />
          <Route path="/reports" element={<ReportsManager />} />
          <Route path="/analytics" element={<AnalyticsManager />} />
        </Routes>
      </AdminLayout>
    </div>
  );
};

export default AdminPanel;
