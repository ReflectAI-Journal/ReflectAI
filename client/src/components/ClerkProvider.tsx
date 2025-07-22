import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

const ClerkProviderWrapper = ({ children }: ClerkProviderWrapperProps) => {
  // If no valid Clerk key is provided, render children without Clerk
  if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_placeholder") {
    return <>{children}</>;
  }
  
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderWrapper;