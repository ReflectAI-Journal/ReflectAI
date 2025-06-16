import React from "react";
import { OnboardingFlow } from "../components/onboarding/OnboardingFlow";

export default function Onboarding() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="w-full max-w-2xl mx-auto p-8">
        <OnboardingFlow />
      </div>
    </div>
  );
}