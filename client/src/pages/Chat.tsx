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
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b border-border bg-background/95 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-xl ${isPhilosophyMode ? 'bg-purple-600' : 'bg-gradient-to-r from-primary to-violet-600'} flex items-center justify-center text-white mr-3 shadow-lg`}>
            {isPhilosophyMode ? <Brain className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-1">
              {isPhilosophyMode ? 'Philosopher' : 'Counselor'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPhilosophyMode 
                ? 'Engage in deep philosophical discussions about existence, knowledge, ethics, and meaning'
                : 'Chat with your personal AI counselor for emotional support, productivity coaching, or general advice'
              }
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatProvider>
          <ChatWrapper />
        </ChatProvider>
      </div>
    </div>
  );
};

export default ChatPage;