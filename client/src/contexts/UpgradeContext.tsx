import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import UpgradeModal from '@/components/subscription/UpgradeModal';

interface UpgradePrompt {
  featureName: string;
  requiredPlan: string;
  description?: string;
}

interface UpgradeContextType {
  showUpgradeModal: (prompt: UpgradePrompt) => void;
}

const UpgradeContext = createContext<UpgradeContextType | null>(null);

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<UpgradePrompt | null>(null);

  const showUpgradeModal = (prompt: UpgradePrompt) => {
    setCurrentPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPrompt(null);
  };

  // Listen for upgrade required events from API responses
  useEffect(() => {
    const handleUpgradeRequired = (event: CustomEvent) => {
      const { featureName, requiredPlan, message } = event.detail;
      
      // Convert feature names to user-friendly display names
      const featureDisplayNames: Record<string, string> = {
        'advanced-analytics': 'Advanced Analytics',
        'export-features': 'Export Features',
        'custom-personalities': 'Custom AI Personalities',
        'ai-journal-insights': 'AI Journal Insights',
        'enhanced-mood-tracking': 'Enhanced Mood Tracking',
        'calendar-integration': 'Calendar Integration'
      };

      const displayName = featureDisplayNames[featureName] || featureName;
      const planName = requiredPlan === 'pro' ? 'Pro' : 'Unlimited';

      showUpgradeModal({
        featureName: displayName,
        requiredPlan: planName,
        description: message
      });
    };

    window.addEventListener('upgradeRequired', handleUpgradeRequired as EventListener);
    
    return () => {
      window.removeEventListener('upgradeRequired', handleUpgradeRequired as EventListener);
    };
  }, []);

  return (
    <UpgradeContext.Provider value={{ showUpgradeModal }}>
      {children}
      {currentPrompt && (
        <UpgradeModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          featureName={currentPrompt.featureName}
          requiredPlan={currentPrompt.requiredPlan}
          description={currentPrompt.description}
        />
      )}
    </UpgradeContext.Provider>
  );
}

export function useUpgrade() {
  const context = useContext(UpgradeContext);
  if (!context) {
    throw new Error('useUpgrade must be used within an UpgradeProvider');
  }
  return context;
}