import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { SendHorizonal, RefreshCw, Sparkles, Mic, Image, X, Brain, Bot, Trash2 } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, clearChat, supportType } = useChat();
  
  // Determine if we're in philosophy mode
  const isPhilosophyMode = supportType === 'philosophy';
  
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

  const exitFocusMode = () => {
    // Add exit animation class
    const focusModeElement = document.querySelector('.focus-mode-layout');
    if (focusModeElement) {
      focusModeElement.classList.add('focus-mode-exit');
      setTimeout(() => {
        setIsFocusMode(false);
      }, 300);
    } else {
      setIsFocusMode(false);
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

  // Auto-focus the textarea when focus mode activates
  useEffect(() => {
    if (isFocusMode && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isFocusMode]);
  
  return (
    <>
      {/* Focus mode overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-background focus-mode-layout">
          {/* Header with title and actions */}
          <div className="bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-xl ${isPhilosophyMode ? 'bg-purple-600' : 'bg-gradient-to-r from-primary to-violet-600'} flex items-center justify-center text-white mr-3 shadow-lg`}>
                  {isPhilosophyMode ? <Brain className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div>
                  <h1 className="text-xl font-semibold">
                    {isPhilosophyMode ? 'Philosopher' : 'Counselor'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isPhilosophyMode 
                      ? 'Ask a profound philosophical question'
                      : 'Share what\'s on your mind'
                    }
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="h-9"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={exitFocusMode}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Full screen chat input */}
          <div className="h-full flex flex-col pt-0">
            <div className="flex-1 p-6">
              <AutoResizeTextarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isPhilosophyMode 
                  ? "Ask a profound philosophical question... What aspects of existence, ethics, knowledge, or consciousness intrigue you today?"
                  : "Share what's on your mind... Ask for advice, emotional support, or help organizing your thoughts."
                }
                className="w-full h-full border-0 bg-transparent text-lg leading-relaxed resize-none focus:outline-none cursor-text auto-resize-textarea transition-all duration-300"
                style={{ 
                  minHeight: '60vh',
                  paddingBottom: '120px',
                  caretColor: 'currentColor'
                }}
                disabled={isLoading}
              />
            </div>
            
            {/* Floating action buttons */}
            <div className="fixed bottom-6 left-4 right-4 flex justify-center gap-4 z-20">
              <Button 
                variant="outline"
                className="bg-background/90 hover:bg-background border-border shadow-lg px-6 py-3 rounded-full text-base transition-all duration-200 hover:scale-105"
                onClick={exitFocusMode}
              >
                Cancel
              </Button>
              <Button 
                className={`${isPhilosophyMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg px-8 py-3 rounded-full text-base transition-all duration-200 hover:scale-105`}
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
                    Send
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
            onBlur={() => {
              setIsFocused(false);
              // Don't exit focus mode on blur - let user explicitly exit
            }}
            placeholder="Type your message here..."
            className="min-h-[40px] resize-none bg-transparent border-0 focus-visible:ring-0 p-2 shadow-none text-gray-800 dark:text-gray-200 cursor-text"
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