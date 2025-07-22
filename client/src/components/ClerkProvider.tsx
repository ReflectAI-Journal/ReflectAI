import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { FallbackAuthProvider } from './FallbackAuth';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

const ClerkProviderWrapper = ({ children }: ClerkProviderWrapperProps) => {
  if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_placeholder") {
    console.log('Using fallback authentication system due to missing/placeholder Clerk keys');
    return (
      <FallbackAuthProvider>
        {children}
      </FallbackAuthProvider>
    );
  }

  console.log('Using Clerk authentication with live keys');
  
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderWrapper;