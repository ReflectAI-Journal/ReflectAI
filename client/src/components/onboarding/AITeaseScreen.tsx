import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AITeaseScreenProps {
  userThought: string;
  onNext: () => void;
}

const AITeaseScreen: React.FC<AITeaseScreenProps> = ({ userThought, onNext }) => {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getAITease() {
      try {
        setIsLoading(true);
        // Use the existing API endpoint for AI responses
        const response = await apiRequest('POST', '/api/ai-response', {
          content: userThought,
          teaseOnly: true // Tell the backend we only want a teaser
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get AI reflection');
        }
        
        setAiResponse(data.response);
      } catch (err: any) {
        console.error('Error getting AI tease:', err);
        setError(err.message || 'Something went wrong');
        // Provide a fallback response if the API fails
        setAiResponse('It seems there might be deeper feelings behind what you shared...');
      } finally {
        setIsLoading(false);
      }
    }

    if (userThought) {
      getAITease();
    }
  }, [userThought]);

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
        AI Reflection Preview
      </h1>
      
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6 mb-8">
        <div className="space-y-4">
          <div className="text-slate-600 dark:text-slate-300 italic">
            <span className="font-semibold text-slate-700 dark:text-slate-200">You wrote:</span>
            <p className="mt-1">{userThought.length > 150 ? `${userThought.substring(0, 150)}...` : userThought}</p>
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-slate-700 dark:text-slate-200">AI Reflection:</div>
            
            {isLoading ? (
              <div className="animate-pulse mt-2 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 mt-2">{error}</p>
            ) : (
              <div className="mt-2">
                <p className="text-slate-700 dark:text-slate-300">{aiResponse}</p>
                
                {/* Blurred continuation text */}
                <div className="mt-4 relative">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm filter blur-sm">
                    <p className="text-slate-700 dark:text-slate-300">
                      This deeper analysis examines the emotional undertones and psychological patterns in your journal entry, offering personalized insights to help you better understand your thoughts and feelings...
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                      Continue this reflection with AI →
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={onNext}
        disabled={isLoading}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Unlock Full AI Reflection
      </button>
    </div>
  );
};

export default AITeaseScreen;