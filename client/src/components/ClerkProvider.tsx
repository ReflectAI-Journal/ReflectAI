import { ReactNode } from 'react';
import { FallbackAuthProvider } from './FallbackAuth';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

const ClerkProviderWrapper = ({ children }: ClerkProviderWrapperProps) => {
  // Force use of fallback authentication until Clerk domain is configured
  console.log('Using fallback authentication system due to domain configuration issues');
  return (
    <FallbackAuthProvider>
      {children}
    </FallbackAuthProvider>
  );
};

export default ClerkProviderWrapper;