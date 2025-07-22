import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode, useState, useEffect } from 'react';
import { FallbackAuthProvider } from './FallbackAuth';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

const ClerkProviderWrapper = ({ children }: ClerkProviderWrapperProps) => {
  // Force fallback system until domain configuration is resolved
  console.log('Using fallback authentication system due to domain configuration issues');
  
  return (
    <FallbackAuthProvider>
      {children}
    </FallbackAuthProvider>
  );
};

export default ClerkProviderWrapper;