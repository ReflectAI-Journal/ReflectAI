import React from 'react';
import { useLocation } from 'wouter';
import { ChatProvider } from '@/contexts/ChatContext';
import { Brain } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import PhilosopherChat from '@/components/philosopher/PhilosopherChat';



const PhilosopherPage: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-3 mb-8">
          <BackButton className="mt-1" />
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white mr-4 shadow-sm">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-header font-bold mb-2 text-indigo-600">
                Philosopher
              </h1>
              <p className="text-muted-foreground">
                Engage in deep philosophical discourse and explore life's profound questions
              </p>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <ChatProvider>
            <PhilosopherChat />
          </ChatProvider>
        </div>
      </div>
    </div>
  );
};

export default PhilosopherPage;