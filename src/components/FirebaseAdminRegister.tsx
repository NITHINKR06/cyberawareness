import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const FirebaseAdminRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin registration is available
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      // Check if any admin users exist in Firestore
      const usersRef = collection(db, 'users');
      const adminQuery = query(usersRef, where('isAdmin', '==', true));
      const adminSnapshot = await getDocs(adminQuery);
      
      // Also check for admin role
      const roleQuery = query(usersRef, where('role', '==', 'admin'));
      const roleSnapshot = await getDocs(roleQuery);
      
      setCanRegister(adminSnapshot.empty && roleSnapshot.empty);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setError('Failed to check admin registration status');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: formData.username
      });

      // Create admin user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: formData.username,
        email: formData.email,
        level: 1,
        totalPoints: 0,
        currentStreak: 0,
        isAdmin: true,
        role: 'admin',
        isActive: true,
        isBanned: false,
        createdAt: new Date(),
        lastLoginDate: new Date(),
        lastActivity: new Date()
      });

      // Store admin info in localStorage
      localStorage.setItem('adminToken', user.uid);
      localStorage.setItem('adminUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        username: formData.username,
        isAdmin: true
      }));
      
      setSuccess(true);
      
      // Redirect to admin panel after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err: any) {
      console.error('Admin registration error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400 text-xl">Checking admin registration status...</div>
      </div>
    );
  }

  if (!canRegister) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/50 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Registration Disabled</h2>
            <p className="text-gray-400 mb-6">
              Admin registration is no longer available. An administrator account already exists for this system.
            </p>
            <Link
              to="/admin/login"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/50 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">Admin Account Created!</h2>
            <p className="text-gray-400">
              Your administrator account has been successfully created. Redirecting to admin panel...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/50 rounded-full mb-4">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-400 mb-2">Admin Registration</h1>
            <p className="text-gray-400 text-sm">
              Create the administrator account for your system
            </p>
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <p className="text-yellow-400 text-xs">
                ⚠️ Only one admin account can be created. After registration, this page will be permanently disabled.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter admin username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter strong password"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an admin account?{' '}
              <Link to="/admin/login" className="text-green-400 hover:text-green-300">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseAdminRegister;
