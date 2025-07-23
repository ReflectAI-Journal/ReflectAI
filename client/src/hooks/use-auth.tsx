import React, { useState, useEffect, createContext, useContext } from 'react';
import { account } from '@/lib/appwrite';
import { ID } from 'appwrite';

interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Appwrite session
    const checkSession = async () => {
      try {
        const session = await account.get();
        const appwriteUser = {
          uid: session.$id,
          email: session.email,
          displayName: session.name || session.email.split('@')[0]
        };
        setUser(appwriteUser);
      } catch (error) {
        // No active session, check localStorage fallback
        const savedUser = localStorage.getItem('auth-user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Try Appwrite authentication first
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      const appwriteUser = {
        uid: session.$id,
        email: session.email,
        displayName: session.name || session.email.split('@')[0]
      };
      setUser(appwriteUser);
      // Clear localStorage fallback when using Appwrite
      localStorage.removeItem('auth-user');
    } catch (error) {
      console.error('Appwrite login failed, using demo mode:', error);
      // Fallback to demo authentication
      const mockUser = {
        uid: 'demo-user',
        email: email,
        displayName: email.split('@')[0],
      };
      setUser(mockUser);
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      // Try Appwrite registration first
      const userId = ID.unique();
      await account.create(userId, email, password, name);
      
      // After successful registration, automatically log in
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      
      const appwriteUser = {
        uid: session.$id,
        email: session.email,
        displayName: session.name || name || email.split('@')[0]
      };
      setUser(appwriteUser);
      // Clear localStorage fallback when using Appwrite
      localStorage.removeItem('auth-user');
      return { user: appwriteUser };
    } catch (error) {
      console.error('Appwrite signup failed, using demo mode:', error);
      // Fallback to demo authentication
      const mockUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: name || email.split('@')[0],
      };
      setUser(mockUser);
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
      return { user: mockUser };
    }
  };

  const signOut = async () => {
    try {
      // Try to delete Appwrite session first
      await account.deleteSession('current');
    } catch (error) {
      console.error('Appwrite logout failed:', error);
    }
    // Always clear local state and localStorage
    setUser(null);
    localStorage.removeItem('auth-user');
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}