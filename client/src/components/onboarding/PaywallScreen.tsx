import React from 'react';
import { DirectCheckoutButton } from '@/components/subscription/DirectCheckoutButton';

const PaywallScreen: React.FC = () => {
  // Default Pro monthly plan
  const proPlan = {
    id: "pro-monthly",
    name: "Pro",
    price: 9.99,
    interval: "month"
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
        Unlock Full Access
      </h1>
      
      <p className="text-center text-slate-600 dark:text-slate-400 mb-8 max-w-md">
        Experience the power of AI-assisted reflection and journaling to deepen your self-understanding and personal growth.
      </p>
      
      <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              What You'll Get
            </h2>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 dark:text-slate-300">Unlimited AI reflections</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 dark:text-slate-300">Mood & growth tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 dark:text-slate-300">Private journal entries</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 dark:text-slate-300">Advanced AI personalities</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 dark:text-slate-300">Goal tracking & visualization</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg mb-4">
              <div className="text-center mb-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <div className="flex justify-center items-end mb-1">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">${proPlan.price}</span>
                <span className="text-slate-500 dark:text-slate-400">/{proPlan.interval}</span>
              </div>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                7-day free trial, cancel anytime
              </p>
              <div className="mt-auto">
                <DirectCheckoutButton plan={proPlan} />
              </div>
            </div>
            
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              By subscribing, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-center text-sm text-slate-500 dark:text-slate-400 space-y-2 md:space-y-0 md:space-x-4 mt-4">
        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
          Terms of Service
        </a>
        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
          Help Center
        </a>
      </div>
    </div>
  );
};

export default PaywallScreen;