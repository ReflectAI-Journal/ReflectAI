import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import ChatContainer from '@/components/chat/ChatContainer';
import { Bot, MessageSquare, Lightbulb, Brain } from 'lucide-react';

// Wrapper component to handle chat type from URL and initialize
const ChatWrapper = () => {
  const { changeSupportType } = useChat();
  const [location] = useLocation();
  
  useEffect(() => {
    // Check if the URL has a type parameter
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const chatType = searchParams.get('type');
    
    if (chatType === 'philosophy') {
      changeSupportType('philosophy');
    }
  }, [location, changeSupportType]);
  
  return <ChatContainer />;
};

const ChatPage: React.FC = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const chatType = searchParams.get('type');
  
  // Determine if we're in philosophy mode
  const isPhilosophyMode = chatType === 'philosophy';
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center mb-6">
          <div className={`h-12 w-12 rounded-lg ${isPhilosophyMode ? 'bg-purple-600' : 'bg-gradient-to-r from-primary via-secondary to-accent'} flex items-center justify-center text-white mr-4 shadow-md`}>
            {isPhilosophyMode ? <Brain className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-3xl font-header font-bold gradient-text mb-2">
              {isPhilosophyMode ? 'AI Philosopher' : 'AI Counselor'}
            </h1>
            <p className="text-muted-foreground">
              {isPhilosophyMode 
                ? 'Engage in deep philosophical discussions about existence, knowledge, ethics, and meaning'
                : 'Chat with your personal AI counselor for emotional support, productivity coaching, or general advice'
              }
            </p>
          </div>
        </div>
        
        {!isPhilosophyMode && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-2 bg-card rounded border border-border/50 flex flex-col items-center text-center">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <MessageSquare className="h-3 w-3 text-primary" />
              </div>
              <h3 className="text-xs font-medium">Emotional Support</h3>
            </div>
            
            <div className="p-2 bg-card rounded border border-border/50 flex flex-col items-center text-center">
              <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center mb-1">
                <MessageSquare className="h-3 w-3 text-secondary" />
              </div>
              <h3 className="text-xs font-medium">Productivity Coaching</h3>
            </div>
            
            <div className="p-2 bg-card rounded border border-border/50 flex flex-col items-center text-center">
              <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center mb-1">
                <MessageSquare className="h-3 w-3 text-accent" />
              </div>
              <h3 className="text-xs font-medium">General Advice</h3>
            </div>
          </div>
        )}
        
        {isPhilosophyMode && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-2 bg-card rounded border border-border/50 flex flex-col items-center text-center">
              <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center mb-1">
                <Brain className="h-3 w-3 text-purple-500" />
              </div>
              <h3 className="text-xs font-medium">Existentialism</h3>
            </div>
            
            <div className="p-2 bg-card rounded border border-border/50 flex flex-col items-center text-center">
              <div className="h-6 w-6 rounded-full bg-purple-600/10 flex items-center justify-center mb-1">
                <Lightbulb className="h-3 w-3 text-purple-600" />
              </div>
              <h3 className="text-xs font-medium">Ethics & Morality</h3>
            </div>
            
            <div className="p-2 bg-card rounded border border-border/50 flex flex-col items-center text-center">
              <div className="h-6 w-6 rounded-full bg-purple-700/10 flex items-center justify-center mb-1">
                <Brain className="h-3 w-3 text-purple-700" />
              </div>
              <h3 className="text-xs font-medium">Knowledge & Truth</h3>
            </div>
          </div>
        )}
      </div>
      
      <ChatProvider>
        <ChatWrapper />
      </ChatProvider>
    </div>
  );
};

export default ChatPage;