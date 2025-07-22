import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

const ClerkProviderWrapper = ({ children }: ClerkProviderWrapperProps) => {
  // If no valid Clerk key is provided, show error message
  if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_placeholder") {
    return (
      <div style={{padding: '20px', textAlign: 'center'}}>
        <h2>Clerk Configuration Missing</h2>
        <p>Please configure VITE_CLERK_PUBLISHABLE_KEY environment variable.</p>
        <p>Current key: {PUBLISHABLE_KEY || 'Not set'}</p>
      </div>
    );
  }
  
  console.log('Initializing Clerk with key:', PUBLISHABLE_KEY?.substring(0, 20) + '...');
  
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/app/counselor"
      signUpFallbackRedirectUrl="/app/counselor"
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderWrapper;