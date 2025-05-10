import React, { useState } from "react";
import { useLocation } from "wouter";
import StartScreen from "./StartScreen";
import AITeaseScreen from "./AITeaseScreen";
import PaywallScreen from "./PaywallScreen";

enum OnboardingStep {
  START = 'start',
  AI_TEASE = 'ai_tease',
  PAYWALL = 'paywall'
}

export function OnboardingFlow() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.START);
  const [userThought, setUserThought] = useState<string>("");
  
  const handleStartScreenNext = (thought: string) => {
    setUserThought(thought);
    setCurrentStep(OnboardingStep.AI_TEASE);
  };
  
  const handleAITeaseNext = () => {
    setCurrentStep(OnboardingStep.PAYWALL);
  };
  
  const handlePaywallComplete = (planId: string) => {
    navigate(`/checkout/${planId}`);
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      {currentStep === OnboardingStep.START && (
        <StartScreen onNext={handleStartScreenNext} />
      )}
      
      {currentStep === OnboardingStep.AI_TEASE && (
        <AITeaseScreen
          userThought={userThought}
          onNext={handleAITeaseNext}
        />
      )}
      
      {currentStep === OnboardingStep.PAYWALL && (
        <PaywallScreen onSelectPlan={handlePaywallComplete} />
      )}
    </div>
  );
}