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
              {isPhilosophyMode ? 'Philosopher' : 'AI Counselor'}
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
          <div className="flex gap-2 mb-3">
            <div className="px-2 py-1 bg-card rounded border border-border/50 flex items-center text-center text-xs">
              <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center mr-1">
                <MessageSquare className="h-2 w-2 text-primary" />
              </div>
              <span className="font-medium">Emotional Support</span>
            </div>
            
            <div className="px-2 py-1 bg-card rounded border border-border/50 flex items-center text-center text-xs">
              <div className="h-4 w-4 rounded-full bg-secondary/10 flex items-center justify-center mr-1">
                <MessageSquare className="h-2 w-2 text-secondary" />
              </div>
              <span className="font-medium">Productivity</span>
            </div>
            
            <div className="px-2 py-1 bg-card rounded border border-border/50 flex items-center text-center text-xs">
              <div className="h-4 w-4 rounded-full bg-accent/10 flex items-center justify-center mr-1">
                <MessageSquare className="h-2 w-2 text-accent" />
              </div>
              <span className="font-medium">General</span>
            </div>
          </div>
        )}
        
        {isPhilosophyMode && (
          <div className="flex gap-2 mb-3">
            <div className="px-2 py-1 bg-card rounded border border-border/50 flex items-center text-center text-xs">
              <div className="h-4 w-4 rounded-full bg-purple-500/10 flex items-center justify-center mr-1">
                <Brain className="h-2 w-2 text-purple-500" />
              </div>
              <span className="font-medium">Existentialism</span>
            </div>
            
            <div className="px-2 py-1 bg-card rounded border border-border/50 flex items-center text-center text-xs">
              <div className="h-4 w-4 rounded-full bg-purple-600/10 flex items-center justify-center mr-1">
                <Lightbulb className="h-2 w-2 text-purple-600" />
              </div>
              <span className="font-medium">Ethics</span>
            </div>
            
            <div className="px-2 py-1 bg-card rounded border border-border/50 flex items-center text-center text-xs">
              <div className="h-4 w-4 rounded-full bg-purple-700/10 flex items-center justify-center mr-1">
                <Brain className="h-2 w-2 text-purple-700" />
              </div>
              <span className="font-medium">Knowledge</span>
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