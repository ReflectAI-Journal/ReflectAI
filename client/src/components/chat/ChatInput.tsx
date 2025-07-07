import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { SendHorizonal, RefreshCw, Sparkles, Mic, Image } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, clearChat } = useChat();
  
  const handleSubmit = async () => {
    if (message.trim() && !isLoading) {
      await sendMessage(message);
      setMessage('');
      setIsFocusMode(false); // Exit focus mode after sending
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle swipe gestures to exit focus mode
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isFocusMode) return;
    
    const touch = e.touches[0];
    const startY = touch.clientY;
    const startX = touch.clientX;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0];
      const deltaY = currentTouch.clientY - startY;
      const deltaX = currentTouch.clientX - startX;
      
      // Swipe down or significant horizontal swipe to exit
      if (deltaY > 100 || Math.abs(deltaX) > 150) {
        setIsFocusMode(false);
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
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
    <>
      {/* Focus mode overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-background">
          {/* Focus mode indicator */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
            <p className="text-xs text-muted-foreground text-center mt-1">Swipe down to exit</p>
          </div>
          
          {/* Full screen chat input */}
          <div className="h-full flex flex-col pt-12">
            <div className="flex-1 p-6">
              <AutoResizeTextarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onTouchStart={handleTouchStart}
                placeholder="Share what's on your mind... Ask for advice, emotional support, or help organizing your thoughts."
                className="w-full h-full border-0 bg-transparent text-lg leading-relaxed resize-none focus:outline-none"
                style={{ 
                  minHeight: '60vh',
                  paddingBottom: '120px'
                }}
                disabled={isLoading}
              />
            </div>
            
            {/* Floating action button */}
            <div className="fixed bottom-6 left-4 right-4 flex justify-center z-20">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8 py-4 rounded-full text-lg"
                onClick={handleSubmit}
                disabled={!message.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="h-5 w-5 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 rounded-b-lg">
      <div className="flex flex-col gap-3">
        {/* Simple suggestion chips */}
        <div className="flex flex-wrap gap-1.5 items-center justify-center mb-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "How can I improve my morning routine?")}
          >
            Morning routine
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "What are some ways to reduce stress and anxiety?")}
          >
            Stress reduction
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "Help me organize my thoughts about a decision I need to make.")}
          >
            Decision helper
          </Button>
        </div>
        
        {/* Input area with clean, simple styling */}
        <div className={cn(
          "flex gap-2 relative rounded-lg border p-1",
          isFocused 
            ? "border-blue-400 shadow-sm bg-white dark:bg-gray-800" 
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChat}
            title="Clear conversation"
            className="shrink-0 h-9 w-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors btn-hover-scale"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <AutoResizeTextarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setIsFocusMode(true);
            }}
            onBlur={() => setIsFocused(false)}
            onTouchStart={handleTouchStart}
            placeholder="Type your message here..."
            className="min-h-[40px] resize-none bg-transparent border-0 focus-visible:ring-0 p-2 shadow-none text-gray-800 dark:text-gray-200"
            disabled={isLoading}
          />
          
          {/* Send button with clean style */}
          <Button 
            className={cn(
              "shrink-0 h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white btn-hover-scale",
              !message.trim() && "opacity-70"
            )}
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4 mr-1" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ChatInput;