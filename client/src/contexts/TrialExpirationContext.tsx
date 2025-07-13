import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import TrialExpiredModal from '@/components/subscription/TrialExpiredModal';

interface TrialExpirationContextType {
  showTrialExpiredModal: () => void;
}

const TrialExpirationContext = createContext<TrialExpirationContextType | null>(null);

export function TrialExpirationProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showTrialExpiredModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Listen for trial expiration events from API responses
  useEffect(() => {
    const handleTrialExpired = () => {
      showTrialExpiredModal();
    };

    window.addEventListener('trialExpired', handleTrialExpired);
    
    return () => {
      window.removeEventListener('trialExpired', handleTrialExpired);
    };
  }, []);

  return (
    <TrialExpirationContext.Provider value={{ showTrialExpiredModal }}>
      {children}
      <TrialExpiredModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </TrialExpirationContext.Provider>
  );
}

export function useTrialExpiration() {
  const context = useContext(TrialExpirationContext);
  if (!context) {
    throw new Error('useTrialExpiration must be used within a TrialExpirationProvider');
  }
  return context;
}