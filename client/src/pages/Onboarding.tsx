import React from 'react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { Link } from 'wouter';

const Onboarding: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 p-4 fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/">
              <a className="flex items-center cursor-pointer">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  ReflectAI
                </span>
              </a>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth?tab=login">
                <a className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  Login
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content - the onboarding flow */}
      <main className="flex-grow pt-20">
        <OnboardingFlow />
      </main>
    </div>
  );
};

export default Onboarding;