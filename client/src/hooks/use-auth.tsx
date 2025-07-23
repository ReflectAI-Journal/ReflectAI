import React, { useState, useEffect, createContext, useContext } from 'react';

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
    // Check for saved user
    const savedUser = localStorage.getItem('auth-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simple authentication
    const mockUser = {
      uid: 'demo-user',
      email: email,
      displayName: email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('auth-user', JSON.stringify(mockUser));
  };

  const signUp = async (email: string, password: string, name?: string) => {
    // Simple authentication
    const mockUser = {
      uid: 'demo-user-' + Date.now(),
      email: email,
      displayName: name || email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('auth-user', JSON.stringify(mockUser));
    return { user: mockUser };
  };

  const signOut = async () => {
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