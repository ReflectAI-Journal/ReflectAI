import React, { useState } from 'react';

interface StartScreenProps {
  onNext: (userThought: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onNext }) => {
  const [userThought, setUserThought] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userThought.trim()) return;
    
    setIsSubmitting(true);
    // Send the user to the next screen with their input
    onNext(userThought);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
        What's been on your mind today?
      </h1>
      
      <form onSubmit={handleSubmit} className="w-full">
        <textarea
          value={userThought}
          onChange={(e) => setUserThought(e.target.value)}
          placeholder="Type your thoughts here..."
          className="w-full p-4 h-48 text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:focus:ring-purple-500 resize-none"
          disabled={isSubmitting}
        />
        
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={!userThought.trim() || isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Let AI Reflect With You"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StartScreen;