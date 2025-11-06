import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Terminal } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const FirebaseAdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const checkAuthState = () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.isAdmin || userData.role === 'admin') {
              navigate('/admin');
              return;
            }
          }
        }
      });
      return unsubscribe;
    };

    const unsubscribe = checkAuthState();
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Check if user is admin in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User account not found');
      }

      const userData = userDoc.data();
      if (!userData.isAdmin && userData.role !== 'admin') {
        // Sign out if not admin
        await auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store admin info in localStorage for session management
      localStorage.setItem('adminToken', user.uid);
      localStorage.setItem('adminUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        username: userData.username,
        isAdmin: true
      }));
      
      // Redirect to admin panel
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin login error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No admin account found with this email address.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="matrix-bg"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-green-900/50 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/50 rounded-full mb-4 animate-pulse">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-400 mb-2 font-mono">ADMIN ACCESS</h1>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Terminal className="w-4 h-4" />
              <span className="font-mono">FIREBASE SECURE PORTAL v2.0</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                EMAIL_ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-green-900/50 text-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono placeholder-gray-600"
                  placeholder="admin@system.local"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                PASSWORD_HASH
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-green-900/50 text-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono placeholder-gray-600"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm font-mono">
                <span className="text-red-500">ERROR:</span> {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-black py-3 rounded-lg font-bold hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider shadow-lg shadow-green-900/50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> AUTHENTICATING...
                </span>
              ) : (
                'ACCESS SYSTEM'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>PROTOCOL: FIREBASE</span>
              <span>ENCRYPTION: AES-256</span>
            </div>
            <div className="mt-4 text-center">
              <Link to="/" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                ← Return to Main Site
              </Link>
            </div>
          </div>
        </div>

        {/* Terminal-like status bar */}
        <div className="mt-4 bg-black/50 rounded-lg p-3 border border-green-900/30">
          <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
            <span className="animate-pulse">$</span>
            <span>firebase_auth --secure --mode=admin</span>
          </div>
        </div>
      </div>

      {/* Add some CSS for matrix effect */}
      <style>{`
        .matrix-bg {
          background-image: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(34, 197, 94, 0.03) 2px,
              rgba(34, 197, 94, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(34, 197, 94, 0.03) 2px,
              rgba(34, 197, 94, 0.03) 4px
            );
          animation: matrix-move 20s linear infinite;
        }
        
        @keyframes matrix-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(4px, 4px); }
        }
      `}</style>
    </div>
  );
};

export default FirebaseAdminLogin;
