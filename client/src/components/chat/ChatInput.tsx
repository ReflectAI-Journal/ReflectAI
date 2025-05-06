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
    <div className="border-t border-border/40 bg-gradient-to-b from-card/60 to-card/90 backdrop-blur-sm p-4 rounded-b-lg shadow-inner">
      <div className="flex flex-col gap-3.5">
        {/* Fun suggestion chips */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3.5 text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 hover:from-pink-200 hover:to-purple-200 dark:hover:from-pink-800/30 dark:hover:to-purple-800/30 text-pink-500 dark:text-pink-400 border border-pink-200/50 dark:border-pink-700/30 shadow-sm transition-all duration-200 hover:scale-105"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "How can I improve my morning routine?")}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Morning routine ideas 🌞
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-500 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/30 shadow-sm transition-all duration-200 hover:scale-105"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "What are some ways to reduce stress and anxiety?")}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Stress reduction tips 😌
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 hover:from-purple-200 hover:to-violet-200 dark:hover:from-purple-800/30 dark:hover:to-violet-800/30 text-violet-500 dark:text-violet-400 border border-violet-200/50 dark:border-violet-700/30 shadow-sm transition-all duration-200 hover:scale-105"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "Help me organize my thoughts about a decision I need to make.")}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Decision helper 🤔
          </Button>
        </div>
        
        {/* Input area with fun, friendly styling */}
        <div className={cn(
          "flex gap-2 relative rounded-2xl border-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-1.5 transition-all duration-300",
          isFocused 
            ? "border-purple-300/70 dark:border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] transform scale-[1.005]" 
            : "border-border/50 shadow-sm"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChat}
            title="Start fresh conversation"
            className="shrink-0 h-10 w-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-500 transition-all duration-200"
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
            placeholder="Ask me anything... I'm here to help! 😊"
            className="min-h-[44px] max-h-[120px] resize-none bg-transparent border-0 focus-visible:ring-0 p-2.5 shadow-none font-medium text-purple-900 dark:text-purple-100 placeholder:text-purple-400 dark:placeholder:text-purple-300/60"
            disabled={isLoading}
          />
          
          {/* Feature buttons (for future implementation) */}
          <div className="flex gap-1 items-center pr-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full bg-purple-100/50 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-800/30 text-purple-400 hover:text-purple-500 transition-all duration-200"
              title="Voice input (coming soon)"
              disabled={true}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full bg-blue-100/50 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-400 hover:text-blue-500 transition-all duration-200"
              title="Send image (coming soon)"
              disabled={true}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Send button with fun, bouncy effect */}
          <Button 
            className={cn(
              "relative shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-white/20 dark:border-white/10",
              !message.trim() ? "opacity-70" : "hover:scale-105 active:scale-95",
              "after:absolute after:inset-0 after:rounded-full after:opacity-0 after:transition-opacity after:bg-white/20 hover:after:opacity-100"
            )}
            size="icon" 
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 text-white animate-spin" />
            ) : (
              <SendHorizonal className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;