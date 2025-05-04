import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, RefreshCw, Sparkles, Mic, Image } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, clearChat } = useChat();
  
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
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // Auto-focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  return (
    <div className="border-t border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-b-lg">
      <div className="flex flex-col gap-3">
        {/* Enhancement suggestion chips */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-xs font-normal bg-primary/10 hover:bg-primary/20 text-primary"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "How can I improve my morning routine?")}
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Morning routine
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-xs font-normal bg-violet-500/10 hover:bg-violet-500/20 text-violet-500"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "What are some ways to reduce stress and anxiety?")}
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Stress reduction
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-xs font-normal bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "Help me organize my thoughts about a decision I need to make.")}
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Decision helper
          </Button>
        </div>
        
        {/* Input area with enhanced styling */}
        <div className={cn(
          "flex gap-2 relative rounded-2xl border border-border/50 bg-background p-1 transition-all duration-200",
          isFocused ? "shadow-glow-soft ring-1 ring-primary/20" : "shadow-sm"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChat}
            title="New conversation"
            className="shrink-0 h-10 w-10 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type a message or ask for advice..."
            className="min-h-[40px] max-h-[120px] resize-none bg-transparent border-0 focus-visible:ring-0 p-2.5 shadow-none"
            disabled={isLoading}
          />
          
          {/* Feature buttons (for future implementation) */}
          <div className="flex gap-1 items-center pr-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              title="Voice input (coming soon)"
              disabled={true}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              title="Send image (coming soon)"
              disabled={true}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Send button with enhanced glow effect */}
          <Button 
            className={cn(
              "btn-glow shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-300",
              !message.trim() && "opacity-70"
            )}
            size="icon" 
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
  );
};

export default ChatInput;