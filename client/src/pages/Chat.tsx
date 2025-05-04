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
              {isPhilosophyMode ? 'AI Philosopher' : 'AI Companion'}
            </h1>
            <p className="text-muted-foreground">
              {isPhilosophyMode 
                ? 'Engage in deep philosophical discussions about existence, knowledge, ethics, and meaning'
                : 'Chat with your personal AI assistant for emotional support, productivity coaching, or general advice'
              }
            </p>
          </div>
        </div>
        
        {!isPhilosophyMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-card/80 rounded-lg border border-border/50 flex flex-col items-center text-center shadow-journal">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Emotional Support</h3>
              <p className="text-muted-foreground text-sm">
                Process feelings, reduce anxiety, and build emotional resilience with evidence-based techniques
              </p>
            </div>
            
            <div className="p-6 bg-card/80 rounded-lg border border-border/50 flex flex-col items-center text-center shadow-journal">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Productivity Coaching</h3>
              <p className="text-muted-foreground text-sm">
                Get help with goal setting, time management, and maintaining focus on your important tasks
              </p>
            </div>
            
            <div className="p-6 bg-card/80 rounded-lg border border-border/50 flex flex-col items-center text-center shadow-journal">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">General Advice</h3>
              <p className="text-muted-foreground text-sm">
                Chat about anything that's on your mind and receive thoughtful, personalized guidance
              </p>
            </div>
          </div>
        )}
        
        {isPhilosophyMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-card/80 rounded-lg border border-border/50 flex flex-col items-center text-center shadow-journal">
              <div className="h-14 w-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <Brain className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Existentialism</h3>
              <p className="text-muted-foreground text-sm">
                Explore questions about existence, freedom, and the meaning we create in our lives
              </p>
            </div>
            
            <div className="p-6 bg-card/80 rounded-lg border border-border/50 flex flex-col items-center text-center shadow-journal">
              <div className="h-14 w-14 rounded-full bg-purple-600/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ethics & Morality</h3>
              <p className="text-muted-foreground text-sm">
                Discuss frameworks for understanding right and wrong, virtue, and the nature of goodness
              </p>
            </div>
            
            <div className="p-6 bg-card/80 rounded-lg border border-border/50 flex flex-col items-center text-center shadow-journal">
              <div className="h-14 w-14 rounded-full bg-purple-700/10 flex items-center justify-center mb-4">
                <Brain className="h-7 w-7 text-purple-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Knowledge & Truth</h3>
              <p className="text-muted-foreground text-sm">
                Consider epistemological questions about what we can know and how we can know it
              </p>
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