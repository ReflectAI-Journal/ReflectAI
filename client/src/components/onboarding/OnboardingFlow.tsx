import React, { useState } from 'react';
import StartScreen from './StartScreen';
import AITeaseScreen from './AITeaseScreen';
import PaywallScreen from './PaywallScreen';

enum OnboardingStep {
  START = 'start',
  AI_TEASE = 'ai_tease',
  PAYWALL = 'paywall'
}

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.START);
  const [userThought, setUserThought] = useState<string>('');

  const handleStartNext = (thought: string) => {
    setUserThought(thought);
    setCurrentStep(OnboardingStep.AI_TEASE);
  };

  const handleTeaseNext = () => {
    setCurrentStep(OnboardingStep.PAYWALL);
  };

  return (
    <div className="min-h-screen py-10 flex flex-col justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {currentStep === OnboardingStep.START && (
        <StartScreen onNext={handleStartNext} />
      )}
      
      {currentStep === OnboardingStep.AI_TEASE && (
        <AITeaseScreen userThought={userThought} onNext={handleTeaseNext} />
      )}
      
      {currentStep === OnboardingStep.PAYWALL && (
        <PaywallScreen />
      )}
      
      {/* Progress indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          <div className={`h-2 w-12 rounded-full transition-all ${
            currentStep === OnboardingStep.START 
              ? 'bg-blue-500' 
              : 'bg-blue-200 dark:bg-blue-900'
          }`}></div>
          <div className={`h-2 w-12 rounded-full transition-all ${
            currentStep === OnboardingStep.AI_TEASE 
              ? 'bg-blue-500' 
              : 'bg-blue-200 dark:bg-blue-900'
          }`}></div>
          <div className={`h-2 w-12 rounded-full transition-all ${
            currentStep === OnboardingStep.PAYWALL 
              ? 'bg-blue-500' 
              : 'bg-blue-200 dark:bg-blue-900'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;