import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, type User } from '../lib/authService';
import { apiRequest } from '../lib/queryClient';

interface SubscriptionStatus {
  status: 'active' | 'expired';
  plan: string | null;
  trialActive: boolean;
  requiresSubscription: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  isSubscriptionLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    password: string;
    email?: string;
    phoneNumber?: string;
    agreeToTerms: boolean;
    subscribeToNewsletter?: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
  getInitials: () => string;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

  const isAuthenticated = !!user;
  const isLoading = loading;

  const login = async (username: string, password: string) => {
    try {
      const authData = await authService.login(username, password);
      setUser(authData.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    email?: string;
    phoneNumber?: string;
    agreeToTerms: boolean;
    subscribeToNewsletter?: boolean;
  }) => {
    try {
      const authData = await authService.register(userData);
      setUser(authData.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    setIsSubscriptionLoading(true);
    try {
      const response = await apiRequest('GET', '/api/subscription/status');
      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      setSubscriptionStatus(null);
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  const getInitials = (): string => {
    if (!user?.username) return 'RU'; // ReflectAI User
    const words = user.username.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.map(word => word.charAt(0)).slice(0, 2).join('').toUpperCase();
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        if (authService.isAuthenticated()) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoading,
      subscriptionStatus,
      isSubscriptionLoading,
      login,
      register,
      logout,
      refreshUser,
      checkSubscriptionStatus,
      getInitials,
      isAuthenticated,
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