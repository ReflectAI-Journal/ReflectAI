import React, { createContext, useContext, useState, useEffect } from 'react';

// Fallback auth context for when Clerk domain isn't configured
interface FallbackUser {
  id: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
}

interface FallbackAuthContextType {
  user: FallbackUser | null;
  isLoaded: boolean;
  signOut: () => void;
}

const FallbackAuthContext = createContext<FallbackAuthContextType | undefined>(undefined);

export function FallbackAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FallbackUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user is already signed in (fallback logic)
    const savedUser = localStorage.getItem('fallback_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoaded(true);
  }, []);

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('fallback_user');
  };

  return (
    <FallbackAuthContext.Provider value={{ user, isLoaded, signOut }}>
      {children}
    </FallbackAuthContext.Provider>
  );
}

export function useFallbackAuth() {
  const context = useContext(FallbackAuthContext);
  if (!context) {
    throw new Error('useFallbackAuth must be used within FallbackAuthProvider');
  }
  return context;
}

// Fallback components that match Clerk's interface
export function FallbackSignedIn({ children }: { children: React.ReactNode }) {
  const { user } = useFallbackAuth();
  return user ? <>{children}</> : null;
}

export function FallbackSignedOut({ children }: { children: React.ReactNode }) {
  const { user } = useFallbackAuth();
  return !user ? <>{children}</> : null;
}

export function FallbackRedirectToSignIn() {
  useEffect(() => {
    // Redirect to auth page
    window.location.href = '/auth';
  }, []);
  return null;
}

// Mock user hook that matches Clerk's interface
export function useFallbackUser() {
  const { user, isLoaded } = useFallbackAuth();
  return { user, isLoaded };
}