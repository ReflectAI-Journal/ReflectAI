import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatContainer from '@/components/chat/ChatContainer';
import { Bot, MessageSquare } from 'lucide-react';

const ChatPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center text-white mr-4 shadow-md">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-header font-bold gradient-text mb-2">AI Companion</h1>
            <p className="text-muted-foreground">
              Chat with your personal AI assistant for emotional support, productivity coaching, or general advice
            </p>
          </div>
        </div>
        
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
      </div>
      
      <ChatProvider>
        <ChatContainer />
      </ChatProvider>
    </div>
  );
};

export default ChatPage;