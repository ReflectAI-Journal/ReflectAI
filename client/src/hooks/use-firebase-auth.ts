import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';


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
    if (!auth) {
      // Demo mode - set a mock user
      setUser({
        uid: 'demo-user',
        email: 'demo@reflectai.app',
        displayName: 'Demo User',
      } as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      // Demo mode
      setUser({
        uid: 'demo-user',
        email: email,
        displayName: 'Demo User',
      } as User);
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!auth) {
      // Demo mode
      const mockUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: name || 'Demo User',
      } as User;
      setUser(mockUser);
      return { user: mockUser };
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name && result.user) {
      await updateProfile(result.user, { displayName: name });
    }
    return result;
  };



  const signOut = async () => {
    if (!auth) {
      setUser(null);
      return;
    }
    await firebaseSignOut(auth);
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