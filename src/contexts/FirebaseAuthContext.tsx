import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateUser: (updateData: { username?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        // Fetch additional user data from Firestore
        await loadUserData(firebaseUser.uid);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load user data from Firestore
  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: uid,
          username: userData.username || 'User',
          email: userData.email || '',
          totalPoints: userData.totalPoints || 0,
          currentStreak: userData.currentStreak || 0,
          level: userData.level || 1,
          isAdmin: userData.isAdmin || false,
          role: userData.role || 'user',
        });

        // Update last login
        await updateDoc(doc(db, 'users', uid), {
          lastLoginDate: serverTimestamp(),
          lastActivity: serverTimestamp()
        });

        // Update streak
        await updateStreak(uid, userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Update user streak
  const updateStreak = async (uid: string, userData: any) => {
    try {
      const now = new Date();
      const lastLogin = userData.lastLoginDate ? userData.lastLoginDate.toDate() : new Date();
      const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      let newStreak = userData.currentStreak || 0;
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }

      if (newStreak !== userData.currentStreak) {
        await updateDoc(doc(db, 'users', uid), {
          currentStreak: newStreak
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await loadUserData(userCredential.user.uid);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        level: 1,
        totalPoints: 0,
        currentStreak: 0,
        isAdmin: false,
        role: 'user',
        isActive: true,
        isBanned: false,
        createdAt: serverTimestamp(),
        lastLoginDate: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      // Load the user data
      await loadUserData(userCredential.user.uid);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Update user profile
  const updateUser = async (updateData: { 
    username?: string; 
    email?: string; 
    currentPassword?: string; 
    newPassword?: string 
  }) => {
    if (!firebaseUser) {
      throw new Error('No user logged in');
    }

    try {
      const updates: any = {};

      // Update username
      if (updateData.username && updateData.username !== user?.username) {
        await updateProfile(firebaseUser, {
          displayName: updateData.username
        });
        updates.username = updateData.username;
      }

      // Update password
      if (updateData.newPassword && updateData.currentPassword) {
        // Re-authenticate user first
        const credential = EmailAuthProvider.credential(
          firebaseUser.email!,
          updateData.currentPassword
        );
        await reauthenticateWithCredential(firebaseUser, credential);
        
        // Update password
        await updatePassword(firebaseUser, updateData.newPassword);
      }

      // Update Firestore document if there are changes
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          ...updates,
          lastActivity: serverTimestamp()
        });
        
        // Reload user data
        await loadUserData(firebaseUser.uid);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      let errorMessage = 'Failed to update profile.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password should be at least 6 characters.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout. Please try again.');
    }
  };

  const isAdmin = user?.isAdmin || user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'moderator' || false;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      updateUser, 
      logout, 
      isLoading, 
      isAdmin 
    }}>
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
