import React, { createContext, useContext, useState, useEffect } from 'react';

interface TutorialContextType {
  showTutorial: boolean;
  startTutorial: () => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if user has completed tutorial before
  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem('reflectai-tutorial-completed');
    if (!hasCompletedTutorial) {
      // Don't auto-start tutorial, wait for explicit trigger
      // This allows us to control when it shows (e.g., after subscription)
    }
  }, []);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('reflectai-tutorial-completed', 'true');
    localStorage.setItem('reflectai-tutorial-completed-date', new Date().toISOString());
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('reflectai-tutorial-completed', 'true');
    localStorage.setItem('reflectai-tutorial-skipped', 'true');
    localStorage.setItem('reflectai-tutorial-completed-date', new Date().toISOString());
  };

  return (
    <TutorialContext.Provider value={{
      showTutorial,
      startTutorial,
      completeTutorial,
      skipTutorial
    }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};