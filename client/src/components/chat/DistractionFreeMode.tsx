import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { SendHorizonal, RefreshCw, X, Minimize2, Brain, Bot, User } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

const DistractionFreeMode: React.FC = () => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    supportType, 
    toggleDistractionFreeMode,
    personalityType,
    getSelectedPersonality
  } = useChat();
  
  // Determine if we're in philosophy mode
  const isPhilosophyMode = supportType === 'philosophy';
  
  // Get personality display name
  const getPersonalityDisplayName = () => {
    if (personalityType === 'default') return 'Default';
    
    const customPersonality = getSelectedPersonality();
    if (customPersonality) return customPersonality.name;
    
    // Built-in personality names
    const builtInNames: Record<string, string> = {
      socratic: 'Socratic',
      stoic: 'Stoic',
      existentialist: 'Existentialist',
      analytical: 'Analytical',
      poetic: 'Poetic',
      humorous: 'Humorous',
      zen: 'Zen'
    };
    
    return builtInNames[personalityType] || personalityType;
  };

  const handleSubmit = async () => {
    if (message.trim() && !isLoading) {
      await sendMessage(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, []);

  const exitDistractionFreeMode = () => {
    toggleDistractionFreeMode();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col distraction-free-mode">
      {/* Minimal header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm",
            isPhilosophyMode ? "bg-indigo-600" : "bg-blue-600"
          )}>
            {isPhilosophyMode ? <Brain className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div>
            <h1 className="text-sm font-medium">
              {isPhilosophyMode ? 'Philosopher' : 'Counselor'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {getPersonalityDisplayName()}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={exitDistractionFreeMode}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-4",
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0",
                message.role === 'user' 
                  ? "bg-gray-600" 
                  : isPhilosophyMode 
                    ? "bg-indigo-600" 
                    : "bg-blue-600"
              )}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : isPhilosophyMode ? (
                  <Brain className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              {/* Message content */}
              <div className={cn(
                "max-w-[70%] px-4 py-3 rounded-2xl",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0",
                isPhilosophyMode ? "bg-indigo-600" : "bg-blue-600"
              )}>
                {isPhilosophyMode ? <Brain className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className="bg-muted text-foreground px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {isPhilosophyMode ? 'Contemplating...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <AutoResizeTextarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isPhilosophyMode 
                ? "Ask a profound philosophical question..." 
                : "Share what's on your mind..."
              }
              disabled={isLoading}
              className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 bg-muted border-0 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            <Button 
              className={cn(
                "h-11 w-11 rounded-full text-white shadow-sm",
                isPhilosophyMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700",
                !message.trim() && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistractionFreeMode;