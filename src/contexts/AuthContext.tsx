import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateUser: (updateData: { username?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';
const USE_FIXED_AUTH = true; // Toggle to use fixed authentication endpoint

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('user');
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        setUser(parsedUser);
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    // Check for stored token and validate it
    const token = localStorage.getItem('authToken');
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          totalPoints: data.user.totalPoints || 0,
          currentStreak: data.user.currentStreak || 0,
          level: data.user.level || 1,
          isAdmin: data.user.isAdmin || false,
          role: data.user.role || 'user',
        });
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Use the fixed endpoint that bypasses the caching issue
      const loginEndpoint = USE_FIXED_AUTH 
        ? `${API_URL}/auth-fixed/login-fixed`
        : `${API_URL}/auth/login`;
      
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Set user data
      setUser({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        totalPoints: data.user.totalPoints || 0,
        currentStreak: data.user.currentStreak || 0,
        level: data.user.level || 1,
        isAdmin: data.user.isAdmin || false,
        role: data.user.role || 'user',
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Set user data
      setUser({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        totalPoints: data.user.totalPoints || 0,
        currentStreak: data.user.currentStreak || 0,
        level: data.user.level || 1,
        isAdmin: data.user.isAdmin || false,
        role: data.user.role || 'user',
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updateUser = async (updateData: { username?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update user data in context
      setUser({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        totalPoints: data.user.totalPoints || 0,
        currentStreak: data.user.currentStreak || 0,
        level: data.user.level || 1,
        isAdmin: data.user.isAdmin || false,
        role: data.user.role || 'user',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user'); // Also clear demo user
    // Clear session cookie by making a logout request
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(console.error);
  };

  const isAdmin = user?.isAdmin || user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'moderator' || false;

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
